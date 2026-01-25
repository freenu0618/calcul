package com.paytools.domain.vo

import java.math.BigDecimal
import java.math.RoundingMode

/**
 * 근무시간 값 객체 (불변)
 * 시간과 분을 분리하여 관리하며, 내부적으로 분 단위로 계산
 */
data class WorkingHours(
    val hours: Int,
    val minutes: Int = 0
) : Comparable<WorkingHours> {

    init {
        require(hours >= 0) { "Hours cannot be negative: $hours" }
        require(minutes in 0..59) { "Minutes must be between 0 and 59: $minutes" }
    }

    operator fun plus(other: WorkingHours): WorkingHours =
        fromMinutes(toMinutes() + other.toMinutes())

    operator fun minus(other: WorkingHours): WorkingHours {
        val result = toMinutes() - other.toMinutes()
        require(result >= 0) { "Cannot subtract $other from $this: result would be negative" }
        return fromMinutes(result)
    }

    operator fun times(multiplier: Double): WorkingHours =
        fromMinutes((toMinutes() * multiplier).toInt())

    override fun compareTo(other: WorkingHours): Int =
        toMinutes().compareTo(other.toMinutes())

    /**
     * 총 분으로 변환
     */
    fun toMinutes(): Int = hours * 60 + minutes

    /**
     * Decimal 시간으로 변환 (급여 계산용)
     * 예: 8시간 30분 → 8.5
     */
    fun toDecimalHours(): BigDecimal =
        BigDecimal.valueOf(hours.toLong())
            .add(BigDecimal.valueOf(minutes.toLong()).divide(BigDecimal.valueOf(60), 10, RoundingMode.HALF_UP))

    /**
     * 한글 포맷팅
     */
    fun format(): String = when {
        minutes == 0 -> "${hours}시간"
        else -> "${hours}시간 ${minutes}분"
    }

    fun isZero(): Boolean = hours == 0 && minutes == 0

    companion object {
        val ZERO = WorkingHours(0, 0)

        /**
         * 총 분에서 WorkingHours 생성
         */
        fun fromMinutes(totalMinutes: Int): WorkingHours {
            require(totalMinutes >= 0) { "Total minutes cannot be negative: $totalMinutes" }
            return WorkingHours(totalMinutes / 60, totalMinutes % 60)
        }

        /**
         * Decimal 시간에서 WorkingHours 생성
         */
        fun fromDecimalHours(decimalHours: BigDecimal): WorkingHours {
            val totalMinutes = decimalHours.multiply(BigDecimal.valueOf(60)).toInt()
            return fromMinutes(totalMinutes)
        }

        fun fromDecimalHours(decimalHours: Double): WorkingHours =
            fromDecimalHours(BigDecimal.valueOf(decimalHours))
    }
}