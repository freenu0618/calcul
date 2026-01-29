package com.paytools.api.dto.request

import com.paytools.domain.model.AbsencePolicy
import com.paytools.domain.model.HoursMode
import com.paytools.domain.model.WageType
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Pattern

/**
 * 급여 계산 요청 DTO
 */
@Schema(description = "급여 계산 요청")
data class SalaryCalculationRequest(
    @Schema(description = "근로자 정보")
    @field:Valid
    val employee: EmployeeRequest,

    @Schema(description = "기본 월급 (월급제)", example = "2500000")
    @field:Min(0, message = "기본 월급은 0 이상이어야 합니다")
    val baseSalary: Long = 0,

    @Schema(description = "수당 목록")
    @field:Valid
    val allowances: List<AllowanceRequest> = emptyList(),

    @Schema(description = "근무 시프트 목록")
    @field:Valid
    val workShifts: List<WorkShiftRequest> = emptyList(),

    @Schema(description = "급여 형태 (MONTHLY=월급제, HOURLY=시급제)", example = "MONTHLY")
    val wageType: WageType = WageType.MONTHLY,

    @Schema(description = "시급 (시급제일 때 사용)", example = "10320")
    @field:Min(0, message = "시급은 0 이상이어야 합니다")
    val hourlyWage: Long = 0,

    @Schema(description = "계산 대상 월 (YYYY-MM, 빈 값이면 시프트 날짜에서 추론)", example = "2026-01")
    @field:Pattern(regexp = "^(\\d{4}-\\d{2})?$", message = "YYYY-MM 형식이어야 합니다")
    val calculationMonth: String = "",

    @Schema(description = "결근 공제 정책 (월급제 전용)", example = "STRICT")
    val absencePolicy: AbsencePolicy = AbsencePolicy.STRICT,

    @Schema(description = "월 소정근로시간 계산 방식 (174=주휴분리, 209=주휴포함)", example = "174")
    val hoursMode: HoursMode = HoursMode.MODE_174,

    @Schema(description = "4대 보험 적용 옵션")
    @field:Valid
    val insuranceOptions: InsuranceOptionsRequest = InsuranceOptionsRequest(),

    @Schema(description = "포괄임금제 옵션")
    @field:Valid
    val inclusiveWageOptions: InclusiveWageOptionsRequest = InclusiveWageOptionsRequest()
)
