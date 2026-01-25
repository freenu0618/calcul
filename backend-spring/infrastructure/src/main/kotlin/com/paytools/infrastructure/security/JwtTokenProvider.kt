package com.paytools.infrastructure.security

import com.paytools.common.exception.AuthenticationException
import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

/**
 * JWT 토큰 생성 및 검증
 * 기존 Python JWT와 호환되도록 설계
 */
@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.expiration}") private val expirationMs: Long
) {
    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(secret.toByteArray())
    }

    /**
     * Access Token 생성
     */
    fun generateAccessToken(userId: Long, email: String, role: String): String {
        val now = Date()
        val expiry = Date(now.time + expirationMs)

        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .claim("role", role)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact()
    }

    /**
     * Refresh Token 생성 (7일)
     */
    fun generateRefreshToken(userId: Long): String {
        val now = Date()
        val expiry = Date(now.time + (7 * 24 * 60 * 60 * 1000)) // 7 days

        return Jwts.builder()
            .subject(userId.toString())
            .claim("type", "refresh")
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact()
    }

    /**
     * 토큰에서 사용자 ID 추출
     */
    fun getUserIdFromToken(token: String): Long {
        val claims = parseToken(token)
        return claims.subject.toLong()
    }

    /**
     * 토큰에서 이메일 추출
     */
    fun getEmailFromToken(token: String): String {
        val claims = parseToken(token)
        return claims["email"] as String
    }

    /**
     * 토큰 유효성 검증
     */
    fun validateToken(token: String): Boolean {
        return try {
            parseToken(token)
            true
        } catch (e: Exception) {
            false
        }
    }

    private fun parseToken(token: String): Claims {
        try {
            return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .payload
        } catch (e: ExpiredJwtException) {
            throw AuthenticationException("Token expired")
        } catch (e: JwtException) {
            throw AuthenticationException("Invalid token")
        }
    }
}