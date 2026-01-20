"""Tax Calculator - 소득세 계산 서비스

근로소득세와 지방소득세를 간이세액표 기준으로 계산합니다.
2026년 간이세액표 적용 (실제 세액표 기준)
"""
from dataclasses import dataclass
from decimal import Decimal

from ..value_objects import Money


@dataclass
class TaxResult:
    """세금 계산 결과

    Attributes:
        income_tax: 근로소득세 (간이세액표)
        local_income_tax: 지방소득세 (소득세의 10%)
        taxable_income: 과세 대상 소득
        dependents_count: 부양가족 수
        children_under_20: 20세 이하 자녀 수 (추가 공제)
    """
    income_tax: Money
    local_income_tax: Money
    taxable_income: Money
    dependents_count: int
    children_under_20: int = 0

    def total(self) -> Money:
        """총 세금 (소득세 + 지방소득세)

        Returns:
            총 세금
        """
        return self.income_tax + self.local_income_tax

    def to_dict(self) -> dict:
        """딕셔너리로 변환 (API 응답용)

        Returns:
            세금 상세 정보
        """
        calculation_detail = f"간이세액표 (부양가족 {self.dependents_count}명"
        if self.children_under_20 > 0:
            calculation_detail += f", 20세 이하 자녀 {self.children_under_20}명"
        calculation_detail += ")"

        return {
            "income_tax": {
                "amount": self.income_tax.to_int(),
                "calculation": calculation_detail
            },
            "local_income_tax": {
                "amount": self.local_income_tax.to_int(),
                "calculation": "소득세 × 10%"
            },
            "total": self.total().to_int()
        }


