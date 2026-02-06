package com.paytools.infrastructure.ratelimit

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

/**
 * Rate Limiting 필터
 * - IP 기반 요청 제한
 * - 분당 60회 제한 (기본값)
 */
@Component
class RateLimitFilter : OncePerRequestFilter() {

    private val requestCounts = ConcurrentHashMap<String, RequestCounter>()
    private val maxRequestsPerMinute = 300
    private val windowMs = 60_000L // 1분

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        // 헬스체크는 제외
        if (request.requestURI.startsWith("/actuator")) {
            filterChain.doFilter(request, response)
            return
        }

        val clientIp = getClientIp(request)
        val counter = requestCounts.computeIfAbsent(clientIp) { RequestCounter() }

        if (counter.isAllowed(maxRequestsPerMinute, windowMs)) {
            filterChain.doFilter(request, response)
        } else {
            response.status = HttpStatus.TOO_MANY_REQUESTS.value()
            response.contentType = "application/json"
            response.writer.write("""
                {
                    "success": false,
                    "error": {
                        "message": "Too many requests",
                        "detail": "Rate limit exceeded. Please try again later."
                    }
                }
            """.trimIndent())
        }
    }

    private fun getClientIp(request: HttpServletRequest): String {
        val xForwardedFor = request.getHeader("X-Forwarded-For")
        return if (!xForwardedFor.isNullOrBlank()) {
            xForwardedFor.split(",").first().trim()
        } else {
            request.remoteAddr
        }
    }

    /**
     * 슬라이딩 윈도우 기반 요청 카운터
     */
    class RequestCounter {
        private val count = AtomicInteger(0)
        @Volatile
        private var windowStart = System.currentTimeMillis()

        @Synchronized
        fun isAllowed(maxRequests: Int, windowMs: Long): Boolean {
            val now = System.currentTimeMillis()

            // 윈도우 갱신
            if (now - windowStart > windowMs) {
                count.set(0)
                windowStart = now
            }

            return count.incrementAndGet() <= maxRequests
        }
    }
}
