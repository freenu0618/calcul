package com.paytools.api.dto.request

import com.paytools.domain.model.InsuranceOptions
import io.swagger.v3.oas.annotations.media.Schema

/**
 * 4대 보험 적용 옵션 요청 DTO
 */
@Schema(description = "4대 보험 적용 옵션")
data class InsuranceOptionsRequest(
    @Schema(description = "국민연금 적용 여부 (만 60세 이상 제외 가능)", example = "true")
    val applyNationalPension: Boolean = true,

    @Schema(description = "건강보험 적용 여부", example = "true")
    val applyHealthInsurance: Boolean = true,

    @Schema(description = "장기요양보험 적용 여부 (건강보험 적용 시에만 유효)", example = "true")
    val applyLongTermCare: Boolean = true,

    @Schema(description = "고용보험 적용 여부 (주 15시간 미만 제외 가능)", example = "true")
    val applyEmploymentInsurance: Boolean = true
) {
    fun toDomain(): InsuranceOptions = InsuranceOptions(
        applyNationalPension = applyNationalPension,
        applyHealthInsurance = applyHealthInsurance,
        applyLongTermCare = applyLongTermCare,
        applyEmploymentInsurance = applyEmploymentInsurance
    )

    companion object {
        fun fromDomain(options: InsuranceOptions) = InsuranceOptionsRequest(
            applyNationalPension = options.applyNationalPension,
            applyHealthInsurance = options.applyHealthInsurance,
            applyLongTermCare = options.applyLongTermCare,
            applyEmploymentInsurance = options.applyEmploymentInsurance
        )
    }
}
