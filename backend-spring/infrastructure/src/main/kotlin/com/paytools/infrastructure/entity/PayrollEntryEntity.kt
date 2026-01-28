package com.paytools.infrastructure.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime
import java.util.*

/**
 * 급여대장 엔트리 엔티티
 * - 직원별 월 급여 상세 내역
 */
@Entity
@Table(
    name = "payroll_entries",
    indexes = [
        Index(name = "idx_payroll_entries_period_id", columnList = "payroll_period_id"),
        Index(name = "idx_payroll_entries_employee_id", columnList = "employee_id")
    ],
    uniqueConstraints = [
        UniqueConstraint(
            name = "uq_payroll_entries_period_employee",
            columnNames = ["payroll_period_id", "employee_id"]
        )
    ]
)
data class PayrollEntryEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "payroll_period_id", nullable = false)
    val payrollPeriodId: Long,

    @Column(name = "employee_id", nullable = false)
    val employeeId: UUID,

    @Column(name = "contract_id")
    val contractId: Long? = null,

    // === 계산 입력 ===
    @Column(name = "base_salary", nullable = false)
    val baseSalary: Long,

    @Column(name = "allowances_json", columnDefinition = "TEXT")
    val allowancesJson: String = "[]",

    @Column(name = "total_work_minutes", nullable = false)
    val totalWorkMinutes: Int = 0,

    @Column(name = "overtime_minutes", nullable = false)
    val overtimeMinutes: Int = 0,

    @Column(name = "night_minutes", nullable = false)
    val nightMinutes: Int = 0,

    @Column(name = "holiday_minutes", nullable = false)
    val holidayMinutes: Int = 0,

    // === 계산 결과 (급여) ===
    @Column(name = "regular_wage")
    val regularWage: Long? = null,

    @Column(name = "hourly_wage")
    val hourlyWage: Long? = null,

    @Column(name = "overtime_pay")
    val overtimePay: Long? = null,

    @Column(name = "night_pay")
    val nightPay: Long? = null,

    @Column(name = "holiday_pay")
    val holidayPay: Long? = null,

    @Column(name = "weekly_holiday_pay")
    val weeklyHolidayPay: Long? = null,

    @Column(name = "total_gross")
    val totalGross: Long? = null,

    // === 공제 ===
    @Column(name = "national_pension")
    val nationalPension: Long? = null,

    @Column(name = "health_insurance")
    val healthInsurance: Long? = null,

    @Column(name = "long_term_care")
    val longTermCare: Long? = null,

    @Column(name = "employment_insurance")
    val employmentInsurance: Long? = null,

    @Column(name = "income_tax")
    val incomeTax: Long? = null,

    @Column(name = "local_income_tax")
    val localIncomeTax: Long? = null,

    @Column(name = "total_deductions")
    val totalDeductions: Long? = null,

    // === 실수령액 ===
    @Column(name = "net_pay")
    val netPay: Long? = null,

    // === 메타데이터 ===
    @Column(name = "calculation_detail", columnDefinition = "TEXT")
    val calculationDetail: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    init {
        require(baseSalary >= 0) { "Base salary cannot be negative" }
        require(totalWorkMinutes >= 0) { "Work minutes cannot be negative" }
    }
}
