"""법정 요율 로더 - 연도별 법정 요율 관리

legal_rates.json에서 연도별 요율을 로드하여 제공합니다.
매년 1월 변경되는 최저임금, 보험료율 등을 중앙에서 관리합니다.
"""
import json
from decimal import Decimal
from pathlib import Path
from typing import Optional

_RATES_FILE = Path(__file__).parent / "legal_rates.json"
_cache: Optional[dict] = None


def _load_all_rates() -> dict:
    """JSON 파일에서 전체 요율 로드 (캐싱)"""
    global _cache
    if _cache is None:
        with open(_RATES_FILE, "r", encoding="utf-8") as f:
            _cache = json.load(f)
    return _cache


def reload_rates() -> None:
    """캐시 초기화 (런타임 업데이트 시 호출)"""
    global _cache
    _cache = None


def get_available_years() -> list:
    """사용 가능한 연도 목록"""
    rates = _load_all_rates()
    return sorted(rates.keys(), reverse=True)


def get_rates(year: int = 2026) -> dict:
    """특정 연도 요율 조회

    Args:
        year: 조회할 연도

    Returns:
        해당 연도의 법정 요율 딕셔너리

    Raises:
        ValueError: 지원하지 않는 연도
    """
    rates = _load_all_rates()
    key = str(year)
    if key not in rates:
        available = ", ".join(get_available_years())
        raise ValueError(f"{year}년 요율이 없습니다. 사용 가능: {available}")
    return rates[key]


def get_minimum_wage(year: int = 2026) -> Decimal:
    """최저임금 시급 조회"""
    return Decimal(str(get_rates(year)["minimum_wage"]["hourly"]))


def get_insurance_rates(year: int = 2026) -> dict:
    """4대 보험 요율 조회 (Decimal 변환)"""
    raw = get_rates(year)["insurance"]
    return {
        "national_pension_rate": Decimal(str(raw["national_pension"]["employee_rate"])),
        "national_pension_upper": raw["national_pension"]["upper_limit"],
        "national_pension_lower": raw["national_pension"]["lower_limit"],
        "health_insurance_rate": Decimal(str(raw["health_insurance"]["employee_rate"])),
        "long_term_care_rate": Decimal(str(raw["long_term_care"]["rate"])),
        "employment_insurance_rate": Decimal(str(raw["employment_insurance"]["employee_rate"])),
        "employment_insurance_upper": raw["employment_insurance"]["upper_limit"],
    }


def get_overtime_rates(year: int = 2026) -> dict:
    """가산수당 요율 조회"""
    return get_rates(year)["overtime"]


def update_rates(year: int, data: dict) -> None:
    """특정 연도 요율 업데이트 (Admin용)

    Args:
        year: 업데이트할 연도
        data: 새로운 요율 데이터
    """
    rates = _load_all_rates()
    rates[str(year)] = data
    with open(_RATES_FILE, "w", encoding="utf-8") as f:
        json.dump(rates, f, ensure_ascii=False, indent=2)
    reload_rates()
