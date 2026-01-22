/**
 * Live Demo Section - 인터랙티브 계산 미리보기
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LiveDemoSection() {
  const [salary, setSalary] = useState(2500000);
  const [netPay, setNetPay] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 간단한 실수령액 계산 (대략적)
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      // 4대보험 약 9.4% + 소득세 약 3% = 약 12.4%
      const deductions = salary * 0.124;
      setNetPay(Math.round(salary - deductions));
      setIsAnimating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [salary]);

  const formatNumber = (num: number) => num.toLocaleString('ko-KR');

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            지금 바로 확인해보세요
          </h2>
          <p className="text-gray-600">
            월급을 입력하면 즉시 실수령액을 계산합니다
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                월 기본급
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="2000000"
                  max="10000000"
                  step="100000"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="mt-4 text-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatNumber(salary)}
                  </span>
                  <span className="text-gray-500 ml-1">원</span>
                </div>
              </div>
            </div>

            {/* 결과 */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="text-sm opacity-80 mb-2">예상 실수령액</div>
              <div className={`text-4xl font-bold transition-opacity ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
                {formatNumber(netPay)}
                <span className="text-lg font-normal ml-1">원</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="opacity-80">4대보험</span>
                  <span>-{formatNumber(Math.round(salary * 0.094))}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">소득세</span>
                  <span>-{formatNumber(Math.round(salary * 0.03))}원</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              * 부양가족, 수당, 연장근로 등에 따라 실제 금액은 달라질 수 있습니다
            </p>
            <Link
              to="/calculator"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              상세하게 계산하기
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
