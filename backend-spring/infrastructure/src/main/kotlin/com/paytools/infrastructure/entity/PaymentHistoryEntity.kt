package com.paytools.infrastructure.entity

import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * 결제 이력 엔티티
 */
@Entity
@Table(name = "payment_history")
class PaymentHistoryEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "subscription_id")
    val subscriptionId: Long? = null,

    @Column(name = "polar_payment_id", length = 100)
    val polarPaymentId: String? = null,

    @Column(name = "amount_cents", nullable = false)
    val amountCents: Int,

    @Column(name = "currency", length = 3)
    val currency: String = "USD",

    @Column(name = "status", nullable = false, length = 20)
    val status: String,

    @Column(name = "paid_at")
    val paidAt: LocalDateTime? = null,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)
