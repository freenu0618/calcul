package com.paytools.api.controller

import com.paytools.api.service.PolarWebhookService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * Polar Webhook 수신 Controller
 * Standard Webhooks 스펙 준수
 */
@RestController
@RequestMapping("/api/v1/webhooks")
class PolarWebhookController(
    private val polarWebhookService: PolarWebhookService
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    /**
     * Polar Webhook 수신
     * POST /api/v1/webhooks/polar
     */
    @PostMapping("/polar")
    fun handlePolarWebhook(
        @RequestBody payload: String,
        @RequestHeader("webhook-id", required = false) webhookId: String?,
        @RequestHeader("webhook-timestamp", required = false) webhookTimestamp: String?,
        @RequestHeader("webhook-signature", required = false) webhookSignature: String?
    ): ResponseEntity<Map<String, Any>> {
        logger.info("Received Polar webhook")

        // 서명 검증
        val isValid = polarWebhookService.verifyWebhook(
            payload = payload,
            webhookId = webhookId,
            webhookTimestamp = webhookTimestamp,
            webhookSignature = webhookSignature
        )

        if (!isValid) {
            logger.warn("Invalid webhook signature")
            return ResponseEntity.status(401).body(mapOf(
                "success" to false,
                "error" to "Invalid signature"
            ))
        }

        // 웹훅 처리
        val result = polarWebhookService.handleWebhook(payload)

        return if (result.success) {
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to result.message
            ))
        } else {
            ResponseEntity.status(400).body(mapOf(
                "success" to false,
                "error" to result.message
            ))
        }
    }
}
