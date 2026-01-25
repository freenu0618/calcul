package com.paytools.domain.vo

import java.math.BigDecimal
import java.math.RoundingMode
import java.text.NumberFormat
import java.util.Locale

/**
 * 금액 값 객체 (불변)
 * 한국 근로기준법에 따라 모든 금액은 원 단위로 반올림하여 계산
 */
data class Money(
    val amount: BigDecimal,
    val currency: String = "KRW"
) : Comparable<Money> {

    init {
        // BigDecimal은 자동 변환되므로 별도 검증 불필요
    }

    operator fun plus(other: Money): Money {
        checkCurrency(other)
        return Money(amount.add(other.amount), currency)
    }

    operator fun minus(other: Money): Money {
        checkCurrency(other)
        return Money(amount.subtract(other.amount), currency)
    }

    operator fun times(multiplier: BigDecimal): Money =
        Money(amount.multiply(multiplier), currency)

    operator fun times(multiplier: Double): Money =
        times(BigDecimal.valueOf(multiplier))

    operator fun times(multiplier: Int): Money =
        times(BigDecimal.valueOf(multiplier.toLong()))

    operator fun div(divisor: BigDecimal): Money {
        require(divisor != BigDecimal.ZERO) { "Cannot divide by zero" }
        return Money(amount.divide(divisor, 10, RoundingMode.HALF_UP), currency)
    }

    operator fun div(divisor: Double): Money =
        div(BigDecimal.valueOf(divisor))

    operator fun div(divisor: Int): Money =
        div(BigDecimal.valueOf(divisor.toLong()))

    override fun compareTo(other: Money): Int {
        checkCurrency(other)
        return amount.compareTo(other.amount)
    }

    private fun checkCurrency(other: Money) {
        require(currency == other.currency) {
            "Cannot operate on different currencies: $currency and ${other.currency}"
        }
    }

    /**
     * 원 단위로 반올림 (ROUND_HALF_UP)
     */
    fun roundToWon(): Money =
        Money(amount.setScale(0, RoundingMode.HALF_UP), currency)

    /**
     * 정수형으로 변환 (원 단위 반올림)
     */
    fun toInt(): Int = roundToWon().amount.toInt()

    /**
     * Long형으로 변환 (원 단위 반올림)
     */
    fun toLong(): Long = roundToWon().amount.toLong()

    /**
     * 금액 포맷팅 (천 단위 콤마)
     */
    fun format(withCurrency: Boolean = true): String {
        val formatter = NumberFormat.getNumberInstance(Locale.KOREA)
        val formatted = formatter.format(toInt())
        return if (withCurrency && currency == "KRW") "${formatted}원" else formatted
    }

    fun isZero(): Boolean = amount.compareTo(BigDecimal.ZERO) == 0
    fun isPositive(): Boolean = amount > BigDecimal.ZERO
    fun isNegative(): Boolean = amount < BigDecimal.ZERO

    companion object {
        val ZERO = Money(BigDecimal.ZERO)

        fun of(amount: Int): Money = Money(BigDecimal.valueOf(amount.toLong()))
        fun of(amount: Long): Money = Money(BigDecimal.valueOf(amount))
        fun of(amount: Double): Money = Money(BigDecimal.valueOf(amount))
        fun of(amount: String): Money = Money(BigDecimal(amount))
    }
}