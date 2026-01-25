package com.paytools.domain.model

import java.util.UUID

/**
 * 고용 형태
 */
enum class EmploymentType {
    FULL_TIME,  // 정규직
    PART_TIME,  // 파트타임
    CONTRACT    // 계약직
}

/**
 * 사업장 규모 (5인 기준)
 * - 5인 이상: 휴일근로 8시간 초과 시 가산율 2.0 적용
 * - 5인 미만: 휴일근로 8시간 초과 시에도 가산율 1.5 적용
 */
enum class CompanySize {
    UNDER_5,  // 5인 미만
    OVER_5    // 5인 이상
}

/**
 * 근로자 도메인 모델 (계산용)
 */
data class Employee(
    val name: String,
    val dependentsCount: Int,
    val childrenUnder20: Int,
    val employmentType: EmploymentType,
    val companySize: CompanySize,
    val scheduledWorkDays: Int = 5,
    val id: UUID = UUID.randomUUID()
) {
    init {
        require(dependentsCount >= 0) { "Dependents count cannot be negative: $dependentsCount" }
        require(childrenUnder20 >= 0) { "Children under 20 cannot be negative: $childrenUnder20" }
        require(childrenUnder20 <= dependentsCount) {
            "Children under 20 ($childrenUnder20) cannot exceed dependents count ($dependentsCount)"
        }
        require(scheduledWorkDays in 1..7) { "Scheduled work days must be between 1 and 7: $scheduledWorkDays" }
    }

    fun isFullTime(): Boolean = employmentType == EmploymentType.FULL_TIME
    fun isPartTime(): Boolean = employmentType == EmploymentType.PART_TIME
    fun isLargeCompany(): Boolean = companySize == CompanySize.OVER_5
    fun isSmallCompany(): Boolean = companySize == CompanySize.UNDER_5
}