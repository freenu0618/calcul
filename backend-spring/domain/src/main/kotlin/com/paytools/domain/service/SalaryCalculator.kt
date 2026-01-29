package com.paytools.domain.service

import com.paytools.domain.model.Allowance
import com.paytools.domain.model.CompanySize
import com.paytools.domain.model.Employee
import com.paytools.domain.model.InsuranceOptions
import com.paytools.domain.model.WorkShift
import com.paytools.domain.vo.Money
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
    val absenceResult: AbsenceResult? = null
)

/**
 * 급여 계산 오케스트레이터
 *
 * 계산 순서:
 * 1. 기본급 결정 (월급제: 고정급-결근공제 / 시급제: 시급×시간)
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
        insuranceOptions: InsuranceOptions = InsuranceOptions.ALL_APPLY
    ): SalaryCalculationResult {
        // 0. 계산월 추론
        val effectiveMonth = if (calculationMonth.isEmpty() && workShifts.isNotEmpty()) {
            val firstDate = workShifts.minOf { it.date }
            "${firstDate.year}-${firstDate.monthValue.toString().padStart(2, '0')}"
        } else {
            calculationMonth
        }

        var absenceResult: AbsenceResult? = null
        val isOver5 = employee.companySize == CompanySize.OVER_5

        val effectiveBase: Money
        val hourlyWage: Money
        val regularWage: Money

        if (wageType == "HOURLY") {
            // 시급제: 기본급 = 시급 × 실제 근무시간
            val hw = Money.of(hourlyWageInput)
            val totalMinutes = workShifts
                .filter { !it.isHolidayWork }
                .sumOf { it.calculateWorkingHours().toMinutes() }
            val totalHours = BigDecimal(totalMinutes).divide(BigDecimal("60"), 10, RoundingMode.HALF_UP)
            effectiveBase = (hw * totalHours).roundToWon()
            hourlyWage = hw
            regularWage = effectiveBase
        } else {
            // 월급제: 결근 공제
            if (effectiveMonth.isNotEmpty() && workShifts.isNotEmpty()) {
                absenceResult = absenceCalculator.calculate(
                    workShifts = workShifts,
                    scheduledWorkDays = employee.scheduledWorkDays,
                    calculationMonth = effectiveMonth,
                    baseSalary = baseSalary,
                    absencePolicy = absencePolicy,
                    isOver5 = isOver5
                )
                effectiveBase = baseSalary - absenceResult.totalDeduction
            } else {
                effectiveBase = baseSalary
            }

            regularWage = calculateRegularWage(baseSalary, allowances)
            val monthlyHours = calculateMonthlyRegularHours(weeklyHours, hoursMode)
            hourlyWage = calculateHourlyWage(regularWage, monthlyHours)
        }

        // 3. 연장/야간/휴일 수당
        val overtimeResult = overtimeCalculator.calculate(
            workShifts = workShifts,
            hourlyWage = hourlyWage,
            companySize = employee.companySize,
            scheduledWorkDays = employee.scheduledWorkDays
        )

        // 4. 주휴수당
        val weeklyHolidayResult = weeklyHolidayCalculator.calculate(
            workShifts = workShifts,
            hourlyWage = hourlyWage,
            scheduledWorkDays = employee.scheduledWorkDays
        )

        // 5. 총 지급액
        val totalGross = calculateTotalGross(
            baseSalary = effectiveBase,
            allowances = allowances,
            overtimePay = overtimeResult.total(),
            weeklyHolidayPay = weeklyHolidayResult.weeklyHolidayPay
        )

        // 6. 보험/세금
        val taxableGross = calculateTaxableGross(totalGross, allowances)
        val insuranceResult = insuranceCalculator.calculate(taxableGross, insuranceOptions)
        val taxResult = taxCalculator.calculate(
            taxableGross,
            employee.dependentsCount,
            employee.childrenUnder20
        )

        val totalDeductions = insuranceResult.total() + taxResult.total()
        val netPay = totalGross - totalDeductions

        return SalaryCalculationResult(
            employee = employee,
            baseSalary = effectiveBase,
            allowances = allowances,
            regularWage = regularWage,
            hourlyWage = hourlyWage,
            overtimeResult = overtimeResult,
            weeklyHolidayResult = weeklyHolidayResult,
            totalGross = totalGross,
            insuranceResult = insuranceResult,
            taxResult = taxResult,
            totalDeductions = totalDeductions,
            netPay = netPay,
            wageType = wageType,
            calculationMonth = effectiveMonth,
            absenceResult = absenceResult
        )
    }

    private fun calculateRegularWage(baseSalary: Money, allowances: List<Allowance>): Money {
        return allowances
            .filter { it.isRegularWage() }
            .fold(baseSalary) { acc, allowance -> acc + allowance.amount }
    }

    private fun calculateHourlyWage(regularWage: Money, monthlyHours: BigDecimal): Money =
        (regularWage / monthlyHours).roundToWon()

    private fun calculateTotalGross(
        baseSalary: Money,
        allowances: List<Allowance>,
        overtimePay: Money,
        weeklyHolidayPay: Money
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