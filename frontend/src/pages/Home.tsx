/**
 * 급여 계산기 메인 페이지
 */

import { useState } from 'react';
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

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : '계산 중 오류가 발생했습니다.';
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>한국 근로기준법 급여 계산기 | 2026년 4대보험 실수령액 계산</title>
        <meta name="description" content="기본급, 수당, 4대보험, 소득세를 자동 계산하여 실수령액을 정확히 확인하세요. 연장·야간·휴일 수당, 주휴수당 계산 포함. 2026년 최신 세율 적용." />
      </Helmet>

      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              한국 근로기준법 급여 계산기
            </h1>
            <p className="text-gray-600">
              근로자 정보와 급여 내역을 입력하면 4대 보험, 세금을 제외한 실수령액을 계산합니다.
            </p>
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
