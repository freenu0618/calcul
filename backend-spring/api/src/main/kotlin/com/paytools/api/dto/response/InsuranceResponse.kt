package com.paytools.api.dto.response

import io.swagger.v3.oas.annotations.media.Schema

/**
 * 보험료율 정보 응답
 */
@Schema(description = "보험료율 정보 응답")
data class InsuranceRatesResponse(
    @Schema(description = "적용 연도", example = "2026")
    val year: Int,

    @Schema(description = "국민연금 정보")
    val nationalPension: Map<String, Any>,

    @Schema(description = "건강보험 정보")
    val healthInsurance: Map<String, Any>,

    @Schema(description = "장기요양보험 정보")
    val longTermCare: Map<String, Any>,

    @Schema(description = "고용보험 정보")
    val employmentInsurance: Map<String, Any>
)

/**
 * 보험료 계산 응답
 */
@Schema(description = "보험료 계산 응답")
data class InsuranceCalculationResponse(
    @Schema(description = "국민연금")
    val nationalPension: Map<String, Any>,

    @Schema(description = "건강보험")
    val healthInsurance: Map<String, Any>,

    @Schema(description = "장기요양보험")
    val longTermCare: Map<String, Any>,

    @Schema(description = "고용보험")
    val employmentInsurance: Map<String, Any>,

    @Schema(description = "총 보험료")
    val total: Long
)
