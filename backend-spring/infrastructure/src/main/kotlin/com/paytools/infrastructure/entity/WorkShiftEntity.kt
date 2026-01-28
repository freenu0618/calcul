package com.paytools.infrastructure.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.*

/**
 * 출퇴근 기록 엔티티
 */
@Entity
@Table(
    name = "work_shifts",
    indexes = [
        Index(name = "idx_work_shifts_employee_id", columnList = "employee_id"),
        Index(name = "idx_work_shifts_date", columnList = "date"),
        Index(name = "idx_work_shifts_employee_date", columnList = "employee_id, date")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "uq_work_shifts_employee_date", columnNames = ["employee_id", "date"])
    ]
)
data class WorkShiftEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "employee_id", nullable = false)
    val employeeId: UUID,

    /** 근무일 */
    @Column(name = "date", nullable = false)
    val date: LocalDate,

    /** 출근 시간 */
    @Column(name = "start_time", nullable = false)
    val startTime: LocalTime,

    /** 퇴근 시간 */
    @Column(name = "end_time", nullable = false)
    val endTime: LocalTime,

    /** 휴게시간 (분) */
    @Column(name = "break_minutes", nullable = false)
    val breakMinutes: Int = 60,

    /** 휴일근로 여부 */
    @Column(name = "is_holiday_work", nullable = false)
    val isHolidayWork: Boolean = false,

    /** 메모 */
    @Column(name = "memo", length = 500)
    val memo: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    init {
        require(breakMinutes >= 0) { "Break minutes cannot be negative" }
    }

    /** 총 근무시간 (분) 계산 */
    fun calculateWorkingMinutes(): Int {
        val startMinutes = startTime.hour * 60 + startTime.minute
        var endMinutes = endTime.hour * 60 + endTime.minute

        // 익일 퇴근 처리
        if (endMinutes < startMinutes) {
            endMinutes += 24 * 60
        }

        return maxOf(0, endMinutes - startMinutes - breakMinutes)
    }

    /** 야간근로시간 (분) 계산 (22:00~06:00) */
    fun calculateNightMinutes(): Int {
        var nightMinutes = 0
        var currentMinute = startTime.hour * 60 + startTime.minute
        var endMinute = endTime.hour * 60 + endTime.minute

        if (endMinute < currentMinute) endMinute += 24 * 60

        while (currentMinute < endMinute) {
            val hourIn24 = (currentMinute / 60) % 24
            if (hourIn24 >= 22 || hourIn24 < 6) {
                nightMinutes++
            }
            currentMinute++
        }

        return nightMinutes
    }
}
