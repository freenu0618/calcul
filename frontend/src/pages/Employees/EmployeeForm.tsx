/**
 * 직원 등록/수정 폼
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { employeeApi } from '../../api/employeeApi';
import type { EmployeeRequest, EmployeeResponse, VisaType } from '../../types/employee';

const VISA_OPTIONS: { value: VisaType; label: string }[] = [
  { value: 'E-9', label: 'E-9 (비전문취업)' },
  { value: 'H-2', label: 'H-2 (방문취업)' },
  { value: 'F-4', label: 'F-4 (재외동포)' },
  { value: 'F-2', label: 'F-2 (거주)' },
  { value: 'F-5', label: 'F-5 (영주)' },
  { value: 'F-6', label: 'F-6 (결혼이민)' },
  { value: 'D-7', label: 'D-7 (주재)' },
  { value: 'D-8', label: 'D-8 (기업투자)' },
  { value: 'D-9', label: 'D-9 (무역경영)' },
];

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForeigner, setIsForeigner] = useState(false);

  const [form, setForm] = useState<EmployeeRequest>({
    name: '',
    resident_id_prefix: '',
    contract_start_date: new Date().toISOString().split('T')[0],
    employment_type: 'FULL_TIME',
    company_size: 'OVER_5',
    visa_type: null,
    work_start_time: '09:00',
    work_end_time: '18:00',
    break_minutes: 60,
    weekly_work_days: 5,
    daily_work_hours: 8,
    probation_months: 0,
    probation_rate: 100,
  });

  useEffect(() => {
    if (isEdit && id) {
      loadEmployee(id);
    }
  }, [id, isEdit]);

  const loadEmployee = async (employeeId: string) => {
    try {
      setLoading(true);
      const data = await employeeApi.getEmployee(employeeId);
      setForm(mapResponseToForm(data));
      setIsForeigner(data.is_foreigner);
    } catch (err) {
      setError('직원 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mapResponseToForm = (data: EmployeeResponse): EmployeeRequest => ({
    name: data.name,
    resident_id_prefix: data.resident_id_prefix,
    contract_start_date: data.contract_start_date,
    employment_type: data.employment_type,
    company_size: data.company_size,
    visa_type: data.visa_type,
    work_start_time: data.work_start_time.slice(0, 5),
    work_end_time: data.work_end_time.slice(0, 5),
    break_minutes: data.break_minutes,
    weekly_work_days: data.weekly_work_days,
    daily_work_hours: data.daily_work_hours,
    probation_months: data.probation_months,
    probation_rate: data.probation_rate,
  });

  const handleResidentIdChange = (value: string) => {
    setForm({ ...form, resident_id_prefix: value });
    // 주민번호 성별코드로 외국인 자동 판단 (5~8: 외국인)
    if (value.length === 8 && value.includes('-')) {
      const genderCode = parseInt(value.charAt(7), 10);
      setIsForeigner(genderCode >= 5 && genderCode <= 8);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const requestData = { ...form, visa_type: isForeigner ? form.visa_type : null };
      if (isEdit && id) {
        await employeeApi.updateEmployee(id, requestData);
      } else {
        await employeeApi.createEmployee(requestData);
      }
      navigate('/employees');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '저장에 실패했습니다.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEdit ? '직원 수정' : '직원 등록'} - paytools</title>
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-main mb-8">
          {isEdit ? '직원 정보 수정' : '새 직원 등록'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <FormSection title="기본 정보">
            <FormField label="이름" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-input"
                placeholder="홍길동"
                required
              />
            </FormField>

            <FormField label="주민번호 앞 7자리" required>
              <input
                type="text"
                value={form.resident_id_prefix}
                onChange={(e) => handleResidentIdChange(e.target.value)}
                className="form-input"
                placeholder="900101-1"
                pattern="\d{6}-\d"
                required
              />
              <p className="text-xs text-text-sub mt-1">형식: YYMMDD-N (예: 900101-1)</p>
            </FormField>

            {isForeigner && (
              <FormField label="체류자격" required>
                <select
                  value={form.visa_type || ''}
                  onChange={(e) => setForm({ ...form, visa_type: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">선택하세요</option>
                  {VISA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
          </FormSection>

          {/* 계약 정보 */}
          <FormSection title="계약 정보">
            <FormField label="계약 시작일" required>
              <input
                type="date"
                value={form.contract_start_date}
                onChange={(e) => setForm({ ...form, contract_start_date: e.target.value })}
                className="form-input"
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="고용형태">
                <select
                  value={form.employment_type}
                  onChange={(e) =>
                    setForm({ ...form, employment_type: e.target.value as 'FULL_TIME' | 'PART_TIME' })
                  }
                  className="form-input"
                >
                  <option value="FULL_TIME">정규직</option>
                  <option value="PART_TIME">파트타임</option>
                </select>
              </FormField>

              <FormField label="사업장 규모">
                <select
                  value={form.company_size}
                  onChange={(e) =>
                    setForm({ ...form, company_size: e.target.value as 'OVER_5' | 'UNDER_5' })
                  }
                  className="form-input"
                >
                  <option value="OVER_5">5인 이상</option>
                  <option value="UNDER_5">5인 미만</option>
                </select>
              </FormField>
            </div>
          </FormSection>

          {/* 근무 시간 */}
          <FormSection title="근무 시간">
            <div className="grid grid-cols-3 gap-4">
              <FormField label="시업 시간">
                <input
                  type="time"
                  value={form.work_start_time}
                  onChange={(e) => setForm({ ...form, work_start_time: e.target.value })}
                  className="form-input"
                />
              </FormField>
              <FormField label="종업 시간">
                <input
                  type="time"
                  value={form.work_end_time}
                  onChange={(e) => setForm({ ...form, work_end_time: e.target.value })}
                  className="form-input"
                />
              </FormField>
              <FormField label="휴게시간 (분)">
                <input
                  type="number"
                  value={form.break_minutes}
                  onChange={(e) => setForm({ ...form, break_minutes: parseInt(e.target.value, 10) })}
                  className="form-input"
                  min="0"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="주 근무일수">
                <input
                  type="number"
                  value={form.weekly_work_days}
                  onChange={(e) => setForm({ ...form, weekly_work_days: parseInt(e.target.value, 10) })}
                  className="form-input"
                  min="1"
                  max="7"
                />
              </FormField>
              <FormField label="일일 근로시간">
                <input
                  type="number"
                  value={form.daily_work_hours}
                  onChange={(e) => setForm({ ...form, daily_work_hours: parseInt(e.target.value, 10) })}
                  className="form-input"
                  min="1"
                />
              </FormField>
            </div>
          </FormSection>

          {/* 수습 기간 */}
          <FormSection title="수습 기간">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="수습기간 (개월)">
                <input
                  type="number"
                  value={form.probation_months}
                  onChange={(e) => setForm({ ...form, probation_months: parseInt(e.target.value, 10) })}
                  className="form-input"
                  min="0"
                />
              </FormField>
              <FormField label="수습 급여 비율 (%)">
                <input
                  type="number"
                  value={form.probation_rate}
                  onChange={(e) => setForm({ ...form, probation_rate: parseInt(e.target.value, 10) })}
                  className="form-input"
                  min="0"
                  max="100"
                />
              </FormField>
            </div>
          </FormSection>

          {/* 버튼 */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-text-main hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중...' : isEdit ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-text-main mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-main mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
