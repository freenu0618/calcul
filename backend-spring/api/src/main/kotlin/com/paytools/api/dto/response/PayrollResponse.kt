package com.paytools.api.dto.response

import com.fasterxml.jackson.annotation.JsonFormat
import com.paytools.infrastructure.entity.*
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

/** 근무 계약 응답 */
@Schema(description = "근무 계약 정보")
data class WorkContractResponse(
    @Schema(description = "계약 ID")
    val id: Long,

    @Schema(description = "직원 ID")
    val employeeId: String,

    @Schema(description = "계약 유형 (MONTHLY/HOURLY)")
    val contractType: String,

    @Schema(description = "기본 금액 (원)")
    val baseAmount: Long,

    @Schema(description = "주 소정근로시간")
    val scheduledHoursPerWeek: Int,

    @Schema(description = "주 소정근로일수")
    val scheduledDaysPerWeek: Int,

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "계약 시작일")
    val effectiveDate: LocalDate,

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "계약 종료일")
    val endDate: LocalDate?,

    @Schema(description = "고정 수당 (JSON)")
    val allowancesJson: String,

    @Schema(description = "현재 유효 여부")
    val isCurrent: Boolean,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(entity: WorkContractEntity) = WorkContractResponse(
            id = entity.id,
            employeeId = entity.employeeId.toString(),
            contractType = entity.contractType,
            baseAmount = entity.baseAmount,
            scheduledHoursPerWeek = entity.scheduledHoursPerWeek,
            scheduledDaysPerWeek = entity.scheduledDaysPerWeek,
            effectiveDate = entity.effectiveDate,
            endDate = entity.endDate,
            allowancesJson = entity.allowancesJson,
            isCurrent = entity.isCurrent,
            createdAt = entity.createdAt
        )
    }
}

/** 출퇴근 기록 응답 */
@Schema(description = "출퇴근 기록")
data class WorkShiftResponse(
    @Schema(description = "기록 ID")
    val id: Long,

    @Schema(description = "직원 ID")
    val employeeId: String,

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "근무일")
    val date: LocalDate,

    @JsonFormat(pattern = "HH:mm")
    @Schema(description = "출근 시간")
    val startTime: LocalTime,

    @JsonFormat(pattern = "HH:mm")
    @Schema(description = "퇴근 시간")
    val endTime: LocalTime,

    @Schema(description = "휴게시간 (분)")
    val breakMinutes: Int,

    @Schema(description = "휴일근로 여부")
    val isHolidayWork: Boolean,

    @Schema(description = "총 근무시간 (분)")
    val workingMinutes: Int,

    @Schema(description = "야간근로시간 (분)")
    val nightMinutes: Int,

    @Schema(description = "메모")
    val memo: String?
) {
    companion object {
        fun from(entity: WorkShiftEntity) = WorkShiftResponse(
            id = entity.id,
            employeeId = entity.employeeId.toString(),
            date = entity.date,
            startTime = entity.startTime,
            endTime = entity.endTime,
            breakMinutes = entity.breakMinutes,
            isHolidayWork = entity.isHolidayWork,
            workingMinutes = entity.calculateWorkingMinutes(),
            nightMinutes = entity.calculateNightMinutes(),
            memo = entity.memo
        )
    }
}

/** 급여 기간 응답 */
@Schema(description = "급여 기간 정보")
data class PayrollPeriodResponse(
    @Schema(description = "급여 기간 ID")
    val id: Long,

    @Schema(description = "연도")
    val year: Int,

    @Schema(description = "월")
    val month: Int,

    @Schema(description = "상태 (DRAFT/CONFIRMED/PAID)")
    val status: String,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "확정 일시")
    val confirmedAt: LocalDateTime?,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "지급 일시")
    val paidAt: LocalDateTime?,

    @Schema(description = "메모")
    val memo: String?,

    @Schema(description = "직원 수")
    val employeeCount: Int = 0,

    @Schema(description = "총 지급액")
    val totalGross: Long = 0,

    @Schema(description = "총 실수령액")
    val totalNetPay: Long = 0,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(
            entity: PayrollPeriodEntity,
            employeeCount: Int = 0,
            totalGross: Long = 0,
            totalNetPay: Long = 0
        ) = PayrollPeriodResponse(
            id = entity.id,
            year = entity.year,
            month = entity.month,
            status = entity.status,
            confirmedAt = entity.confirmedAt,
            paidAt = entity.paidAt,
            memo = entity.memo,
            employeeCount = employeeCount,
            totalGross = totalGross,
            totalNetPay = totalNetPay,
            createdAt = entity.createdAt
        )
    }
}

