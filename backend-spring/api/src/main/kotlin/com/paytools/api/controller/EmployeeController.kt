package com.paytools.api.controller

import com.paytools.api.dto.request.EmployeeManagementRequest
import com.paytools.api.dto.response.EmployeeListResponse
import com.paytools.api.dto.response.EmployeeResponse
import com.paytools.api.service.EmployeeService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

/**
 * 근무자 관리 API
 */
@Tag(name = "근무자 관리", description = "근무자 등록, 조회, 수정, 삭제 API")
@RestController
@RequestMapping("/api/v1/employees")
class EmployeeController(
    private val employeeService: EmployeeService
) {

    @Operation(summary = "근무자 등록", description = "새로운 근무자를 등록합니다")
    @PostMapping
    fun createEmployee(
        @Valid @RequestBody request: EmployeeManagementRequest
    ): ResponseEntity<EmployeeResponse> {
        val response = employeeService.createEmployee(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @Operation(summary = "근무자 목록 조회", description = "등록된 모든 근무자를 조회합니다")
    @GetMapping
    fun getEmployees(): ResponseEntity<EmployeeListResponse> {
        val response = employeeService.getEmployees()
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "근무자 상세 조회", description = "특정 근무자의 상세 정보를 조회합니다")
    @GetMapping("/{id}")
    fun getEmployee(
        @PathVariable id: UUID
    ): ResponseEntity<EmployeeResponse> {
        val response = employeeService.getEmployee(id)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "근무자 정보 수정", description = "근무자 정보를 수정합니다")
    @PutMapping("/{id}")
    fun updateEmployee(
        @PathVariable id: UUID,
        @Valid @RequestBody request: EmployeeManagementRequest
    ): ResponseEntity<EmployeeResponse> {
        val response = employeeService.updateEmployee(id, request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "근무자 삭제", description = "근무자를 삭제합니다")
    @DeleteMapping("/{id}")
    fun deleteEmployee(
        @PathVariable id: UUID
    ): ResponseEntity<Void> {
        employeeService.deleteEmployee(id)
        return ResponseEntity.noContent().build()
    }

    @Operation(summary = "근무자 이름 검색", description = "이름으로 근무자를 검색합니다")
    @GetMapping("/search")
    fun searchEmployeesByName(
        @RequestParam name: String
    ): ResponseEntity<EmployeeListResponse> {
        val response = employeeService.searchEmployeesByName(name)
        return ResponseEntity.ok(response)
    }

    @Operation(
        summary = "국민연금 비대상자 조회",
        description = "만 60세 이상 근무자 목록을 조회합니다 (국민연금 의무가입 대상 아님)"
    )
    @GetMapping("/pension-ineligible")
    fun getPensionIneligibleEmployees(): ResponseEntity<EmployeeListResponse> {
        val response = employeeService.getPensionIneligibleEmployees()
        return ResponseEntity.ok(response)
    }
}
