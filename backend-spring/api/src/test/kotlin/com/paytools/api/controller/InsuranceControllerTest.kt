package com.paytools.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.paytools.api.dto.request.InsuranceCalculationRequest
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
class InsuranceControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    @WithMockUser
    fun `보험료율 조회 성공`() {
        // when & then
        mockMvc.perform(get("/api/v1/insurance/rates"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.year").value(2026))
            .andExpect(jsonPath("$.nationalPension.rate").value(0.0475))
            .andExpect(jsonPath("$.healthInsurance.rate").value(0.03595))
            .andExpect(jsonPath("$.longTermCare.rate").value(0.1314))
            .andExpect(jsonPath("$.employmentInsurance.rate").value(0.009))
    }

    @Test
    @WithMockUser
    fun `보험료 계산 - 일반 급여`() {
        // given
        val request = InsuranceCalculationRequest(
            grossIncome = 2800000
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/insurance/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.nationalPension.amount").exists())
            .andExpect(jsonPath("$.nationalPension.rate").value(0.0475))
            .andExpect(jsonPath("$.healthInsurance.amount").exists())
            .andExpect(jsonPath("$.healthInsurance.rate").value(0.03595))
            .andExpect(jsonPath("$.longTermCare.amount").exists())
            .andExpect(jsonPath("$.employmentInsurance.amount").exists())
            .andExpect(jsonPath("$.total").exists())
    }

    @Test
    @WithMockUser
    fun `보험료 계산 - 국민연금 상한 초과`() {
        // given
        val request = InsuranceCalculationRequest(
            grossIncome = 7000000  // 상한 5,900,000 초과
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/insurance/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.nationalPension.amount").value(280250))  // 5,900,000 * 0.0475
            .andExpect(jsonPath("$.nationalPension.base").value(5900000))
    }

    @Test
    @WithMockUser
    fun `보험료 계산 - 국민연금 하한 미달`() {
        // given
        val request = InsuranceCalculationRequest(
            grossIncome = 300000  // 하한 390,000 미달
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/insurance/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.nationalPension.amount").value(18525))  // 390,000 * 0.0475
            .andExpect(jsonPath("$.nationalPension.base").value(390000))
    }

    @Test
    @WithMockUser
    fun `보험료 계산 - 고용보험 상한 초과`() {
        // given
        val request = InsuranceCalculationRequest(
            grossIncome = 15000000  // 상한 13,500,000 초과
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/insurance/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.employmentInsurance.amount").value(121500))  // 13,500,000 * 0.009
            .andExpect(jsonPath("$.employmentInsurance.base").value(13500000))
    }

    @Test
    @WithMockUser
    fun `보험료 계산 - 유효성 검증 실패 (음수 소득)`() {
        // given
        val request = InsuranceCalculationRequest(
            grossIncome = -1000
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/insurance/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @WithMockUser
    fun `보험료 계산 - 장기요양보험은 건강보험료 기준으로 계산`() {
        // given
        val grossIncome = 2800000L
        val expectedHealthInsurance = (grossIncome * 0.03595).toLong()
        val expectedLongTermCare = (expectedHealthInsurance * 0.1314).toLong()

        val request = InsuranceCalculationRequest(
            grossIncome = grossIncome
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/insurance/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.longTermCare.calculation").value("건강보험료 × 13.14%"))
    }
}
