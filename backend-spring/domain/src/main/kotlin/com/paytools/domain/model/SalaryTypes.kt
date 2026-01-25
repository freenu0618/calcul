package com.paytools.domain.model

/**
 * 급여 형태
 */
enum class WageType {
    MONTHLY,  // 월급제
    HOURLY    // 시급제
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
