package com.paytools.api.dto.common

import com.paytools.domain.vo.Money
import io.swagger.v3.oas.annotations.media.Schema
import java.text.NumberFormat
import java.util.Locale

/**
 * 금액 응답 DTO
 */
@Schema(description = "금액 응답")
data class MoneyResponse(
    @Schema(description = "금액 (원)", example = "2500000")
    val amount: Long,

    @Schema(description = "포맷팅된 금액", example = "2,500,000원")
    val formatted: String
) {
    companion object {
        private val formatter = NumberFormat.getNumberInstance(Locale.KOREA)

        fun from(money: Money): MoneyResponse {
            val amount = money.amount.toLong()
            return MoneyResponse(
                amount = amount,
                formatted = "${formatter.format(amount)}원"
            )
        }
    }
}
