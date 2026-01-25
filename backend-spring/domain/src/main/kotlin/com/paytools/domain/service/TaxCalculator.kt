package com.paytools.domain.service

import com.paytools.domain.vo.Money
import java.math.BigDecimal

/**
 * 세금 계산 결과
 */
data class TaxResult(
    val incomeTax: Money,
    val localIncomeTax: Money,
    val taxableIncome: Money,
    val dependentsCount: Int,
    val childrenUnder20: Int = 0
) {
    fun total(): Money = incomeTax + localIncomeTax
}

/**
 * 소득세 계산기 (2026년 간이세액표 기준)
 */
class TaxCalculator {

    companion object {
        private val LOCAL_TAX_RATE = BigDecimal("0.1")

        // 2026년 간이세액표 (국세청 기준)
        private val TAX_TABLE_2026: List<TaxBracket> = listOf(
            TaxBracket(0, 1_060_000, mapOf(1 to 0, 2 to 0, 3 to 0, 4 to 0, 5 to 0, 6 to 0, 7 to 0, 8 to 0, 9 to 0, 10 to 0, 11 to 0)),
            TaxBracket(1_060_000, 1_510_000, mapOf(1 to 6_880, 2 to 4_170, 3 to 1_460, 4 to 0, 5 to 0, 6 to 0, 7 to 0, 8 to 0, 9 to 0, 10 to 0, 11 to 0)),
            TaxBracket(1_510_000, 2_060_000, mapOf(1 to 17_490, 2 to 11_670, 3 to 5_840, 4 to 0, 5 to 0, 6 to 0, 7 to 0, 8 to 0, 9 to 0, 10 to 0, 11 to 0)),
            TaxBracket(2_060_000, 2_560_000, mapOf(1 to 31_290, 2 to 22_920, 3 to 14_550, 4 to 6_180, 5 to 0, 6 to 0, 7 to 0, 8 to 0, 9 to 0, 10 to 0, 11 to 0)),
            TaxBracket(2_560_000, 3_060_000, mapOf(1 to 49_090, 2 to 38_170, 3 to 27_250, 4 to 16_330, 5 to 5_410, 6 to 0, 7 to 0, 8 to 0, 9 to 0, 10 to 0, 11 to 0)),
            TaxBracket(3_060_000, 3_560_000, mapOf(1 to 70_890, 2 to 57_420, 3 to 43_950, 4 to 30_480, 5 to 17_010, 6 to 3_540, 7 to 0, 8 to 0, 9 to 0, 10 to 0, 11 to 0)),
            TaxBracket(3_560_000, 4_060_000, mapOf(1 to 96_690, 2 to 80_670, 3 to 64_650, 4 to 48_630, 5 to 32_610, 6 to 16_590, 7 to 570, 8 to 0, 9 to 0, 10 to 0, 11 to 0)),
            TaxBracket(4_060_000, 4_560_000, mapOf(1 to 126_490, 2 to 107_920, 3 to 89_350, 4 to 70_780, 5 to 52_210, 6 to 33_640, 7 to 15_070, 8 to 0, 9 to 0, 10 to 0, 11 to 0)),
            TaxBracket(4_560_000, 5_060_000, mapOf(1 to 160_290, 2 to 139_170, 3 to 118_050, 4 to 96_930, 5 to 75_810, 6 to 54_690, 7 to 33_570, 8 to 12_450, 9 to 0, 10 to 0, 11 to 0)),
            TaxBracket(5_060_000, 6_060_000, mapOf(1 to 204_090, 2 to 179_420, 3 to 154_750, 4 to 130_080, 5 to 105_410, 6 to 80_740, 7 to 56_070, 8 to 31_400, 9 to 6_730, 10 to 0, 11 to 0)),
            TaxBracket(6_060_000, 7_060_000, mapOf(1 to 273_890, 2 to 244_670, 3 to 215_450, 4 to 186_230, 5 to 157_010, 6 to 127_790, 7 to 98_570, 8 to 69_350, 9 to 40_130, 10 to 10_910, 11 to 0)),
            TaxBracket(7_060_000, 8_060_000, mapOf(1 to 353_690, 2 to 319_920, 3 to 286_150, 4 to 252_380, 5 to 218_610, 6 to 184_840, 7 to 151_070, 8 to 117_300, 9 to 83_530, 10 to 49_760, 11 to 15_990)),
            TaxBracket(8_060_000, 9_060_000, mapOf(1 to 443_490, 2 to 405_170, 3 to 366_850, 4 to 328_530, 5 to 290_210, 6 to 251_890, 7 to 213_570, 8 to 175_250, 9 to 136_930, 10 to 98_610, 11 to 60_290)),
            TaxBracket(9_060_000, 10_000_000, mapOf(1 to 543_290, 2 to 500_420, 3 to 457_550, 4 to 414_680, 5 to 371_810, 6 to 328_940, 7 to 286_070, 8 to 243_200, 9 to 200_330, 10 to 157_460, 11 to 114_590)),
            TaxBracket(10_000_000, 100_000_000, mapOf(1 to 643_090, 2 to 595_670, 3 to 548_250, 4 to 500_830, 5 to 453_410, 6 to 405_990, 7 to 358_570, 8 to 311_150, 9 to 263_730, 10 to 216_310, 11 to 168_890))
        )
    }

    private data class TaxBracket(
        val minIncome: Int,
        val maxIncome: Int,
        val taxByDependents: Map<Int, Int>
    )

    /**
     * 소득세 계산 (간이세액표 기준)
     */
    fun calculate(
        taxableIncome: Money,
        dependentsCount: Int,
        childrenUnder20: Int = 0
    ): TaxResult {
        // 20세 이하 자녀 1명당 부양가족 1명 추가 효과
        val effectiveDependents = dependentsCount + childrenUnder20
        val incomeTaxAmount = lookupIncomeTax(taxableIncome.toInt(), effectiveDependents)
        val incomeTax = Money.of(incomeTaxAmount)

        // 지방소득세 = 소득세 × 10%
        val localIncomeTax = (incomeTax * LOCAL_TAX_RATE).roundToWon()

        return TaxResult(
            incomeTax = incomeTax,
            localIncomeTax = localIncomeTax,
            taxableIncome = taxableIncome,
            dependentsCount = dependentsCount,
            childrenUnder20 = childrenUnder20
        )
    }

    private fun lookupIncomeTax(monthlyIncome: Int, dependents: Int): Int {
        val dependentsKey = dependents.coerceIn(1, 11)

        for (bracket in TAX_TABLE_2026) {
            if (monthlyIncome >= bracket.minIncome && monthlyIncome < bracket.maxIncome) {
                return bracket.taxByDependents[dependentsKey] ?: 0
            }
        }

        // 범위 벗어나면 최고 구간
        return TAX_TABLE_2026.last().taxByDependents[dependentsKey] ?: 643_090
    }
}