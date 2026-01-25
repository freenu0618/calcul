package com.paytools.api.exception

/**
 * 근무자를 찾을 수 없을 때 발생하는 예외
 */
class EmployeeNotFoundException(
    val employeeId: String
) : RuntimeException("Employee not found: $employeeId")

/**
 * 주민번호가 중복될 때 발생하는 예외
 */
class DuplicateResidentIdException(
    val residentIdPrefix: String
) : RuntimeException("Resident ID already exists: $residentIdPrefix")
