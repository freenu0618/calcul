package com.paytools.domain.service

import com.paytools.domain.model.Allowance
import com.paytools.domain.model.CompanySize
import com.paytools.domain.model.Employee
import com.paytools.domain.model.InclusiveWageOptions
import com.paytools.domain.model.InsuranceOptions
import com.paytools.domain.model.WageType
import com.paytools.domain.model.WorkShift
import com.paytools.domain.vo.Money
import com.paytools.domain.vo.WorkingHours
import java.math.BigDecimal
import java.math.RoundingMode

/**
 * 급여 계산 결과
 */
data class SalaryCalculationResult(
    val employee: Employee,
    val baseSalary: Money,
    val allowances: List<Allowance>,
    val regularWage: Money,
    val hourlyWage: Money,
    val overtimeResult: OvertimeResult,
    val weeklyHolidayResult: WeeklyHolidayPayResult,
    val totalGross: Money,
    val insuranceResult: InsuranceResult,
    val taxResult: TaxResult,
    val totalDeductions: Money,
    val netPay: Money,
    val wageType: String = "MONTHLY",
    val calculationMonth: String = "",
    val absenceResult: AbsenceResult? = null,
    val inclusiveWageOptions: InclusiveWageOptions = InclusiveWageOptions.DISABLED,
    val inclusiveOvertimePay: Money = Money.ZERO,
    val appliedWageMode: String? = null,
    val contractVsActualDiff: Money? = null,
    val contractGuaranteeAllowance: Money = Money.ZERO
)

/**
 * 급여 계산 오케스트레이터 (3분류 지원)
 *
 * 급여 유형:
 * - MONTHLY_FIXED: 월급제 고정 (매월 동일, 결근만 공제)
 * - HOURLY_MONTHLY: 시급제 월정산 (실제시간 × 시급)
 * - HOURLY_BASED_MONTHLY: 시급기반 월급제 (MAX(계약월급, 실제계산))
 *
 * 계산 순서:
 * 1. 기본급 결정 (유형별 분기)
 * 2. 통상시급 계산
 * 3. 연장/야간/휴일 수당 계산
 * 4. 주휴수당 계산 (개근 주만)
 * 5. 총 지급액 → 보험/세금 공제 → 실수령액
 */
class SalaryCalculator {

    private val insuranceCalculator = InsuranceCalculator()
    private val taxCalculator = TaxCalculator()
    private val overtimeCalculator = OvertimeCalculator()
    private val weeklyHolidayCalculator = WeeklyHolidayPayCalculator()
    private val absenceCalculator = AbsenceCalculator()

    companion object {
        val WEEKS_PER_MONTH = BigDecimal("4.345")

        /**
         * 월 소정근로시간 동적 계산
         * @param weeklyHours 주 소정근로시간
         * @param hoursMode "174" (주휴분리) 또는 "209" (주휴포함)
         */
        fun calculateMonthlyRegularHours(weeklyHours: Int, hoursMode: String = "174"): BigDecimal {
            val capped = minOf(weeklyHours, 40)
            return if (hoursMode == "209") {
                val weeklyHolidayHours = BigDecimal(capped)
                    .divide(BigDecimal("40"), 10, RoundingMode.HALF_UP)
                    .multiply(BigDecimal("8"))
                (BigDecimal(capped) + weeklyHolidayHours)
                    .multiply(WEEKS_PER_MONTH)
                    .setScale(0, RoundingMode.HALF_UP)
            } else {
                BigDecimal(capped)
                    .multiply(WEEKS_PER_MONTH)
                    .setScale(0, RoundingMode.HALF_UP)
            }
        }
    }

