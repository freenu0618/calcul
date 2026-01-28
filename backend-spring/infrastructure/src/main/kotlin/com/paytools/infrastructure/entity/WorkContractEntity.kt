package com.paytools.infrastructure.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

/**
 * 근무 계약 엔티티
 * - 직원별 급여 계약 조건 관리
 */
@Entity
@Table(
    name = "work_contracts",
    indexes = [
        Index(name = "idx_work_contracts_employee_id", columnList = "employee_id"),
        Index(name = "idx_work_contracts_effective_date", columnList = "effective_date"),
        Index(name = "idx_work_contracts_is_current", columnList = "is_current")
    ]
)
data class WorkContractEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "employee_id", nullable = false)
    val employeeId: UUID,

    /** 계약 유형: MONTHLY(월급제), HOURLY(시급제) */
    @Column(name = "contract_type", nullable = false, length = 20)
    val contractType: String,

    /** 기본 금액: 월급 또는 시급 (원) */
    @Column(name = "base_amount", nullable = false)
    val baseAmount: Long,

    /** 주 소정근로시간 */
    @Column(name = "scheduled_hours_per_week", nullable = false)
    val scheduledHoursPerWeek: Int = 40,

    /** 주 소정근로일수 */
    @Column(name = "scheduled_days_per_week", nullable = false)
    val scheduledDaysPerWeek: Int = 5,

    /** 계약 시작일 */
    @Column(name = "effective_date", nullable = false)
    val effectiveDate: LocalDate,

    /** 계약 종료일 (NULL이면 현재 유효) */
    @Column(name = "end_date")
    val endDate: LocalDate? = null,

    /** 고정 수당 목록 (JSON) */
    @Column(name = "allowances_json", columnDefinition = "TEXT")
    val allowancesJson: String = "[]",

    /** 현재 유효 계약 여부 */
    @Column(name = "is_current", nullable = false)
    val isCurrent: Boolean = true,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        const val MONTHLY = "MONTHLY"
        const val HOURLY = "HOURLY"
    }

    init {
        require(contractType in listOf(MONTHLY, HOURLY)) { "Invalid contract type: $contractType" }
        require(baseAmount > 0) { "Base amount must be positive" }
        require(scheduledHoursPerWeek in 1..52) { "Scheduled hours must be 1-52" }
        require(scheduledDaysPerWeek in 1..7) { "Scheduled days must be 1-7" }
    }
}
