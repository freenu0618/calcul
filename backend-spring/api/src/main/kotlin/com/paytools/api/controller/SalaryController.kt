package com.paytools.api.controller

import com.paytools.api.dto.common.MoneyResponse
import com.paytools.api.dto.common.WorkingHoursResponse
import com.paytools.api.dto.request.SalaryCalculationRequest
import com.paytools.api.dto.response.*
import com.paytools.api.service.AuthService
import com.paytools.api.service.UsageService
import com.paytools.domain.model.*
import com.paytools.domain.model.UsageType
import com.paytools.domain.service.SalaryCalculator
import com.paytools.domain.vo.Money
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@Tag(name = "Salary", description = "급여 계산 API")
@RestController
@RequestMapping("/api/v1/salary")
class SalaryController(
    private val authService: AuthService,
    private val usageService: UsageService
) {

    private val salaryCalculator = SalaryCalculator()

    @Operation(summary = "급여 계산", description = "근로자 정보와 근무 시프트를 기반으로 급여를 계산합니다")
    @PostMapping("/calculate")
    fun calculateSalary(
        @Valid @RequestBody request: SalaryCalculationRequest,
        @RequestHeader("Authorization", required = false) authorization: String?
    ): ResponseEntity<SalaryCalculationResponse> {

        // 로그인한 사용자만 사용량 체크 (비로그인은 무제한)
        authorization?.let { auth ->
            if (auth.startsWith("Bearer ")) {
                try {
                    val token = auth.removePrefix("Bearer ")
                    val userInfo = authService.getUserFromToken(token)
                    val allowed = usageService.incrementUsage(userInfo.id, UsageType.SALARY_CALC)
                    if (!allowed) {
                        return ResponseEntity.status(429).body(null)
                    }
                } catch (_: Exception) { /* 인증 실패 시 무시 */ }
            }
        }

        // DTO → Domain Model 변환
        val employee = Employee(
            name = request.employee.name,
            dependentsCount = request.employee.dependentsCount,
            childrenUnder20 = request.employee.childrenUnder20,
            employmentType = request.employee.employmentType,
            companySize = request.employee.companySize,
            scheduledWorkDays = request.employee.scheduledWorkDays
        )

        val allowances = request.allowances.map { allowanceReq ->
            Allowance(
                name = allowanceReq.name,
                amount = Money.of(allowanceReq.amount),
                isTaxable = allowanceReq.isTaxable,
                isIncludableInMinimumWage = allowanceReq.isIncludableInMinimumWage,
                isFixed = allowanceReq.isFixed,
                isIncludedInRegularWage = allowanceReq.isIncludedInRegularWage
            )
        }

        val workShifts = request.workShifts.map { shiftReq ->
            WorkShift(
                date = shiftReq.date,
                startTime = shiftReq.startTime,
                endTime = shiftReq.endTime,
                breakMinutes = shiftReq.breakMinutes,
                isHolidayWork = shiftReq.isHolidayWork
            )
        }

        // 급여 계산 실행
        val result = salaryCalculator.calculate(
            employee = employee,
            baseSalary = Money.of(request.baseSalary),
            allowances = allowances,
            workShifts = workShifts,
            wageType = request.wageType.name,
            hourlyWageInput = request.hourlyWage.toInt(),
            calculationMonth = request.calculationMonth,
            absencePolicy = request.absencePolicy.name,
            weeklyHours = request.employee.scheduledWorkDays * request.employee.dailyWorkHours,
            hoursMode = request.hoursMode.toValue(),
            insuranceOptions = request.insuranceOptions.toDomain(),
            inclusiveWageOptions = request.inclusiveWageOptions.toDomain(),
            contractMonthlySalary = request.contractMonthlySalary
        )

        // Domain Result → Response DTO 변환
        val response = convertToResponse(result, request)

        return ResponseEntity.ok(response)
    }

    /**
     * SalaryCalculationResult → SalaryCalculationResponse 변환
     */
    private fun convertToResponse(
        result: com.paytools.domain.service.SalaryCalculationResult,
        request: SalaryCalculationRequest
    ): SalaryCalculationResponse {
        val taxableAllowances = result.allowances
            .filter { it.isTaxable }
            .fold(Money.ZERO) { acc, allowance -> acc + allowance.amount }

        val nonTaxableAllowances = result.allowances
            .filter { !it.isTaxable }
            .fold(Money.ZERO) { acc, allowance -> acc + allowance.amount }

        val grossBreakdown = GrossBreakdown(
            baseSalary = MoneyResponse.from(result.baseSalary),
            regularWage = MoneyResponse.from(result.regularWage),
            hourlyWage = MoneyResponse.from(result.hourlyWage),
            taxableAllowances = MoneyResponse.from(taxableAllowances),
            nonTaxableAllowances = MoneyResponse.from(nonTaxableAllowances),
            overtimeAllowances = OvertimeBreakdown.from(result.overtimeResult),
            weeklyHolidayPay = WeeklyHolidayPayBreakdown.from(result.weeklyHolidayResult),
            inclusiveOvertimePay = if (result.inclusiveWageOptions.enabled) {
                MoneyResponse.from(result.inclusiveOvertimePay)
            } else null,
            total = MoneyResponse.from(result.totalGross)
        )

        val deductionsBreakdown = DeductionsBreakdown(
            insurance = InsuranceBreakdown.from(result.insuranceResult),
            tax = TaxBreakdown.from(result.taxResult),
            total = MoneyResponse.from(result.totalDeductions)
        )

        val absenceBreakdown = result.absenceResult?.let {
            AbsenceBreakdown.from(it, request.absencePolicy.name)
        }

        val calculationMetadata = mapOf(
            "calculation_date" to LocalDate.now().toString(),
            "tax_year" to LocalDate.now().year,
            "insurance_year" to LocalDate.now().year,
            "wage_type" to result.wageType,
            "calculation_month" to result.calculationMonth
        )

        // 근무 요약 생성
        val workSummary = createWorkSummary(request, result)

        // 포괄임금제 옵션 응답
        val inclusiveWageOptionsResponse = if (result.inclusiveWageOptions.enabled) {
            InclusiveWageOptionsResponse(
                enabled = true,
                fixedOvertimeHourlyRate = result.inclusiveWageOptions.fixedOvertimeHourlyRate,
                monthlyExpectedOvertimeHours = result.inclusiveWageOptions.monthlyExpectedOvertimeHours.toDouble(),
                monthlyFixedOvertimePay = MoneyResponse.from(result.inclusiveOvertimePay)
            )
        } else null

        return SalaryCalculationResponse(
            employeeName = result.employee.name,
            grossBreakdown = grossBreakdown,
            deductionsBreakdown = deductionsBreakdown,
            netPay = MoneyResponse.from(result.netPay),
            workSummary = workSummary,
            absenceBreakdown = absenceBreakdown,
            inclusiveWageOptions = inclusiveWageOptionsResponse,
            warnings = emptyList(), // TODO: 경고 생성기 구현 필요
            appliedWageMode = result.appliedWageMode,
            contractVsActualDiff = result.contractVsActualDiff?.let { MoneyResponse.from(it) },
            contractGuaranteeAllowance = if (result.contractGuaranteeAllowance > Money.ZERO) {
                MoneyResponse.from(result.contractGuaranteeAllowance)
            } else null,
            calculationMetadata = calculationMetadata
        )
    }

    private fun createWorkSummary(
        request: SalaryCalculationRequest,
        result: com.paytools.domain.service.SalaryCalculationResult
    ): WorkSummaryResponse {
        val workShifts = request.workShifts.map { shiftReq ->
            WorkShift(
                date = shiftReq.date,
                startTime = shiftReq.startTime,
                endTime = shiftReq.endTime,
                breakMinutes = shiftReq.breakMinutes,
                isHolidayWork = shiftReq.isHolidayWork
            )
        }

        // 총 근무시간 (휴게시간 제외)
        val totalWorkMinutes = workShifts.sumOf { it.calculateWorkingHours().toMinutes() }
        val totalWorkHours = com.paytools.domain.vo.WorkingHours.fromMinutes(totalWorkMinutes)

        // 연장/야간/휴일 시간
        val overtimeHours = result.overtimeResult.overtimeHours
        val nightHours = result.overtimeResult.nightHours
        val holidayHours = result.overtimeResult.holidayHours

        // 소정근로시간 = 총 근무시간 - 연장시간 - 휴일시간
        val regularMinutes = maxOf(0, totalWorkMinutes - overtimeHours.toMinutes() - holidayHours.toMinutes())
        val regularHours = com.paytools.domain.vo.WorkingHours.fromMinutes(regularMinutes)

        return WorkSummaryResponse(
            calculationMonth = result.calculationMonth,
            wageType = result.wageType,
            scheduledDays = request.employee.scheduledWorkDays * 4,
            actualWorkDays = workShifts.size,
            absentDays = result.absenceResult?.absentDays ?: 0,
            totalWorkHours = WorkingHoursResponse.from(totalWorkHours),
            regularHours = WorkingHoursResponse.from(regularHours),
            overtimeHours = WorkingHoursResponse.from(overtimeHours),
            nightHours = WorkingHoursResponse.from(nightHours),
            holidayHours = WorkingHoursResponse.from(holidayHours),
            weeklyHolidayWeeks = result.weeklyHolidayResult.weeklyHours.toMinutes() / 60 / 40,
            totalWeeks = 4
        )
    }
}
