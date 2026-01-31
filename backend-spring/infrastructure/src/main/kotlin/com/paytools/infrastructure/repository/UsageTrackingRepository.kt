package com.paytools.infrastructure.repository

import com.paytools.infrastructure.entity.UsageTrackingEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UsageTrackingRepository : JpaRepository<UsageTrackingEntity, Long> {
    fun findByUserIdAndUsageTypeAndYearMonth(
        userId: Long,
        usageType: String,
        yearMonth: String
    ): Optional<UsageTrackingEntity>

    fun findByUserIdAndYearMonth(userId: Long, yearMonth: String): List<UsageTrackingEntity>
}
