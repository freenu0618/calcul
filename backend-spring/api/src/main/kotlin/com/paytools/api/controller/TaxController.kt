package com.paytools.api.controller

import com.paytools.api.dto.request.AnnualTaxEstimateRequest
import com.paytools.api.dto.request.TaxCalculationRequest
import com.paytools.api.dto.response.AnnualTaxEstimateResponse
import com.paytools.api.dto.response.TaxCalculationResponse
import com.paytools.domain.service.TaxCalculator
import com.paytools.domain.vo.Money
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Tax", description = "세금 계산 API")
@RestController
@RequestMapping("/api/v1/tax")
class TaxController {

    private val taxCalculator = TaxCalculator()

    @Operation(summary = "세금 계산", description = "과세 대상 소득으로 소득세와 지방소득세를 계산합니다")
    @PostMapping("/calculate")
    fun calculateTax(
        @Valid @RequestBody request: TaxCalculationRequest
    ): ResponseEntity<TaxCalculationResponse> {

        val taxableIncome = Money.of(request.taxableIncome)
        val result = taxCalculator.calculate(
            taxableIncome = taxableIncome,
            dependentsCount = request.dependentsCount,
            childrenUnder20 = request.childrenUnder20
        )

        val response = TaxCalculationResponse(
            incomeTax = mapOf(
                "amount" to result.incomeTax.amount.toLong(),
                "calculation" to "간이세액표 (부양가족 ${request.dependentsCount}명, 20세 이하 자녀 ${request.childrenUnder20}명)"
            ),
            localIncomeTax = mapOf(
                "amount" to result.localIncomeTax.amount.toLong(),
                "calculation" to "소득세 × 10%"
            ),
            total = result.total().amount.toLong()
        )

        return ResponseEntity.ok(response)
    }

    @Operation(summary = "연간 소득세 추정", description = "월 소득으로 연간 소득세를 추정합니다")
    @PostMapping("/estimate-annual")
    fun estimateAnnualTax(
        @Valid @RequestBody request: AnnualTaxEstimateRequest
    ): ResponseEntity<AnnualTaxEstimateResponse> {

        val monthlyIncome = Money.of(request.monthlyIncome)
        val monthlyTaxResult = taxCalculator.calculate(
            taxableIncome = monthlyIncome,
            dependentsCount = request.dependentsCount,
            childrenUnder20 = request.childrenUnder20
        )

        val monthlyTax = monthlyTaxResult.total().amount.toLong()
        val annualTax = monthlyTax * 12

        val response = AnnualTaxEstimateResponse(
            monthlyTax = monthlyTax,
            annualTax = annualTax
        )

        return ResponseEntity.ok(response)
    }
}
