package com.paytools.api.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Min

/**
 * 보험료 계산 요청 DTO
 */
@Schema(description = "보험료 계산 요청")
data class InsuranceCalculationRequest(
    @Schema(description = "총 과세 대상 급여 (원)", example = "2800000")
    @field:Min(0, message = "총 과세 대상 급여는 0 이상이어야 합니다")
    val grossIncome: Long
)