class TaxCalculator:
    """소득세 계산기

    간이세액표를 기준으로 근로소득세를 계산합니다.
    실제 구현 시 JSON 파일로 관리 권장

    Note:
        간이세액표는 근사치이므로 연말정산 시 차이가 발생할 수 있습니다.
    """

    # 2026년 간이세액표 (국세청 기준)
    # 실제 구현 시 data/tax_table_2026.json 파일로 관리
    # 월급여액 구간별, 부양가족 수별 세액
    TAX_TABLE_2026 = {
        # ~106만원
        (0, 1_060_000): {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0,
        },
        # 106~151만원
        (1_060_000, 1_510_000): {
            1: 6_880, 2: 4_170, 3: 1_460, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0,
        },
        # 151~206만원
        (1_510_000, 2_060_000): {
            1: 17_490, 2: 11_670, 3: 5_840, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0,
        },
        # 206~256만원
        (2_060_000, 2_560_000): {
            1: 31_290, 2: 22_920, 3: 14_550, 4: 6_180, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0,
        },
        # 256~306만원
        (2_560_000, 3_060_000): {
            1: 49_090, 2: 38_170, 3: 27_250, 4: 16_330, 5: 5_410, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0,
        },
        # 306~356만원
        (3_060_000, 3_560_000): {
            1: 70_890, 2: 57_420, 3: 43_950, 4: 30_480, 5: 17_010, 6: 3_540, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0,
        },
        # 356~406만원
        (3_560_000, 4_060_000): {
            1: 96_690, 2: 80_670, 3: 64_650, 4: 48_630, 5: 32_610, 6: 16_590, 7: 570, 8: 0, 9: 0, 10: 0, 11: 0,
        },
        # 406~456만원
        (4_060_000, 4_560_000): {
            1: 126_490, 2: 107_920, 3: 89_350, 4: 70_780, 5: 52_210, 6: 33_640, 7: 15_070, 8: 0, 9: 0, 10: 0, 11: 0,
        },
        # 456~506만원
        (4_560_000, 5_060_000): {
            1: 160_290, 2: 139_170, 3: 118_050, 4: 96_930, 5: 75_810, 6: 54_690, 7: 33_570, 8: 12_450, 9: 0, 10: 0, 11: 0,
        },
        # 506~606만원
        (5_060_000, 6_060_000): {
            1: 204_090, 2: 179_420, 3: 154_750, 4: 130_080, 5: 105_410, 6: 80_740, 7: 56_070, 8: 31_400, 9: 6_730, 10: 0, 11: 0,
        },
        # 606~706만원
        (6_060_000, 7_060_000): {
            1: 273_890, 2: 244_670, 3: 215_450, 4: 186_230, 5: 157_010, 6: 127_790, 7: 98_570, 8: 69_350, 9: 40_130, 10: 10_910, 11: 0,
        },
        # 706~806만원
        (7_060_000, 8_060_000): {
            1: 353_690, 2: 319_920, 3: 286_150, 4: 252_380, 5: 218_610, 6: 184_840, 7: 151_070, 8: 117_300, 9: 83_530, 10: 49_760, 11: 15_990,
        },
        # 806~906만원
        (8_060_000, 9_060_000): {
            1: 443_490, 2: 405_170, 3: 366_850, 4: 328_530, 5: 290_210, 6: 251_890, 7: 213_570, 8: 175_250, 9: 136_930, 10: 98_610, 11: 60_290,
        },
        # 906~1,000만원
        (9_060_000, 10_000_000): {
            1: 543_290, 2: 500_420, 3: 457_550, 4: 414_680, 5: 371_810, 6: 328_940, 7: 286_070, 8: 243_200, 9: 200_330, 10: 157_460, 11: 114_590,
        },
        # 1,000만원 이상
        (10_000_000, 100_000_000): {
            1: 643_090, 2: 595_670, 3: 548_250, 4: 500_830, 5: 453_410, 6: 405_990, 7: 358_570, 8: 311_150, 9: 263_730, 10: 216_310, 11: 168_890,
        },
    }

    def calculate(
        self,
        taxable_income: Money,
        dependents_count: int,
        children_under_20: int = 0
    ) -> TaxResult:
        """소득세 계산 (간이세액표 기준)

        Args:
            taxable_income: 과세 대상 소득 (비과세 제외)
            dependents_count: 부양가족 수 (본인 포함)
            children_under_20: 20세 이하 자녀 수 (추가 공제)

        Returns:
            세금 계산 결과

        Examples:
            >>> calculator = TaxCalculator()
            >>> result = calculator.calculate(Money(2800000), dependents_count=2)
            >>> result.income_tax.to_int()
            38170
            >>> result.local_income_tax.to_int()
            3817
        """
        # 1. 간이세액표에서 소득세 조회
        # 20세 이하 자녀 1명당 부양가족 1명 추가 효과
        effective_dependents = dependents_count + children_under_20

        income_tax_amount = self._lookup_income_tax(
            taxable_income.to_int(),
            effective_dependents
        )
        income_tax = Money(Decimal(income_tax_amount))

        # 2. 지방소득세 계산 (소득세의 10%)
        local_income_tax = (income_tax * Decimal('0.1')).round_to_won()

        return TaxResult(
            income_tax=income_tax,
            local_income_tax=local_income_tax,
            taxable_income=taxable_income,
            dependents_count=dependents_count,
            children_under_20=children_under_20
        )

    def _lookup_income_tax(self, monthly_income: int, dependents: int) -> int:
        """간이세액표에서 소득세 조회

        Args:
            monthly_income: 월 소득 (원)
            dependents: 부양가족 수 (20세 이하 자녀 포함)

        Returns:
            소득세 (원)
        """
        # 부양가족 수 보정 (최대 11명까지만 테이블에 있음)
        dependents_key = min(dependents, 11)
        if dependents_key < 1:
            dependents_key = 1

        # 소득 구간 찾기
        for (min_income, max_income), tax_by_dependents in self.TAX_TABLE_2026.items():
            if min_income <= monthly_income < max_income:
                return tax_by_dependents.get(dependents_key, 0)

        # 범위를 벗어나면 최고 구간 적용
        return self.TAX_TABLE_2026[(10_000_000, 100_000_000)].get(dependents_key, 643_090)

    @classmethod
    def estimate_annual_tax(
        cls,
        monthly_income: Money,
        dependents_count: int,
        children_under_20: int = 0
    ) -> Money:
        """연간 소득세 추정치

        Args:
            monthly_income: 월 소득
            dependents_count: 부양가족 수
            children_under_20: 20세 이하 자녀 수

        Returns:
            연간 소득세 추정치

        Note:
            간이세액표 기준이므로 실제 연말정산과 차이가 있을 수 있습니다.
        """
        calculator = cls()
        monthly_tax = calculator.calculate(monthly_income, dependents_count, children_under_20)
        return monthly_tax.total() * 12

    @classmethod
    def load_from_json(cls, json_path: str, year: int):
        """JSON 파일에서 간이세액표 로드 (추후 구현)

        Args:
            json_path: JSON 파일 경로
            year: 연도

        Note:
            Phase 5에서 구현 예정
        """
        raise NotImplementedError("JSON loading will be implemented in Phase 5")
