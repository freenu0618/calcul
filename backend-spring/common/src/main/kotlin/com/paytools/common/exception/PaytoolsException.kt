package com.paytools.common.exception

/**
 * Paytools 애플리케이션 기본 예외
 */
open class PaytoolsException(
    message: String,
    cause: Throwable? = null
) : RuntimeException(message, cause)

/**
 * 리소스를 찾을 수 없음
 */
class ResourceNotFoundException(
    resource: String,
    id: Any
) : PaytoolsException("$resource not found with id: $id")

/**
 * 비즈니스 로직 위반
 */
class BusinessRuleViolationException(
    message: String
) : PaytoolsException(message)

/**
 * 인증 실패
 */
class AuthenticationException(
    message: String = "Authentication failed"
) : PaytoolsException(message)

/**
 * 권한 부족
 */
class AuthorizationException(
    message: String = "Access denied"
) : PaytoolsException(message)

/**
 * 유효하지 않은 입력
 */
class InvalidInputException(
    message: String
) : PaytoolsException(message)