    fun calculate(
        employee: Employee,
        baseSalary: Money,
        allowances: List<Allowance>,
        workShifts: List<WorkShift>,
        wageType: String = "MONTHLY",
        hourlyWageInput: Int = 0,
        calculationMonth: String = "",
        absencePolicy: String = "STRICT",
        weeklyHours: Int = 40,
        hoursMode: String = "174",
        insuranceOptions: InsuranceOptions = InsuranceOptions.ALL_APPLY,
        inclusiveWageOptions: InclusiveWageOptions = InclusiveWageOptions.DISABLED,
        contractMonthlySalary: Long? = null
    ): SalaryCalculationResult {
        // 0. 계산월 추론
        val effectiveMonth = if (calculationMonth.isEmpty() && workShifts.isNotEmpty()) {
            val firstDate = workShifts.minOf { it.date }
            "${firstDate.year}-${firstDate.monthValue.toString().padStart(2, '0')}"
        } else {
            calculationMonth
        }

        val isOver5 = employee.companySize == CompanySize.OVER_5
        val normalizedType = WageType.normalize(WageType.valueOf(wageType))

        // 1. 유형별 기본급/통상시급 결정
        val baseCalcResult = calculateBasePay(
            normalizedType, employee, baseSalary, allowances, workShifts,
            hourlyWageInput, effectiveMonth, absencePolicy, weeklyHours,
            hoursMode, isOver5
        )

        // 2. 연장/야간/휴일 수당
        val (overtimeResult, inclusiveOvertimePay) = calculateOvertimePay(
            normalizedType, inclusiveWageOptions, workShifts,
            baseCalcResult.hourlyWage, employee, baseCalcResult.overtimeForHourly
        )

        // 3. 주휴수당
        val weeklyHolidayResult = weeklyHolidayCalculator.calculate(
            workShifts = workShifts,
            hourlyWage = baseCalcResult.hourlyWage,
            scheduledWorkDays = employee.scheduledWorkDays
        )

        // 4. HOURLY_BASED_MONTHLY: MAX(계약월급, 실제계산) 판정
        val hourlyBasedResult = resolveHourlyBasedMonthly(
            normalizedType, baseCalcResult, weeklyHolidayResult, contractMonthlySalary
        )

        // 5. 총 지급액 (계약보전수당 포함)
        val totalGross = calculateTotalGross(
            baseSalary = hourlyBasedResult.finalBase,
            allowances = allowances,
            overtimePay = overtimeResult.total() + inclusiveOvertimePay,
            weeklyHolidayPay = weeklyHolidayResult.weeklyHolidayPay
        ) + hourlyBasedResult.guaranteeAllowance

        // 6. 보험/세금
        val taxableGross = calculateTaxableGross(totalGross, allowances)
        val insuranceResult = insuranceCalculator.calculate(taxableGross, insuranceOptions)
        val taxResult = taxCalculator.calculate(
            taxableGross, employee.dependentsCount, employee.childrenUnder20
        )

        val totalDeductions = insuranceResult.total() + taxResult.total()
        val netPay = totalGross - totalDeductions

        return SalaryCalculationResult(
            employee = employee,
            baseSalary = hourlyBasedResult.finalBase,
            allowances = allowances,
            regularWage = baseCalcResult.regularWage,
            hourlyWage = baseCalcResult.hourlyWage,
            overtimeResult = overtimeResult,
            weeklyHolidayResult = weeklyHolidayResult,
            totalGross = totalGross,
            insuranceResult = insuranceResult,
            taxResult = taxResult,
            totalDeductions = totalDeductions,
            netPay = netPay,
            wageType = wageType,
            calculationMonth = effectiveMonth,
            absenceResult = baseCalcResult.absenceResult,
            inclusiveWageOptions = inclusiveWageOptions,
            inclusiveOvertimePay = inclusiveOvertimePay,
            appliedWageMode = hourlyBasedResult.appliedWageMode,
            contractVsActualDiff = hourlyBasedResult.contractDiff,
            contractGuaranteeAllowance = hourlyBasedResult.guaranteeAllowance
        )
    }

    /** 유형별 기본급 계산 중간 결과 */
    private data class BaseCalcResult(
        val effectiveBase: Money,
        val hourlyWage: Money,
        val regularWage: Money,
        val absenceResult: AbsenceResult?,
        val overtimeForHourly: OvertimeResult?
    )

    /**
     * Step 1: 유형별 기본급/통상시급 결정
     */
    private fun calculateBasePay(
        normalizedType: WageType, employee: Employee, baseSalary: Money,
        allowances: List<Allowance>, workShifts: List<WorkShift>,
        hourlyWageInput: Int, effectiveMonth: String, absencePolicy: String,
        weeklyHours: Int, hoursMode: String, isOver5: Boolean
    ): BaseCalcResult = when (normalizedType) {

        WageType.MONTHLY_FIXED -> {
            // 월급제 고정: 결근 공제
            var absResult: AbsenceResult? = null
            val effBase: Money
            if (effectiveMonth.isNotEmpty() && workShifts.isNotEmpty()) {
                absResult = absenceCalculator.calculate(
                    workShifts, employee.scheduledWorkDays, effectiveMonth,
                    baseSalary, absencePolicy, isOver5
                )
                effBase = baseSalary - absResult.totalDeduction
            } else {
                effBase = baseSalary
            }
            val regWage = calculateRegularWage(baseSalary, allowances)
            val monthlyHours = calculateMonthlyRegularHours(weeklyHours, hoursMode)
            val hw = calculateHourlyWage(regWage, monthlyHours)
            BaseCalcResult(effBase, hw, regWage, absResult, null)
        }

        WageType.HOURLY_MONTHLY, WageType.HOURLY_BASED_MONTHLY -> {
            // 시급 기반: 소정근로시간 × 시급 (연장시간 제외)
            val hw = Money.of(hourlyWageInput)
            val overtimeForHourly = overtimeCalculator.calculate(
                workShifts, hw, employee.companySize, employee.scheduledWorkDays
            )

            val shiftsForBasePay = if (isOver5) {
                workShifts.filter { !it.isHolidayWork }
            } else {
                workShifts
            }
            val totalMinutes = shiftsForBasePay.sumOf { it.calculateWorkingHours().toMinutes() }
            val overtimeMinutes = if (isOver5) overtimeForHourly.overtimeHours.toMinutes() else 0
            val regularMinutes = totalMinutes - overtimeMinutes
            val regularHours = BigDecimal(regularMinutes).divide(BigDecimal("60"), 10, RoundingMode.HALF_UP)
            val effBase = (hw * regularHours).roundToWon()
            BaseCalcResult(effBase, hw, effBase, null, overtimeForHourly)
        }

        else -> throw IllegalArgumentException("Unknown wage type: $normalizedType")
    }

