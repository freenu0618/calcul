#!/usr/bin/env python3
"""
Python vs Kotlin 급여 계산 결과 비교 검증 스크립트

Python FastAPI와 Kotlin Spring Boot API의 급여 계산 결과가
1원 단위까지 일치하는지 검증합니다.
"""
import requests
import json
from typing import Dict, Any, List
from decimal import Decimal

# API URLs
PYTHON_API = "http://localhost:8000/api/v1/salary/calculate"
KOTLIN_API = "http://localhost:8080/api/v1/salary/calculate"

# 테스트 케이스
TEST_CASES = [
    {
        "name": "풀타임 주5일 근무 (월급제)",
        "request": {
            "employee": {
                "name": "홍길동",
                "dependentsCount": 1,
                "childrenUnder20": 0,
                "employmentType": "FULL_TIME",
                "companySize": "OVER_5",
                "scheduledWorkDays": 5,
                "dailyWorkHours": 8
            },
            "baseSalary": 2800000,
            "allowances": [],
            "workShifts": [
                {
                    "date": "2026-01-02",
                    "startTime": "09:00",
                    "endTime": "18:00",
                    "breakMinutes": 60,
                    "isHolidayWork": False
                },
                {
                    "date": "2026-01-03",
                    "startTime": "09:00",
                    "endTime": "18:00",
                    "breakMinutes": 60,
                    "isHolidayWork": False
                }
            ],
            "wageType": "MONTHLY",
            "hourlyWage": 0,
            "calculationMonth": "2026-01",
            "absencePolicy": "STRICT",
            "hoursMode": "174"
        }
    },
    {
        "name": "시급제 파트타임",
        "request": {
            "employee": {
                "name": "김파트",
                "dependentsCount": 0,
                "childrenUnder20": 0,
                "employmentType": "PART_TIME",
                "companySize": "OVER_5",
                "scheduledWorkDays": 3,
                "dailyWorkHours": 4
            },
            "baseSalary": 0,
            "allowances": [],
            "workShifts": [
                {
                    "date": "2026-01-02",
                    "startTime": "14:00",
                    "endTime": "18:00",
                    "breakMinutes": 0,
                    "isHolidayWork": False
                }
            ],
            "wageType": "HOURLY",
            "hourlyWage": 10320,
            "calculationMonth": "2026-01",
            "absencePolicy": "LENIENT",
            "hoursMode": "174"
        }
    },
    {
        "name": "연장근로 포함",
        "request": {
            "employee": {
                "name": "이연장",
                "dependentsCount": 2,
                "childrenUnder20": 1,
                "employmentType": "FULL_TIME",
                "companySize": "OVER_5",
                "scheduledWorkDays": 5,
                "dailyWorkHours": 8
            },
            "baseSalary": 2800000,
            "allowances": [],
            "workShifts": [
                {
                    "date": "2026-01-02",
                    "startTime": "09:00",
                    "endTime": "20:00",  # 11시간 - 휴게 1시간 = 10시간 (연장 2시간)
                    "breakMinutes": 60,
                    "isHolidayWork": False
                }
            ],
            "wageType": "MONTHLY",
            "hourlyWage": 0,
            "calculationMonth": "2026-01",
            "absencePolicy": "MODERATE",
            "hoursMode": "174"
        }
    }
]

def compare_money(py_val: int, kt_val: int, field_path: str) -> bool:
    """금액 비교 (1원 단위)"""
    if py_val == kt_val:
        return True
    else:
        print(f"  ❌ {field_path}: Python={py_val:,}원 vs Kotlin={kt_val:,}원 (차이={abs(py_val - kt_val):,}원)")
        return False

def extract_money_field(data: Any, field_name: str) -> int:
    """중첩된 딕셔너리에서 amount 필드 추출"""
    if isinstance(data, dict) and "amount" in data:
        return data["amount"]
    return data

