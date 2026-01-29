package com.paytools.domain.model

/**
 * 4대 보험 적용 옵션
 *
 * 기본값: 모든 보험 적용 (true)
 *
 * 제외 조건 예시:
 * - 국민연금: 만 60세 이상, 외국인 임의가입
 * - 건강보험: 외국인 체류자격에 따라 임의
 * - 고용보험: 주 15시간 미만, 외국인 체류자격에 따라 임의
 * - 장기요양보험: 건강보험 미적용 시 자동 제외
 */
data class InsuranceOptions(
    val applyNationalPension: Boolean = true,    // 국민연금 적용 여부
    val applyHealthInsurance: Boolean = true,    // 건강보험 적용 여부
    val applyLongTermCare: Boolean = true,       // 장기요양보험 적용 여부 (건강보험 적용 시에만 유효)
    val applyEmploymentInsurance: Boolean = true // 고용보험 적용 여부
) {
    companion object {
        val ALL_APPLY = InsuranceOptions()
        val NONE_APPLY = InsuranceOptions(
            applyNationalPension = false,
            applyHealthInsurance = false,
            applyLongTermCare = false,
            applyEmploymentInsurance = false
        )
    }
}
