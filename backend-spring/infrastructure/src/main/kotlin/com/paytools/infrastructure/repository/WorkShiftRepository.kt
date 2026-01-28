package com.paytools.infrastructure.repository

import com.paytools.infrastructure.entity.WorkShiftEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

/**
 * 출퇴근 기록 Repository
 */
@Repository
interface WorkShiftRepository : JpaRepository<WorkShiftEntity, Long> {

    /** 직원의 특정 기간 출퇴근 기록 조회 */
    fun findByEmployeeIdAndDateBetweenOrderByDateAsc(
        employeeId: UUID,
        startDate: LocalDate,
        endDate: LocalDate
    ): List<WorkShiftEntity>

    /** 직원의 특정 날짜 기록 조회 */
    fun findByEmployeeIdAndDate(employeeId: UUID, date: LocalDate): WorkShiftEntity?

    /** 직원의 해당 월 기록 조회 */
    @Query("""
        SELECT s FROM WorkShiftEntity s
        WHERE s.employeeId = :employeeId
        AND YEAR(s.date) = :year
        AND MONTH(s.date) = :month
        ORDER BY s.date ASC
    """)
    fun findByEmployeeIdAndYearMonth(employeeId: UUID, year: Int, month: Int): List<WorkShiftEntity>

    /** 여러 직원의 기간별 기록 조회 */
    fun findByEmployeeIdInAndDateBetween(
        employeeIds: List<UUID>,
        startDate: LocalDate,
        endDate: LocalDate
    ): List<WorkShiftEntity>

    /** 직원별 기록 개수 */
    fun countByEmployeeId(employeeId: UUID): Long
}
