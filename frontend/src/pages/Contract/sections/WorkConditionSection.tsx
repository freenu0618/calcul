/**
 * 근로 조건 섹션
 */

import Input from '../../../components/common/Input';
import type { LaborContract } from '../../../types/contract';
import { WEEKDAY_OPTIONS } from '../../../types/contract';

interface Props {
  contract: LaborContract;
  onChange: (updates: Partial<LaborContract>) => void;
}

export default function WorkConditionSection({ contract, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* 근무 장소/업무 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="근무 장소"
          value={contract.workplace}
          onChange={(e) => onChange({ workplace: e.target.value })}
          placeholder="본사 사무실"
          required
        />
        <Input
          label="직위/직책"
          value={contract.job_title}
          onChange={(e) => onChange({ job_title: e.target.value })}
          placeholder="사원"
        />
      </div>
      <Input
        label="담당 업무"
        value={contract.job_description}
        onChange={(e) => onChange({ job_description: e.target.value })}
        placeholder="사무 보조, 데이터 입력 등"
      />

      {/* 근로 시간 */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">근로 시간</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="시업 시각"
            type="time"
            value={contract.work_start_time}
            onChange={(e) => onChange({ work_start_time: e.target.value })}
          />
          <Input
            label="종업 시각"
            type="time"
            value={contract.work_end_time}
            onChange={(e) => onChange({ work_end_time: e.target.value })}
          />
          <Input
            label="휴게 시간 (분)"
            type="number"
            min={0}
            value={contract.break_minutes}
            onChange={(e) => onChange({ break_minutes: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="주 소정근로일수"
            type="number"
            min={1}
            max={7}
            value={contract.weekly_work_days}
            onChange={(e) => onChange({ weekly_work_days: parseInt(e.target.value) || 5 })}
          />
        </div>
      </div>

      {/* 주휴일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">주휴일</label>
        <select
          value={contract.weekly_holiday}
          onChange={(e) => onChange({ weekly_holiday: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {WEEKDAY_OPTIONS.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      {/* 연장/야간/휴일 근로 */}
      <div className="border-t pt-4">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={contract.overtime_agreement}
            onChange={(e) => onChange({ overtime_agreement: e.target.checked })}
          />
          <span className="font-medium">연장/야간/휴일 근로 합의</span>
        </label>
        {contract.overtime_agreement && (
          <div className="grid grid-cols-3 gap-4 ml-6 text-sm">
            <div>
              <span className="text-gray-600">연장근로 가산율:</span>
              <span className="font-medium ml-2">{(contract.overtime_rate * 100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-gray-600">야간근로 가산율:</span>
              <span className="font-medium ml-2">{(contract.night_rate * 100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-gray-600">휴일근로 가산율:</span>
              <span className="font-medium ml-2">{(contract.holiday_rate * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
