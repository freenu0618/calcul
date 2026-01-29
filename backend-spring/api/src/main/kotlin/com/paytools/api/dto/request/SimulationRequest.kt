package com.paytools.api.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

/**
 * 급여 구조 비교 시뮬레이션 요청
 */
@Schema(description = "급여 구조 비교 시뮬레이션 요청")
data class SimulationCompareRequest(
    @field:NotNull
    @field:Min(0)
    @Schema(description = "월 총 급여액", example = "2500000")
    val monthlyTotal: Long,

    @field:Min(15)
    @field:Max(60)
    @Schema(description = "주 소정근로시간", example = "40", defaultValue = "40")
    val weeklyHours: Int = 40,

    @field:Min(0)
    @field:Max(100)
    @Schema(description = "예상 월 연장근로시간", example = "20", defaultValue = "0")
    val expectedOvertimeHours: BigDecimal = BigDecimal.ZERO,

    @field:Min(0)
    @field:Max(100)
    @Schema(description = "예상 월 야간근로시간", example = "0", defaultValue = "0")
    val expectedNightHours: BigDecimal = BigDecimal.ZERO,

    @field:Min(0)
    @field:Max(100)
    @Schema(description = "예상 월 휴일근로시간", example = "8", defaultValue = "0")
    val expectedHolidayHours: BigDecimal = BigDecimal.ZERO,

    @Schema(description = "A안 기본급 비율 (0.0~1.0)", example = "1.0", defaultValue = "1.0")
    val baseSalaryRatioA: BigDecimal = BigDecimal.ONE,

    @Schema(description = "B안 기본급 비율 (0.0~1.0)", example = "0.6", defaultValue = "0.6")
    val baseSalaryRatioB: BigDecimal = BigDecimal("0.6")
)

/**
 * 단일 플랜 시뮬레이션 요청
 */
@Schema(description = "단일 플랜 시뮬레이션 요청")
data class SimulationSingleRequest(
    @field:NotNull
    @field:Min(0)
    @Schema(description = "월 총 급여액", example = "2500000")
    val monthlyTotal: Long,

    @Schema(description = "기본급 비율 (0.0~1.0)", example = "0.8")
    val baseSalaryRatio: BigDecimal,

    @field:Min(15)
    @field:Max(60)
    @Schema(description = "주 소정근로시간", example = "40", defaultValue = "40")
    val weeklyHours: Int = 40,

    @field:Min(0)
    @field:Max(100)
    @Schema(description = "예상 월 연장근로시간", example = "20", defaultValue = "0")
    val expectedOvertimeHours: BigDecimal = BigDecimal.ZERO,

    @field:Min(0)
    @field:Max(100)
    @Schema(description = "예상 월 야간근로시간", example = "0", defaultValue = "0")
    val expectedNightHours: BigDecimal = BigDecimal.ZERO,

    @field:Min(0)
    @field:Max(100)
    @Schema(description = "예상 월 휴일근로시간", example = "8", defaultValue = "0")
    val expectedHolidayHours: BigDecimal = BigDecimal.ZERO
)
