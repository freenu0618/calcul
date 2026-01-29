package com.paytools.domain.service

import com.paytools.domain.model.CompanySize
import com.paytools.domain.model.WorkShift
import com.paytools.domain.vo.Money
import com.paytools.domain.vo.WorkingHours
import java.math.BigDecimal

/**
 * 가산수당 계산 결과
 */
data class OvertimeResult(
    val overtimePay: Money,
    val nightPay: Money,
    val holidayPay: Money,
    val overtimeHours: WorkingHours,
    val nightHours: WorkingHours,
    val holidayHours: WorkingHours,
    val hourlyWage: Money
) {
    fun total(): Money = overtimePay + nightPay + holidayPay
}

/**
 * 연장/야간/휴일 수당 계산기
 *
 * 근로기준법 제56조:
 * - 연장근로: 통상시급 × 1.5배 (주 40시간 초과)
 * - 야간근로: 통상시급 × 0.5배 (22:00~06:00, 가산분만)
 * - 휴일근로: 통상시급 × 1.5배 (8시간 이하)
 * - 휴일근로 8시간 초과: 통상시급 × 2.0배 (5인 이상 사업장)
 */
class OvertimeCalculator {

    companion object {
        val OVERTIME_RATE = BigDecimal("1.5")
        val NIGHT_RATE = BigDecimal("0.5")
        val HOLIDAY_RATE = BigDecimal("1.5")
        val HOLIDAY_OVERTIME_RATE = BigDecimal("2.0")

        const val WEEKLY_REGULAR_HOURS = 40
        const val DAILY_REGULAR_HOURS = 8
    }

    fun calculate(
        workShifts: List<WorkShift>,
        hourlyWage: Money,
        companySize: CompanySize,
        scheduledWorkDays: Int = 5
    ): OvertimeResult {
        // 5인 미만 사업장: 연장/야간/휴일 수당 의무 없음 (근로기준법 미적용)
        if (companySize == CompanySize.UNDER_5) {
            return OvertimeResult(
                overtimePay = Money.ZERO,
                nightPay = Money.ZERO,
                holidayPay = Money.ZERO,
                overtimeHours = WorkingHours.ZERO,
                nightHours = WorkingHours.ZERO,
                holidayHours = WorkingHours.ZERO,
                hourlyWage = hourlyWage
            )
        }

        val (overtimeHours, overtimePay) = calculateOvertime(workShifts, hourlyWage, scheduledWorkDays)
        val (nightHours, nightPay) = calculateNightWork(workShifts, hourlyWage)
        val (holidayHours, holidayPay) = calculateHolidayWork(workShifts, hourlyWage, companySize)

        return OvertimeResult(
            overtimePay = overtimePay,
            nightPay = nightPay,
            holidayPay = holidayPay,
            overtimeHours = overtimeHours,
            nightHours = nightHours,
            holidayHours = holidayHours,
            hourlyWage = hourlyWage
        )
    }

    private fun calculateOvertime(
        workShifts: List<WorkShift>,
        hourlyWage: Money,
        scheduledWorkDays: Int
    ): Pair<WorkingHours, Money> {
        val weeklyGroups = groupByWeek(workShifts)
        var totalOvertimeMinutes = 0

        val scheduledWeeklyHours = scheduledWorkDays * DAILY_REGULAR_HOURS
        val weeklyLimitMinutes = minOf(scheduledWeeklyHours, WEEKLY_REGULAR_HOURS) * 60

        for (weekShifts in weeklyGroups) {
            val regularShifts = weekShifts.filter { !it.isHolidayWork }.sortedBy { it.date }

            var scheduledMinutes = 0
            var excessMinutes = 0

            regularShifts.forEachIndexed { i, shift ->
                val shiftMinutes = shift.calculateWorkingHours().toMinutes()

                if (i < scheduledWorkDays) {
                    val dailyLimit = DAILY_REGULAR_HOURS * 60
                    if (shiftMinutes > dailyLimit) {
                        scheduledMinutes += dailyLimit
                        excessMinutes += shiftMinutes - dailyLimit
                    } else {
                        scheduledMinutes += shiftMinutes
                    }
                } else {
                    excessMinutes += shiftMinutes
                }
            }

            if (scheduledMinutes > weeklyLimitMinutes) {
                excessMinutes += scheduledMinutes - weeklyLimitMinutes
            }

            totalOvertimeMinutes += excessMinutes
        }

        val overtimeHours = WorkingHours.fromMinutes(totalOvertimeMinutes)
        val overtimePay = (hourlyWage * overtimeHours.toDecimalHours() * OVERTIME_RATE).roundToWon()

        return overtimeHours to overtimePay
    }

    private fun calculateNightWork(
        workShifts: List<WorkShift>,
        hourlyWage: Money
    ): Pair<WorkingHours, Money> {
        val totalNightMinutes = workShifts.sumOf { it.calculateNightHours().toMinutes() }
        val nightHours = WorkingHours.fromMinutes(totalNightMinutes)
        val nightPay = (hourlyWage * nightHours.toDecimalHours() * NIGHT_RATE).roundToWon()

        return nightHours to nightPay
    }

    private fun calculateHolidayWork(
        workShifts: List<WorkShift>,
        hourlyWage: Money,
        companySize: CompanySize
    ): Pair<WorkingHours, Money> {
        val holidayShifts = workShifts.filter { it.isHolidayWork }

        if (holidayShifts.isEmpty()) {
            return WorkingHours.ZERO to Money.ZERO
        }

        var totalHolidayPay = Money.ZERO
        var totalHolidayMinutes = 0

        for (shift in holidayShifts) {
            val workingHours = shift.calculateWorkingHours()
            totalHolidayMinutes += workingHours.toMinutes()

            val hoursDecimal = workingHours.toDecimalHours()

            val shiftPay = if (companySize == CompanySize.OVER_5 && hoursDecimal > BigDecimal("8")) {
                val basePay = hourlyWage * BigDecimal("8") * HOLIDAY_RATE
                val overtimeHrs = hoursDecimal - BigDecimal("8")
                val overtimePay = hourlyWage * overtimeHrs * HOLIDAY_OVERTIME_RATE
                (basePay + overtimePay).roundToWon()
            } else {
                (hourlyWage * hoursDecimal * HOLIDAY_RATE).roundToWon()
            }

            totalHolidayPay += shiftPay
        }

        return WorkingHours.fromMinutes(totalHolidayMinutes) to totalHolidayPay
    }

    private fun groupByWeek(workShifts: List<WorkShift>): List<List<WorkShift>> {
        if (workShifts.isEmpty()) return emptyList()

        return workShifts
            .sortedBy { it.date }
            .groupBy { shift ->
                val cal = java.util.Calendar.getInstance()
                cal.time = java.sql.Date.valueOf(shift.date)
                cal.get(java.util.Calendar.YEAR) to cal.get(java.util.Calendar.WEEK_OF_YEAR)
            }
            .values
            .toList()
    }
}