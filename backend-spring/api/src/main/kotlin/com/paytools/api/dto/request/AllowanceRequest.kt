package com.paytools.api.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

/**
 * 수당 요청 DTO
 */
@Schema(description = "수당 요청")
data class AllowanceRequest(
    @Schema(description = "수당 이름", example = "직책수당")
    @field:NotBlank(message = "수당 이름은 필수입니다")
    @field:Size(min = 1, max = 100, message = "수당 이름은 1자 이상 100자 이하여야 합니다")
    val name: String,

    @Schema(description = "수당 금액 (원)", example = "300000")
    @field:Min(0, message = "수당 금액은 0 이상이어야 합니다")
    val amount: Long,

    @Schema(description = "과세 대상 여부", example = "true")
    val isTaxable: Boolean,

    @Schema(description = "최저임금 산입 여부", example = "true")
    val isIncludableInMinimumWage: Boolean,

    @Schema(description = "고정 수당 여부", example = "true")
    val isFixed: Boolean = true,

    @Schema(description = "통상임금 포함 여부", example = "true")
    val isIncludedInRegularWage: Boolean = true
)
