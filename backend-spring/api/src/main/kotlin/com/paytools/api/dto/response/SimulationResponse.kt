package com.paytools.api.dto.response

import com.paytools.api.dto.common.MoneyResponse
import com.paytools.domain.service.SimulationCalculation
import com.paytools.domain.service.SimulationCompareResult
import com.paytools.domain.service.SimulationDifference
import com.paytools.domain.service.SimulationPlan
import io.swagger.v3.oas.annotations.media.Schema
import java.math.BigDecimal

/**
 * 시뮬레이션 계산식 응답
 */
@Schema(description = "시뮬레이션 계산식 상세")
data class SimulationCalculationResponse(
    @Schema(description = "통상시급 계산식")
    val hourlyWageFormula: String,

    @Schema(description = "연장수당 계산식")
    val overtimeFormula: String,

    @Schema(description = "퇴직금 계산식")
    val severanceFormula: String,

    @Schema(description = "연간 인건비 계산식")
    val annualCostFormula: String
) {
    companion object {
        fun from(calc: SimulationCalculation): SimulationCalculationResponse {
            return SimulationCalculationResponse(
                hourlyWageFormula = calc.hourlyWageFormula,
                overtimeFormula = calc.overtimeFormula,
                severanceFormula = calc.severanceFormula,
                annualCostFormula = calc.annualCostFormula
            )
        }
    }
}

/**
 * 시뮬레이션 플랜 응답
 */
@Schema(description = "급여 구조 시뮬레이션 플랜")
data class SimulationPlanResponse(
    @Schema(description = "플랜 이름")
    val name: String,

    @Schema(description = "기본급")
    val baseSalary: MoneyResponse,

    @Schema(description = "수당 합계")
    val allowances: MoneyResponse,

    @Schema(description = "월 총액")
    val monthlyTotal: MoneyResponse,

    @Schema(description = "통상시급")
    val hourlyWage: MoneyResponse,

    @Schema(description = "연장근로수당 (예상)")
    val overtimePay: MoneyResponse,

    @Schema(description = "야간근로수당 (예상)")
    val nightPay: MoneyResponse,

    @Schema(description = "휴일근로수당 (예상)")
    val holidayPay: MoneyResponse,

    @Schema(description = "주휴수당")
    val weeklyHolidayPay: MoneyResponse,

    @Schema(description = "퇴직금 산정 기준액 (월)")
    val severancePay: MoneyResponse,

    @Schema(description = "연차수당 (1일분)")
    val annualLeavePay: MoneyResponse,

    @Schema(description = "사업주 연간 인건비")
    val annualEmployerCost: MoneyResponse,

    @Schema(description = "계산식 상세")
    val calculation: SimulationCalculationResponse
) {
    companion object {
        fun from(plan: SimulationPlan): SimulationPlanResponse {
            return SimulationPlanResponse(
                name = plan.name,
                baseSalary = MoneyResponse.from(plan.baseSalary),
                allowances = MoneyResponse.from(plan.allowances),
                monthlyTotal = MoneyResponse.from(plan.monthlyTotal),
                hourlyWage = MoneyResponse.from(plan.hourlyWage),
                overtimePay = MoneyResponse.from(plan.overtimePay),
                nightPay = MoneyResponse.from(plan.nightPay),
                holidayPay = MoneyResponse.from(plan.holidayPay),
                weeklyHolidayPay = MoneyResponse.from(plan.weeklyHolidayPay),
                severancePay = MoneyResponse.from(plan.severancePay),
                annualLeavePay = MoneyResponse.from(plan.annualLeavePay),
                annualEmployerCost = MoneyResponse.from(plan.annualEmployerCost),
                calculation = SimulationCalculationResponse.from(plan.calculation)
            )
        }
    }
}

/**
 * 플랜 간 차이 분석 응답
 */
@Schema(description = "플랜 간 차이 분석")
data class SimulationDifferenceResponse(
    @Schema(description = "통상시급 차이")
    val hourlyWageDiff: MoneyResponse,

    @Schema(description = "연장수당 차이")
    val overtimePayDiff: MoneyResponse,

    @Schema(description = "퇴직금 차이")
    val severancePayDiff: MoneyResponse,

    @Schema(description = "연간 인건비 차이")
    val annualCostDiff: MoneyResponse,

    @Schema(description = "연간 인건비 차이율 (%)")
    val annualCostDiffPercent: BigDecimal
) {
    companion object {
        fun from(diff: SimulationDifference): SimulationDifferenceResponse {
            return SimulationDifferenceResponse(
                hourlyWageDiff = MoneyResponse.from(diff.hourlyWageDiff),
                overtimePayDiff = MoneyResponse.from(diff.overtimePayDiff),
                severancePayDiff = MoneyResponse.from(diff.severancePayDiff),
                annualCostDiff = MoneyResponse.from(diff.annualCostDiff),
                annualCostDiffPercent = diff.annualCostDiffPercent
            )
        }
    }
}

/**
 * 급여 구조 비교 시뮬레이션 응답
 */
@Schema(description = "급여 구조 비교 시뮬레이션 응답")
data class SimulationCompareResponse(
    @Schema(description = "A안 (고기본급)")
    val planA: SimulationPlanResponse,

    @Schema(description = "B안 (저기본급+수당)")
    val planB: SimulationPlanResponse,

    @Schema(description = "차이 분석")
    val difference: SimulationDifferenceResponse,

    @Schema(description = "추천 의견")
    val recommendation: String
) {
    companion object {
        fun from(result: SimulationCompareResult): SimulationCompareResponse {
            return SimulationCompareResponse(
                planA = SimulationPlanResponse.from(result.planA),
                planB = SimulationPlanResponse.from(result.planB),
                difference = SimulationDifferenceResponse.from(result.difference),
                recommendation = result.recommendation
            )
        }
    }
}
