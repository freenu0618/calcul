/**
 * EmployeeForm 사용 예제
 *
 * 이 파일은 EmployeeForm 컴포넌트의 사용 방법을 보여줍니다.
 * 개발 환경에서 참고용으로 사용하세요.
 */

import React, { useState } from 'react';
import EmployeeForm from './EmployeeForm';
import type { EmployeeRequest } from '../../types/salary';

const EmployeeFormExample: React.FC = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeRequest | null>(null);

  const handleEmployeeChange = (data: EmployeeRequest) => {
    console.log('근로자 정보 변경:', data);
    setEmployeeData(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          근로자 정보 입력 폼 예제
        </h1>

        {/* 기본 사용 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">1. 기본 사용</h2>
          <EmployeeForm onChange={handleEmployeeChange} />
        </section>

        {/* 초기 데이터 포함 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">2. 초기 데이터 포함</h2>
          <EmployeeForm
            onChange={handleEmployeeChange}
            initialData={{
              name: '홍길동',
              dependents_count: 3,
              children_under_20: 2,
              employment_type: 'FULL_TIME',
              company_size: 'OVER_5',
              scheduled_work_days: 5,
            }}
          />
        </section>

        {/* 현재 입력된 데이터 표시 */}
        {employeeData && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">입력된 데이터</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <pre className="text-sm text-gray-700 overflow-auto">
                {JSON.stringify(employeeData, null, 2)}
              </pre>
            </div>
          </section>
        )}

        {/* 사용 가이드 */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">사용 가이드</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>이름</strong>: 필수 입력 항목입니다.</li>
            <li>• <strong>부양가족 수</strong>: 본인을 제외한 부양가족 수를 입력하세요.</li>
            <li>• <strong>20세 이하 자녀 수</strong>: 부양가족 수를 초과할 수 없습니다.</li>
            <li>• <strong>고용 형태</strong>: 정규직/비정규직을 선택하세요.</li>
            <li>• <strong>사업장 규모</strong>: 5인 미만/5인 이상을 선택하세요. (휴일근로 가산율에 영향)</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default EmployeeFormExample;
