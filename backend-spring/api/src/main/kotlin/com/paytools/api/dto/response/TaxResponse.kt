package com.paytools.api.dto.response

import io.swagger.v3.oas.annotations.media.Schema

/**
 * 세금 계산 응답
 */
@Schema(description = "세금 계산 응답")
data class TaxCalculationResponse(
    @Schema(description = "소득세")
    val incomeTax: Map<String, Any>,

    @Schema(description = "지방소득세")
    val localIncomeTax: Map<String, Any>,

    @Schema(description = "총 세금")
    val total: Long
)

/**
 * 연간 소득세 추정 응답
 */
@Schema(description = "연간 소득세 추정 응답")
data class AnnualTaxEstimateResponse(
    @Schema(description = "월 세금", example = "29975")
    val monthlyTax: Long,

    @Schema(description = "연간 세금 추정치", example = "359700")
    val annualTax: Long,

    @Schema(description = "주의사항")
    val note: String = "간이세액표 기준이므로 실제 연말정산과 차이가 있을 수 있습니다."
)
