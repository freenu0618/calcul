package com.paytools.api.dto.request

import com.fasterxml.jackson.annotation.JsonFormat
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.*
import java.time.LocalDate
import java.time.LocalTime

/** 근무 계약 등록 요청 */
@Schema(description = "근무 계약 등록 요청")
data class WorkContractCreateRequest(
    @Schema(description = "직원 ID", required = true)
    @field:NotBlank(message = "직원 ID는 필수입니다")
    val employeeId: String,

    @Schema(description = "계약 유형 (MONTHLY/HOURLY)", example = "MONTHLY")
    @field:NotBlank(message = "계약 유형은 필수입니다")
    @field:Pattern(regexp = "^(MONTHLY|HOURLY)$", message = "MONTHLY 또는 HOURLY만 가능합니다")
    val contractType: String,

    @Schema(description = "기본 금액 (월급 또는 시급, 원)", example = "2800000")
    @field:Min(value = 1, message = "기본 금액은 1원 이상이어야 합니다")
    val baseAmount: Long,

    @Schema(description = "주 소정근로시간", example = "40")
    @field:Min(1) @field:Max(52)
    val scheduledHoursPerWeek: Int = 40,

    @Schema(description = "주 소정근로일수", example = "5")
    @field:Min(1) @field:Max(7)
    val scheduledDaysPerWeek: Int = 5,

    @Schema(description = "계약 시작일", example = "2026-01-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    val effectiveDate: LocalDate,

    @Schema(description = "계약 종료일 (선택)", example = "2026-12-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    val endDate: LocalDate? = null,

    @Schema(description = "고정 수당 목록 (JSON)", example = "[]")
    val allowancesJson: String = "[]"
)

/** 출퇴근 기록 등록 요청 */
@Schema(description = "출퇴근 기록 등록 요청")
data class WorkShiftCreateRequest(
    @Schema(description = "직원 ID", required = true)
    @field:NotBlank(message = "직원 ID는 필수입니다")
    val employeeId: String,

    @Schema(description = "근무일", example = "2026-01-28")
    @JsonFormat(pattern = "yyyy-MM-dd")
    val date: LocalDate,

    @Schema(description = "출근 시간", example = "09:00")
    @JsonFormat(pattern = "HH:mm")
    val startTime: LocalTime,

    @Schema(description = "퇴근 시간", example = "18:00")
    @JsonFormat(pattern = "HH:mm")
    val endTime: LocalTime,

    @Schema(description = "휴게시간 (분)", example = "60")
    @field:Min(0)
    val breakMinutes: Int = 60,

    @Schema(description = "휴일근로 여부", example = "false")
    val isHolidayWork: Boolean = false,

    @Schema(description = "메모")
    val memo: String? = null
)

/** 급여 기간 생성 요청 */
@Schema(description = "급여 기간 생성 요청")
data class PayrollPeriodCreateRequest(
    @Schema(description = "연도", example = "2026")
    @field:Min(2020) @field:Max(2100)
    val year: Int,

    @Schema(description = "월", example = "1")
    @field:Min(1) @field:Max(12)
    val month: Int,

    @Schema(description = "메모")
    val memo: String? = null
)

/** 급여 기간 상태 변경 요청 */
@Schema(description = "급여 기간 상태 변경 요청")
data class PayrollPeriodStatusRequest(
    @Schema(description = "상태 (DRAFT/CONFIRMED/PAID)", example = "CONFIRMED")
    @field:NotBlank
    @field:Pattern(regexp = "^(DRAFT|CONFIRMED|PAID)$")
    val status: String
)

/** 급여 엔트리 생성/수정 요청 */
@Schema(description = "급여 엔트리 생성 요청")
data class PayrollEntryRequest(
    @Schema(description = "직원 ID", required = true)
    @field:NotBlank
    val employeeId: String,

    @Schema(description = "계약 ID (선택)")
    val contractId: Long? = null,

    @Schema(description = "기본급", example = "2800000")
    @field:Min(0)
    val baseSalary: Long,

    @Schema(description = "수당 목록 (JSON)", example = "[]")
    val allowancesJson: String = "[]",

    @Schema(description = "총 근무시간 (분)", example = "10080")
    @field:Min(0)
    val totalWorkMinutes: Int = 0,

    @Schema(description = "연장근로시간 (분)", example = "480")
    @field:Min(0)
    val overtimeMinutes: Int = 0,

    @Schema(description = "야간근로시간 (분)", example = "0")
    @field:Min(0)
    val nightMinutes: Int = 0,

    @Schema(description = "휴일근로시간 (분)", example = "0")
    @field:Min(0)
    val holidayMinutes: Int = 0,

    // 계산 결과 (선택적, 이미 계산된 값이 있으면 전달)
    @Schema(description = "총 지급액")
    val totalGross: Long? = null,

    @Schema(description = "실수령액")
    val netPay: Long? = null,

    @Schema(description = "총 공제액")
    val totalDeductions: Long? = null,

    @Schema(description = "연장수당")
    val overtimePay: Long? = null,

    @Schema(description = "야간수당")
    val nightPay: Long? = null,

    @Schema(description = "휴일수당")
    val holidayPay: Long? = null,

    @Schema(description = "주휴수당")
    val weeklyHolidayPay: Long? = null
)
