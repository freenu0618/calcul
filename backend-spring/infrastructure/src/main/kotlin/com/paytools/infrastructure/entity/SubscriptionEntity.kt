package com.paytools.infrastructure.entity

import com.paytools.domain.model.SubscriptionTier
import com.paytools.domain.model.SubscriptionStatus
import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * 구독 이력 엔티티
 */
@Entity
@Table(name = "subscriptions")
class SubscriptionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false, length = 20)
    var tier: SubscriptionTier,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    var status: SubscriptionStatus = SubscriptionStatus.ACTIVE,

    @Column(name = "polar_subscription_id", length = 100)
    var polarSubscriptionId: String? = null,

    @Column(name = "polar_customer_id", length = 100)
    var polarCustomerId: String? = null,

    @Column(name = "current_period_start")
    var currentPeriodStart: LocalDateTime? = null,

    @Column(name = "current_period_end")
    var currentPeriodEnd: LocalDateTime? = null,

    @Column(name = "cancel_at_period_end")
    var cancelAtPeriodEnd: Boolean = false,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}
