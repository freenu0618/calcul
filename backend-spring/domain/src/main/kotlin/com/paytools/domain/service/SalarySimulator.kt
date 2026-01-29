package com.paytools.domain.service

import com.paytools.domain.vo.Money
import java.math.BigDecimal
import java.math.RoundingMode

/**
 * 급여 구조 시뮬레이션 결과
 */
data class SimulationPlan(
    val name: String,
    val baseSalary: Money,                    // 기본급
    val allowances: Money,                    // 수당 합계
    val monthlyTotal: Money,                  // 월 총액
    val hourlyWage: Money,                    // 통상시급
    val overtimePay: Money,                   // 연장근로수당 (예상)
    val nightPay: Money,                      // 야간근로수당 (예상)
    val holidayPay: Money,                    // 휴일근로수당 (예상)
    val weeklyHolidayPay: Money,              // 주휴수당
    val severancePay: Money,                  // 퇴직금 산정 기준액 (월 평균)
    val annualLeavePay: Money,                // 연차수당 (1일분)
    val annualEmployerCost: Money,            // 사업주 연간 인건비
    val calculation: SimulationCalculation   // 계산식 상세
)

/**
 * 시뮬레이션 계산식 상세
 */
data class SimulationCalculation(
    val hourlyWageFormula: String,            // 통상시급 계산식
    val overtimeFormula: String,              // 연장수당 계산식
    val severanceFormula: String,             // 퇴직금 계산식
    val annualCostFormula: String             // 연간 인건비 계산식
)

/**
 * 급여 구조 비교 결과
 */
data class SimulationCompareResult(
    val planA: SimulationPlan,                // A안 (고기본급)
    val planB: SimulationPlan,                // B안 (저기본급)
    val difference: SimulationDifference,     // 차이 분석
    val recommendation: String                // 추천 의견
)

/**
 * 플랜 간 차이 분석
 */
data class SimulationDifference(
    val hourlyWageDiff: Money,                // 통상시급 차이
    val overtimePayDiff: Money,               // 연장수당 차이
    val severancePayDiff: Money,              // 퇴직금 차이
    val annualCostDiff: Money,                // 연간 인건비 차이
    val annualCostDiffPercent: BigDecimal     // 연간 인건비 차이율 (%)
)

/**
 * 급여 구조 시뮬레이터
 *
 * 같은 총 급여액에서 기본급/수당 배분에 따른 인건비 차이를 비교합니다.
 * - A안: 고기본급 (예: 250만원 전체 기본급)
 * - B안: 저기본급 + 수당 (예: 최저시급 기준 + 수당)
 */
class SalarySimulator {

    companion object {
        val WEEKS_PER_MONTH = BigDecimal("4.345")
        val MONTHS_PER_YEAR = BigDecimal("12")
        val OVERTIME_RATE = BigDecimal("1.5")
        val NIGHT_RATE = BigDecimal("0.5")
        val HOLIDAY_RATE = BigDecimal("1.5")
        val MIN_HOURLY_WAGE_2026 = Money.of(10320) // 2026년 최저시급
    }

