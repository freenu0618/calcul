package com.paytools.api.service

import com.paytools.api.dto.request.EmployeeManagementRequest
import com.paytools.api.dto.response.EmployeeListResponse
import com.paytools.api.dto.response.EmployeeResponse
import com.paytools.api.exception.DuplicateResidentIdException
import com.paytools.api.exception.EmployeeNotFoundException
import com.paytools.common.exception.AuthenticationException
import com.paytools.infrastructure.entity.EmployeeEntity
import com.paytools.infrastructure.repository.EmployeeRepository
import com.paytools.infrastructure.security.UserPrincipal
import mu.KotlinLogging
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

private val logger = KotlinLogging.logger {}

/**
 * 근무자 관리 서비스
 * - 모든 조회/수정/삭제는 현재 로그인 사용자 범위로 제한
 */
@Service
@Transactional(readOnly = true)
class EmployeeService(
    private val employeeRepository: EmployeeRepository
) {
    /** 현재 인증된 사용자 ID 조회 */
    private fun getCurrentUserId(): Long {
        val auth = SecurityContextHolder.getContext().authentication
            ?: throw AuthenticationException("인증이 필요합니다")
        val principal = auth.principal as? UserPrincipal
            ?: throw AuthenticationException("유효하지 않은 인증 정보입니다")
        return principal.userId
    }

    /** 근무자 등록 */
    @Transactional
    fun createEmployee(request: EmployeeManagementRequest): EmployeeResponse {
        val userId = getCurrentUserId()
        logger.info { "Creating employee for user $userId: ${request.name}" }

        // 사용자 범위 내 주민번호 중복 체크
        if (employeeRepository.existsByUserIdAndResidentIdPrefix(userId, request.residentIdPrefix)) {
            throw DuplicateResidentIdException(request.residentIdPrefix)
        }

        val birthDate = EmployeeEntity.parseBirthDate(request.residentIdPrefix)
        val isForeigner = EmployeeEntity.isForeignerByResidentId(request.residentIdPrefix)

        if (isForeigner && request.visaType.isNullOrBlank()) {
            throw IllegalArgumentException("외국인 근로자는 체류자격이 필수입니다")
        }

        val entity = EmployeeEntity(
            userId = userId,
            name = request.name,
            residentIdPrefix = request.residentIdPrefix,
            birthDate = birthDate,
            isForeigner = isForeigner,
            visaType = request.visaType,
            contractStartDate = request.contractStartDate,
            employmentType = request.employmentType,
            companySize = request.companySize,
            workStartTime = request.workStartTime,
            workEndTime = request.workEndTime,
            breakMinutes = request.breakMinutes,
            weeklyWorkDays = request.weeklyWorkDays,
            dailyWorkHours = request.dailyWorkHours,
            probationMonths = request.probationMonths,
            probationRate = request.probationRate
        )

        val saved = employeeRepository.save(entity)
        logger.info { "Employee created: ${saved.id}" }

        if (!saved.isPensionEligible()) {
            logger.info { "Employee ${saved.name} (age: ${saved.calculateAge()}) is not eligible for national pension" }
        }

        return EmployeeResponse.from(saved)
    }

    /** 근무자 목록 조회 (사용자 범위) */
    fun getEmployees(): EmployeeListResponse {
        val userId = getCurrentUserId()
        val employees = employeeRepository.findByUserId(userId)
            .map { EmployeeResponse.from(it) }
            .sortedByDescending { it.createdAt }

        return EmployeeListResponse(employees = employees, totalCount = employees.size)
    }

    /** 근무자 상세 조회 (사용자 범위) */
    fun getEmployee(id: UUID): EmployeeResponse {
        val userId = getCurrentUserId()
        val entity = employeeRepository.findByUserIdAndId(userId, id)
            ?: throw EmployeeNotFoundException(id.toString())

        return EmployeeResponse.from(entity)
    }

    /** 근무자 정보 수정 (사용자 범위) */
    @Transactional
    fun updateEmployee(id: UUID, request: EmployeeManagementRequest): EmployeeResponse {
        val userId = getCurrentUserId()
        logger.info { "Updating employee: $id" }

        val existing = employeeRepository.findByUserIdAndId(userId, id)
            ?: throw EmployeeNotFoundException(id.toString())

        // 주민번호 변경 시 사용자 범위 내 중복 체크
        if (existing.residentIdPrefix != request.residentIdPrefix) {
            if (employeeRepository.existsByUserIdAndResidentIdPrefix(userId, request.residentIdPrefix)) {
                throw DuplicateResidentIdException(request.residentIdPrefix)
            }
        }

        val birthDate = EmployeeEntity.parseBirthDate(request.residentIdPrefix)
        val isForeigner = EmployeeEntity.isForeignerByResidentId(request.residentIdPrefix)

        if (isForeigner && request.visaType.isNullOrBlank()) {
            throw IllegalArgumentException("외국인 근로자는 체류자격이 필수입니다")
        }

        val updated = existing.copy(
            name = request.name,
            residentIdPrefix = request.residentIdPrefix,
            birthDate = birthDate,
            isForeigner = isForeigner,
            visaType = request.visaType,
            contractStartDate = request.contractStartDate,
            employmentType = request.employmentType,
            companySize = request.companySize,
            workStartTime = request.workStartTime,
            workEndTime = request.workEndTime,
            breakMinutes = request.breakMinutes,
            weeklyWorkDays = request.weeklyWorkDays,
            dailyWorkHours = request.dailyWorkHours,
            probationMonths = request.probationMonths,
            probationRate = request.probationRate
        )

        val saved = employeeRepository.save(updated)
        logger.info { "Employee updated: ${saved.id}" }

        return EmployeeResponse.from(saved)
    }

    /** 근무자 삭제 (사용자 범위) */
    @Transactional
    fun deleteEmployee(id: UUID) {
        val userId = getCurrentUserId()
        logger.info { "Deleting employee: $id" }

        val existing = employeeRepository.findByUserIdAndId(userId, id)
            ?: throw EmployeeNotFoundException(id.toString())

        employeeRepository.delete(existing)
        logger.info { "Employee deleted: $id" }
    }

    /** 이름으로 검색 (사용자 범위) */
    fun searchEmployeesByName(name: String): EmployeeListResponse {
        val userId = getCurrentUserId()
        val employees = employeeRepository.findByUserIdAndNameContaining(userId, name)
            .map { EmployeeResponse.from(it) }
            .sortedByDescending { it.createdAt }

        return EmployeeListResponse(employees = employees, totalCount = employees.size)
    }

    /** 국민연금 비대상자 조회 (만 60세 이상) - 사용자 범위 */
    fun getPensionIneligibleEmployees(): EmployeeListResponse {
        val userId = getCurrentUserId()
        val employees = employeeRepository.findByUserId(userId)
            .filter { !it.isPensionEligible() }
            .map { EmployeeResponse.from(it) }
            .sortedByDescending { it.age }

        return EmployeeListResponse(employees = employees, totalCount = employees.size)
    }
}
