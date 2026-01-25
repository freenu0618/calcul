package com.paytools.api.dto.response

import com.fasterxml.jackson.annotation.JsonFormat
import com.paytools.domain.model.CompanySize
import com.paytools.domain.model.EmploymentType
import com.paytools.infrastructure.entity.EmployeeEntity
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

/**
 * 근무자 응답 DTO
 */
@Schema(description = "근무자 정보")
data class EmployeeResponse(
    @Schema(description = "근무자 ID")
    val id: String,

    @Schema(description = "근로자 이름", example = "홍길동")
    val name: String,

    @Schema(description = "주민번호 앞 7자리 (YYMMDD-N)", example = "900101-1")
    val residentIdPrefix: String,

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "생년월일", example = "1990-01-01")
    val birthDate: LocalDate,

    @Schema(description = "외국인 여부", example = "false")
    val isForeigner: Boolean,

    @Schema(description = "체류자격 (외국인만)", example = "E-9")
    val visaType: String? = null,

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "계약 시작일", example = "2026-01-01")
    val contractStartDate: LocalDate,

    @Schema(description = "고용형태", example = "FULL_TIME")
    val employmentType: EmploymentType,

    @Schema(description = "사업장 규모", example = "OVER_5")
    val companySize: CompanySize,

    @JsonFormat(pattern = "HH:mm")
    @Schema(description = "근무 시작시간", example = "09:00")
    val workStartTime: LocalTime,

    @JsonFormat(pattern = "HH:mm")
    @Schema(description = "근무 종료시간", example = "18:00")
    val workEndTime: LocalTime,

    @Schema(description = "휴게시간 (분)", example = "60")
    val breakMinutes: Int,

    @Schema(description = "주 근무일수", example = "5")
    val weeklyWorkDays: Int,

    @Schema(description = "일일 근로시간 (시간)", example = "8")
    val dailyWorkHours: Int,

    @Schema(description = "수습기간 (월, 0=없음)", example = "3")
    val probationMonths: Int,

    @Schema(description = "수습 급여 비율 (%)", example = "90")
    val probationRate: Int,

    @Schema(description = "만 나이", example = "35")
    val age: Int,

    @Schema(description = "국민연금 가입 대상 여부 (만 60세 미만)", example = "true")
    val isPensionEligible: Boolean,

    @Schema(description = "수습기간 중 여부", example = "false")
    val isInProbation: Boolean,

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "등록일", example = "2026-01-25")
    val createdAt: LocalDate,

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "수정일", example = "2026-01-25")
    val updatedAt: LocalDate
) {
    companion object {
        fun from(entity: EmployeeEntity): EmployeeResponse {
            return EmployeeResponse(
                id = entity.id.toString(),
                name = entity.name,
                residentIdPrefix = entity.residentIdPrefix,
                birthDate = entity.birthDate,
                isForeigner = entity.isForeigner,
                visaType = entity.visaType,
                contractStartDate = entity.contractStartDate,
                employmentType = entity.employmentType,
                companySize = entity.companySize,
                workStartTime = entity.workStartTime,
                workEndTime = entity.workEndTime,
                breakMinutes = entity.breakMinutes,
                weeklyWorkDays = entity.weeklyWorkDays,
                dailyWorkHours = entity.dailyWorkHours,
                probationMonths = entity.probationMonths,
                probationRate = entity.probationRate,
                age = entity.calculateAge(),
                isPensionEligible = entity.isPensionEligible(),
                isInProbation = entity.isInProbation(),
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt
            )
        }
    }
}

/**
 * 근무자 목록 응답 DTO
 */
@Schema(description = "근무자 목록")
data class EmployeeListResponse(
    @Schema(description = "근무자 목록")
    val employees: List<EmployeeResponse>,

    @Schema(description = "총 개수", example = "10")
    val totalCount: Int
)
