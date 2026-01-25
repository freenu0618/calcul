package com.paytools.domain.service

import com.paytools.domain.vo.Money
import java.math.BigDecimal

/**
 * 4대 보험료 계산 결과
 */
data class InsuranceResult(
    val nationalPension: Money,
    val nationalPensionBase: Money,  // 국민연금 기준액 (상한/하한 적용 후)
    val healthInsurance: Money,
    val healthInsuranceBase: Money,  // 건강보험 기준액
    val longTermCare: Money,
    val employmentInsurance: Money,
    val employmentInsuranceBase: Money,  // 고용보험 기준액 (상한 적용 후)
    val baseAmount: Money  // 원본 소득
) {
    fun total(): Money =
        nationalPension + healthInsurance + longTermCare + employmentInsurance
}

/**
 * 4대 보험 계산기 (2026년 기준)
 *
 * - 국민연금: 4.75% (상한 590만원, 하한 39만원) - 2026년 연금개혁 반영
 * - 건강보험: 3.595%
 * - 장기요양보험: 건강보험료 × 13.14%
 * - 고용보험: 0.9% (상한 1350만원)
 */
class InsuranceCalculator {

    companion object {
        // 2026년 기준 요율
        val NATIONAL_PENSION_RATE = BigDecimal("0.0475")
        val HEALTH_INSURANCE_RATE = BigDecimal("0.03595")
        val LONG_TERM_CARE_RATE = BigDecimal("0.1314")
        val EMPLOYMENT_INSURANCE_RATE = BigDecimal("0.009")

        // 국민연금 기준소득월액 상한/하한
        val NATIONAL_PENSION_MAX = Money.of(5_900_000)
        val NATIONAL_PENSION_MIN = Money.of(390_000)

        // 고용보험 기준임금 상한
        val EMPLOYMENT_INSURANCE_MAX = Money.of(13_500_000)
    }

    /**
     * 4대 보험료 계산
     */
    fun calculate(grossIncome: Money): InsuranceResult {
        // 1. 국민연금 (상한/하한 적용)
        val pensionBase = applyNationalPensionLimits(grossIncome)
        val nationalPension = (pensionBase * NATIONAL_PENSION_RATE).roundToWon()

        // 2. 건강보험
        val healthInsurance = (grossIncome * HEALTH_INSURANCE_RATE).roundToWon()

        // 3. 장기요양보험 (건강보험료 기준)
        val longTermCare = (healthInsurance * LONG_TERM_CARE_RATE).roundToWon()

        // 4. 고용보험 (상한 적용)
        val employmentBase = applyEmploymentInsuranceLimit(grossIncome)
        val employmentInsurance = (employmentBase * EMPLOYMENT_INSURANCE_RATE).roundToWon()

        return InsuranceResult(
            nationalPension = nationalPension,
            nationalPensionBase = pensionBase,
            healthInsurance = healthInsurance,
            healthInsuranceBase = grossIncome,
            longTermCare = longTermCare,
            employmentInsurance = employmentInsurance,
            employmentInsuranceBase = employmentBase,
            baseAmount = grossIncome
        )
    }

    private fun applyNationalPensionLimits(income: Money): Money = when {
        income > NATIONAL_PENSION_MAX -> NATIONAL_PENSION_MAX
        income < NATIONAL_PENSION_MIN -> NATIONAL_PENSION_MIN
        else -> income
    }

    private fun applyEmploymentInsuranceLimit(income: Money): Money =
        if (income > EMPLOYMENT_INSURANCE_MAX) EMPLOYMENT_INSURANCE_MAX else income
}