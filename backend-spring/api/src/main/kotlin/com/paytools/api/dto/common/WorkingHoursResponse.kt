package com.paytools.api.dto.common

import com.paytools.domain.vo.WorkingHours
import io.swagger.v3.oas.annotations.media.Schema

/**
 * 근로시간 응답 DTO
 */
@Schema(description = "근로시간 응답")
data class WorkingHoursResponse(
    @Schema(description = "시간", example = "8")
    val hours: Int,

    @Schema(description = "분", example = "30")
    val minutes: Int,

    @Schema(description = "총 분", example = "510")
    val totalMinutes: Int,

    @Schema(description = "포맷팅 (예: 8시간 30분)", example = "8시간 30분")
    val formatted: String
) {
    companion object {
        fun from(workingHours: WorkingHours): WorkingHoursResponse {
            val hours = workingHours.hours
            val minutes = workingHours.minutes
            return WorkingHoursResponse(
                hours = hours,
                minutes = minutes,
                totalMinutes = workingHours.toMinutes(),
                formatted = workingHours.format()
            )
        }
    }
}
