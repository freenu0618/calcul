package com.paytools.infrastructure.repository

import com.paytools.infrastructure.entity.PaymentHistoryEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PaymentHistoryRepository : JpaRepository<PaymentHistoryEntity, Long> {
    fun findByUserId(userId: Long): List<PaymentHistoryEntity>
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<PaymentHistoryEntity>
}
