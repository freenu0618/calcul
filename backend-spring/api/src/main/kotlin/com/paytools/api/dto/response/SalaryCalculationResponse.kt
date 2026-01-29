package com.paytools.api.dto.response

import com.paytools.api.dto.common.MoneyResponse
import com.paytools.api.dto.common.WorkingHoursResponse
import com.paytools.domain.service.*
import io.swagger.v3.oas.annotations.media.Schema

/**
 * 4대 보험 적용 옵션 응답
 */
@Schema(description = "4대 보험 적용 옵션")
data class InsuranceOptionsResponse(
    @Schema(description = "국민연금 적용 여부")
    val applyNationalPension: Boolean,

    @Schema(description = "건강보험 적용 여부")
    val applyHealthInsurance: Boolean,

    @Schema(description = "장기요양보험 적용 여부")
    val applyLongTermCare: Boolean,

    @Schema(description = "고용보험 적용 여부")
    val applyEmploymentInsurance: Boolean
)

/**
 * 4대 보험 상세
 */
@Schema(description = "4대 보험 상세")
data class InsuranceBreakdown(
    @Schema(description = "국민연금")
    val nationalPension: MoneyResponse,

    @Schema(description = "건강보험")
    val healthInsurance: MoneyResponse,

    @Schema(description = "장기요양보험")
    val longTermCare: MoneyResponse,

    @Schema(description = "고용보험")
    val employmentInsurance: MoneyResponse,

    @Schema(description = "4대 보험 합계")
    val total: MoneyResponse,

    @Schema(description = "적용된 보험 옵션")
    val appliedOptions: InsuranceOptionsResponse? = null
) {
    companion object {
        fun from(result: InsuranceResult): InsuranceBreakdown {
            return InsuranceBreakdown(
                nationalPension = MoneyResponse.from(result.nationalPension),
                healthInsurance = MoneyResponse.from(result.healthInsurance),
                longTermCare = MoneyResponse.from(result.longTermCare),
                employmentInsurance = MoneyResponse.from(result.employmentInsurance),
                total = MoneyResponse.from(result.total()),
                appliedOptions = InsuranceOptionsResponse(
                    applyNationalPension = result.appliedOptions.applyNationalPension,
                    applyHealthInsurance = result.appliedOptions.applyHealthInsurance,
                    applyLongTermCare = result.appliedOptions.applyLongTermCare,
                    applyEmploymentInsurance = result.appliedOptions.applyEmploymentInsurance
                )
            )
        }
    }
}

/**
 * 세금 상세
 */
@Schema(description = "세금 상세")
data class TaxBreakdown(
    @Schema(description = "소득세")
    val incomeTax: MoneyResponse,

    @Schema(description = "지방소득세")
    val localIncomeTax: MoneyResponse,

    @Schema(description = "세금 합계")
    val total: MoneyResponse
) {
    companion object {
        fun from(result: TaxResult): TaxBreakdown {
            return TaxBreakdown(
                incomeTax = MoneyResponse.from(result.incomeTax),
                localIncomeTax = MoneyResponse.from(result.localIncomeTax),
                total = MoneyResponse.from(result.total())
            )
        }
    }
}

/**
 * 가산수당 상세
 */
@Schema(description = "가산수당 상세")
data class OvertimeBreakdown(
    @Schema(description = "연장근로시간")
    val overtimeHours: WorkingHoursResponse,

    @Schema(description = "연장근로수당")
    val overtimePay: MoneyResponse,

    @Schema(description = "야간근로시간")
    val nightHours: WorkingHoursResponse,

    @Schema(description = "야간근로수당")
    val nightPay: MoneyResponse,

    @Schema(description = "휴일근로시간")
    val holidayHours: WorkingHoursResponse,

    @Schema(description = "휴일근로수당")
    val holidayPay: MoneyResponse,

    @Schema(description = "가산수당 합계")
    val total: MoneyResponse
) {
    companion object {
        fun from(result: OvertimeResult): OvertimeBreakdown {
            return OvertimeBreakdown(
                overtimeHours = WorkingHoursResponse.from(result.overtimeHours),
                overtimePay = MoneyResponse.from(result.overtimePay),
                nightHours = WorkingHoursResponse.from(result.nightHours),
                nightPay = MoneyResponse.from(result.nightPay),
                holidayHours = WorkingHoursResponse.from(result.holidayHours),
                holidayPay = MoneyResponse.from(result.holidayPay),
                total = MoneyResponse.from(result.total())
            )
        }
    }
}

/**
 * 주휴수당 상세
 */
@Schema(description = "주휴수당 상세")
data class WeeklyHolidayPayBreakdown(
    @Schema(description = "주휴수당")
    val amount: MoneyResponse,

    @Schema(description = "주 평균 근로시간")
    val weeklyHours: WorkingHoursResponse,

    @Schema(description = "비례 지급 여부")
    val isProportional: Boolean,

    @Schema(description = "계산식")
    val calculation: String
) {
    companion object {
        fun from(result: WeeklyHolidayPayResult): WeeklyHolidayPayBreakdown {
            return WeeklyHolidayPayBreakdown(
                amount = MoneyResponse.from(result.weeklyHolidayPay),
                weeklyHours = WorkingHoursResponse.from(result.weeklyHours),
                isProportional = result.isProportional,
                calculation = result.calculation
            )
        }
    }
}

/**
 * 포괄임금제 옵션 응답
 */
