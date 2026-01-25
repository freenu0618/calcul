package com.paytools.common.dto

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.Instant

/**
 * 표준 API 응답 래퍼
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: ErrorDetail? = null,
    val timestamp: Instant = Instant.now()
) {
    companion object {
        fun <T> success(data: T): ApiResponse<T> = ApiResponse(
            success = true,
            data = data
        )

        fun <T> error(message: String, detail: String? = null): ApiResponse<T> = ApiResponse(
            success = false,
            error = ErrorDetail(message, detail)
        )
    }
}

data class ErrorDetail(
    val message: String,
    val detail: String? = null
)