package com.paytools.api.dto.request

import com.fasterxml.jackson.annotation.JsonFormat
import com.paytools.domain.model.CompanySize
import com.paytools.domain.model.EmploymentType
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.*
import java.time.LocalDate
import java.time.LocalTime

/**
 * 근무자 등록/수정 요청 DTO
 */
@Schema(description = "근무자 등록/수정 요청")
data class EmployeeManagementRequest(
    @field:NotBlank(message = "이름은 필수입니다")
    @field:Size(max = 100, message = "이름은 100자 이하여야 합니다")
    @Schema(description = "근로자 이름", example = "홍길동")
    val name: String,

    @field:NotBlank(message = "주민번호 앞 7자리는 필수입니다")
    @field:Pattern(
        regexp = """^\d{6}-\d$""",
        message = "주민번호 형식이 올바르지 않습니다 (YYMMDD-N)"
    )
    @Schema(description = "주민번호 앞 7자리 (YYMMDD-N)", example = "900101-1")
    val residentIdPrefix: String,

    @field:NotNull(message = "계약 시작일은 필수입니다")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "계약 시작일", example = "2026-01-01")
    val contractStartDate: LocalDate,

    @field:NotNull(message = "고용형태는 필수입니다")
    @Schema(description = "고용형태", example = "FULL_TIME")
    val employmentType: EmploymentType,

    @field:NotNull(message = "사업장 규모는 필수입니다")
    @Schema(description = "사업장 규모", example = "OVER_5")
    val companySize: CompanySize,

    @Schema(description = "체류자격 (외국인만)", example = "E-9")
    val visaType: String? = null,

    @JsonFormat(pattern = "HH:mm")
    @Schema(description = "근무 시작시간", example = "09:00")
    val workStartTime: LocalTime = LocalTime.of(9, 0),

    @JsonFormat(pattern = "HH:mm")
    @Schema(description = "근무 종료시간", example = "18:00")
    val workEndTime: LocalTime = LocalTime.of(18, 0),

    @field:Min(value = 0, message = "휴게시간은 0분 이상이어야 합니다")
    @Schema(description = "휴게시간 (분)", example = "60")
    val breakMinutes: Int = 60,

    @field:Min(value = 1, message = "주 근무일수는 1일 이상이어야 합니다")
    @field:Max(value = 7, message = "주 근무일수는 7일 이하여야 합니다")
    @Schema(description = "주 근무일수", example = "5")
    val weeklyWorkDays: Int = 5,

    @field:Min(value = 1, message = "일일 근로시간은 1시간 이상이어야 합니다")
    @Schema(description = "일일 근로시간 (시간)", example = "8")
    val dailyWorkHours: Int = 8,

    @field:Min(value = 0, message = "수습기간은 0개월 이상이어야 합니다")
    @Schema(description = "수습기간 (월, 0=없음)", example = "3")
    val probationMonths: Int = 0,

    @field:Min(value = 0, message = "수습 급여 비율은 0% 이상이어야 합니다")
    @field:Max(value = 100, message = "수습 급여 비율은 100% 이하여야 합니다")
    @Schema(description = "수습 급여 비율 (%)", example = "90")
    val probationRate: Int = 100
)
