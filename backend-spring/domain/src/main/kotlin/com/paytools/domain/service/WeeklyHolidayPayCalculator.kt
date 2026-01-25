package com.paytools.domain.service

import com.paytools.domain.model.WorkShift
import com.paytools.domain.vo.Money
import com.paytools.domain.vo.WorkingHours
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.WeekFields
import java.util.Locale

/**
 * 주휴수당 계산 결과
 */
data class WeeklyHolidayPayResult(
    val weeklyHolidayPay: Money,
    val weeklyHours: WorkingHours,
    val hourlyWage: Money,
    val isProportional: Boolean
)

/**
 * 주휴수당 계산기
 *
 * 근로기준법 제55조:
 * - 주휴수당 = (1주 소정근로시간 ÷ 40) × 8 × 통상시급
 * - 주 15시간 미만: 주휴수당 없음
 * - 5인 미만 사업장도 의무 적용
 */
class WeeklyHolidayPayCalculator {

    companion object {
        val WEEKLY_REGULAR_HOURS = BigDecimal("40")
        val HOLIDAY_HOURS = BigDecimal("8")
        val MINIMUM_WEEKLY_HOURS = BigDecimal("15")
        private const val MINIMUM_WEEKLY_MINUTES = 900 // 15시간 = 900분
    }

    fun calculate(
        workShifts: List<WorkShift>,
        hourlyWage: Money,
        scheduledWorkDays: Int = 5
    ): WeeklyHolidayPayResult {
        // 1. 주별 평균 근로시간 계산
        val avgWeeklyHours = calculateAverageWeeklyHours(workShifts)
        val weeklyHoursDecimal = avgWeeklyHours.toDecimalHours()

        val isProportional = weeklyHoursDecimal < WEEKLY_REGULAR_HOURS

        // 2. 주 15시간 미만: 주휴수당 없음
        if (weeklyHoursDecimal < MINIMUM_WEEKLY_HOURS) {
            return WeeklyHolidayPayResult(
                weeklyHolidayPay = Money.ZERO,
                weeklyHours = avgWeeklyHours,
                hourlyWage = hourlyWage,
                isProportional = isProportional
            )
        }

        // 3. 개근한 주 수 계산
        val (qualifyingWeeks, _) = countQualifyingWeeks(workShifts, scheduledWorkDays)

        if (qualifyingWeeks == 0) {
            return WeeklyHolidayPayResult(
                weeklyHolidayPay = Money.ZERO,
                weeklyHours = avgWeeklyHours,
                hourlyWage = hourlyWage,
                isProportional = isProportional
            )
        }

        // 4. 주휴수당 계산
        val holidayHours = if (isProportional) {
            weeklyHoursDecimal.divide(WEEKLY_REGULAR_HOURS, 10, java.math.RoundingMode.HALF_UP)
                .multiply(HOLIDAY_HOURS)
        } else {
            HOLIDAY_HOURS
        }

        val weeklyPay = hourlyWage * holidayHours
        val monthlyHolidayPay = (weeklyPay * qualifyingWeeks).roundToWon()

        return WeeklyHolidayPayResult(
            weeklyHolidayPay = monthlyHolidayPay,
            weeklyHours = avgWeeklyHours,
            hourlyWage = hourlyWage,
            isProportional = isProportional
        )
    }

    private fun countQualifyingWeeks(
        workShifts: List<WorkShift>,
        scheduledWorkDays: Int
    ): Pair<Int, Int> {
        if (workShifts.isEmpty()) return 0 to 0

        val regularShifts = workShifts.filter { !it.isHolidayWork }
        if (regularShifts.isEmpty()) return 0 to 0

        val weekFields = WeekFields.of(Locale.KOREA)

        // 주별 근무일 집계
        val weeks = regularShifts.groupBy { shift ->
            shift.date.get(weekFields.weekOfWeekBasedYear()) to shift.date.get(weekFields.weekBasedYear())
        }.mapValues { (_, shifts) -> shifts.map { it.date }.toSet() }

        // 주별 근무시간 집계
        val weekMinutes = regularShifts.groupBy { shift ->
            shift.date.get(weekFields.weekOfWeekBasedYear()) to shift.date.get(weekFields.weekBasedYear())
        }.mapValues { (_, shifts) ->
            shifts.sumOf { it.calculateWorkingHours().toMinutes() }
        }

        // 월 범위 파악
        val monthCounter = regularShifts.groupBy { YearMonth.from(it.date) }
        val mainMonth = monthCounter.maxByOrNull { it.value.size }?.key ?: return 0 to 0
        val minDate = mainMonth.atDay(1)
        val maxDate = mainMonth.atEndOfMonth()

        var qualifying = 0
        var total = 0

        for ((weekKey, dates) in weeks) {
            // 주 15시간 미만이면 미적용
            if ((weekMinutes[weekKey] ?: 0) < MINIMUM_WEEKLY_MINUTES) continue

            // 해당 주에서 월 범위 내 가능한 평일 수 계산
            val (weekNum, year) = weekKey
            val startOfWeek = LocalDate.ofYearDay(year, 1)
                .with(weekFields.weekOfWeekBasedYear(), weekNum.toLong())
                .with(weekFields.dayOfWeek(), 1)

            var possibleDays = 0
            for (i in 0 until 7) {
                val d = startOfWeek.plusDays(i.toLong())
                if (d.dayOfWeek.value <= scheduledWorkDays && !d.isBefore(minDate) && !d.isAfter(maxDate)) {
                    possibleDays++
                }
            }

            val required = if (possibleDays < scheduledWorkDays) possibleDays else scheduledWorkDays

            total++
            if (dates.size >= required) {
                qualifying++
            }
        }

        return qualifying to total
    }

    private fun calculateAverageWeeklyHours(workShifts: List<WorkShift>): WorkingHours {
        if (workShifts.isEmpty()) return WorkingHours.ZERO

        val regularShifts = workShifts.filter { !it.isHolidayWork }
        if (regularShifts.isEmpty()) return WorkingHours.ZERO

        val totalMinutes = regularShifts.sumOf { it.calculateWorkingHours().toMinutes() }

        val sortedShifts = regularShifts.sortedBy { it.date }
        val firstDate = sortedShifts.first().date
        val lastDate = sortedShifts.last().date
        val totalDays = java.time.temporal.ChronoUnit.DAYS.between(firstDate, lastDate) + 1
        val weeks = BigDecimal(totalDays).divide(BigDecimal("7"), 10, java.math.RoundingMode.HALF_UP)
            .coerceAtLeast(BigDecimal.ONE)

        val avgWeeklyMinutes = BigDecimal(totalMinutes)
            .divide(weeks, 0, java.math.RoundingMode.HALF_UP)
            .toInt()

        return WorkingHours.fromMinutes(avgWeeklyMinutes)
    }
}