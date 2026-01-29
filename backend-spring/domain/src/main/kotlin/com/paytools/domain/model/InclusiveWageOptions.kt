package com.paytools.domain.model

import com.paytools.domain.vo.Money
import java.math.BigDecimal

/**
 * 포괄임금제 옵션
 *
 * 포괄임금제: 연장/야간/휴일근로 수당을 고정 금액으로 지급하는 방식
 * - 연장수당 시간당 금액 또는 월 정액 지정
 * - 월 예정 연장근로시간 지정
 *
 * 주의: 포괄임금제 시 최저시급 미달 여부 검증 필수
 * - 근로기준법 위반 가능성 안내
 */
data class InclusiveWageOptions(
    val enabled: Boolean = false,                    // 포괄임금제 적용 여부
    val fixedOvertimeHourlyRate: Long = 0,           // 연장수당 시간당 고정 금액 (원)
    val monthlyExpectedOvertimeHours: BigDecimal = BigDecimal.ZERO  // 월 예정 연장근로시간
) {
    /**
     * 월 고정 연장수당 계산
     * = 시간당 고정 금액 × 월 예정 연장시간
     */
    fun calculateMonthlyFixedOvertimePay(): Money {
        if (!enabled || fixedOvertimeHourlyRate <= 0) return Money.ZERO
        return Money.of((BigDecimal.valueOf(fixedOvertimeHourlyRate) * monthlyExpectedOvertimeHours).toLong())
    }

    /**
     * 최저시급 위반 여부 검증
     * @param baseSalary 기본급
     * @param monthlyHours 월 소정근로시간
     * @param minWage 최저시급
     */
    fun validateMinimumWage(baseSalary: Money, monthlyHours: BigDecimal, minWage: Long): MinWageValidation {
        if (!enabled) return MinWageValidation(isValid = true, message = null)

        // 총 지급액 = 기본급 + 고정 연장수당
        val totalPay = baseSalary + calculateMonthlyFixedOvertimePay()

        // 총 근로시간 = 소정근로시간 + 연장근로시간
        val totalHours = monthlyHours + monthlyExpectedOvertimeHours

        // 환산 시급 = 총 지급액 / 총 근로시간
        val effectiveHourlyRate = if (totalHours > BigDecimal.ZERO) {
            totalPay.amount.divide(totalHours, 0, java.math.RoundingMode.HALF_UP)
        } else {
            BigDecimal.ZERO
        }

        val isValid = effectiveHourlyRate >= BigDecimal.valueOf(minWage)

        val message = if (!isValid) {
            "⚠️ 포괄임금제 최저임금 위반 위험: 환산시급 ${effectiveHourlyRate}원 < 최저시급 ${minWage}원"
        } else {
            null
        }

        return MinWageValidation(
            isValid = isValid,
            effectiveHourlyRate = effectiveHourlyRate.toLong(),
            message = message
        )
    }

    companion object {
        val DISABLED = InclusiveWageOptions()
    }
}

data class MinWageValidation(
    val isValid: Boolean,
    val effectiveHourlyRate: Long = 0,
    val message: String? = null
)