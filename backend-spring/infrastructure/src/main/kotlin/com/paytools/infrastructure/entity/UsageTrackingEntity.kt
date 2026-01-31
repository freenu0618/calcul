package com.paytools.infrastructure.entity

import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * 사용량 추적 엔티티
 */
@Entity
@Table(
    name = "usage_tracking",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["user_id", "usage_type", "year_month"])
    ]
)
class UsageTrackingEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "usage_type", nullable = false, length = 30)
    val usageType: String,

    @Column(name = "year_month", nullable = false, length = 7)
    val yearMonth: String,

    @Column(name = "count", nullable = false)
    var count: Int = 0,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    fun increment() {
        count++
        updatedAt = LocalDateTime.now()
    }
}
