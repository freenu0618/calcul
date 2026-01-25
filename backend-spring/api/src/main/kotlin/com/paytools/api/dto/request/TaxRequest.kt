package com.paytools.api.dto.request

import com.paytools.api.validation.ValidTaxRequest
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

/**
 * 세금 계산 요청 DTO
 */
@Schema(description = "세금 계산 요청")
@ValidTaxRequest
data class TaxCalculationRequest(
    @Schema(description = "과세 대상 소득 (원)", example = "2800000")
    @field:Min(0, message = "과세 대상 소득은 0 이상이어야 합니다")
    val taxableIncome: Long,

    @Schema(description = "부양가족 수 (본인 포함)", example = "2")
    @field:Min(0, message = "부양가족 수는 0 이상이어야 합니다")
    @field:Max(20, message = "부양가족 수는 20 이하여야 합니다")
    val dependentsCount: Int,

    @Schema(description = "20세 이하 자녀 수", example = "1")
    @field:Min(0, message = "자녀 수는 0 이상이어야 합니다")
    @field:Max(20, message = "자녀 수는 20 이하여야 합니다")
    val childrenUnder20: Int = 0
)

/**
 * 연간 소득세 추정 요청 DTO
 */
@Schema(description = "연간 소득세 추정 요청")
data class AnnualTaxEstimateRequest(
    @Schema(description = "월 소득 (원)", example = "2800000")
    @field:Min(0, message = "월 소득은 0 이상이어야 합니다")
    val monthlyIncome: Long,

    @Schema(description = "부양가족 수 (본인 포함)", example = "2")
    @field:Min(0, message = "부양가족 수는 0 이상이어야 합니다")
    @field:Max(20, message = "부양가족 수는 20 이하여야 합니다")
    val dependentsCount: Int,

    @Schema(description = "20세 이하 자녀 수", example = "1")
    @field:Min(0, message = "자녀 수는 0 이상이어야 합니다")
    @field:Max(20, message = "자녀 수는 20 이하여야 합니다")
    val childrenUnder20: Int = 0
)
