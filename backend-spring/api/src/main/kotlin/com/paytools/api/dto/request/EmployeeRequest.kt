package com.paytools.api.dto.request

import com.paytools.domain.model.CompanySize
import com.paytools.domain.model.EmploymentType
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

/**
 * 근로자 정보 요청 DTO
 */
@Schema(description = "근로자 정보 요청")
data class EmployeeRequest(
    @Schema(description = "근로자 이름", example = "홍길동")
    @field:NotBlank(message = "근로자 이름은 필수입니다")
    @field:Size(min = 1, max = 100, message = "이름은 1자 이상 100자 이하여야 합니다")
    val name: String,

    @Schema(description = "부양가족 수 (본인 포함)", example = "2")
    @field:Min(0, message = "부양가족 수는 0 이상이어야 합니다")
    @field:Max(20, message = "부양가족 수는 20 이하여야 합니다")
    val dependentsCount: Int,

    @Schema(description = "20세 이하 자녀 수", example = "1")
    @field:Min(0, message = "자녀 수는 0 이상이어야 합니다")
    @field:Max(20, message = "자녀 수는 20 이하여야 합니다")
    val childrenUnder20: Int = 0,

    @Schema(description = "고용 형태", example = "FULL_TIME")
    val employmentType: EmploymentType,

    @Schema(description = "사업장 규모", example = "OVER_5")
    val companySize: CompanySize,

    @Schema(description = "주 소정근로일 (계약상 주당 근무일 수)", example = "5")
    @field:Min(1, message = "주 소정근로일은 1일 이상이어야 합니다")
    @field:Max(7, message = "주 소정근로일은 7일 이하여야 합니다")
    val scheduledWorkDays: Int = 5,

    @Schema(description = "1일 소정근로시간 (기본 8시간)", example = "8")
    @field:Min(1, message = "1일 소정근로시간은 1시간 이상이어야 합니다")
    @field:Max(24, message = "1일 소정근로시간은 24시간 이하여야 합니다")
    val dailyWorkHours: Int = 8
)
