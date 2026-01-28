package com.paytools.infrastructure.repository

import com.paytools.infrastructure.entity.WorkContractEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

/**
 * 근무 계약 Repository
 */
@Repository
interface WorkContractRepository : JpaRepository<WorkContractEntity, Long> {

    /** 직원의 모든 계약 조회 (최신순) */
    fun findByEmployeeIdOrderByEffectiveDateDesc(employeeId: UUID): List<WorkContractEntity>

    /** 직원의 현재 유효 계약 조회 */
    fun findByEmployeeIdAndIsCurrent(employeeId: UUID, isCurrent: Boolean): WorkContractEntity?

    /** 특정 날짜에 유효한 계약 조회 */
    fun findByEmployeeIdAndEffectiveDateLessThanEqualAndEndDateIsNullOrEndDateGreaterThanEqual(
        employeeId: UUID,
        effectiveDate: LocalDate,
        endDate: LocalDate
    ): List<WorkContractEntity>

    /** 직원의 계약 존재 여부 확인 */
    fun existsByEmployeeId(employeeId: UUID): Boolean
}
