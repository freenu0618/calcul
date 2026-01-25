package com.paytools.api.controller

import com.paytools.common.dto.ApiResponse
import com.paytools.api.service.AuthResult
import com.paytools.api.service.AuthService
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {

    /**
     * 회원가입
     * POST /api/v1/auth/register
     */
    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<ApiResponse<AuthResult>> {
        val result = authService.register(
            email = request.email,
            password = request.password,
            name = request.name
        )
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    /**
     * 로그인
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<ApiResponse<AuthResult>> {
        val result = authService.login(
            email = request.email,
            password = request.password
        )
        return ResponseEntity.ok(ApiResponse.success(result))
    }
}

data class RegisterRequest(
    @field:NotBlank(message = "이메일은 필수입니다")
    @field:Email(message = "올바른 이메일 형식이 아닙니다")
    val email: String,

    @field:NotBlank(message = "비밀번호는 필수입니다")
    @field:Size(min = 8, max = 100, message = "비밀번호는 8자 이상이어야 합니다")
    val password: String,

    @field:NotBlank(message = "이름은 필수입니다")
    @field:Size(min = 2, max = 50, message = "이름은 2~50자여야 합니다")
    val name: String
)

data class LoginRequest(
    @field:NotBlank(message = "이메일은 필수입니다")
    @field:Email(message = "올바른 이메일 형식이 아닙니다")
    val email: String,

    @field:NotBlank(message = "비밀번호는 필수입니다")
    val password: String
)