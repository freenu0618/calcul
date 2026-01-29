package com.paytools.api.controller

import com.paytools.api.dto.request.SimulationCompareRequest
import com.paytools.api.dto.request.SimulationSingleRequest
import com.paytools.api.dto.response.SimulationCompareResponse
import com.paytools.api.dto.response.SimulationPlanResponse
import com.paytools.domain.service.SalarySimulator
import com.paytools.domain.vo.Money
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Simulation", description = "급여 구조 시뮬레이션 API")
@RestController
@RequestMapping("/api/v1/simulation")
class SimulationController {

    private val simulator = SalarySimulator()

    @Operation(
        summary = "급여 구조 비교 시뮬레이션",
        description = """
            같은 총 급여액에서 기본급/수당 배분에 따른 인건비 차이를 비교합니다.

            비교 항목:
            - 통상시급 변화
            - 가산수당(연장/야간/휴일) 차이
            - 퇴직금 산정 기준액 차이
            - 연차수당 차이
            - 사업주 연간 인건비
        """
    )
    @PostMapping("/compare")
    fun compareStructures(
        @Valid @RequestBody request: SimulationCompareRequest
    ): ResponseEntity<SimulationCompareResponse> {
        val result = simulator.compare(
            monthlyTotal = Money.of(request.monthlyTotal),
            weeklyHours = request.weeklyHours,
            expectedOvertimeHours = request.expectedOvertimeHours,
            expectedNightHours = request.expectedNightHours,
            expectedHolidayHours = request.expectedHolidayHours,
            baseSalaryRatioA = request.baseSalaryRatioA,
            baseSalaryRatioB = request.baseSalaryRatioB
        )

        return ResponseEntity.ok(SimulationCompareResponse.from(result))
    }

    @Operation(
        summary = "단일 플랜 시뮬레이션",
        description = "특정 기본급 비율로 급여 구조를 시뮬레이션합니다."
    )
    @PostMapping("/single")
    fun simulateSingle(
        @Valid @RequestBody request: SimulationSingleRequest
    ): ResponseEntity<SimulationPlanResponse> {
        val plan = simulator.simulateSinglePlan(
            monthlyTotal = Money.of(request.monthlyTotal),
            baseSalaryRatio = request.baseSalaryRatio,
            weeklyHours = request.weeklyHours,
            expectedOvertimeHours = request.expectedOvertimeHours,
            expectedNightHours = request.expectedNightHours,
            expectedHolidayHours = request.expectedHolidayHours
        )

        return ResponseEntity.ok(SimulationPlanResponse.from(plan))
    }
}
