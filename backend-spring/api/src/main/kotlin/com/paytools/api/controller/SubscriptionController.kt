package com.paytools.api.controller

import com.paytools.api.dto.*
import com.paytools.api.service.AuthService
import com.paytools.api.service.SubscriptionService
import com.paytools.api.service.UsageService
import com.paytools.common.dto.ApiResponse
import com.paytools.domain.model.UsageType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/v1/subscription")
class SubscriptionController(
    private val subscriptionService: SubscriptionService,
    private val authService: AuthService,
    private val usageService: UsageService
) {
    /**
     * 현재 구독 상태 조회
     * GET /api/v1/subscription/me
     */
    @GetMapping("/me")
    fun getSubscription(
        @RequestHeader("Authorization") authorization: String
    ): ResponseEntity<ApiResponse<SubscriptionResponse>> {
        val userId = getUserId(authorization)
        val subscription = subscriptionService.getSubscription(userId)
        return ResponseEntity.ok(ApiResponse.success(subscription))
    }

    /**
     * 사용량 조회
     * GET /api/v1/subscription/usage
     */
    @GetMapping("/usage")
    fun getUsage(
        @RequestHeader("Authorization") authorization: String
    ): ResponseEntity<ApiResponse<UsageResponse>> {
        val userId = getUserId(authorization)
        val usage = usageService.getMonthlyUsage(userId)

        val response = UsageResponse(
            aiChats = usage[UsageType.AI_CHAT] ?: 0,
            salaryCalcs = usage[UsageType.SALARY_CALC] ?: 0,
            pdfExports = usage[UsageType.PDF_EXPORT] ?: 0,
            excelExports = usage[UsageType.EXCEL_EXPORT] ?: 0
        )
        return ResponseEntity.ok(ApiResponse.success(response))
    }

    /**
     * 사용량 증가 (내부 API)
     * POST /api/v1/subscription/usage/increment
     */
    @PostMapping("/usage/increment")
    fun incrementUsage(
        @RequestHeader("Authorization") authorization: String,
        @RequestParam type: UsageType
    ): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val userId = getUserId(authorization)
        val allowed = usageService.incrementUsage(userId, type)

        return if (allowed) {
            ResponseEntity.ok(ApiResponse.success(mapOf("allowed" to true)))
        } else {
            ResponseEntity.ok(ApiResponse.success(mapOf(
                "allowed" to false,
                "message" to "사용량 한도를 초과했습니다. 업그레이드를 고려해주세요."
            )))
        }
    }

    /**
     * 사용 가능 여부 체크
     * GET /api/v1/subscription/can-use
     */
    @GetMapping("/can-use")
    fun canUse(
        @RequestHeader("Authorization") authorization: String,
        @RequestParam type: UsageType
    ): ResponseEntity<ApiResponse<Map<String, Boolean>>> {
        val userId = getUserId(authorization)
        val canUse = usageService.canUse(userId, type)
        return ResponseEntity.ok(ApiResponse.success(mapOf("canUse" to canUse)))
    }

    /**
     * Trial 시작
     * POST /api/v1/subscription/trial
     */
    @PostMapping("/trial")
    fun startTrial(
        @RequestHeader("Authorization") authorization: String
    ): ResponseEntity<ApiResponse<TrialResponse>> {
        val userId = getUserId(authorization)
        val success = subscriptionService.startTrial(userId)

        val response = if (success) {
            TrialResponse(
                success = true,
                message = "3일 무료 체험이 시작되었습니다!",
                endDate = LocalDateTime.now().plusDays(3)
            )
        } else {
            TrialResponse(
                success = false,
                message = "이미 체험을 사용하셨거나 유료 플랜을 사용 중입니다.",
                endDate = null
            )
        }
        return ResponseEntity.ok(ApiResponse.success(response))
    }

    private fun getUserId(authorization: String): Long {
        val token = authorization.removePrefix("Bearer ")
        val userInfo = authService.getUserFromToken(token)
        return userInfo.id
    }
}
