package com.paytools.domain.model

/**
 * 급여 형태 (3분류 + 하위 호환)
 *
 * MONTHLY/HOURLY는 기존 API 하위 호환용.
 * SalaryCalculator에서 normalizeWageType()으로 변환 후 사용.
 */
enum class WageType {
    MONTHLY,              // 하위 호환용 → MONTHLY_FIXED로 처리
    HOURLY,               // 하위 호환용 → HOURLY_MONTHLY로 처리
    MONTHLY_FIXED,        // 월급제 고정: 매월 동일 금액, 결근만 공제
    HOURLY_MONTHLY,       // 시급제 월정산: 매월 실제시간 × 시급
    HOURLY_BASED_MONTHLY; // 시급기반 월급제: MAX(계약월급, 실제시간×시급+주휴수당)

    companion object {
        /** 하위 호환 매핑: MONTHLY→MONTHLY_FIXED, HOURLY→HOURLY_MONTHLY */
        fun normalize(type: WageType): WageType = when (type) {
            MONTHLY -> MONTHLY_FIXED
            HOURLY -> HOURLY_MONTHLY
            else -> type
        }

        /** 시급 기반 유형 여부 (HOURLY_MONTHLY, HOURLY_BASED_MONTHLY) */
        fun isHourlyBased(type: WageType): Boolean = when (normalize(type)) {
            HOURLY_MONTHLY, HOURLY_BASED_MONTHLY -> true
            else -> false
        }
    }
}

/**
 * 결근 공제 정책 (월급제 전용)
 */
enum class AbsencePolicy {
    STRICT,    // 엄격: 일급 공제 + 주휴수당 미지급
    MODERATE,  // 보통: 주휴수당만 미지급
    LENIENT    // 관대: 공제 없음
}

/**
 * 월 소정근로시간 계산 방식
 */
enum class HoursMode {
    MODE_174,  // 174시간 방식 (주휴 분리)
    MODE_209;  // 209시간 방식 (주휴 포함)

    companion object {
        fun from(value: String): HoursMode {
            return when (value) {
                "174" -> MODE_174
                "209" -> MODE_209
                else -> MODE_174
            }
        }
    }

    fun toValue(): String {
        return when (this) {
            MODE_174 -> "174"
            MODE_209 -> "209"
        }
    }
}
