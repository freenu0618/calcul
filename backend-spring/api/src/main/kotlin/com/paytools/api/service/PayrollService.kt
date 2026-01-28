package com.paytools.api.service

import com.paytools.api.dto.request.*
import com.paytools.api.dto.response.*
import com.paytools.common.exception.AuthenticationException
import com.paytools.infrastructure.entity.*
import com.paytools.infrastructure.repository.*
import com.paytools.infrastructure.security.UserPrincipal
import mu.KotlinLogging
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

private val logger = KotlinLogging.logger {}

/**
 * 급여대장 서비스
 */
@Service
@Transactional(readOnly = true)
class PayrollService(
    private val payrollPeriodRepository: PayrollPeriodRepository,
    private val payrollEntryRepository: PayrollEntryRepository,
    private val workShiftRepository: WorkShiftRepository,
    private val workContractRepository: WorkContractRepository,
    private val employeeRepository: EmployeeRepository
) {
    private fun getCurrentUserId(): Long {
        val auth = SecurityContextHolder.getContext().authentication
            ?: throw AuthenticationException("인증이 필요합니다")
        val principal = auth.principal as? UserPrincipal
            ?: throw AuthenticationException("유효하지 않은 인증 정보입니다")
        return principal.userId
    }

    // ==================== 급여 기간 ====================

    /** 급여 기간 생성 */
    @Transactional
    fun createPayrollPeriod(request: PayrollPeriodCreateRequest): PayrollPeriodResponse {
        val userId = getCurrentUserId()
        logger.info { "Creating payroll period: ${request.year}-${request.month} for user $userId" }

        if (payrollPeriodRepository.existsByUserIdAndYearAndMonth(userId, request.year, request.month)) {
            throw IllegalArgumentException("이미 해당 연월의 급여 기간이 존재합니다")
        }

        val entity = PayrollPeriodEntity(
            userId = userId,
            year = request.year,
            month = request.month,
            memo = request.memo
        )

        val saved = payrollPeriodRepository.save(entity)
        return PayrollPeriodResponse.from(saved)
    }

    /** 급여 기간 목록 조회 */
    fun getPayrollPeriods(): PayrollPeriodListResponse {
        val userId = getCurrentUserId()
        val periods = payrollPeriodRepository.findByUserIdOrderByYearDescMonthDesc(userId)
            .map { period ->
                val count = payrollEntryRepository.countByPayrollPeriodId(period.id).toInt()
                val totalGross = payrollEntryRepository.sumTotalGrossByPeriodId(period.id) ?: 0
                val totalNetPay = payrollEntryRepository.sumNetPayByPeriodId(period.id) ?: 0
                PayrollPeriodResponse.from(period, count, totalGross, totalNetPay)
            }
        return PayrollPeriodListResponse(periods, periods.size)
    }

    /** 급여 기간 상세 조회 (엔트리 포함) */
    fun getPayrollLedger(periodId: Long): PayrollLedgerResponse {
        val userId = getCurrentUserId()
        val period = payrollPeriodRepository.findById(periodId)
            .orElseThrow { IllegalArgumentException("급여 기간을 찾을 수 없습니다") }

        if (period.userId != userId) {
            throw IllegalArgumentException("접근 권한이 없습니다")
        }

        val entries = payrollEntryRepository.findByPayrollPeriodId(periodId)
        val employeeIds = entries.map { it.employeeId }
        val employeeMap = employeeRepository.findAllById(employeeIds).associateBy { it.id }

        val entryResponses = entries.map { entry ->
            val empName = employeeMap[entry.employeeId]?.name
            PayrollEntryResponse.from(entry, empName)
        }

        val count = entries.size
        val totalGross = entries.sumOf { it.totalGross ?: 0 }
        val totalNetPay = entries.sumOf { it.netPay ?: 0 }

        return PayrollLedgerResponse(
            period = PayrollPeriodResponse.from(period, count, totalGross, totalNetPay),
            entries = entryResponses
        )
    }

    /** 급여 기간 상태 변경 */
    @Transactional
    fun updatePayrollPeriodStatus(periodId: Long, request: PayrollPeriodStatusRequest): PayrollPeriodResponse {
        val userId = getCurrentUserId()
        val period = payrollPeriodRepository.findById(periodId)
            .orElseThrow { IllegalArgumentException("급여 기간을 찾을 수 없습니다") }

        if (period.userId != userId) {
            throw IllegalArgumentException("접근 권한이 없습니다")
        }

        val updated = when (request.status) {
            PayrollPeriodEntity.STATUS_CONFIRMED -> period.confirm()
            PayrollPeriodEntity.STATUS_PAID -> period.markAsPaid()
            PayrollPeriodEntity.STATUS_DRAFT -> period.revertToDraft()
            else -> throw IllegalArgumentException("유효하지 않은 상태입니다")
        }

        val saved = payrollPeriodRepository.save(updated)
        return PayrollPeriodResponse.from(saved)
    }

    // ==================== 급여 엔트리 ====================

    /** 급여 엔트리 추가 */
    @Transactional
    fun addPayrollEntry(periodId: Long, request: PayrollEntryRequest): PayrollEntryResponse {
        val userId = getCurrentUserId()
        val period = payrollPeriodRepository.findById(periodId)
            .orElseThrow { IllegalArgumentException("급여 기간을 찾을 수 없습니다") }

        if (period.userId != userId) {
            throw IllegalArgumentException("접근 권한이 없습니다")
        }

        if (period.status != PayrollPeriodEntity.STATUS_DRAFT) {
            throw IllegalArgumentException("확정된 급여 기간은 수정할 수 없습니다")
        }

        val employeeId = UUID.fromString(request.employeeId)
        val employee = employeeRepository.findByUserIdAndId(userId, employeeId)
            ?: throw IllegalArgumentException("직원을 찾을 수 없습니다")

        if (payrollEntryRepository.existsByPayrollPeriodIdAndEmployeeId(periodId, employeeId)) {
            throw IllegalArgumentException("이미 해당 직원의 급여 엔트리가 존재합니다")
        }

        val entity = PayrollEntryEntity(
            payrollPeriodId = periodId,
            employeeId = employeeId,
            contractId = request.contractId,
            baseSalary = request.baseSalary,
            allowancesJson = request.allowancesJson,
            totalWorkMinutes = request.totalWorkMinutes,
            overtimeMinutes = request.overtimeMinutes,
            nightMinutes = request.nightMinutes,
            holidayMinutes = request.holidayMinutes,
            // 계산 결과 저장
            totalGross = request.totalGross,
            netPay = request.netPay,
            totalDeductions = request.totalDeductions,
            overtimePay = request.overtimePay,
            nightPay = request.nightPay,
            holidayPay = request.holidayPay,
            weeklyHolidayPay = request.weeklyHolidayPay
        )

        val saved = payrollEntryRepository.save(entity)
        return PayrollEntryResponse.from(saved, employee.name)
    }

    /** 급여 엔트리 삭제 */
    @Transactional
    fun removePayrollEntry(periodId: Long, entryId: Long) {
        val userId = getCurrentUserId()
        val period = payrollPeriodRepository.findById(periodId)
            .orElseThrow { IllegalArgumentException("급여 기간을 찾을 수 없습니다") }

        if (period.userId != userId) {
            throw IllegalArgumentException("접근 권한이 없습니다")
        }

        if (period.status != PayrollPeriodEntity.STATUS_DRAFT) {
            throw IllegalArgumentException("확정된 급여 기간은 수정할 수 없습니다")
        }

        payrollEntryRepository.deleteById(entryId)
    }

    // ==================== 출퇴근 기록 ====================

    /** 출퇴근 기록 추가 */
    @Transactional
    fun addWorkShift(request: WorkShiftCreateRequest): WorkShiftResponse {
        val userId = getCurrentUserId()
        val employeeId = UUID.fromString(request.employeeId)

        employeeRepository.findByUserIdAndId(userId, employeeId)
            ?: throw IllegalArgumentException("직원을 찾을 수 없습니다")

        val existing = workShiftRepository.findByEmployeeIdAndDate(employeeId, request.date)
        if (existing != null) {
            throw IllegalArgumentException("해당 날짜에 이미 출퇴근 기록이 있습니다")
        }

        val entity = WorkShiftEntity(
            employeeId = employeeId,
            date = request.date,
            startTime = request.startTime,
            endTime = request.endTime,
            breakMinutes = request.breakMinutes,
            isHolidayWork = request.isHolidayWork,
            memo = request.memo
        )

        val saved = workShiftRepository.save(entity)
        return WorkShiftResponse.from(saved)
    }

    /** 직원의 월별 출퇴근 기록 조회 */
    fun getWorkShifts(employeeId: UUID, year: Int, month: Int): List<WorkShiftResponse> {
        val userId = getCurrentUserId()
        employeeRepository.findByUserIdAndId(userId, employeeId)
            ?: throw IllegalArgumentException("직원을 찾을 수 없습니다")

        return workShiftRepository.findByEmployeeIdAndYearMonth(employeeId, year, month)
            .map { WorkShiftResponse.from(it) }
    }

    // ==================== 근무 계약 ====================

    /** 근무 계약 등록 */
    @Transactional
    fun addWorkContract(request: WorkContractCreateRequest): WorkContractResponse {
        val userId = getCurrentUserId()
        val employeeId = UUID.fromString(request.employeeId)

        employeeRepository.findByUserIdAndId(userId, employeeId)
            ?: throw IllegalArgumentException("직원을 찾을 수 없습니다")

        // 기존 현재 계약 비활성화
        val currentContract = workContractRepository.findByEmployeeIdAndIsCurrent(employeeId, true)
        if (currentContract != null) {
            workContractRepository.save(currentContract.copy(isCurrent = false))
        }

        val entity = WorkContractEntity(
            employeeId = employeeId,
            contractType = request.contractType,
            baseAmount = request.baseAmount,
            scheduledHoursPerWeek = request.scheduledHoursPerWeek,
            scheduledDaysPerWeek = request.scheduledDaysPerWeek,
            effectiveDate = request.effectiveDate,
            endDate = request.endDate,
            allowancesJson = request.allowancesJson
        )

        val saved = workContractRepository.save(entity)
        return WorkContractResponse.from(saved)
    }

    /** 직원의 계약 목록 조회 */
    fun getWorkContracts(employeeId: UUID): List<WorkContractResponse> {
        val userId = getCurrentUserId()
        employeeRepository.findByUserIdAndId(userId, employeeId)
            ?: throw IllegalArgumentException("직원을 찾을 수 없습니다")

        return workContractRepository.findByEmployeeIdOrderByEffectiveDateDesc(employeeId)
            .map { WorkContractResponse.from(it) }
    }
}
