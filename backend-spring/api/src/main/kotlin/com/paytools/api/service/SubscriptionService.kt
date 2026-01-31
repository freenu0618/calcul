package com.paytools.api.service

import com.paytools.api.dto.SubscriptionResponse
import com.paytools.api.dto.UsageResponse
import com.paytools.domain.model.PlanLimits
import com.paytools.domain.model.SubscriptionStatus
import com.paytools.domain.model.SubscriptionTier
import com.paytools.domain.model.UsageType
import com.paytools.infrastructure.entity.SubscriptionEntity
import com.paytools.infrastructure.repository.SubscriptionRepository
import com.paytools.infrastructure.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

/**
 * 구독 관리 서비스
 */
@Service
class SubscriptionService(
    private val subscriptionRepository: SubscriptionRepository,
    private val userRepository: UserRepository,
    private val usageService: UsageService
) {
    /**
     * 현재 구독 정보 조회
     */
    fun getSubscription(userId: Long): SubscriptionResponse {
        val user = userRepository.findById(userId).orElseThrow {
            IllegalArgumentException("User not found: $userId")
        }

        val limits = PlanLimits.forTier(user.subscriptionTier)
        val usage = usageService.getMonthlyUsage(userId)

        return SubscriptionResponse(
            tier = user.subscriptionTier,
            status = user.subscriptionStatus,
            endDate = user.subscriptionEndDate,
            limits = limits,
            usage = UsageResponse(
                aiChats = usage[UsageType.AI_CHAT] ?: 0,
                salaryCalcs = usage[UsageType.SALARY_CALC] ?: 0,
                pdfExports = usage[UsageType.PDF_EXPORT] ?: 0,
                excelExports = usage[UsageType.EXCEL_EXPORT] ?: 0
            )
        )
    }

    /**
     * 구독 업그레이드 (Polar 웹훅에서 호출)
     */
    @Transactional
    fun upgradeSubscription(
        userId: Long,
        tier: SubscriptionTier,
        polarSubscriptionId: String?,
        polarCustomerId: String?,
        periodEnd: LocalDateTime?
    ) {
        val user = userRepository.findById(userId).orElseThrow {
            IllegalArgumentException("User not found: $userId")
        }

        // User 엔티티 업데이트
        user.subscriptionTier = tier
        user.subscriptionStatus = SubscriptionStatus.ACTIVE
        user.subscriptionEndDate = periodEnd
        user.polarSubscriptionId = polarSubscriptionId
        user.polarCustomerId = polarCustomerId
        userRepository.save(user)

        // 구독 이력 저장
        val subscription = SubscriptionEntity(
            userId = userId,
            tier = tier,
            status = SubscriptionStatus.ACTIVE,
            polarSubscriptionId = polarSubscriptionId,
            polarCustomerId = polarCustomerId,
            currentPeriodStart = LocalDateTime.now(),
            currentPeriodEnd = periodEnd
        )
        subscriptionRepository.save(subscription)
    }

    /**
     * 구독 취소 (Polar 웹훅에서 호출)
     */
    @Transactional
    fun cancelSubscription(userId: Long, cancelAtPeriodEnd: Boolean = true) {
        val user = userRepository.findById(userId).orElseThrow {
            IllegalArgumentException("User not found: $userId")
        }

        user.subscriptionStatus = SubscriptionStatus.CANCELED
        userRepository.save(user)

        // 최신 구독 이력 업데이트
        subscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
            .ifPresent { subscription ->
                subscription.status = SubscriptionStatus.CANCELED
                subscription.cancelAtPeriodEnd = cancelAtPeriodEnd
                subscriptionRepository.save(subscription)
            }
    }

    /**
     * 구독 만료 처리 (스케줄러에서 호출)
     */
    @Transactional
    fun expireSubscription(userId: Long) {
        val user = userRepository.findById(userId).orElseThrow {
            IllegalArgumentException("User not found: $userId")
        }

        user.subscriptionTier = SubscriptionTier.FREE
        user.subscriptionStatus = SubscriptionStatus.EXPIRED
        user.subscriptionEndDate = null
        user.polarSubscriptionId = null
        userRepository.save(user)

        // 최신 구독 이력 업데이트
        subscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
            .ifPresent { subscription ->
                subscription.status = SubscriptionStatus.EXPIRED
                subscriptionRepository.save(subscription)
            }
    }

    /**
     * Trial 시작
     */
    @Transactional
    fun startTrial(userId: Long): Boolean {
        val user = userRepository.findById(userId).orElseThrow {
            IllegalArgumentException("User not found: $userId")
        }

        // 이미 유료 또는 Trial 사용 이력이 있으면 불가
        val hasTrialHistory = subscriptionRepository.findByUserId(userId)
            .any { it.tier == SubscriptionTier.TRIAL }

        if (hasTrialHistory || user.subscriptionTier != SubscriptionTier.FREE) {
            return false
        }

        // 3일 Trial 시작
        val trialEnd = LocalDateTime.now().plusDays(3)

        user.subscriptionTier = SubscriptionTier.TRIAL
        user.subscriptionStatus = SubscriptionStatus.TRIAL
        user.subscriptionEndDate = trialEnd
        userRepository.save(user)

        // 구독 이력 저장
        val subscription = SubscriptionEntity(
            userId = userId,
            tier = SubscriptionTier.TRIAL,
            status = SubscriptionStatus.TRIAL,
            currentPeriodStart = LocalDateTime.now(),
            currentPeriodEnd = trialEnd
        )
        subscriptionRepository.save(subscription)

        return true
    }
}
