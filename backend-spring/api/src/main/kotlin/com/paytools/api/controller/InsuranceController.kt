package com.paytools.api.controller

import com.paytools.api.dto.request.InsuranceCalculationRequest
import com.paytools.api.dto.response.InsuranceCalculationResponse
import com.paytools.api.dto.response.InsuranceRatesResponse
import com.paytools.domain.service.InsuranceCalculator
import com.paytools.domain.vo.Money
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDate

@Tag(name = "Insurance", description = "보험료 조회 및 계산 API")
@RestController
@RequestMapping("/api/v1/insurance")
class InsuranceController {

    private val insuranceCalculator = InsuranceCalculator()

    @Operation(summary = "보험료율 조회", description = "현재 연도 4대 보험료율 정보를 조회합니다")
    @GetMapping("/rates")
    fun getInsuranceRates(): ResponseEntity<InsuranceRatesResponse> {
        val year = LocalDate.now().year

        val response = InsuranceRatesResponse(
            year = year,
            nationalPension = mapOf(
                "rate" to 0.0475,
                "max_base" to 5_900_000,
                "min_base" to 390_000
            ),
            healthInsurance = mapOf(
                "rate" to 0.03595
            ),
            longTermCare = mapOf(
                "rate" to 0.1314,
                "calculation" to "건강보험료 기준"
            ),
            employmentInsurance = mapOf(
                "rate" to 0.009,
                "max_base" to 13_500_000
            )
        )

        return ResponseEntity.ok(response)
    }

    @Operation(summary = "보험료 계산", description = "총 과세 대상 급여로 4대 보험료를 계산합니다")
    @PostMapping("/calculate")
    fun calculateInsurance(
        @Valid @RequestBody request: InsuranceCalculationRequest
    ): ResponseEntity<InsuranceCalculationResponse> {

        val grossIncome = Money.of(request.grossIncome)
        val result = insuranceCalculator.calculate(grossIncome)

        val response = InsuranceCalculationResponse(
            nationalPension = mapOf(
                "amount" to result.nationalPension.amount.toLong(),
                "rate" to 0.0475,
                "base" to result.nationalPensionBase.amount.toLong()  // 실제 적용 기준액
            ),
            healthInsurance = mapOf(
                "amount" to result.healthInsurance.amount.toLong(),
                "rate" to 0.03595,
                "base" to result.healthInsuranceBase.amount.toLong()
            ),
            longTermCare = mapOf(
                "amount" to result.longTermCare.amount.toLong(),
                "calculation" to "건강보험료 × 13.14%"
            ),
            employmentInsurance = mapOf(
                "amount" to result.employmentInsurance.amount.toLong(),
                "rate" to 0.009,
                "base" to result.employmentInsuranceBase.amount.toLong()  // 실제 적용 기준액
            ),
            total = result.total().amount.toLong()
        )

        return ResponseEntity.ok(response)
    }
}