/** 급여 엔트리 응답 */
@Schema(description = "급여 엔트리 (직원별 급여 내역)")
data class PayrollEntryResponse(
    @Schema(description = "엔트리 ID")
    val id: Long,

    @Schema(description = "급여 기간 ID")
    val payrollPeriodId: Long,

    @Schema(description = "직원 ID")
    val employeeId: String,

    @Schema(description = "직원 이름")
    val employeeName: String? = null,

    // 급여 상세
    @Schema(description = "기본급")
    val baseSalary: Long,

    @Schema(description = "통상임금")
    val regularWage: Long?,

    @Schema(description = "통상시급")
    val hourlyWage: Long?,

    @Schema(description = "연장근로수당")
    val overtimePay: Long?,

    @Schema(description = "야간근로수당")
    val nightPay: Long?,

    @Schema(description = "휴일근로수당")
    val holidayPay: Long?,

    @Schema(description = "주휴수당")
    val weeklyHolidayPay: Long?,

    @Schema(description = "총 지급액")
    val totalGross: Long?,

    // 공제
    @Schema(description = "국민연금")
    val nationalPension: Long?,

    @Schema(description = "건강보험")
    val healthInsurance: Long?,

    @Schema(description = "장기요양보험")
    val longTermCare: Long?,

    @Schema(description = "고용보험")
    val employmentInsurance: Long?,

    @Schema(description = "소득세")
    val incomeTax: Long?,

    @Schema(description = "지방소득세")
    val localIncomeTax: Long?,

    @Schema(description = "총 공제액")
    val totalDeductions: Long?,

    @Schema(description = "실수령액")
    val netPay: Long?,

    // 근무 정보
    @Schema(description = "총 근무시간 (분)")
    val totalWorkMinutes: Int,

    @Schema(description = "연장근로시간 (분)")
    val overtimeMinutes: Int,

    @Schema(description = "야간근로시간 (분)")
    val nightMinutes: Int,

    @Schema(description = "휴일근로시간 (분)")
    val holidayMinutes: Int
) {
    companion object {
        fun from(entity: PayrollEntryEntity, employeeName: String? = null) = PayrollEntryResponse(
            id = entity.id,
            payrollPeriodId = entity.payrollPeriodId,
            employeeId = entity.employeeId.toString(),
            employeeName = employeeName,
            baseSalary = entity.baseSalary,
            regularWage = entity.regularWage,
            hourlyWage = entity.hourlyWage,
            overtimePay = entity.overtimePay,
            nightPay = entity.nightPay,
            holidayPay = entity.holidayPay,
            weeklyHolidayPay = entity.weeklyHolidayPay,
            totalGross = entity.totalGross,
            nationalPension = entity.nationalPension,
            healthInsurance = entity.healthInsurance,
            longTermCare = entity.longTermCare,
            employmentInsurance = entity.employmentInsurance,
            incomeTax = entity.incomeTax,
            localIncomeTax = entity.localIncomeTax,
            totalDeductions = entity.totalDeductions,
            netPay = entity.netPay,
            totalWorkMinutes = entity.totalWorkMinutes,
            overtimeMinutes = entity.overtimeMinutes,
            nightMinutes = entity.nightMinutes,
            holidayMinutes = entity.holidayMinutes
        )
    }
}

/** 급여대장 전체 응답 (기간 + 엔트리 목록) */
@Schema(description = "급여대장 (기간 + 직원별 엔트리)")
data class PayrollLedgerResponse(
    @Schema(description = "급여 기간 정보")
    val period: PayrollPeriodResponse,

    @Schema(description = "직원별 급여 내역")
    val entries: List<PayrollEntryResponse>
)

/** 급여 기간 목록 응답 */
@Schema(description = "급여 기간 목록")
data class PayrollPeriodListResponse(
    @Schema(description = "급여 기간 목록")
    val periods: List<PayrollPeriodResponse>,

    @Schema(description = "총 개수")
    val totalCount: Int
)