    /**
     * Step 2: 연장/야간/휴일 수당 (포괄임금제 분기 포함)
     */
    private fun calculateOvertimePay(
        normalizedType: WageType,
        inclusiveWageOptions: InclusiveWageOptions, workShifts: List<WorkShift>,
        hourlyWage: Money, employee: Employee, overtimeForHourly: OvertimeResult?
    ): Pair<OvertimeResult, Money> {
        val isMonthlyFixed = normalizedType == WageType.MONTHLY_FIXED
        if (inclusiveWageOptions.enabled && isMonthlyFixed) {
            val fixedOvertimePay = inclusiveWageOptions.calculateMonthlyFixedOvertimePay()
            val actualResult = overtimeCalculator.calculate(
                workShifts, hourlyWage, employee.companySize, employee.scheduledWorkDays
            )
            val modifiedResult = OvertimeResult(
                overtimePay = Money.ZERO,
                nightPay = actualResult.nightPay,
                holidayPay = actualResult.holidayPay,
                overtimeHours = WorkingHours.fromMinutes(
                    (inclusiveWageOptions.monthlyExpectedOvertimeHours * BigDecimal("60")).toInt()
                ),
                nightHours = actualResult.nightHours,
                holidayHours = actualResult.holidayHours,
                hourlyWage = hourlyWage
            )
            return modifiedResult to fixedOvertimePay
        }

        val result = overtimeForHourly ?: overtimeCalculator.calculate(
            workShifts, hourlyWage, employee.companySize, employee.scheduledWorkDays
        )
        return result to Money.ZERO
    }

    /** HOURLY_BASED_MONTHLY 판정 결과 */
    private data class HourlyBasedResult(
        val finalBase: Money,
        val appliedWageMode: String?,
        val contractDiff: Money?,
        val guaranteeAllowance: Money
    )

    /**
     * Step 4: HOURLY_BASED_MONTHLY 계약월급 vs 실제계산 비교
     * MAX(계약월급, 실제시간×시급+주휴수당) 적용
     * 차액은 기본급에 합산하지 않고 계약보전수당으로 분리
     */
    private fun resolveHourlyBasedMonthly(
        normalizedType: WageType, baseCalcResult: BaseCalcResult,
        weeklyHolidayResult: WeeklyHolidayPayResult,
        contractMonthlySalary: Long?
    ): HourlyBasedResult {
        if (normalizedType != WageType.HOURLY_BASED_MONTHLY || contractMonthlySalary == null) {
            return HourlyBasedResult(baseCalcResult.effectiveBase, null, null, Money.ZERO)
        }

        val contractSalary = Money.of(contractMonthlySalary)
        val actualBase = baseCalcResult.effectiveBase
        val weeklyHolidayPay = weeklyHolidayResult.weeklyHolidayPay
        val actualTotal = actualBase + weeklyHolidayPay

        return if (actualTotal > contractSalary) {
            val diff = actualTotal - contractSalary
            HourlyBasedResult(actualBase, "ACTUAL_CALCULATION", diff, Money.ZERO)
        } else {
            // 계약월급 보장 → 차액을 계약보전수당으로 분리 (기본급 유지)
            val diff = contractSalary - actualTotal
            HourlyBasedResult(actualBase, "CONTRACT_SALARY", diff, diff)
        }
    }

    private fun calculateRegularWage(baseSalary: Money, allowances: List<Allowance>): Money {
        return allowances
            .filter { it.isRegularWage() }
            .fold(baseSalary) { acc, allowance -> acc + allowance.amount }
    }

    private fun calculateHourlyWage(regularWage: Money, monthlyHours: BigDecimal): Money =
        (regularWage / monthlyHours).roundToWon()

    private fun calculateTotalGross(
        baseSalary: Money, allowances: List<Allowance>,
        overtimePay: Money, weeklyHolidayPay: Money
    ): Money {
        val allowanceTotal = allowances.fold(Money.ZERO) { acc, a -> acc + a.amount }
        return baseSalary + allowanceTotal + overtimePay + weeklyHolidayPay
    }

    private fun calculateTaxableGross(totalGross: Money, allowances: List<Allowance>): Money {
        val nonTaxable = allowances
            .filter { !it.isTaxable }
            .fold(Money.ZERO) { acc, a -> acc + a.amount }
        return totalGross - nonTaxable
    }
}
