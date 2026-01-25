package com.paytools.domain.model

import com.paytools.domain.vo.WorkingHours
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.UUID

/**
 * 근무 시프트 도메인 모델 (계산용)
 */
data class WorkShift(
    val date: LocalDate,
    val startTime: LocalTime,
    val endTime: LocalTime,
    val breakMinutes: Int,
    val isHolidayWork: Boolean = false,
    val id: UUID = UUID.randomUUID()
) {
    init {
        require(breakMinutes >= 0) { "Break minutes cannot be negative: $breakMinutes" }
    }

    /**
     * 실근로시간 계산 (휴게시간 제외)
     */
    fun calculateWorkingHours(): WorkingHours {
        val totalMinutes = calculateTotalMinutes()
        val netMinutes = totalMinutes - breakMinutes

        require(netMinutes >= 0) {
            "Break time (${breakMinutes}분) exceeds total work time (${totalMinutes}분)"
        }

        return WorkingHours.fromMinutes(netMinutes)
    }

    /**
     * 야간근로시간 계산 (22:00~06:00)
     * 근로기준법 제56조: 야간근로(22:00~06:00)는 통상임금의 50% 가산
     */
    fun calculateNightHours(): WorkingHours {
        var startDt = LocalDateTime.of(date, startTime)
        var endDt = LocalDateTime.of(date, endTime)

        // 퇴근 시각이 출근 시각보다 빠르면 다음날로 간주
        if (!endDt.isAfter(startDt)) {
            endDt = endDt.plusDays(1)
        }

        var nightMinutes = 0
        var current = startDt

        // 1분 단위로 순회하며 야간 시간대 체크
        while (current.isBefore(endDt)) {
            val hour = current.hour
            // 22:00~23:59 또는 00:00~05:59
            if (hour >= 22 || hour < 6) {
                nightMinutes++
            }
            current = current.plusMinutes(1)
        }

        return WorkingHours.fromMinutes(nightMinutes)
    }

    /**
     * 연장근로시간 계산 (참고용)
     * 실제 연장근로는 주 단위로 계산해야 함
     */
    fun calculateOvertimeHours(dailyRegularHours: Int = 8): WorkingHours {
        val workingHours = calculateWorkingHours()
        val regularMinutes = dailyRegularHours * 60

        return if (workingHours.toMinutes() > regularMinutes) {
            WorkingHours.fromMinutes(workingHours.toMinutes() - regularMinutes)
        } else {
            WorkingHours.ZERO
        }
    }

    fun isNightShift(): Boolean = !calculateNightHours().isZero()

    private fun calculateTotalMinutes(): Int {
        var startDt = LocalDateTime.of(date, startTime)
        var endDt = LocalDateTime.of(date, endTime)

        // 퇴근 시각이 출근 시각보다 빠르면 다음날로 간주
        if (!endDt.isAfter(startDt)) {
            endDt = endDt.plusDays(1)
        }

        return java.time.Duration.between(startDt, endDt).toMinutes().toInt()
    }

    override fun toString(): String {
        val holidayLabel = if (isHolidayWork) ", 휴일근로" else ""
        return "WorkShift($date ${startTime}~${endTime}, 휴게 ${breakMinutes}분$holidayLabel)"
    }
}