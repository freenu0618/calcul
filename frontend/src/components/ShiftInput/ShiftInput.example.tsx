/**
 * ShiftInput 컴포넌트 사용 예제
 *
 * 이 파일은 ShiftInput 컴포넌트의 사용 방법을 보여주는 예제입니다.
 */

import { useState } from 'react';
import { ShiftInput } from './index';
import type { WorkShiftRequest } from '../../types/salary';

const ShiftInputExample: React.FC = () => {
  const [workShifts, setWorkShifts] = useState<WorkShiftRequest[]>([]);

  // 초기 데이터 예제
  const initialShifts: WorkShiftRequest[] = [
    {
      date: '2026-01-13',
      start_time: '09:00',
      end_time: '18:00',
      break_minutes: 60,
      is_holiday_work: false,
    },
    {
      date: '2026-01-14',
      start_time: '22:00',
      end_time: '06:00',
      break_minutes: 30,
      is_holiday_work: false,
    },
    {
      date: '2026-01-19',
      start_time: '10:00',
      end_time: '19:00',
      break_minutes: 60,
      is_holiday_work: true,
    },
  ];

  const handleShiftChange = (shifts: WorkShiftRequest[]) => {
    setWorkShifts(shifts);
    console.log('Updated shifts:', shifts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting shifts:', workShifts);
    // API 호출 등의 로직 추가
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">근무 시프트 입력 예제</h1>

      <form onSubmit={handleSubmit}>
        {/* ShiftInput 컴포넌트 */}
        <ShiftInput
          onChange={handleShiftChange}
          initialShifts={initialShifts}
        />

        {/* 제출 버튼 */}
        <div className="mt-6">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            급여 계산하기
          </button>
        </div>
      </form>

      {/* 디버깅용 JSON 출력 */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">현재 시프트 데이터 (JSON)</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(workShifts, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ShiftInputExample;