    /**
     * 두 가지 급여 구조를 비교 시뮬레이션
     *
     * @param monthlyTotal 월 총 급여액
     * @param weeklyHours 주 소정근로시간
     * @param expectedOvertimeHours 예상 월 연장근로시간
     * @param expectedNightHours 예상 월 야간근로시간
     * @param expectedHolidayHours 예상 월 휴일근로시간
     * @param baseSalaryRatioA A안 기본급 비율 (0.0~1.0, 기본 1.0 = 전액 기본급)
     * @param baseSalaryRatioB B안 기본급 비율 (0.0~1.0, 기본 0.6 = 60% 기본급)
     */
    fun compare(
        monthlyTotal: Money,
        weeklyHours: Int = 40,
        expectedOvertimeHours: BigDecimal = BigDecimal.ZERO,
        expectedNightHours: BigDecimal = BigDecimal.ZERO,
        expectedHolidayHours: BigDecimal = BigDecimal.ZERO,
        baseSalaryRatioA: BigDecimal = BigDecimal.ONE,
        baseSalaryRatioB: BigDecimal = BigDecimal("0.6")
    ): SimulationCompareResult {
        // 월 소정근로시간 (174시간 방식)
        val monthlyHours = calculateMonthlyHours(weeklyHours)

        // A안: 고기본급
        val planA = calculatePlan(
            name = "A안 (고기본급)",
            monthlyTotal = monthlyTotal,
            baseSalaryRatio = baseSalaryRatioA,
            monthlyHours = monthlyHours,
            weeklyHours = weeklyHours,
            expectedOvertimeHours = expectedOvertimeHours,
            expectedNightHours = expectedNightHours,
            expectedHolidayHours = expectedHolidayHours
        )

        // B안: 저기본급 + 수당
        val planB = calculatePlan(
            name = "B안 (저기본급+수당)",
            monthlyTotal = monthlyTotal,
            baseSalaryRatio = baseSalaryRatioB,
            monthlyHours = monthlyHours,
            weeklyHours = weeklyHours,
            expectedOvertimeHours = expectedOvertimeHours,
            expectedNightHours = expectedNightHours,
            expectedHolidayHours = expectedHolidayHours
        )

        // 차이 분석
        val difference = SimulationDifference(
            hourlyWageDiff = planA.hourlyWage - planB.hourlyWage,
            overtimePayDiff = planA.overtimePay - planB.overtimePay,
            severancePayDiff = planA.severancePay - planB.severancePay,
            annualCostDiff = planA.annualEmployerCost - planB.annualEmployerCost,
            annualCostDiffPercent = if (planB.annualEmployerCost.amount > BigDecimal.ZERO) {
                (planA.annualEmployerCost - planB.annualEmployerCost).amount
                    .divide(planB.annualEmployerCost.amount, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal("100"))
                    .setScale(1, RoundingMode.HALF_UP)
            } else BigDecimal.ZERO
        )

        // 추천 의견 생성
        val recommendation = generateRecommendation(planA, planB, difference)

        return SimulationCompareResult(
            planA = planA,
            planB = planB,
            difference = difference,
            recommendation = recommendation
        )
    }

    /**
     * 단일 플랜 시뮬레이션
     */
    fun simulateSinglePlan(
        monthlyTotal: Money,
        baseSalaryRatio: BigDecimal,
        weeklyHours: Int = 40,
        expectedOvertimeHours: BigDecimal = BigDecimal.ZERO,
        expectedNightHours: BigDecimal = BigDecimal.ZERO,
        expectedHolidayHours: BigDecimal = BigDecimal.ZERO
    ): SimulationPlan {
        val monthlyHours = calculateMonthlyHours(weeklyHours)
        return calculatePlan(
            name = "커스텀 플랜",
            monthlyTotal = monthlyTotal,
            baseSalaryRatio = baseSalaryRatio,
            monthlyHours = monthlyHours,
            weeklyHours = weeklyHours,
            expectedOvertimeHours = expectedOvertimeHours,
            expectedNightHours = expectedNightHours,
            expectedHolidayHours = expectedHolidayHours
        )
    }

