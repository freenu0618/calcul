package com.paytools.infrastructure.security

import com.paytools.infrastructure.entity.UserEntity
import com.paytools.infrastructure.repository.UserRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

/**
 * OAuth2 로그인 성공 시 JWT 발급 후 프론트엔드로 리다이렉트
 */
@Component
class OAuth2SuccessHandler(
    private val jwtTokenProvider: JwtTokenProvider,
    private val userRepository: UserRepository,
    @Value("\${oauth2.frontend-redirect-url}") private val frontendRedirectUrl: String
) : SimpleUrlAuthenticationSuccessHandler() {

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val oauthToken = authentication as OAuth2AuthenticationToken
        val oauthUser = oauthToken.principal as OAuth2User
        val provider = oauthToken.authorizedClientRegistrationId

        // OAuth 사용자 정보 추출
        val (email, name) = extractUserInfo(oauthUser, provider)

        if (email.isNullOrBlank()) {
            val errorUrl = "$frontendRedirectUrl?error=${encode("이메일 정보를 가져올 수 없습니다")}"
            response.sendRedirect(errorUrl)
            return
        }

        // 사용자 찾기 또는 생성
        val user = userRepository.findByEmail(email) ?: createUser(email, name, provider)

        // JWT 토큰 발급
        val token = jwtTokenProvider.generateToken(user.id.toString())

        // 프론트엔드로 리다이렉트 (토큰 포함)
        val redirectUrl = "$frontendRedirectUrl?token=$token&name=${encode(user.name)}"
        response.sendRedirect(redirectUrl)
    }

    private fun extractUserInfo(oauthUser: OAuth2User, provider: String): Pair<String?, String?> {
        return when (provider) {
            "google" -> {
                val email = oauthUser.getAttribute<String>("email")
                val name = oauthUser.getAttribute<String>("name")
                email to name
            }
            "kakao" -> {
                val kakaoAccount = oauthUser.getAttribute<Map<String, Any>>("kakao_account")
                val profile = kakaoAccount?.get("profile") as? Map<String, Any>
                val email = kakaoAccount?.get("email") as? String
                val name = profile?.get("nickname") as? String
                email to name
            }
            "naver" -> {
                val responseData = oauthUser.getAttribute<Map<String, Any>>("response")
                val email = responseData?.get("email") as? String
                val name = responseData?.get("name") as? String
                email to name
            }
            else -> null to null
        }
    }

    private fun createUser(email: String, name: String?, provider: String): UserEntity {
        val newUser = UserEntity(
            email = email,
            password = "", // OAuth 사용자는 비밀번호 없음
            name = name ?: email.substringBefore("@"),
            oauthProvider = provider
        )
        return userRepository.save(newUser)
    }

    private fun encode(value: String): String =
        URLEncoder.encode(value, StandardCharsets.UTF_8)
}
