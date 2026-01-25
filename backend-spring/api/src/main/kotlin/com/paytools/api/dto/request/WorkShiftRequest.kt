package com.paytools.api.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.time.LocalTime

/**
 * 근무 시프트 요청 DTO
 */
@Schema(description = "근무 시프트 요청")
data class WorkShiftRequest(
    @Schema(description = "근무 날짜", example = "2026-01-05")
    @field:NotNull(message = "근무 날짜는 필수입니다")
    val date: LocalDate,

    @Schema(description = "출근 시각", example = "09:00:00")
    @field:NotNull(message = "출근 시각은 필수입니다")
    val startTime: LocalTime,

    @Schema(description = "퇴근 시각", example = "18:00:00")
    @field:NotNull(message = "퇴근 시각은 필수입니다")
    val endTime: LocalTime,

    @Schema(description = "휴게시간 (분)", example = "60")
    @field:Min(0, message = "휴게시간은 0 이상이어야 합니다")
    val breakMinutes: Int,

    @Schema(description = "휴일근로 여부", example = "false")
    val isHolidayWork: Boolean = false
)
