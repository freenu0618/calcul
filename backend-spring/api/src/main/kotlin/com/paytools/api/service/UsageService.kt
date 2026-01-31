package com.paytools.api.service

import com.paytools.domain.model.PlanLimits
import com.paytools.domain.model.SubscriptionTier
import com.paytools.domain.model.UsageType
import com.paytools.infrastructure.entity.UsageTrackingEntity
import com.paytools.infrastructure.repository.UsageTrackingRepository
import com.paytools.infrastructure.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.YearMonth
import java.time.format.DateTimeFormatter

/**
 * 사용량 추적 서비스
 */
@Service
class UsageService(
    private val usageTrackingRepository: UsageTrackingRepository,
    private val userRepository: UserRepository
) {
    private val yearMonthFormatter = DateTimeFormatter.ofPattern("yyyy-MM")

    /**
     * 사용량 증가 및 제한 체크
     * @return true if usage is allowed, false if limit exceeded
     */
    @Transactional
    fun incrementUsage(userId: Long, usageType: UsageType): Boolean {
        val user = userRepository.findById(userId).orElseThrow {
            IllegalArgumentException("User not found: $userId")
        }

        val limits = PlanLimits.forTier(user.subscriptionTier)
        val currentYearMonth = YearMonth.now().format(yearMonthFormatter)

        // 현재 사용량 조회 또는 생성
        val usage = usageTrackingRepository.findByUserIdAndUsageTypeAndYearMonth(
            userId, usageType.name, currentYearMonth
        ).orElseGet {
            UsageTrackingEntity(
                userId = userId,
                usageType = usageType.name,
                yearMonth = currentYearMonth
            )
        }

        // 제한 체크
        val limit = when (usageType) {
            UsageType.AI_CHAT -> limits.aiChatsPerMonth
            UsageType.SALARY_CALC -> limits.salaryCalcsPerMonth
            UsageType.PDF_EXPORT -> if (limits.hasPdfExport) Int.MAX_VALUE else 0
            UsageType.EXCEL_EXPORT -> if (limits.hasExcelExport) Int.MAX_VALUE else 0
        }

        if (usage.count >= limit) {
            return false
        }

        // 사용량 증가
        usage.increment()
        usageTrackingRepository.save(usage)
        return true
    }

    /**
     * 현재 월 사용량 조회
     */
    fun getMonthlyUsage(userId: Long): Map<UsageType, Int> {
        val currentYearMonth = YearMonth.now().format(yearMonthFormatter)
        val usages = usageTrackingRepository.findByUserIdAndYearMonth(userId, currentYearMonth)

        return UsageType.entries.associateWith { type ->
            usages.find { it.usageType == type.name }?.count ?: 0
        }
    }

    /**
     * 사용량 제한 정보 조회
     */
    fun getUsageLimits(userId: Long): Map<UsageType, Int> {
        val user = userRepository.findById(userId).orElseThrow {
            IllegalArgumentException("User not found: $userId")
        }

        val limits = PlanLimits.forTier(user.subscriptionTier)

        return mapOf(
            UsageType.AI_CHAT to limits.aiChatsPerMonth,
            UsageType.SALARY_CALC to limits.salaryCalcsPerMonth,
            UsageType.PDF_EXPORT to if (limits.hasPdfExport) Int.MAX_VALUE else 0,
            UsageType.EXCEL_EXPORT to if (limits.hasExcelExport) Int.MAX_VALUE else 0
        )
    }

    /**
     * 특정 기능 사용 가능 여부 체크
     */
    fun canUse(userId: Long, usageType: UsageType): Boolean {
        val usage = getMonthlyUsage(userId)[usageType] ?: 0
        val limit = getUsageLimits(userId)[usageType] ?: 0
        return usage < limit
    }
}
