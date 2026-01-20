"""세금 조회 API 통합 테스트"""
import pytest
from fastapi.testclient import TestClient
from app.api.main import app

client = TestClient(app)


class TestTaxAPI:
    """세금 조회 API 테스트"""

    def test_calculate_tax(self):
        """세금 계산"""
        request_data = {
            "taxable_income": 2800000,
            "dependents_count": 2,
            "children_under_20": 1
        }

        response = client.post("/api/v1/tax/calculate", json=request_data)

        assert response.status_code == 200
        data = response.json()

        # 응답 구조 검증
        assert "income_tax" in data
        assert "local_income_tax" in data
        assert "total" in data

        # 계산 결과 검증 (부양가족 2+자녀1 = 실효 3명)
        assert data["income_tax"]["amount"] == 27250
        assert data["local_income_tax"]["amount"] == 2725  # 27,250 × 10%
        assert data["total"] == 29975

    def test_calculate_tax_no_children(self):
        """자녀 없는 경우"""
        request_data = {
            "taxable_income": 2800000,
            "dependents_count": 2,
            "children_under_20": 0
        }

        response = client.post("/api/v1/tax/calculate", json=request_data)

        assert response.status_code == 200
        data = response.json()

        # 부양가족 2명
        assert data["income_tax"]["amount"] == 38170
        assert data["local_income_tax"]["amount"] == 3817

    def test_calculate_tax_low_income(self):
        """저소득 (면세)"""
        request_data = {
            "taxable_income": 1000000,
            "dependents_count": 1,
            "children_under_20": 0
        }

        response = client.post("/api/v1/tax/calculate", json=request_data)

        assert response.status_code == 200
        data = response.json()

        # 106만원 미만: 세금 0
        assert data["income_tax"]["amount"] == 0
        assert data["local_income_tax"]["amount"] == 0
        assert data["total"] == 0

    def test_estimate_annual_tax(self):
        """연간 소득세 추정"""
        request_data = {
            "monthly_income": 2800000,
            "dependents_count": 2,
            "children_under_20": 1
        }

        response = client.post("/api/v1/tax/estimate-annual", json=request_data)

        assert response.status_code == 200
        data = response.json()

        # 응답 구조 검증
        assert "monthly_tax" in data
        assert "annual_tax" in data
        assert "note" in data

        # 계산 결과 검증
        assert data["monthly_tax"] == 29975
        assert data["annual_tax"] == 29975 * 12  # 359,700

    def test_calculate_tax_invalid_dependents(self):
        """잘못된 부양가족 수"""
        request_data = {
            "taxable_income": 2800000,
            "dependents_count": -1,  # 음수
            "children_under_20": 0
        }

        response = client.post("/api/v1/tax/calculate", json=request_data)

        # 422 Validation Error
        assert response.status_code == 422
