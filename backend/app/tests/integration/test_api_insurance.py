"""보험료 조회 API 통합 테스트"""
import pytest
from fastapi.testclient import TestClient
from app.api.main import app

client = TestClient(app)


class TestInsuranceAPI:
    """보험료 조회 API 테스트"""

    def test_get_insurance_rates(self):
        """보험료율 조회"""
        response = client.get("/api/v1/insurance/rates")

        assert response.status_code == 200
        data = response.json()

        # 응답 구조 검증
        assert "year" in data
        assert data["year"] == 2026
        assert "national_pension" in data
        assert "health_insurance" in data
        assert "long_term_care" in data
        assert "employment_insurance" in data

        # 요율 값 검증
        assert data["national_pension"]["rate"] == 0.045
        assert data["health_insurance"]["rate"] == 0.03595
        assert data["long_term_care"]["rate"] == 0.1295
        assert data["employment_insurance"]["rate"] == 0.009

    def test_get_insurance_rates_invalid_year(self):
        """잘못된 연도 조회"""
        response = client.get("/api/v1/insurance/rates?year=2025")

        assert response.status_code == 400

    def test_calculate_insurance(self):
        """보험료 계산"""
        request_data = {
            "gross_income": 2800000
        }

        response = client.post("/api/v1/insurance/calculate", json=request_data)

        assert response.status_code == 200
        data = response.json()

        # 응답 구조 검증
        assert "national_pension" in data
        assert "health_insurance" in data
        assert "long_term_care" in data
        assert "employment_insurance" in data
        assert "total" in data

        # 계산 결과 검증
        assert data["national_pension"]["amount"] == 126000  # 2,800,000 × 4.5%
        assert data["health_insurance"]["amount"] == 100660  # 2,800,000 × 3.595%
        assert data["total"] > 0

    def test_calculate_insurance_zero_income(self):
        """0원 소득"""
        request_data = {
            "gross_income": 0
        }

        response = client.post("/api/v1/insurance/calculate", json=request_data)

        assert response.status_code == 200
        data = response.json()

        # 국민연금은 하한 적용
        assert data["national_pension"]["amount"] == 17550  # 39만원 × 4.5%
        # 나머지는 0
        assert data["health_insurance"]["amount"] == 0
        assert data["employment_insurance"]["amount"] == 0

    def test_calculate_insurance_high_income(self):
        """고소득 (상한 적용)"""
        request_data = {
            "gross_income": 10000000
        }

        response = client.post("/api/v1/insurance/calculate", json=request_data)

        assert response.status_code == 200
        data = response.json()

        # 국민연금 상한 적용
        assert data["national_pension"]["amount"] == 265500  # 590만원 × 4.5%
