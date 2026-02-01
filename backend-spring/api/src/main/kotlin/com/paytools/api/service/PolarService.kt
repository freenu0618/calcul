package com.paytools.api.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.paytools.api.config.PolarConfig
import org.slf4j.LoggerFactory
import org.springframework.http.*
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

/**
 * Polar API 호출 서비스
 */
@Service
class PolarService(
    private val polarConfig: PolarConfig,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private val restTemplate = RestTemplate()

    /**
     * Checkout 세션 생성
     * @return checkout URL
     */
    fun createCheckoutSession(
        plan: String,
        customerEmail: String,
        userId: Long,
        successUrl: String? = null
    ): CheckoutResult {
        val productId = polarConfig.getProductId(plan)
            ?: throw IllegalArgumentException("Invalid plan: $plan")

        val requestBody = mapOf(
            "products" to listOf(productId),
            "customer_email" to customerEmail,
            "success_url" to (successUrl ?: "${polarConfig.successUrl}?session_id={CHECKOUT_SESSION_ID}"),
            "metadata" to mapOf(
                "user_id" to userId.toString(),
                "plan" to plan
            )
        )

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            setBearerAuth(polarConfig.apiToken)
        }

        val request = HttpEntity(requestBody, headers)

        return try {
            val response = restTemplate.exchange(
                "${polarConfig.apiUrl}/v1/checkouts/",
                HttpMethod.POST,
                request,
                Map::class.java
            )

            val body = response.body as Map<*, *>
            CheckoutResult(
                success = true,
                checkoutUrl = body["url"] as? String ?: "",
                checkoutId = body["id"] as? String ?: "",
                clientSecret = body["client_secret"] as? String
            )
        } catch (e: Exception) {
            logger.error("Polar checkout creation failed", e)
            CheckoutResult(
                success = false,
                error = e.message ?: "결제 세션 생성 실패"
            )
        }
    }

    /**
     * 구독 정보 조회
     */
    fun getSubscription(subscriptionId: String): Map<String, Any>? {
        val headers = HttpHeaders().apply {
            setBearerAuth(polarConfig.apiToken)
        }

        return try {
            val response = restTemplate.exchange(
                "${polarConfig.apiUrl}/v1/subscriptions/$subscriptionId",
                HttpMethod.GET,
                HttpEntity<Any>(headers),
                Map::class.java
            )
            @Suppress("UNCHECKED_CAST")
            response.body as? Map<String, Any>
        } catch (e: Exception) {
            logger.error("Failed to get subscription: $subscriptionId", e)
            null
        }
    }

    /**
     * 구독 취소
     */
    fun cancelSubscription(subscriptionId: String): Boolean {
        val headers = HttpHeaders().apply {
            setBearerAuth(polarConfig.apiToken)
        }

        return try {
            restTemplate.exchange(
                "${polarConfig.apiUrl}/v1/subscriptions/$subscriptionId",
                HttpMethod.DELETE,
                HttpEntity<Any>(headers),
                Void::class.java
            )
            true
        } catch (e: Exception) {
            logger.error("Failed to cancel subscription: $subscriptionId", e)
            false
        }
    }

    data class CheckoutResult(
        val success: Boolean,
        val checkoutUrl: String = "",
        val checkoutId: String = "",
        val clientSecret: String? = null,
        val error: String? = null
    )
}
