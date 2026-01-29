package com.paytools.api.dto.request

import com.paytools.domain.model.InclusiveWageOptions
import io.swagger.v3.oas.annotations.media.Schema
import java.math.BigDecimal

/**
 * 포괄임금제 옵션 요청 DTO
 */
@Schema(description = "포괄임금제 옵션")
data class InclusiveWageOptionsRequest(
    @Schema(description = "포괄임금제 적용 여부", example = "false")
    val enabled: Boolean = false,

    @Schema(description = "연장수당 시간당 고정 금액 (원)", example = "10500")
    val fixedOvertimeHourlyRate: Long = 0,

    @Schema(description = "월 예정 연장근로시간", example = "20")
    val monthlyExpectedOvertimeHours: Double = 0.0
) {
    fun toDomain(): InclusiveWageOptions = InclusiveWageOptions(
        enabled = enabled,
        fixedOvertimeHourlyRate = fixedOvertimeHourlyRate,
        monthlyExpectedOvertimeHours = BigDecimal.valueOf(monthlyExpectedOvertimeHours)
    )

    companion object {
        fun fromDomain(options: InclusiveWageOptions) = InclusiveWageOptionsRequest(
            enabled = options.enabled,
            fixedOvertimeHourlyRate = options.fixedOvertimeHourlyRate,
            monthlyExpectedOvertimeHours = options.monthlyExpectedOvertimeHours.toDouble()
        )
    }
}