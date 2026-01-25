package com.paytools.domain.model

import com.paytools.domain.vo.Money
import java.util.UUID

/**
 * 수당 도메인 모델 (계산용)
 *
 * @property name 수당 이름
 * @property amount 수당 금액
 * @property isTaxable 과세 대상 여부
 * @property isIncludableInMinimumWage 최저임금 산입 여부
 * @property isFixed 고정 수당 여부
 * @property isIncludedInRegularWage 통상임금 포함 여부
 */
data class Allowance(
    val name: String,
    val amount: Money,
    val isTaxable: Boolean,
    val isIncludableInMinimumWage: Boolean,
    val isFixed: Boolean = true,
    val isIncludedInRegularWage: Boolean = true,
    val id: UUID = UUID.randomUUID()
) {
    init {
        require(name.isNotBlank()) { "Allowance name cannot be empty" }
        require(!amount.isNegative()) { "Allowance amount cannot be negative: ${amount.amount}" }
    }

    fun isRegularWage(): Boolean = isIncludedInRegularWage
    fun isNonTaxable(): Boolean = !isTaxable

    companion object {
        /**
         * 식대 수당 생성 (비과세 20만원 한도)
         */
        fun createMealAllowance(amount: Money) = Allowance(
            name = "식대",
            amount = amount,
            isTaxable = false,
            isIncludableInMinimumWage = false,
            isFixed = true,
            isIncludedInRegularWage = false
        )

        /**
         * 직책수당 생성 (과세, 통상임금 포함)
         */
        fun createPositionAllowance(amount: Money) = Allowance(
            name = "직책수당",
            amount = amount,
            isTaxable = true,
            isIncludableInMinimumWage = true,
            isFixed = true,
            isIncludedInRegularWage = true
        )

        /**
         * 연장근로수당 생성 (과세, 최저임금 비산입, 변동)
         */
        fun createOvertimeAllowance(amount: Money) = Allowance(
            name = "연장근로수당",
            amount = amount,
            isTaxable = true,
            isIncludableInMinimumWage = false,
            isFixed = false,
            isIncludedInRegularWage = false
        )
    }
}