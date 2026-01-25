package com.paytools.infrastructure.repository

import com.paytools.infrastructure.entity.EmployeeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

/**
 * 근무자 Repository
 */
@Repository
interface EmployeeRepository : JpaRepository<EmployeeEntity, UUID> {

    /**
     * 주민번호로 조회
     */
    fun findByResidentIdPrefix(residentIdPrefix: String): EmployeeEntity?

    /**
     * 이름으로 검색
     */
    fun findByNameContaining(name: String): List<EmployeeEntity>

    /**
     * 계약 시작일 범위로 조회
     */
    fun findByContractStartDateBetween(startDate: LocalDate, endDate: LocalDate): List<EmployeeEntity>

    /**
     * 외국인 여부로 조회
     */
    fun findByIsForeigner(isForeigner: Boolean): List<EmployeeEntity>

    /**
     * 수습기간 중인 근무자 조회 (PostgreSQL 호환)
     */
    @Query(
        value = """
        SELECT * FROM employees e
        WHERE e.probation_months > 0
        AND CURRENT_DATE < e.contract_start_date + INTERVAL '1 month' * e.probation_months
    """,
        nativeQuery = true
    )
    fun findInProbation(): List<EmployeeEntity>

    /**
     * 국민연금 비대상자 조회 (만 60세 이상, PostgreSQL 호환)
     */
    @Query(
        value = """
        SELECT * FROM employees e
        WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.birth_date)) >= 60
    """,
        nativeQuery = true
    )
    fun findPensionIneligible(): List<EmployeeEntity>

    /**
     * 주민번호 중복 체크
     */
    fun existsByResidentIdPrefix(residentIdPrefix: String): Boolean
}
