package com.paytools.infrastructure.repository

import com.paytools.infrastructure.entity.PayrollPeriodEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * 급여 기간 Repository
 */
@Repository
interface PayrollPeriodRepository : JpaRepository<PayrollPeriodEntity, Long> {

    /** 사용자의 모든 급여 기간 조회 (최신순) */
    fun findByUserIdOrderByYearDescMonthDesc(userId: Long): List<PayrollPeriodEntity>

    /** 사용자의 특정 연월 급여 기간 조회 */
    fun findByUserIdAndYearAndMonth(userId: Long, year: Int, month: Int): PayrollPeriodEntity?

    /** 사용자의 특정 연도 급여 기간 목록 */
    fun findByUserIdAndYearOrderByMonthDesc(userId: Long, year: Int): List<PayrollPeriodEntity>

    /** 사용자의 상태별 급여 기간 조회 */
    fun findByUserIdAndStatus(userId: Long, status: String): List<PayrollPeriodEntity>

    /** 존재 여부 확인 */
    fun existsByUserIdAndYearAndMonth(userId: Long, year: Int, month: Int): Boolean
}
