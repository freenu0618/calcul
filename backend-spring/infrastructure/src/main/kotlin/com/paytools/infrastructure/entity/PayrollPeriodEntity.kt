package com.paytools.infrastructure.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

/**
 * 급여 기간 엔티티
 * - 월별 급여대장 헤더
 */
@Entity
@Table(
    name = "payroll_periods",
    indexes = [
        Index(name = "idx_payroll_periods_user_id", columnList = "user_id"),
        Index(name = "idx_payroll_periods_year_month", columnList = "year, month"),
        Index(name = "idx_payroll_periods_status", columnList = "status")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "uq_payroll_periods_user_year_month", columnNames = ["user_id", "year", "month"])
    ]
)
data class PayrollPeriodEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "year", nullable = false)
    val year: Int,

    @Column(name = "month", nullable = false)
    val month: Int,

    /** 상태: DRAFT, CONFIRMED, PAID */
    @Column(name = "status", nullable = false, length = 20)
    val status: String = STATUS_DRAFT,

    /** 확정 일시 */
    @Column(name = "confirmed_at")
    val confirmedAt: LocalDateTime? = null,

    /** 지급 일시 */
    @Column(name = "paid_at")
    val paidAt: LocalDateTime? = null,

    /** 메모 */
    @Column(name = "memo", length = 500)
    val memo: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        const val STATUS_DRAFT = "DRAFT"
        const val STATUS_CONFIRMED = "CONFIRMED"
        const val STATUS_PAID = "PAID"
    }

    init {
        require(status in listOf(STATUS_DRAFT, STATUS_CONFIRMED, STATUS_PAID)) {
            "Invalid status: $status"
        }
        require(year in 2020..2100) { "Year must be between 2020 and 2100" }
        require(month in 1..12) { "Month must be between 1 and 12" }
    }

    /** 확정 처리 */
    fun confirm(): PayrollPeriodEntity = copy(
        status = STATUS_CONFIRMED,
        confirmedAt = LocalDateTime.now()
    )

    /** 지급 완료 처리 */
    fun markAsPaid(): PayrollPeriodEntity = copy(
        status = STATUS_PAID,
        paidAt = LocalDateTime.now()
    )

    /** 상태 되돌리기 (DRAFT로) */
    fun revertToDraft(): PayrollPeriodEntity = copy(
        status = STATUS_DRAFT,
        confirmedAt = null,
        paidAt = null
    )
}
