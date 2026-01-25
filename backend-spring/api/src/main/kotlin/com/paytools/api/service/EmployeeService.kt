package com.paytools.api.service

import com.paytools.api.dto.request.EmployeeManagementRequest
import com.paytools.api.dto.response.EmployeeListResponse
import com.paytools.api.dto.response.EmployeeResponse
import com.paytools.api.exception.DuplicateResidentIdException
import com.paytools.api.exception.EmployeeNotFoundException
import com.paytools.infrastructure.entity.EmployeeEntity
import com.paytools.infrastructure.repository.EmployeeRepository
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

private val logger = KotlinLogging.logger {}

/**
 * 근무자 관리 서비스
 */
@Service
@Transactional(readOnly = true)
class EmployeeService(
    private val employeeRepository: EmployeeRepository
) {

    /**
     * 근무자 등록
     */
    @Transactional
    fun createEmployee(request: EmployeeManagementRequest): EmployeeResponse {
        logger.info { "Creating employee: ${request.name}" }

        // 주민번호 중복 체크
        if (employeeRepository.existsByResidentIdPrefix(request.residentIdPrefix)) {
            throw DuplicateResidentIdException(request.residentIdPrefix)
        }

        // 생년월일 추출
        val birthDate = EmployeeEntity.parseBirthDate(request.residentIdPrefix)

        // 외국인 여부 판단
        val isForeigner = EmployeeEntity.isForeignerByResidentId(request.residentIdPrefix)

        // 외국인이면 체류자격 필수
        if (isForeigner && request.visaType.isNullOrBlank()) {
            throw IllegalArgumentException("Visa type is required for foreign workers")
        }

        val entity = EmployeeEntity(
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

        // 국민연금 안내 메시지 로그
        if (!saved.isPensionEligible()) {
            logger.info { "Employee ${saved.name} (age: ${saved.calculateAge()}) is not eligible for national pension" }
        }

        return EmployeeResponse.from(saved)
    }

    /**
     * 근무자 목록 조회
     */
    fun getEmployees(): EmployeeListResponse {
        val employees = employeeRepository.findAll()
            .map { EmployeeResponse.from(it) }
            .sortedByDescending { it.createdAt }

        return EmployeeListResponse(
            employees = employees,
            totalCount = employees.size
        )
    }

    /**
     * 근무자 상세 조회
     */
    fun getEmployee(id: UUID): EmployeeResponse {
        val entity = employeeRepository.findById(id)
            .orElseThrow { EmployeeNotFoundException(id.toString()) }

        return EmployeeResponse.from(entity)
    }

    /**
     * 근무자 정보 수정
     */
    @Transactional
    fun updateEmployee(id: UUID, request: EmployeeManagementRequest): EmployeeResponse {
        logger.info { "Updating employee: $id" }

        val existing = employeeRepository.findById(id)
            .orElseThrow { EmployeeNotFoundException(id.toString()) }

        // 주민번호 변경 시 중복 체크
        if (existing.residentIdPrefix != request.residentIdPrefix) {
            if (employeeRepository.existsByResidentIdPrefix(request.residentIdPrefix)) {
                throw DuplicateResidentIdException(request.residentIdPrefix)
            }
        }

        // 생년월일 추출
        val birthDate = EmployeeEntity.parseBirthDate(request.residentIdPrefix)

        // 외국인 여부 판단
        val isForeigner = EmployeeEntity.isForeignerByResidentId(request.residentIdPrefix)

        // 외국인이면 체류자격 필수
        if (isForeigner && request.visaType.isNullOrBlank()) {
            throw IllegalArgumentException("Visa type is required for foreign workers")
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

    /**
     * 근무자 삭제
     */
    @Transactional
    fun deleteEmployee(id: UUID) {
        logger.info { "Deleting employee: $id" }

        if (!employeeRepository.existsById(id)) {
            throw EmployeeNotFoundException(id.toString())
        }

        employeeRepository.deleteById(id)

        logger.info { "Employee deleted: $id" }
    }

    /**
     * 이름으로 검색
     */
    fun searchEmployeesByName(name: String): EmployeeListResponse {
        val employees = employeeRepository.findByNameContaining(name)
            .map { EmployeeResponse.from(it) }
            .sortedByDescending { it.createdAt }

        return EmployeeListResponse(
            employees = employees,
            totalCount = employees.size
        )
    }

    /**
     * 국민연금 비대상자 조회 (만 60세 이상)
     */
    fun getPensionIneligibleEmployees(): EmployeeListResponse {
        val employees = employeeRepository.findPensionIneligible()
            .map { EmployeeResponse.from(it) }
            .sortedByDescending { it.age }

        return EmployeeListResponse(
            employees = employees,
            totalCount = employees.size
        )
    }
}
