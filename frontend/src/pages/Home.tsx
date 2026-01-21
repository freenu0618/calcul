/**
 * 급여 계산기 메인 페이지
 */

import { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmployeeInfoForm from '../components/forms/EmployeeInfoForm';
import SalaryForm from '../components/forms/SalaryForm';
import { SalaryResult } from '../components/ResultDisplay';
import { ShiftInput } from '../components/ShiftInput';
import { salaryApi } from '../api';
import type { Employee, Allowance } from '../types/models';
import type { SalaryCalculationResponse, WorkShiftRequest } from '../types/salary';

function Home() {
  // 근로자 정보 상태
  const [employee, setEmployee] = useState<Employee>({
    name: '',
    dependents_count: 1,
    children_under_20: 0,
    employment_type: 'FULL_TIME',
    company_size: 'OVER_5',
    scheduled_work_days: 5,
  });

  // 급여 정보 상태
  const [baseSalary, setBaseSalary] = useState<number>(2500000);
  const [allowances, setAllowances] = useState<Allowance[]>([]);

  // 근무 시프트 상태
  const [workShifts, setWorkShifts] = useState<WorkShiftRequest[]>([]);

  // 계산 결과 상태
  const [result, setResult] = useState<SalaryCalculationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 제출 핸들러 (메모이제이션)
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 디버깅: API 요청 데이터 확인
      console.log('API Request:', {
        employee,
        base_salary: baseSalary,
        allowances,
        work_shifts: workShifts,
      });

      const response = await salaryApi.calculateSalary({
        employee,
        base_salary: baseSalary,
        allowances,
        work_shifts: workShifts,
      });
      setResult(response);

      // GA4 이벤트 전송: 급여 계산 완료
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'calculate_salary', {
          event_category: 'engagement',
          event_label: 'salary_calculator',
          employment_type: employee.employment_type,
          company_size: employee.company_size,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '계산 중 오류가 발생했습니다.';
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [employee, baseSalary, allowances, workShifts]);

  return (
    <>
      <Helmet>
        <title>한국 근로기준법 급여 계산기 | 2026년 4대보험 실수령액 계산</title>
        <meta name="description" content="기본급, 수당, 4대보험, 소득세를 자동 계산하여 실수령액을 정확히 확인하세요. 연장·야간·휴일 수당, 주휴수당 계산 포함. 2026년 최신 세율 적용." />
      </Helmet>

      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold mb-4">
              한국 근로기준법에 완벽히 맞춘 급여 계산기
            </h1>
            <p className="text-xl mb-6 text-blue-50">
              4대 보험, 소득세, 가산수당을 자동 계산하여 정확한 실수령액을 확인하세요
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>2026년 최신 세율 적용</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>연장·야간·휴일 수당 자동 계산</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>100% 무료, 회원가입 불필요</span>
              </div>
            </div>
            <button
              onClick={() => {
                const formElement = document.querySelector('form');
                formElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              지금 계산하기
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">정확한 계산</h3>
              <p className="text-gray-600">2026년 4대 보험 요율과 간이세액표를 정확히 적용</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">다양한 근무 형태</h3>
              <p className="text-gray-600">풀타임, 파트타임, 교대근무 모두 지원</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">법적 근거 제공</h3>
              <p className="text-gray-600">근로기준법 기반 계산 과정 투명 공개</p>
            </div>
          </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* 근로자 정보 카드 */}
            <Card>
              <EmployeeInfoForm employee={employee} onChange={setEmployee} />
            </Card>

            {/* 급여 정보 카드 */}
            <Card>
              <SalaryForm
                baseSalary={baseSalary}
                allowances={allowances}
                onBaseSalaryChange={setBaseSalary}
                onAllowancesChange={setAllowances}
              />
            </Card>

            {/* 근무 시프트 카드 */}
            <Card>
              <ShiftInput
                onChange={setWorkShifts}
                initialShifts={workShifts}
              />
            </Card>

            {/* 제출 버튼 */}
            <div className="flex justify-center">
              <Button
                type="submit"
                variant="primary"
                className="px-8 py-3 text-lg"
                disabled={isLoading}
              >
                {isLoading ? '계산 중...' : '급여 계산하기'}
              </Button>
            </div>
          </div>
        </form>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
            <p className="font-medium">오류</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* 계산 결과 표시 */}
        <div className="mt-8">
          <Card title="계산 결과">
            {result ? (
              <SalaryResult result={result} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>급여 정보를 입력하고 "급여 계산하기" 버튼을 클릭하세요.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
    </>
  );
}

export default Home;
