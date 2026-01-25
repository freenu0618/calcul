package com.paytools.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.paytools.api.dto.request.*
import com.paytools.domain.model.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDate
import java.time.LocalTime

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
class SalaryControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    @WithMockUser
    fun `급여 계산 - 풀타임 주5일 근무`() {
        // given
        val employee = EmployeeRequest(
            name = "홍길동",
            dependentsCount = 1,
            childrenUnder20 = 0,
            employmentType = EmploymentType.FULL_TIME,
            companySize = CompanySize.OVER_5,
            scheduledWorkDays = 5,
            dailyWorkHours = 8
        )

        val workShifts = listOf(
            WorkShiftRequest(
                date = LocalDate.of(2026, 1, 2),
                startTime = LocalTime.of(9, 0),
                endTime = LocalTime.of(18, 0),
                breakMinutes = 60,
                isHolidayWork = false
            ),
            WorkShiftRequest(
                date = LocalDate.of(2026, 1, 3),
                startTime = LocalTime.of(9, 0),
                endTime = LocalTime.of(18, 0),
                breakMinutes = 60,
                isHolidayWork = false
            ),
            WorkShiftRequest(
                date = LocalDate.of(2026, 1, 6),
                startTime = LocalTime.of(9, 0),
                endTime = LocalTime.of(18, 0),
                breakMinutes = 60,
                isHolidayWork = false
            )
        )

        val request = SalaryCalculationRequest(
            employee = employee,
            baseSalary = 2800000,
            allowances = emptyList(),
            workShifts = workShifts,
            wageType = WageType.MONTHLY,
            hourlyWage = 0,
            calculationMonth = "2026-01",
            absencePolicy = AbsencePolicy.STRICT,
            hoursMode = HoursMode.MODE_174
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/salary/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.employeeName").value("홍길동"))
            .andExpect(jsonPath("$.grossBreakdown.baseSalary").exists())
            .andExpect(jsonPath("$.deductionsBreakdown.insurance").exists())
            .andExpect(jsonPath("$.deductionsBreakdown.tax").exists())
            .andExpect(jsonPath("$.netPay").exists())
    }

    @Test
    @WithMockUser
    fun `급여 계산 - 시급제 파트타임`() {
        // given
        val employee = EmployeeRequest(
            name = "김파트",
            dependentsCount = 0,
            childrenUnder20 = 0,
            employmentType = EmploymentType.PART_TIME,
            companySize = CompanySize.OVER_5,
            scheduledWorkDays = 3,
            dailyWorkHours = 4
        )

        val workShifts = listOf(
            WorkShiftRequest(
                date = LocalDate.of(2026, 1, 2),
                startTime = LocalTime.of(14, 0),
                endTime = LocalTime.of(18, 0),
                breakMinutes = 0,
                isHolidayWork = false
            ),
            WorkShiftRequest(
                date = LocalDate.of(2026, 1, 3),
                startTime = LocalTime.of(14, 0),
                endTime = LocalTime.of(18, 0),
                breakMinutes = 0,
                isHolidayWork = false
            )
        )

        val request = SalaryCalculationRequest(
            employee = employee,
            baseSalary = 0,
            allowances = emptyList(),
            workShifts = workShifts,
            wageType = WageType.HOURLY,
            hourlyWage = 10320,
            calculationMonth = "2026-01",
            absencePolicy = AbsencePolicy.LENIENT,
            hoursMode = HoursMode.MODE_174
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/salary/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.employeeName").value("김파트"))
            .andExpect(jsonPath("$.grossBreakdown.hourlyWage.amount").value(10320))
            .andExpect(jsonPath("$.netPay").exists())
    }

    @Test
    @WithMockUser
    fun `급여 계산 - 연장근로 포함`() {
        // given
        val employee = EmployeeRequest(
            name = "이연장",
            dependentsCount = 2,
            childrenUnder20 = 1,
            employmentType = EmploymentType.FULL_TIME,
            companySize = CompanySize.OVER_5,
            scheduledWorkDays = 5,
            dailyWorkHours = 8
        )

        val workShifts = listOf(
            WorkShiftRequest(
                date = LocalDate.of(2026, 1, 2),
                startTime = LocalTime.of(9, 0),
                endTime = LocalTime.of(20, 0),  // 11시간 - 휴게 1시간 = 10시간
                breakMinutes = 60,
                isHolidayWork = false
            )
        )

        val request = SalaryCalculationRequest(
            employee = employee,
            baseSalary = 2800000,
            allowances = emptyList(),
            workShifts = workShifts,
            wageType = WageType.MONTHLY,
            hourlyWage = 0,
            calculationMonth = "2026-01",
            absencePolicy = AbsencePolicy.MODERATE,
            hoursMode = HoursMode.MODE_174
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/salary/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.grossBreakdown.overtimeAllowances.overtimePay.amount").exists())
    }

    @Test
    @WithMockUser
    fun `급여 계산 - 야간근로 포함`() {
        // given
        val employee = EmployeeRequest(
            name = "박야간",
            dependentsCount = 0,
            childrenUnder20 = 0,
            employmentType = EmploymentType.FULL_TIME,
            companySize = CompanySize.OVER_5,
            scheduledWorkDays = 5,
            dailyWorkHours = 8
        )

        val workShifts = listOf(
            WorkShiftRequest(
                date = LocalDate.of(2026, 1, 2),
                startTime = LocalTime.of(22, 0),
                endTime = LocalTime.of(6, 0),  // 익일 06:00
                breakMinutes = 60,
                isHolidayWork = false
            )
        )

        val request = SalaryCalculationRequest(
            employee = employee,
            baseSalary = 2800000,
            allowances = emptyList(),
            workShifts = workShifts,
            wageType = WageType.MONTHLY,
            hourlyWage = 0,
            calculationMonth = "2026-01",
            absencePolicy = AbsencePolicy.STRICT,
            hoursMode = HoursMode.MODE_174
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/salary/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.grossBreakdown.overtimeAllowances.nightPay.amount").exists())
    }

    @Test
    @WithMockUser
    fun `급여 계산 - 유효성 검증 실패 (음수 기본급)`() {
        // given
        val employee = EmployeeRequest(
            name = "오류",
            dependentsCount = 0,
            childrenUnder20 = 0,
            employmentType = EmploymentType.FULL_TIME,
            companySize = CompanySize.OVER_5,
            scheduledWorkDays = 5,
            dailyWorkHours = 8
        )

        val request = SalaryCalculationRequest(
            employee = employee,
            baseSalary = -1000,  // 음수 (유효성 검증 실패)
            allowances = emptyList(),
            workShifts = emptyList(),
            wageType = WageType.MONTHLY,
            hourlyWage = 0,
            calculationMonth = "2026-01",
            absencePolicy = AbsencePolicy.STRICT,
            hoursMode = HoursMode.MODE_174
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/salary/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isBadRequest)
    }
}
