package com.paytools.api.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.paytools.api.config.PolarConfig
import com.paytools.domain.model.SubscriptionTier
import com.paytools.infrastructure.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import java.util.Base64

/**
 * Polar Webhook 검증 및 처리 서비스
 * Standard Webhooks 스펙 준수
 */
@Service
class PolarWebhookService(
    private val polarConfig: PolarConfig,
    private val subscriptionService: SubscriptionService,
    private val userRepository: UserRepository,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    /**
     * Webhook 서명 검증 (Standard Webhooks 스펙)
     */
    fun verifyWebhook(
        payload: String,
        webhookId: String?,
        webhookTimestamp: String?,
        webhookSignature: String?
    ): Boolean {
        logger.info("Verifying webhook - id: $webhookId, timestamp: $webhookTimestamp")

        if (webhookId == null || webhookTimestamp == null || webhookSignature == null) {
            logger.warn("Missing webhook headers")
            return false
        }

        // 개발 환경에서 시크릿 미설정 시 검증 스킵
        if (polarConfig.webhookSecret.isBlank()) {
            logger.warn("Webhook secret not configured - skipping verification")
            return true
        }

        // 타임스탬프 검증 (5분 이내)
        val timestamp = webhookTimestamp.toLongOrNull() ?: return false
        val now = Instant.now().epochSecond
        if (kotlin.math.abs(now - timestamp) > 300) {
            logger.warn("Webhook timestamp too old: $timestamp")
            return false
        }

        // 서명 검증
        val signedPayload = "$webhookId.$webhookTimestamp.$payload"
        val secret = polarConfig.webhookSecret

        // Standard Webhooks 시크릿 디코딩
        // Polar 형식: polar_whs_xxx 또는 whsec_xxx (Base64 인코딩)
        val secretBytes = when {
            secret.startsWith("polar_whs_") -> {
                // polar_whs_ 접두사 제거 후 그대로 사용 (이미 raw bytes)
                secret.removePrefix("polar_whs_").toByteArray()
            }
            secret.startsWith("whsec_") -> {
                Base64.getDecoder().decode(secret.removePrefix("whsec_"))
            }
            else -> secret.toByteArray()
        }

        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(secretBytes, "HmacSHA256"))
        val expectedSignature = Base64.getEncoder().encodeToString(mac.doFinal(signedPayload.toByteArray()))

        // v1,signature 형식에서 signature 추출
        val signatures = webhookSignature.split(" ").mapNotNull { sig ->
            if (sig.startsWith("v1,")) sig.removePrefix("v1,") else null
        }

        return signatures.any { it == expectedSignature }
    }

    /**
     * Webhook 이벤트 처리
     */
    fun handleWebhook(payload: String): WebhookResult {
        return try {
            val event = objectMapper.readValue(payload, Map::class.java)
            val eventType = event["type"] as? String ?: return WebhookResult(false, "Missing event type")
            val data = event["data"] as? Map<*, *> ?: return WebhookResult(false, "Missing data")

            logger.info("Processing Polar webhook: $eventType")

            when (eventType) {
                "subscription.created" -> handleSubscriptionCreated(data)
                "subscription.active" -> handleSubscriptionActive(data)
                "subscription.updated" -> handleSubscriptionUpdated(data)
                "subscription.canceled" -> handleSubscriptionCanceled(data)
                "subscription.revoked" -> handleSubscriptionRevoked(data)
                "checkout.created" -> WebhookResult(true, "Checkout created - no action needed")
                "checkout.updated" -> WebhookResult(true, "Checkout updated - no action needed")
                else -> {
                    logger.info("Unhandled webhook event: $eventType")
                    WebhookResult(true, "Event ignored: $eventType")
                }
            }
        } catch (e: Exception) {
            logger.error("Webhook processing failed", e)
            WebhookResult(false, e.message ?: "Processing failed")
        }
    }

    private fun handleSubscriptionCreated(data: Map<*, *>): WebhookResult {
        logger.info("Subscription created: ${data["id"]}")
        return WebhookResult(true, "Subscription created")
    }

    private fun handleSubscriptionActive(data: Map<*, *>): WebhookResult {
        val subscriptionId = data["id"] as? String
        val customerId = data["customer_id"] as? String

        // customer 객체에서 이메일 추출
        val customer = data["customer"] as? Map<*, *>
        val email = customer?.get("email") as? String

        // product에서 product_id 추출하여 플랜 결정
        val product = data["product"] as? Map<*, *>
        val productId = product?.get("id") as? String

        logger.info("Subscription active - email: $email, productId: $productId")

        if (email == null) {
            logger.warn("Missing customer email in subscription event")
            return WebhookResult(false, "Missing customer email")
        }

        // 이메일로 사용자 찾기
        val user = userRepository.findByEmail(email).orElse(null)
        if (user == null) {
            logger.warn("User not found for email: $email")
            return WebhookResult(false, "User not found")
        }

        // product_id로 티어 결정
        val tier = productIdToTier(productId)
        val periodEnd = parseDateTime(data["current_period_end"] as? String)

        subscriptionService.upgradeSubscription(
            userId = user.id!!,
            tier = tier,
            polarSubscriptionId = subscriptionId,
            polarCustomerId = customerId,
            periodEnd = periodEnd
        )

        logger.info("User ${user.id} (${email}) upgraded to $tier")
        return WebhookResult(true, "Subscription activated for user ${user.id}")
    }

    private fun handleSubscriptionUpdated(data: Map<*, *>): WebhookResult {
        val user = findUserFromSubscriptionData(data)
        if (user != null) {
            val periodEnd = parseDateTime(data["current_period_end"] as? String)
            logger.info("Subscription updated for user ${user.id}, periodEnd: $periodEnd")
        }
        return WebhookResult(true, "Subscription updated")
    }

    private fun handleSubscriptionCanceled(data: Map<*, *>): WebhookResult {
        val user = findUserFromSubscriptionData(data)
        if (user != null) {
            subscriptionService.cancelSubscription(user.id!!, cancelAtPeriodEnd = true)
            logger.info("Subscription canceled for user ${user.id}")
        }
        return WebhookResult(true, "Subscription canceled")
    }

    private fun handleSubscriptionRevoked(data: Map<*, *>): WebhookResult {
        val user = findUserFromSubscriptionData(data)
        if (user != null) {
            subscriptionService.expireSubscription(user.id!!)
            logger.info("Subscription revoked for user ${user.id}")
        }
        return WebhookResult(true, "Subscription revoked")
    }

    /**
     * 구독 데이터에서 사용자 찾기 (customer.email 기반)
     */
    private fun findUserFromSubscriptionData(data: Map<*, *>): com.paytools.domain.entity.User? {
        val customer = data["customer"] as? Map<*, *>
        val email = customer?.get("email") as? String
        if (email == null) {
            logger.warn("Missing customer email in subscription data")
            return null
        }
        return userRepository.findByEmail(email).orElse(null)
    }

    private fun planToTier(plan: String): SubscriptionTier {
        return when (plan.lowercase()) {
            "basic", "basic_annual", "basic-annual" -> SubscriptionTier.BASIC
            "pro", "pro_annual", "pro-annual" -> SubscriptionTier.PRO
            else -> SubscriptionTier.FREE
        }
    }

    /**
     * Product ID로 구독 티어 결정
     */
    private fun productIdToTier(productId: String?): SubscriptionTier {
        if (productId == null) return SubscriptionTier.FREE
        return when (productId) {
            polarConfig.products.basic, polarConfig.products.basicAnnual -> SubscriptionTier.BASIC
            polarConfig.products.pro, polarConfig.products.proAnnual -> SubscriptionTier.PRO
            else -> SubscriptionTier.FREE
        }
    }

    private fun parseDateTime(dateStr: String?): LocalDateTime? {
        return try {
            dateStr?.let {
                Instant.parse(it).atZone(ZoneId.systemDefault()).toLocalDateTime()
            }
        } catch (e: Exception) {
            null
        }
    }

    data class WebhookResult(
        val success: Boolean,
        val message: String
    )
}