def compare_results(py_result: Dict[str, Any], kt_result: Dict[str, Any], test_name: str) -> bool:
    """결과 비교"""
    print(f"\n📋 {test_name}")
    all_match = True

    # 실수령액 비교
    py_net = extract_money_field(py_result.get("netPay", {}), "netPay")
    kt_net = extract_money_field(kt_result.get("netPay", {}), "netPay")
    if not compare_money(py_net, kt_net, "실수령액"):
        all_match = False

    # 총 지급액 비교
    py_gross = extract_money_field(py_result.get("grossBreakdown", {}).get("total", {}), "total")
    kt_gross = extract_money_field(kt_result.get("grossBreakdown", {}).get("total", {}), "total")
    if not compare_money(py_gross, kt_gross, "총 지급액"):
        all_match = False

    # 기본급 비교
    py_base = extract_money_field(py_result.get("grossBreakdown", {}).get("baseSalary", {}), "baseSalary")
    kt_base = extract_money_field(kt_result.get("grossBreakdown", {}).get("baseSalary", {}), "baseSalary")
    if not compare_money(py_base, kt_base, "기본급"):
        all_match = False

    # 4대 보험 비교
    insurance = py_result.get("deductionsBreakdown", {}).get("insurance", {})
    kt_insurance = kt_result.get("deductionsBreakdown", {}).get("insurance", {})

    py_np = extract_money_field(insurance.get("nationalPension", {}), "nationalPension")
    kt_np = extract_money_field(kt_insurance.get("nationalPension", {}), "nationalPension")
    if not compare_money(py_np, kt_np, "국민연금"):
        all_match = False

    py_hi = extract_money_field(insurance.get("healthInsurance", {}), "healthInsurance")
    kt_hi = extract_money_field(kt_insurance.get("healthInsurance", {}), "healthInsurance")
    if not compare_money(py_hi, kt_hi, "건강보험"):
        all_match = False

    py_ltc = extract_money_field(insurance.get("longTermCare", {}), "longTermCare")
    kt_ltc = extract_money_field(kt_insurance.get("longTermCare", {}), "longTermCare")
    if not compare_money(py_ltc, kt_ltc, "장기요양보험"):
        all_match = False

    py_ei = extract_money_field(insurance.get("employmentInsurance", {}), "employmentInsurance")
    kt_ei = extract_money_field(kt_insurance.get("employmentInsurance", {}), "employmentInsurance")
    if not compare_money(py_ei, kt_ei, "고용보험"):
        all_match = False

    # 세금 비교
    tax = py_result.get("deductionsBreakdown", {}).get("tax", {})
    kt_tax = kt_result.get("deductionsBreakdown", {}).get("tax", {})

    py_it = extract_money_field(tax.get("incomeTax", {}), "incomeTax")
    kt_it = extract_money_field(kt_tax.get("incomeTax", {}), "incomeTax")
    if not compare_money(py_it, kt_it, "소득세"):
        all_match = False

    py_lit = extract_money_field(tax.get("localIncomeTax", {}), "localIncomeTax")
    kt_lit = extract_money_field(kt_tax.get("localIncomeTax", {}), "localIncomeTax")
    if not compare_money(py_lit, kt_lit, "지방소득세"):
        all_match = False

    # 총 공제액 비교
    py_ded = extract_money_field(py_result.get("deductionsBreakdown", {}).get("total", {}), "total")
    kt_ded = extract_money_field(kt_result.get("deductionsBreakdown", {}).get("total", {}), "total")
    if not compare_money(py_ded, kt_ded, "총 공제액"):
        all_match = False

    if all_match:
        print("  ✅ 모든 필드 일치")

    return all_match

def run_tests():
    """테스트 실행"""
    print("=" * 60)
    print("Python vs Kotlin 급여 계산 결과 비교 검증")
    print("=" * 60)

    total_tests = len(TEST_CASES)
    passed_tests = 0

    for test_case in TEST_CASES:
        test_name = test_case["name"]
        request_data = test_case["request"]

        try:
            # Python API 호출
            print(f"\n🐍 Python API 호출 중...")
            py_response = requests.post(PYTHON_API, json=request_data, timeout=10)
            if py_response.status_code != 200:
                print(f"  ❌ Python API 에러: {py_response.status_code}")
                print(f"  응답: {py_response.text}")
                continue
            py_result = py_response.json()

            # Kotlin API 호출
            print(f"☕ Kotlin API 호출 중...")
            kt_response = requests.post(KOTLIN_API, json=request_data, timeout=10)
            if kt_response.status_code != 200:
                print(f"  ❌ Kotlin API 에러: {kt_response.status_code}")
                print(f"  응답: {kt_response.text}")
                continue
            kt_result = kt_response.json()

            # 결과 비교
            if compare_results(py_result, kt_result, test_name):
                passed_tests += 1

        except requests.exceptions.ConnectionError as e:
            print(f"  ❌ 연결 실패: {e}")
            print(f"  Python API ({PYTHON_API}) 또는 Kotlin API ({KOTLIN_API})가 실행 중인지 확인하세요.")
        except Exception as e:
            print(f"  ❌ 예외 발생: {e}")

    # 결과 요약
    print("\n" + "=" * 60)
    print(f"테스트 결과: {passed_tests}/{total_tests} 통과")
    print("=" * 60)

    if passed_tests == total_tests:
        print("✅ 모든 테스트 통과! Python과 Kotlin의 계산 결과가 1원 단위로 일치합니다.")
        return 0
    else:
        print("❌ 일부 테스트 실패. Python과 Kotlin의 계산 결과가 일치하지 않습니다.")
        return 1

if __name__ == "__main__":
    exit(run_tests())
