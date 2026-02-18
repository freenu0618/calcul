package com.paytools.domain.service

import com.paytools.domain.model.WorkShift
import com.paytools.domain.vo.Money
import java.math.BigDecimal
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.WeekFields
import java.util.Locale

/**
 * 결근 계산 결과
 */
data class AbsenceResult(
    val scheduledDays: Int,
    val actualWorkDays: Int,
    val absentDays: Int,
    val dailyWage: Money,
    val wageDeduction: Money,
    val holidayPayLoss: Money,
    val totalDeduction: Money,
    val absentWeeks: Int
)

/**
 * 결근 계산기
 *
 * 결근 공제 정책:
 * - STRICT: 일급 공제 + 결근 주 주휴수당 미지급
 * - MODERATE: 결근 주 주휴수당만 미지급
 * - LENIENT: 공제 없음
 */
class AbsenceCalculator {

    companion object {
        // 근로자의 날 (모든 사업장 적용 - 5인 미만 포함)
        private val LABOR_DAY_2026 = LocalDate.of(2026, 5, 1)

        // 2026년 공휴일 (5인 이상 사업장만 적용)
        private val HOLIDAYS_2026 = setOf(
            LocalDate.of(2026, 1, 1),   // 신정
            LocalDate.of(2026, 2, 16),  // 설날 연휴
            LocalDate.of(2026, 2, 17),
            LocalDate.of(2026, 2, 18),
            LocalDate.of(2026, 3, 1),   // 삼일절
            LocalDate.of(2026, 5, 5),   // 어린이날
            LocalDate.of(2026, 5, 24),  // 석가탄신일
            LocalDate.of(2026, 6, 6),   // 현충일
            LocalDate.of(2026, 8, 15),  // 광복절
            LocalDate.of(2026, 9, 24),  // 추석 연휴
            LocalDate.of(2026, 9, 25),
            LocalDate.of(2026, 9, 26),
            LocalDate.of(2026, 10, 3),  // 개천절
            LocalDate.of(2026, 10, 9),  // 한글날
            LocalDate.of(2026, 12, 25), // 성탄절
        )

        private val WEEKDAY_MAP = mapOf(
            1 to (0..0),  // 월
            2 to (0..1),  // 월~화
            3 to (0..2),  // 월~수
            4 to (0..3),  // 월~목
            5 to (0..4),  // 월~금
            6 to (0..5),  // 월~토
            7 to (0..6),  // 매일
        )
    }

    fun calculate(
        workShifts: List<WorkShift>,
        scheduledWorkDays: Int,
        calculationMonth: String,
        baseSalary: Money,
        absencePolicy: String,
        isOver5: Boolean,
        hourlyWage: Money? = null
    ): AbsenceResult {
        val (year, month) = calculationMonth.split("-").map { it.toInt() }
        val yearMonth = YearMonth.of(year, month)

        // 1. 소정근로일수 계산
        val scheduledDates = getScheduledDates(year, month, scheduledWorkDays, isOver5)
        val scheduledCount = scheduledDates.size

        // 2. 실제 근무일수
        val actualDates = workShifts
            .filter { !it.isHolidayWork }
            .map { it.date }
            .toSet()
        val actualCount = actualDates.intersect(scheduledDates).size

        // 3. 결근일수
        val absentDays = maxOf(0, scheduledCount - actualCount)

        // 4. 일급 계산
        val dailyWage = if (scheduledCount > 0) {
            (baseSalary / scheduledCount).roundToWon()
        } else {
            Money.ZERO
        }

        // 5. 정책별 공제액 계산
        var wageDeduction = Money.ZERO
        var holidayPayLoss = Money.ZERO

        when {
            absencePolicy == "LENIENT" || absentDays == 0 -> {
                // 공제 없음
            }
            absencePolicy == "STRICT" -> {
                wageDeduction = (dailyWage * absentDays).roundToWon()
                holidayPayLoss = calcHolidayPayLoss(
                    workShifts, scheduledWorkDays, scheduledDates, hourlyWage, year, month
                )
            }
            absencePolicy == "MODERATE" -> {
                holidayPayLoss = calcHolidayPayLoss(
                    workShifts, scheduledWorkDays, scheduledDates, hourlyWage, year, month
                )
            }
        }

        val absentWeeks = countAbsentWeeks(workShifts, scheduledDates)

        return AbsenceResult(
            scheduledDays = scheduledCount,
            actualWorkDays = actualCount,
            absentDays = absentDays,
            dailyWage = dailyWage,
            wageDeduction = wageDeduction,
            holidayPayLoss = holidayPayLoss,
            totalDeduction = wageDeduction + holidayPayLoss,
            absentWeeks = absentWeeks
        )
    }

    private fun getScheduledDates(
        year: Int,
        month: Int,
        scheduledWorkDays: Int,
        isOver5: Boolean
    ): Set<LocalDate> {
        // 근로자의 날은 모든 사업장에 적용
        val allHolidays = if (isOver5) {
            HOLIDAYS_2026 + LABOR_DAY_2026
        } else {
            setOf(LABOR_DAY_2026)  // 5인 미만도 근로자의 날은 유급휴일
        }
        val workWeekdays = WEEKDAY_MAP[scheduledWorkDays] ?: (0..4)

        val yearMonth = YearMonth.of(year, month)
        return (1..yearMonth.lengthOfMonth())
            .map { LocalDate.of(year, month, it) }
            .filter { d ->
                d.dayOfWeek.value - 1 in workWeekdays && d !in allHolidays
            }
            .toSet()
    }

    private fun countAbsentWeeks(
        workShifts: List<WorkShift>,
        scheduledDates: Set<LocalDate>
    ): Int {
        val actualDates = workShifts
            .filter { !it.isHolidayWork }
            .map { it.date }
            .toSet()

        val weekFields = WeekFields.of(Locale.KOREA)
        val weeks = scheduledDates.groupBy { d ->
            d.get(weekFields.weekOfWeekBasedYear()) to d.get(weekFields.weekBasedYear())
        }

        return weeks.count { (_, weekDates) ->
            val expected = weekDates.size
            val actual = actualDates.intersect(weekDates.toSet()).size
            actual < expected
        }
    }

    private fun calcHolidayPayLoss(
        workShifts: List<WorkShift>,
        scheduledWorkDays: Int,
        scheduledDates: Set<LocalDate>,
        hourlyWage: Money?,
        year: Int,
        month: Int
    ): Money {
        if (hourlyWage == null) return Money.ZERO

        val absentWeeks = countAbsentWeeks(workShifts, scheduledDates)
        if (absentWeeks == 0) return Money.ZERO

        val weeklyHolidayPay = (hourlyWage * BigDecimal("8")).roundToWon()
        return (weeklyHolidayPay * absentWeeks).roundToWon()
    }
}
