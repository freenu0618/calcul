"""급여 계산 API 통합 테스트"""
import pytest
from fastapi.testclient import TestClient
from app.api.main import app

client = TestClient(app)


class TestSalaryCalculationAPI:
    """급여 계산 API 테스트"""

    def test_calculate_salary_basic(self):
        """기본 급여 계산 테스트"""
        request_data = {
            "employee": {
                "name": "홍길동",
                "dependents_count": 2,
                "children_under_20": 1,
                "employment_type": "FULL_TIME",
                "company_size": "OVER_5"
            },
            "base_salary": 2500000,
            "allowances": [
                {
                    "name": "직책수당",
                    "amount": 300000,
                    "is_taxable": True,
                    "is_includable_in_minimum_wage": True,
                    "is_fixed": True,
                    "is_included_in_regular_wage": True
                },
                {
                    "name": "식대",
                    "amount": 200000,
                    "is_taxable": False,
                    "is_includable_in_minimum_wage": False,
                    "is_fixed": True,
                    "is_included_in_regular_wage": False
                }
            ],
            "work_shifts": [
                {
                    "date": "2026-01-05",
                    "start_time": "09:00:00",
                    "end_time": "18:00:00",
                    "break_minutes": 60,
                    "is_holiday_work": False
                },
                {
                    "date": "2026-01-06",
                    "start_time": "09:00:00",
                    "end_time": "18:00:00",
                    "break_minutes": 60,
                    "is_holiday_work": False
                },
                {
                    "date": "2026-01-07",
                    "start_time": "09:00:00",
                    "end_time": "18:00:00",
                    "break_minutes": 60,
                    "is_holiday_work": False
                },
                {
                    "date": "2026-01-08",
                    "start_time": "09:00:00",
                    "end_time": "18:00:00",
                    "break_minutes": 60,
                    "is_holiday_work": False
                },
                {
                    "date": "2026-01-09",
                    "start_time": "09:00:00",
                    "end_time": "18:00:00",
                    "break_minutes": 60,
                    "is_holiday_work": False
                }
            ]
        }

        response = client.post("/api/v1/salary/calculate", json=request_data)

        assert response.status_code == 200
        data = response.json()

        # 응답 구조 검증
        assert "employee_name" in data
        assert data["employee_name"] == "홍길동"
        assert "gross_breakdown" in data
        assert "deductions_breakdown" in data
        assert "net_pay" in data

        # 총 지급액 검증
        assert data["gross_breakdown"]["base_salary"]["amount"] == 2500000
        assert data["gross_breakdown"]["total"]["amount"] > 0

        # 공제 내역 검증
        assert data["deductions_breakdown"]["insurance"]["total"]["amount"] > 0
        assert data["deductions_breakdown"]["tax"]["total"]["amount"] > 0

        # 실수령액 검증
        assert data["net_pay"]["amount"] > 0

    def test_calculate_salary_no_shifts(self):
        """근무 시프트 없는 경우"""
        request_data = {
            "employee": {
                "name": "김철수",
                "dependents_count": 1,
                "children_under_20": 0,
                "employment_type": "FULL_TIME",
                "company_size": "OVER_5"
            },
            "base_salary": 2000000,
            "allowances": [],
            "work_shifts": []
        }

        response = client.post("/api/v1/salary/calculate", json=request_data)

        assert response.status_code == 200
        data = response.json()

        # 가산수당 없음
        assert data["gross_breakdown"]["overtime_allowances"]["total"]["amount"] == 0
        # 주휴수당 없음
        assert data["gross_breakdown"]["weekly_holiday_pay"]["amount"]["amount"] == 0

    def test_calculate_salary_with_night_work(self):
        """야간근로 포함"""
        request_data = {
            "employee": {
                "name": "박야근",
                "dependents_count": 1,
                "children_under_20": 0,
                "employment_type": "FULL_TIME",
                "company_size": "OVER_5"
            },
            "base_salary": 2500000,
            "allowances": [],
            "work_shifts": [
                {
                    "date": "2026-01-05",
                    "start_time": "22:00:00",
                    "end_time": "07:00:00",
                    "break_minutes": 60,
                    "is_holiday_work": False
                }
            ]
        }

        response = client.post("/api/v1/salary/calculate", json=request_data)

        assert response.status_code == 200
        data = response.json()

        # 야간수당 확인
        assert data["gross_breakdown"]["overtime_allowances"]["night_hours"]["hours"] > 0
        assert data["gross_breakdown"]["overtime_allowances"]["night_pay"]["amount"] > 0

    def test_calculate_salary_invalid_input(self):
        """잘못된 입력 (음수 급여)"""
        request_data = {
            "employee": {
                "name": "테스트",
                "dependents_count": 1,
                "children_under_20": 0,
                "employment_type": "FULL_TIME",
                "company_size": "OVER_5"
            },
            "base_salary": -1000000,  # 음수
            "allowances": [],
            "work_shifts": []
        }

        response = client.post("/api/v1/salary/calculate", json=request_data)

        # 400 또는 422 에러 발생
        assert response.status_code in [400, 422]
