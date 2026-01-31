package com.paytools.infrastructure.repository

import com.paytools.infrastructure.entity.PayrollEntryEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

/**
 * 급여대장 엔트리 Repository
 */
@Repository
interface PayrollEntryRepository : JpaRepository<PayrollEntryEntity, Long> {

    /** 특정 급여 기간의 모든 엔트리 조회 */
    fun findByPayrollPeriodId(payrollPeriodId: Long): List<PayrollEntryEntity>

    /** 특정 급여 기간의 특정 직원 엔트리 조회 */
    fun findByPayrollPeriodIdAndEmployeeId(payrollPeriodId: Long, employeeId: UUID): PayrollEntryEntity?

    /** 직원의 모든 급여 엔트리 조회 */
    fun findByEmployeeIdOrderByCreatedAtDesc(employeeId: UUID): List<PayrollEntryEntity>

    /** 급여 기간 ID 목록으로 엔트리 조회 */
    fun findByPayrollPeriodIdIn(payrollPeriodIds: List<Long>): List<PayrollEntryEntity>

    /** 급여 기간별 총 지급액 합계 */
    @Query("SELECT SUM(e.totalGross) FROM PayrollEntryEntity e WHERE e.payrollPeriodId = :periodId")
    fun sumTotalGrossByPeriodId(periodId: Long): Long?

    /** 급여 기간별 실수령액 합계 */
    @Query("SELECT SUM(e.netPay) FROM PayrollEntryEntity e WHERE e.payrollPeriodId = :periodId")
    fun sumNetPayByPeriodId(periodId: Long): Long?

    /** 급여 기간 내 엔트리 개수 */
    fun countByPayrollPeriodId(payrollPeriodId: Long): Long

    /** 급여 기간 내 엔트리 존재 여부 */
    fun existsByPayrollPeriodIdAndEmployeeId(payrollPeriodId: Long, employeeId: UUID): Boolean

    /** 급여 기간의 모든 엔트리 삭제 */
    fun deleteByPayrollPeriodId(payrollPeriodId: Long)
}
