package com.paytools.domain.entity

import com.paytools.domain.model.SubscriptionTier
import com.paytools.domain.model.SubscriptionStatus
import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDateTime

/**
 * 사용자 엔티티 (인증용)
 */
@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val email: String,

    @Column(name = "password_hash", nullable = false)
    var passwordHash: String,

    @Column(nullable = false)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: UserRole = UserRole.USER,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "oauth_provider")
    var oauthProvider: String? = null,

    // 구독 관련 필드
    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_tier", nullable = false)
    var subscriptionTier: SubscriptionTier = SubscriptionTier.FREE,

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_status", nullable = false)
    var subscriptionStatus: SubscriptionStatus = SubscriptionStatus.ACTIVE,

    @Column(name = "subscription_end_date")
    var subscriptionEndDate: LocalDateTime? = null,

    @Column(name = "polar_customer_id")
    var polarCustomerId: String? = null,

    @Column(name = "polar_subscription_id")
    var polarSubscriptionId: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    @PreUpdate
    fun onUpdate() {
        updatedAt = Instant.now()
    }
}

enum class UserRole {
    USER,       // 일반 사용자
    ADMIN,      // 관리자
    PREMIUM     // 유료 사용자 (향후)
}