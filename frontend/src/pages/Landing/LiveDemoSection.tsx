/**
 * Live Demo Section - 아하 모먼트 + 호기심의 틈
 * 2026년 요율 기반 간이 실수령액 계산 슬라이더
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const fmt = (n: number) => n.toLocaleString('ko-KR');

/** 2026년 기준 간이 소득세 추정 (간이세액표 근사) */
function estimateIncomeTax(monthly: number): number {
  if (monthly <= 1060000) return 0;
  if (monthly <= 1500000) return Math.round((monthly - 1060000) * 0.06);
  if (monthly <= 3000000) return 26400 + Math.round((monthly - 1500000) * 0.15);
  if (monthly <= 4500000) return 251400 + Math.round((monthly - 3000000) * 0.24);
  return 611400 + Math.round((monthly - 4500000) * 0.35);
}

/** 간이 실수령액 계산 (랜딩페이지용) */
function quickCalc(gross: number) {
  const pension = Math.min(Math.round(gross * 0.045), 265500);
  const health = Math.round(gross * 0.03545);
  const longTermCare = Math.round(health * 0.1295);
  const employment = Math.round(gross * 0.009);
  const incomeTax = estimateIncomeTax(gross);
  const localTax = Math.round(incomeTax * 0.1);
  const totalDeduction = pension + health + longTermCare + employment + incomeTax + localTax;

  return {
    net: gross - totalDeduction,
    totalDeduction,
    items: [
      { label: '국민연금', amount: pension },
      { label: '건강보험', amount: health },
      { label: '장기요양보험', amount: longTermCare },
      { label: '고용보험', amount: employment },
      { label: '소득세', amount: incomeTax },
      { label: '지방소득세', amount: localTax },
    ],
  };
}

export default function LiveDemoSection() {
  const [salary, setSalary] = useState(3000000);
  const result = useMemo(() => quickCalc(salary), [salary]);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl mb-3">
            이렇게 정확하게 계산해 드려요
          </h2>
          <p className="text-text-sub">
            월급 {fmt(salary)}원, 5인 이상 사업장, 부양가족 1인 기준
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 md:p-10">
          {/* 슬라이더 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-text-main mb-3 text-center">
              월급을 조절해 보세요
            </label>
            <input
              type="range"
              min={2000000}
              max={10000000}
              step={100000}
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-text-sub mt-1">
              <span>200만원</span>
              <span className="text-lg font-bold text-text-main">{fmt(salary)}원</span>
              <span>1,000만원</span>
            </div>
          </div>

          {/* 결과 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 실수령액 */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6 text-white">
              <p className="text-sm opacity-80 mb-1">예상 실수령액</p>
              <p className="text-3xl sm:text-4xl font-bold">
                {fmt(result.net)}
                <span className="text-lg font-normal ml-1">원</span>
              </p>
              {/* 아하 인사이트 */}
              <div className="mt-4 pt-3 border-t border-white/20 text-sm">
                매달 <strong>{fmt(result.totalDeduction)}원</strong>이 공제됩니다.
                <br />
                연간으로 보면 <strong>약 {fmt(Math.round(result.totalDeduction * 12 / 10000))}만원</strong>.
              </div>
            </div>

            {/* 공제 내역 */}
            <div className="space-y-2">
              {result.items.map((item) => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-text-sub">{item.label}</span>
                  <span className="text-sm font-medium text-red-600">-{fmt(item.amount)}원</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2 h-12 px-8 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
            >
              내 정확한 실수령액 계산하기
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <p className="text-xs text-text-sub mt-3">
              수당, 연장근로, 비과세까지 정밀 계산
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
