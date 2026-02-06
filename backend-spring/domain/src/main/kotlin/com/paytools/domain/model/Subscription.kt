package com.paytools.domain.model

/**
 * 구독 플랜 타입
 */
enum class SubscriptionTier {
    FREE,       // 무료 플랜
    TRIAL,      // Basic 체험 (3일)
    BASIC,      // $9.99/월
    PRO,        // $14.99/월
    ENTERPRISE  // 문의
}

/**
 * 구독 상태
 */
enum class SubscriptionStatus {
    ACTIVE,      // 활성
    TRIAL,       // 체험 중
    CANCELED,    // 취소됨 (기간 종료 시 만료)
    PAST_DUE,    // 결제 실패
    EXPIRED      // 만료됨
}

/**
 * 플랜별 제한 설정
 */
data class PlanLimits(
    val maxEmployees: Int,
    val aiChatsPerMonth: Int,
    val salaryCalcsPerMonth: Int,
    val hasPdfExport: Boolean,
    val hasExcelExport: Boolean,
    val recordRetentionMonths: Int
) {
    companion object {
        val FREE = PlanLimits(
            maxEmployees = 3,
            aiChatsPerMonth = 10,
            salaryCalcsPerMonth = 100,
            hasPdfExport = false,
            hasExcelExport = false,
            recordRetentionMonths = 3
        )

        val TRIAL = PlanLimits(
            maxEmployees = 10,
            aiChatsPerMonth = 30,
            salaryCalcsPerMonth = Int.MAX_VALUE,
            hasPdfExport = true,
            hasExcelExport = false,
            recordRetentionMonths = Int.MAX_VALUE
        )

        val BASIC = PlanLimits(
            maxEmployees = 10,
            aiChatsPerMonth = 30,
            salaryCalcsPerMonth = Int.MAX_VALUE,
            hasPdfExport = true,
            hasExcelExport = false,
            recordRetentionMonths = Int.MAX_VALUE
        )

        val PRO = PlanLimits(
            maxEmployees = 30,
            aiChatsPerMonth = Int.MAX_VALUE,
            salaryCalcsPerMonth = Int.MAX_VALUE,
            hasPdfExport = true,
            hasExcelExport = true,
            recordRetentionMonths = Int.MAX_VALUE
        )

        val ENTERPRISE = PlanLimits(
            maxEmployees = Int.MAX_VALUE,
            aiChatsPerMonth = Int.MAX_VALUE,
            salaryCalcsPerMonth = Int.MAX_VALUE,
            hasPdfExport = true,
            hasExcelExport = true,
            recordRetentionMonths = Int.MAX_VALUE
        )

        fun forTier(tier: SubscriptionTier): PlanLimits = when (tier) {
            SubscriptionTier.FREE -> FREE
            SubscriptionTier.TRIAL -> TRIAL
            SubscriptionTier.BASIC -> BASIC
            SubscriptionTier.PRO -> PRO
            SubscriptionTier.ENTERPRISE -> ENTERPRISE
        }
    }
}

/**
 * 사용량 타입
 */
enum class UsageType {
    AI_CHAT,
    SALARY_CALC,
    PDF_EXPORT,
    EXCEL_EXPORT
}
