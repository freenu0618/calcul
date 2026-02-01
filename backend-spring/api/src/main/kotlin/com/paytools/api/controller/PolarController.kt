package com.paytools.api.controller

import com.paytools.api.service.AuthService
import com.paytools.api.service.PolarService
import com.paytools.api.service.UserInfo
import com.paytools.common.dto.ApiResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * Polar 결제 API Controller
 */
@RestController
@RequestMapping("/api/v1/payment")
class PolarController(
    private val polarService: PolarService,
    private val authService: AuthService
) {
    /**
     * Checkout 세션 생성
     * POST /api/v1/payment/checkout
     */
    @PostMapping("/checkout")
    fun createCheckout(
        @RequestHeader("Authorization") authorization: String,
        @RequestBody request: CheckoutRequest
    ): ResponseEntity<ApiResponse<CheckoutResponse>> {
        val user = getUserFromToken(authorization)

        val result = polarService.createCheckoutSession(
            plan = request.plan,
            customerEmail = user.email,
            userId = user.id,
            successUrl = request.successUrl
        )

        return if (result.success) {
            ResponseEntity.ok(ApiResponse.success(CheckoutResponse(
                checkoutUrl = result.checkoutUrl,
                checkoutId = result.checkoutId
            )))
        } else {
            ResponseEntity.badRequest().body(ApiResponse.error(result.error ?: "결제 세션 생성 실패"))
        }
    }

    /**
     * 구독 취소
     * POST /api/v1/payment/cancel
     */
    @PostMapping("/cancel")
    fun cancelSubscription(
        @RequestHeader("Authorization") authorization: String
    ): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val user = getUserFromToken(authorization)

        val subscriptionId = user.polarSubscriptionId
        if (subscriptionId.isNullOrBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("활성 구독이 없습니다"))
        }

        val success = polarService.cancelSubscription(subscriptionId)
        return if (success) {
            ResponseEntity.ok(ApiResponse.success(mapOf(
                "success" to true,
                "message" to "구독이 취소되었습니다. 현재 결제 기간이 끝날 때까지 서비스를 이용하실 수 있습니다."
            )))
        } else {
            ResponseEntity.badRequest().body(ApiResponse.error("구독 취소 실패"))
        }
    }

    private fun getUserFromToken(authorization: String): UserInfo {
        val token = authorization.removePrefix("Bearer ")
        return authService.getUserFromToken(token)
    }

    data class CheckoutRequest(
        val plan: String,  // basic, basic_annual, pro, pro_annual
        val successUrl: String? = null
    )

    data class CheckoutResponse(
        val checkoutUrl: String,
        val checkoutId: String
    )
}
