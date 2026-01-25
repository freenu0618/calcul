package com.paytools.api.validation

import com.paytools.api.dto.request.TaxCalculationRequest
import jakarta.validation.Constraint
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext
import jakarta.validation.Payload
import kotlin.reflect.KClass

/**
 * 세금 계산 요청 검증 애노테이션
 *
 * - 20세 이하 자녀 수는 부양가족 수 이하여야 함
 */
@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [TaxRequestValidatorImpl::class])
annotation class ValidTaxRequest(
    val message: String = "20세 이하 자녀 수는 부양가족 수를 초과할 수 없습니다",
    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Payload>> = []
)

class TaxRequestValidatorImpl : ConstraintValidator<ValidTaxRequest, TaxCalculationRequest> {
    override fun isValid(value: TaxCalculationRequest?, context: ConstraintValidatorContext?): Boolean {
        if (value == null) return true

        return value.childrenUnder20 <= value.dependentsCount
    }
}
