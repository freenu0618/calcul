package com.paytools.api.dto

import com.paytools.domain.model.PlanLimits
import com.paytools.domain.model.SubscriptionStatus
import com.paytools.domain.model.SubscriptionTier
import java.time.LocalDateTime

/**
 * 구독 정보 응답
 */
data class SubscriptionResponse(
    val tier: SubscriptionTier,
    val status: SubscriptionStatus,
    val endDate: LocalDateTime?,
    val limits: PlanLimits,
    val usage: UsageResponse
)

/**
 * 사용량 응답
 */
data class UsageResponse(
    val aiChats: Int,
    val salaryCalcs: Int,
    val pdfExports: Int,
    val excelExports: Int
)

/**
 * Checkout 세션 요청
 */
data class CheckoutRequest(
    val tier: SubscriptionTier
)

/**
 * Checkout 세션 응답
 */
data class CheckoutResponse(
    val checkoutUrl: String
)

/**
 * Trial 시작 응답
 */
data class TrialResponse(
    val success: Boolean,
    val message: String,
    val endDate: LocalDateTime?
)
