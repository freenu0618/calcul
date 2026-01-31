package com.paytools.infrastructure.repository

import com.paytools.infrastructure.entity.SubscriptionEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface SubscriptionRepository : JpaRepository<SubscriptionEntity, Long> {
    fun findByUserId(userId: Long): List<SubscriptionEntity>
    fun findTopByUserIdOrderByCreatedAtDesc(userId: Long): Optional<SubscriptionEntity>
    fun findByPolarSubscriptionId(polarSubscriptionId: String): Optional<SubscriptionEntity>
}
