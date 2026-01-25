package com.paytools.api.controller

import com.paytools.api.dto.common.MoneyResponse
import com.paytools.api.dto.common.WorkingHoursResponse
import com.paytools.api.dto.request.SalaryCalculationRequest
import com.paytools.api.dto.response.*
import com.paytools.domain.model.*
import com.paytools.domain.service.SalaryCalculator
import com.paytools.domain.vo.Money
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.LocalDateTime

@Tag(name = "Salary", description = "급여 계산 API")
@RestController
@RequestMapping("/api/v1/salary")
class SalaryController {

    private val salaryCalculator = SalaryCalculator()

    @Operation(summary = "급여 계산", description = "근로자 정보와 근무 시프트를 기반으로 급여를 계산합니다")
    @PostMapping("/calculate")
    fun calculateSalary(
        @Valid @RequestBody request: SalaryCalculationRequest
    ): ResponseEntity<SalaryCalculationResponse> {

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
            hoursMode = request.hoursMode.toValue()
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

        return SalaryCalculationResponse(
            employeeName = result.employee.name,
            grossBreakdown = grossBreakdown,
            deductionsBreakdown = deductionsBreakdown,
            netPay = MoneyResponse.from(result.netPay),
            workSummary = null, // TODO: 근무 요약 구현 필요
            absenceBreakdown = absenceBreakdown,
            warnings = emptyList(), // TODO: 경고 생성기 구현 필요
            calculationMetadata = calculationMetadata
        )
    }
}
