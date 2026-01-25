package com.paytools.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.paytools.api.dto.request.AnnualTaxEstimateRequest
import com.paytools.api.dto.request.TaxCalculationRequest
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

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
class TaxControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    @WithMockUser
    fun `세금 계산 - 부양가족 없음`() {
        // given
        val request = TaxCalculationRequest(
            taxableIncome = 2500000,
            dependentsCount = 0,
            childrenUnder20 = 0
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/tax/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.incomeTax.amount").exists())
            .andExpect(jsonPath("$.incomeTax.calculation").value("간이세액표 (부양가족 0명, 20세 이하 자녀 0명)"))
            .andExpect(jsonPath("$.localIncomeTax.amount").exists())
            .andExpect(jsonPath("$.localIncomeTax.calculation").value("소득세 × 10%"))
            .andExpect(jsonPath("$.total").exists())
    }

    @Test
    @WithMockUser
    fun `세금 계산 - 부양가족 2명, 20세 이하 자녀 1명`() {
        // given
        val request = TaxCalculationRequest(
            taxableIncome = 2500000,
            dependentsCount = 2,
            childrenUnder20 = 1
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/tax/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.incomeTax.amount").exists())
            .andExpect(jsonPath("$.incomeTax.calculation").value("간이세액표 (부양가족 2명, 20세 이하 자녀 1명)"))
            .andExpect(jsonPath("$.localIncomeTax.amount").exists())
            .andExpect(jsonPath("$.total").exists())
    }

    @Test
    @WithMockUser
    fun `세금 계산 - 지방소득세는 소득세의 10퍼센트`() {
        // given
        val request = TaxCalculationRequest(
            taxableIncome = 2500000,
            dependentsCount = 1,
            childrenUnder20 = 0
        )

        // when & then
        val result = mockMvc.perform(
            post("/api/v1/tax/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andReturn()

        val content = result.response.contentAsString
        val response = objectMapper.readTree(content)

        val incomeTax = response.get("incomeTax").get("amount").asLong()
        val localIncomeTax = response.get("localIncomeTax").get("amount").asLong()

        // 지방소득세는 소득세의 10%
        assert(localIncomeTax == (incomeTax * 0.1).toLong())
    }

    @Test
    @WithMockUser
    fun `세금 계산 - 저소득층 (100만원 미만)`() {
        // given
        val request = TaxCalculationRequest(
            taxableIncome = 800000,
            dependentsCount = 0,
            childrenUnder20 = 0
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/tax/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.incomeTax.amount").value(0))
            .andExpect(jsonPath("$.localIncomeTax.amount").value(0))
            .andExpect(jsonPath("$.total").value(0))
    }

    @Test
    @WithMockUser
    fun `세금 계산 - 고소득층 (500만원 이상)`() {
        // given
        val request = TaxCalculationRequest(
            taxableIncome = 6000000,
            dependentsCount = 0,
            childrenUnder20 = 0
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/tax/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.incomeTax.amount").exists())
            .andExpect(jsonPath("$.total").exists())
    }

    @Test
    @WithMockUser
    fun `연간 소득세 추정 - 월 소득 250만원`() {
        // given
        val request = AnnualTaxEstimateRequest(
            monthlyIncome = 2500000,
            dependentsCount = 1,
            childrenUnder20 = 0
        )

        // when & then
        val result = mockMvc.perform(
            post("/api/v1/tax/estimate-annual")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.monthlyTax").exists())
            .andExpect(jsonPath("$.annualTax").exists())
            .andReturn()

        val content = result.response.contentAsString
        val response = objectMapper.readTree(content)

        val monthlyTax = response.get("monthlyTax").asLong()
        val annualTax = response.get("annualTax").asLong()

        // 연간 세금은 월 세금의 12배
        assert(annualTax == monthlyTax * 12)
    }

    @Test
    @WithMockUser
    fun `세금 계산 - 유효성 검증 실패 (음수 소득)`() {
        // given
        val request = TaxCalculationRequest(
            taxableIncome = -1000,
            dependentsCount = 0,
            childrenUnder20 = 0
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/tax/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @WithMockUser
    fun `세금 계산 - 유효성 검증 실패 (20세 이하 자녀수가 부양가족수보다 많음)`() {
        // given
        val request = TaxCalculationRequest(
            taxableIncome = 2500000,
            dependentsCount = 1,
            childrenUnder20 = 2  // 부양가족수보다 많음
        )

        // when & then
        mockMvc.perform(
            post("/api/v1/tax/calculate")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isBadRequest)
    }
}
