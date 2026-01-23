"""2026년 한국 공휴일 목록

관공서의 공휴일에 관한 규정 (대통령령) 기준.
5인 이상 사업장: 공휴일 = 유급휴일 (근로기준법 제55조 2항, 2022년~)
5인 미만 사업장: 공휴일 적용 의무 없음
"""
from datetime import date
from typing import List, Set


# 2026년 법정 공휴일 (대체공휴일 포함)
HOLIDAYS_2026: List[date] = [
    date(2026, 1, 1),    # 신정
    date(2026, 2, 16),   # 설날 전날 (음력 12/29)
    date(2026, 2, 17),   # 설날 (음력 1/1)
    date(2026, 2, 18),   # 설날 다음날 (음력 1/2)
    date(2026, 3, 1),    # 삼일절 (일요일 → 3/2 대체공휴일)
    date(2026, 3, 2),    # 삼일절 대체공휴일
    date(2026, 5, 5),    # 어린이날
    date(2026, 5, 24),   # 부처님오신날 (음력 4/8, 일요일 → 5/25 대체)
    date(2026, 5, 25),   # 부처님오신날 대체공휴일
    date(2026, 6, 6),    # 현충일 (토요일)
    date(2026, 8, 15),   # 광복절 (토요일)
    date(2026, 9, 24),   # 추석 전날 (음력 8/14)
    date(2026, 9, 25),   # 추석 (음력 8/15)
    date(2026, 9, 26),   # 추석 다음날 (음력 8/16)
    date(2026, 10, 3),   # 개천절 (토요일)
    date(2026, 10, 9),   # 한글날
    date(2026, 12, 25),  # 크리스마스
]

HOLIDAYS_2026_SET: Set[date] = set(HOLIDAYS_2026)


def get_holidays(year: int = 2026) -> Set[date]:
    """해당 연도 공휴일 목록 반환

    Args:
        year: 연도 (현재 2026년만 지원)

    Returns:
        공휴일 날짜 집합
    """
    if year == 2026:
        return HOLIDAYS_2026_SET
    return set()


def is_holiday(d: date) -> bool:
    """해당 날짜가 공휴일인지 확인"""
    return d in HOLIDAYS_2026_SET
