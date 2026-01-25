package com.paytools.infrastructure.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/**
 * JWT 인증 필터
 * Authorization: Bearer <token> 헤더에서 JWT 추출 및 검증
 */
@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val token = extractToken(request)
            if (token != null && jwtTokenProvider.validateToken(token)) {
                val userId = jwtTokenProvider.getUserIdFromToken(token)
                val email = jwtTokenProvider.getEmailFromToken(token)

                val authentication = UsernamePasswordAuthenticationToken(
                    UserPrincipal(userId, email),
                    null,
                    listOf(SimpleGrantedAuthority("ROLE_USER"))
                )
                SecurityContextHolder.getContext().authentication = authentication
            }
        } catch (e: Exception) {
            // 인증 실패 시 무시하고 진행 (SecurityConfig에서 처리)
            logger.debug("JWT authentication failed: ${e.message}")
        }

        filterChain.doFilter(request, response)
    }

    private fun extractToken(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken?.startsWith("Bearer ") == true) {
            bearerToken.substring(7)
        } else null
    }
}

/**
 * 인증된 사용자 정보
 */
data class UserPrincipal(
    val userId: Long,
    val email: String
)