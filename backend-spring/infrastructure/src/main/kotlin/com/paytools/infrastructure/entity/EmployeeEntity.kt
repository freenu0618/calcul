package com.paytools.infrastructure.entity

import com.paytools.domain.model.CompanySize
import com.paytools.domain.model.EmploymentType
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

/**
 * 근무자 JPA 엔티티
 *
 * 근로계약서 기반 근무자 정보 관리
 * 참조: docs/근로계약서.pdf
 */
@Entity
@Table(
    name = "employees",
    indexes = [
        Index(name = "idx_employee_name", columnList = "name"),
        Index(name = "idx_employee_contract_start", columnList = "contract_start_date"),
        Index(name = "idx_employees_user_id", columnList = "user_id")
    ]
)
data class EmployeeEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    /** 소유 사용자 ID (다중 테넌트 지원) */
    @Column(name = "user_id", nullable = false)
    val userId: Long,

    // 기본 정보
    @Column(name = "name", nullable = false, length = 100)
    val name: String,

    /**
     * 주민번호 앞 7자리 (YYMMDD-N)
     * 예: "760623-2"
     */
    @Column(name = "resident_id_prefix", nullable = false, length = 8, unique = true)
    val residentIdPrefix: String,

    /**
     * 생년월일 (주민번호에서 자동 추출)
     */
    @Column(name = "birth_date", nullable = false)
    val birthDate: LocalDate,

    /**
     * 외국인 여부
     * 성별코드 5~8이면 외국인, 1~4이면 내국인
     */
    @Column(name = "is_foreigner", nullable = false)
    val isForeigner: Boolean = false,

    /**
     * 체류자격 (외국인만)
     * 예: E-9, F-4, F-5, H-2 등
     */
    @Column(name = "visa_type", length = 10)
    val visaType: String? = null,

    // 계약 정보
    @Column(name = "contract_start_date", nullable = false)
    val contractStartDate: LocalDate,

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 20)
    val employmentType: EmploymentType,

    @Enumerated(EnumType.STRING)
    @Column(name = "company_size", nullable = false, length = 20)
    val companySize: CompanySize,

    // 근무 시간 정보
    @Column(name = "work_start_time", nullable = false)
    val workStartTime: LocalTime = LocalTime.of(9, 0),

    @Column(name = "work_end_time", nullable = false)
    val workEndTime: LocalTime = LocalTime.of(18, 0),

    /**
     * 휴게시간 (분 단위)
     * 기본값: 60분 (1시간)
     */
    @Column(name = "break_minutes", nullable = false)
    val breakMinutes: Int = 60,

    /**
     * 주 근무일수
     * 기본값: 5일 (주5일제)
     */
    @Column(name = "weekly_work_days", nullable = false)
    val weeklyWorkDays: Int = 5,

    /**
     * 일일 근로시간 (시간 단위)
     * 계산식: (종업시간 - 시업시간) - 휴게시간
     */
    @Column(name = "daily_work_hours", nullable = false)
    val dailyWorkHours: Int = 8,

    // 수습 기간
    /**
     * 수습기간 (월 단위)
     * 0 = 수습기간 없음
     */
    @Column(name = "probation_months", nullable = false)
    val probationMonths: Int = 0,

    /**
     * 수습 급여 비율 (%)
     * 기본값: 100 (100% 지급)
     */
    @Column(name = "probation_rate", nullable = false)
    val probationRate: Int = 100,

    // 감사 필드
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDate = LocalDate.now(),

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDate = LocalDate.now()
) {
    init {
        require(name.isNotBlank()) { "Name cannot be blank" }
        require(residentIdPrefix.matches(Regex("""\d{6}-\d"""))) {
            "Resident ID prefix must be in format YYMMDD-N"
        }
        require(weeklyWorkDays in 1..7) { "Weekly work days must be between 1 and 7" }
        require(breakMinutes >= 0) { "Break minutes cannot be negative" }
        require(dailyWorkHours > 0) { "Daily work hours must be positive" }
        require(probationMonths >= 0) { "Probation months cannot be negative" }
        require(probationRate in 0..100) { "Probation rate must be between 0 and 100" }

        // 외국인이면 체류자격 필수
        if (isForeigner) {
            require(!visaType.isNullOrBlank()) { "Visa type is required for foreign workers" }
        }
    }

    /**
     * 만 나이 계산
     */
    fun calculateAge(): Int {
        val today = LocalDate.now()
        var age = today.year - birthDate.year

        // 생일이 아직 안 지났으면 -1
        if (today.monthValue < birthDate.monthValue ||
            (today.monthValue == birthDate.monthValue && today.dayOfMonth < birthDate.dayOfMonth)
        ) {
            age--
        }

        return age
    }

    /**
     * 국민연금 가입 대상 여부 확인
     * 만 60세 이상은 의무가입 대상 아님
     */
    fun isPensionEligible(): Boolean {
        return calculateAge() < 60
    }

    /**
     * 수습기간 중인지 확인
     */
    fun isInProbation(): Boolean {
        if (probationMonths == 0) return false

        val probationEndDate = contractStartDate.plusMonths(probationMonths.toLong())
        return LocalDate.now().isBefore(probationEndDate)
    }

    /**
     * 도메인 모델로 변환
     */
    fun toDomainModel(): com.paytools.domain.model.Employee {
        return com.paytools.domain.model.Employee(
            name = this.name,
            dependentsCount = 0, // 별도 관리 필요
            childrenUnder20 = 0, // 별도 관리 필요
            employmentType = this.employmentType,
            companySize = this.companySize,
            scheduledWorkDays = this.weeklyWorkDays,
            id = this.id
        )
    }

    companion object {
        /**
         * 주민번호 앞 7자리에서 생년월일 추출
         * 예: "760623-2" → 1976-06-23
         */
        fun parseBirthDate(residentIdPrefix: String): LocalDate {
            require(residentIdPrefix.matches(Regex("""\d{6}-\d"""))) {
                "Invalid resident ID prefix format: $residentIdPrefix"
            }

            val year2Digit = residentIdPrefix.substring(0, 2).toInt()
            val month = residentIdPrefix.substring(2, 4).toInt()
            val day = residentIdPrefix.substring(4, 6).toInt()
            val genderCode = residentIdPrefix.substring(7, 8).toInt()

            // 성별코드로 세기 판단
            // 1,2,5,6 = 1900년대 / 3,4,7,8 = 2000년대
            val yearPrefix = when (genderCode) {
                1, 2, 5, 6 -> 1900
                3, 4, 7, 8 -> 2000
                else -> throw IllegalArgumentException("Invalid gender code: $genderCode")
            }

            val year = yearPrefix + year2Digit

            return LocalDate.of(year, month, day)
        }

        /**
         * 주민번호 성별코드로 외국인 여부 판단
         * 5,6,7,8 = 외국인 / 1,2,3,4 = 내국인
         */
        fun isForeignerByResidentId(residentIdPrefix: String): Boolean {
            val genderCode = residentIdPrefix.substring(7, 8).toInt()
            return genderCode in 5..8
        }
    }
}
