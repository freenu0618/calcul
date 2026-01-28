package com.paytools.api.controller

import com.paytools.api.dto.request.*
import com.paytools.api.dto.response.*
import com.paytools.api.service.PayrollService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

/**
 * 급여대장 API
 */
@Tag(name = "급여대장", description = "급여대장 관리 API")
@RestController
@RequestMapping("/api/v1/payroll")
class PayrollController(
    private val payrollService: PayrollService
) {
    // ==================== 급여 기간 ====================

    @Operation(summary = "급여 기간 생성", description = "새로운 급여 기간을 생성합니다")
    @PostMapping("/periods")
    fun createPayrollPeriod(
        @Valid @RequestBody request: PayrollPeriodCreateRequest
    ): ResponseEntity<PayrollPeriodResponse> {
        val response = payrollService.createPayrollPeriod(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @Operation(summary = "급여 기간 목록 조회", description = "모든 급여 기간을 조회합니다")
    @GetMapping("/periods")
    fun getPayrollPeriods(): ResponseEntity<PayrollPeriodListResponse> {
        val response = payrollService.getPayrollPeriods()
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "급여대장 조회", description = "특정 급여 기간의 급여대장을 조회합니다")
    @GetMapping("/periods/{periodId}")
    fun getPayrollLedger(
        @PathVariable periodId: Long
    ): ResponseEntity<PayrollLedgerResponse> {
        val response = payrollService.getPayrollLedger(periodId)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "급여 기간 상태 변경", description = "급여 기간의 상태를 변경합니다 (DRAFT/CONFIRMED/PAID)")
    @PatchMapping("/periods/{periodId}/status")
    fun updatePayrollPeriodStatus(
        @PathVariable periodId: Long,
        @Valid @RequestBody request: PayrollPeriodStatusRequest
    ): ResponseEntity<PayrollPeriodResponse> {
        val response = payrollService.updatePayrollPeriodStatus(periodId, request)
        return ResponseEntity.ok(response)
    }

    // ==================== 급여 엔트리 ====================

    @Operation(summary = "급여 엔트리 추가", description = "급여 기간에 직원의 급여 엔트리를 추가합니다")
    @PostMapping("/periods/{periodId}/entries")
    fun addPayrollEntry(
        @PathVariable periodId: Long,
        @Valid @RequestBody request: PayrollEntryRequest
    ): ResponseEntity<PayrollEntryResponse> {
        val response = payrollService.addPayrollEntry(periodId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @Operation(summary = "급여 엔트리 삭제", description = "급여 엔트리를 삭제합니다")
    @DeleteMapping("/periods/{periodId}/entries/{entryId}")
    fun removePayrollEntry(
        @PathVariable periodId: Long,
        @PathVariable entryId: Long
    ): ResponseEntity<Void> {
        payrollService.removePayrollEntry(periodId, entryId)
        return ResponseEntity.noContent().build()
    }

    // ==================== 출퇴근 기록 ====================

    @Operation(summary = "출퇴근 기록 추가", description = "출퇴근 기록을 추가합니다")
    @PostMapping("/shifts")
    fun addWorkShift(
        @Valid @RequestBody request: WorkShiftCreateRequest
    ): ResponseEntity<WorkShiftResponse> {
        val response = payrollService.addWorkShift(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @Operation(summary = "출퇴근 기록 조회", description = "직원의 월별 출퇴근 기록을 조회합니다")
    @GetMapping("/shifts")
    fun getWorkShifts(
        @RequestParam employeeId: String,
        @RequestParam year: Int,
        @RequestParam month: Int
    ): ResponseEntity<List<WorkShiftResponse>> {
        val response = payrollService.getWorkShifts(UUID.fromString(employeeId), year, month)
        return ResponseEntity.ok(response)
    }

    // ==================== 근무 계약 ====================

    @Operation(summary = "근무 계약 등록", description = "근무 계약을 등록합니다")
    @PostMapping("/contracts")
    fun addWorkContract(
        @Valid @RequestBody request: WorkContractCreateRequest
    ): ResponseEntity<WorkContractResponse> {
        val response = payrollService.addWorkContract(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @Operation(summary = "근무 계약 목록 조회", description = "직원의 근무 계약 목록을 조회합니다")
    @GetMapping("/contracts")
    fun getWorkContracts(
        @RequestParam employeeId: String
    ): ResponseEntity<List<WorkContractResponse>> {
        val response = payrollService.getWorkContracts(UUID.fromString(employeeId))
        return ResponseEntity.ok(response)
    }
}
