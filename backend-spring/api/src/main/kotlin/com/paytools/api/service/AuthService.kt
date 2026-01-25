package com.paytools.api.service

import com.paytools.common.exception.AuthenticationException
import com.paytools.common.exception.BusinessRuleViolationException
import com.paytools.domain.entity.User
import com.paytools.domain.entity.UserRole
import com.paytools.infrastructure.repository.UserRepository
import com.paytools.infrastructure.security.JwtTokenProvider
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    /**
     * 회원가입
     */
    @Transactional
    fun register(email: String, password: String, name: String): AuthResult {
        if (userRepository.existsByEmail(email)) {
            throw BusinessRuleViolationException("이미 등록된 이메일입니다: $email")
        }

        val user = User(
            email = email,
            passwordHash = passwordEncoder.encode(password),
            name = name,
            role = UserRole.USER
        )
        val saved = userRepository.save(user)

        return generateTokens(saved)
    }

    /**
     * 로그인
     */
    @Transactional(readOnly = true)
    fun login(email: String, password: String): AuthResult {
        val user = userRepository.findByEmail(email)
            .orElseThrow { AuthenticationException("이메일 또는 비밀번호가 올바르지 않습니다") }

        if (!user.isActive) {
            throw AuthenticationException("비활성화된 계정입니다")
        }

        if (!passwordEncoder.matches(password, user.passwordHash)) {
            throw AuthenticationException("이메일 또는 비밀번호가 올바르지 않습니다")
        }

        return generateTokens(user)
    }

    private fun generateTokens(user: User): AuthResult {
        val accessToken = jwtTokenProvider.generateAccessToken(
            userId = user.id,
            email = user.email,
            role = user.role.name
        )
        val refreshToken = jwtTokenProvider.generateRefreshToken(user.id)

        return AuthResult(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = UserInfo(
                id = user.id,
                email = user.email,
                name = user.name,
                role = user.role.name
            )
        )
    }
}

data class AuthResult(
    val accessToken: String,
    val refreshToken: String,
    val user: UserInfo
)

data class UserInfo(
    val id: Long,
    val email: String,
    val name: String,
    val role: String
)