@Schema(description = "포괄임금제 옵션")
data class InclusiveWageOptionsResponse(
    @Schema(description = "포괄임금제 적용 여부")
    val enabled: Boolean,

    @Schema(description = "연장수당 시간당 고정 금액")
    val fixedOvertimeHourlyRate: Long,

    @Schema(description = "월 예정 연장근로시간")
    val monthlyExpectedOvertimeHours: Double,

    @Schema(description = "월 고정 연장수당")
    val monthlyFixedOvertimePay: MoneyResponse? = null
)

/**
 * 총 지급액 상세
 */
@Schema(description = "총 지급액 상세")
data class GrossBreakdown(
    @Schema(description = "기본급")
    val baseSalary: MoneyResponse,

    @Schema(description = "통상임금")
    val regularWage: MoneyResponse,

    @Schema(description = "통상시급")
    val hourlyWage: MoneyResponse,

    @Schema(description = "과세 수당")
    val taxableAllowances: MoneyResponse,

    @Schema(description = "비과세 수당")
    val nonTaxableAllowances: MoneyResponse,

    @Schema(description = "가산수당")
    val overtimeAllowances: OvertimeBreakdown,

    @Schema(description = "주휴수당")
    val weeklyHolidayPay: WeeklyHolidayPayBreakdown,

    @Schema(description = "포괄임금제 고정 연장수당")
    val inclusiveOvertimePay: MoneyResponse? = null,

    @Schema(description = "총 지급액")
    val total: MoneyResponse
)

/**
 * 공제 내역 상세
 */
@Schema(description = "공제 내역 상세")
data class DeductionsBreakdown(
    @Schema(description = "4대 보험")
    val insurance: InsuranceBreakdown,

    @Schema(description = "세금")
    val tax: TaxBreakdown,

    @Schema(description = "총 공제액")
    val total: MoneyResponse
)

/**
 * 결근 공제 상세 (월급제 전용)
 */
@Schema(description = "결근 공제 상세 (월급제 전용)")
data class AbsenceBreakdown(
    @Schema(description = "소정근로일수")
    val scheduledDays: Int,

    @Schema(description = "실제 근무일수")
    val actualWorkDays: Int,

    @Schema(description = "결근일수")
    val absentDays: Int,

    @Schema(description = "일급")
    val dailyWage: MoneyResponse,

    @Schema(description = "일급 공제액")
    val wageDeduction: MoneyResponse,

    @Schema(description = "주휴수당 미지급액")
    val holidayPayLoss: MoneyResponse,

    @Schema(description = "총 결근 공제액")
    val totalDeduction: MoneyResponse,

    @Schema(description = "적용된 공제 정책")
    val absencePolicy: String
) {
    companion object {
        fun from(result: AbsenceResult, absencePolicy: String): AbsenceBreakdown {
            return AbsenceBreakdown(
                scheduledDays = result.scheduledDays,
                actualWorkDays = result.actualWorkDays,
                absentDays = result.absentDays,
                dailyWage = MoneyResponse.from(result.dailyWage),
                wageDeduction = MoneyResponse.from(result.wageDeduction),
                holidayPayLoss = MoneyResponse.from(result.holidayPayLoss),
                totalDeduction = MoneyResponse.from(result.totalDeduction),
                absencePolicy = absencePolicy
            )
        }
    }
}

/**
 * 근무 요약
 */
@Schema(description = "근무 요약")
data class WorkSummaryResponse(
    @Schema(description = "계산 대상 월")
    val calculationMonth: String,

    @Schema(description = "급여 형태")
    val wageType: String,

    @Schema(description = "소정근로일수")
    val scheduledDays: Int,

    @Schema(description = "실제 근무일수")
    val actualWorkDays: Int,

    @Schema(description = "결근일수")
    val absentDays: Int,

    @Schema(description = "총 근무시간")
    val totalWorkHours: WorkingHoursResponse,

    @Schema(description = "소정근로시간")
    val regularHours: WorkingHoursResponse,

    @Schema(description = "연장근로시간")
    val overtimeHours: WorkingHoursResponse,

    @Schema(description = "야간근로시간")
    val nightHours: WorkingHoursResponse,

    @Schema(description = "휴일근로시간")
    val holidayHours: WorkingHoursResponse,

    @Schema(description = "주휴수당 발생 주 수")
    val weeklyHolidayWeeks: Int,

    @Schema(description = "해당 월 총 주 수")
    val totalWeeks: Int
)

/**
 * 경고 메시지
 */
@Schema(description = "경고 메시지")
data class WarningResponse(
    @Schema(description = "경고 수준 (critical, warning, info)")
    val level: String,

    @Schema(description = "경고 메시지")
    val message: String,

    @Schema(description = "상세 설명")
    val detail: String = ""
)

/**
 * 급여 계산 응답
 */
@Schema(description = "급여 계산 응답")
data class SalaryCalculationResponse(
    @Schema(description = "근로자 이름")
    val employeeName: String,

    @Schema(description = "지급 내역")
    val grossBreakdown: GrossBreakdown,

    @Schema(description = "공제 내역")
    val deductionsBreakdown: DeductionsBreakdown,

    @Schema(description = "실수령액")
    val netPay: MoneyResponse,

    @Schema(description = "근무 요약")
    val workSummary: WorkSummaryResponse? = null,

    @Schema(description = "결근 공제 상세")
    val absenceBreakdown: AbsenceBreakdown? = null,

    @Schema(description = "포괄임금제 옵션")
    val inclusiveWageOptions: InclusiveWageOptionsResponse? = null,

    @Schema(description = "경고 메시지 목록")
    val warnings: List<WarningResponse> = emptyList(),

    @Schema(description = "계산 메타데이터")
    val calculationMetadata: Map<String, Any> = emptyMap()
)