    private fun calculatePlan(
        name: String,
        monthlyTotal: Money,
        baseSalaryRatio: BigDecimal,
        monthlyHours: BigDecimal,
        weeklyHours: Int,
        expectedOvertimeHours: BigDecimal,
        expectedNightHours: BigDecimal,
        expectedHolidayHours: BigDecimal
    ): SimulationPlan {
        // 기본급 = 총액 × 비율
        val baseSalary = (monthlyTotal * baseSalaryRatio).roundToWon()
        val allowances = monthlyTotal - baseSalary

        // 통상시급 = 기본급 / 월 소정근로시간
        val hourlyWage = (baseSalary / monthlyHours).roundToWon()

        // 연장근로수당 = 통상시급 × 연장시간 × 1.5
        val overtimePay = (hourlyWage * expectedOvertimeHours * OVERTIME_RATE).roundToWon()

        // 야간근로수당 = 통상시급 × 야간시간 × 0.5 (가산분만)
        val nightPay = (hourlyWage * expectedNightHours * NIGHT_RATE).roundToWon()

        // 휴일근로수당 = 통상시급 × 휴일시간 × 1.5
        val holidayPay = (hourlyWage * expectedHolidayHours * HOLIDAY_RATE).roundToWon()

        // 주휴수당 = 통상시급 × 8시간 × 4.345주
        val weeklyHolidayPay = (hourlyWage * BigDecimal("8") * WEEKS_PER_MONTH).roundToWon()

        // 퇴직금 산정 기준 = (기본급 + 고정수당) × 12 / 12 (월 평균)
        // 여기서는 기본급 기준으로 계산 (통상임금 포함 수당은 별도 고려 필요)
        val severancePay = baseSalary

        // 연차수당 (1일분) = 통상시급 × 8시간
        val annualLeavePay = (hourlyWage * BigDecimal("8")).roundToWon()

        // 연간 인건비 = (월급여 + 예상 가산수당) × 12 + 퇴직금 충당
        val monthlyWithOvertime = monthlyTotal + overtimePay + nightPay + holidayPay
        val annualBase = monthlyWithOvertime * MONTHS_PER_YEAR
        val severanceProvision = severancePay // 1년 퇴직금 충당
        val annualEmployerCost = (annualBase + severanceProvision).roundToWon()

        // 계산식 상세
        val calculation = SimulationCalculation(
            hourlyWageFormula = "${baseSalary.format()} ÷ ${monthlyHours.setScale(0)}시간 = ${hourlyWage.format()}",
            overtimeFormula = "${hourlyWage.format()} × ${expectedOvertimeHours}시간 × 1.5 = ${overtimePay.format()}",
            severanceFormula = "기본급 ${baseSalary.format()} (1년 근속 시)",
            annualCostFormula = "(${monthlyWithOvertime.format()} × 12) + ${severanceProvision.format()} = ${annualEmployerCost.format()}"
        )

        return SimulationPlan(
            name = name,
            baseSalary = baseSalary,
            allowances = allowances,
            monthlyTotal = monthlyTotal,
            hourlyWage = hourlyWage,
            overtimePay = overtimePay,
            nightPay = nightPay,
            holidayPay = holidayPay,
            weeklyHolidayPay = weeklyHolidayPay,
            severancePay = severancePay,
            annualLeavePay = annualLeavePay,
            annualEmployerCost = annualEmployerCost,
            calculation = calculation
        )
    }

    private fun calculateMonthlyHours(weeklyHours: Int): BigDecimal {
        val capped = minOf(weeklyHours, 40)
        return BigDecimal(capped)
            .multiply(WEEKS_PER_MONTH)
            .setScale(0, RoundingMode.HALF_UP)
    }

    private fun generateRecommendation(
        planA: SimulationPlan,
        planB: SimulationPlan,
        diff: SimulationDifference
    ): String {
        val costSaving = diff.annualCostDiff.amount
        val percentDiff = diff.annualCostDiffPercent

        return when {
            costSaving > BigDecimal("1000000") -> {
                "B안(저기본급+수당) 선택 시 연간 약 ${diff.annualCostDiff.format()} 절감 가능합니다. " +
                "단, 최저임금 위반 여부를 반드시 확인하세요."
            }
            costSaving > BigDecimal.ZERO -> {
                "B안이 연간 ${percentDiff}% (${diff.annualCostDiff.format()}) 절감되지만, " +
                "근로자 퇴직금/연차수당에 불리할 수 있습니다."
            }
            costSaving < BigDecimal.ZERO -> {
                "A안(고기본급)이 오히려 유리합니다. " +
                "통상시급이 높아 가산수당 부담이 증가하므로, 연장근로가 적은 경우 A안을 권장합니다."
            }
            else -> "두 안의 연간 인건비가 비슷합니다. 근로자 선호도를 고려하여 결정하세요."
        }
    }
}
