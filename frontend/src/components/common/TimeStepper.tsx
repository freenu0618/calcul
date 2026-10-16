/**
 * 시간/분 분리 스테퍼 컴포넌트
 * - 시간: 1h 단위 증감 (0~23 순환)
 * - 분: 10분 단위 증감 (0~50, 자동 올림/내림)
 */

import { useId } from 'react';

interface TimeStepperProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function TimeStepper({ value, onChange, label }: TimeStepperProps) {
  const labelId = useId();
  const timeLabel = label || '시간';
  const [h, m] = (value || '09:00').split(':').map(Number);
  // 부모의 입력값을 그대로 사용해 프리셋 변경도 추가 렌더링 없이 반영합니다.
  const hours = isNaN(h) ? 9 : h;
  const minutes = isNaN(m) ? 0 : m;

  const emit = (newH: number, newM: number) => {
    onChange(`${pad(newH)}:${pad(newM)}`);
  };

  const adjustHour = (delta: number) => {
    const next = (hours + delta + 24) % 24;
    emit(next, minutes);
  };

  const adjustMinute = (delta: number) => {
    let newM = minutes + delta;
    let newH = hours;
    if (newM >= 60) { newM = 0; newH = (newH + 1) % 24; }
    if (newM < 0) { newM = 50; newH = (newH - 1 + 24) % 24; }
    emit(newH, newM);
  };

  const btnClass =
    'w-9 h-9 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold text-lg select-none transition-colors';

  return (
    <div role="group" aria-labelledby={labelId}>
      <div id={labelId} className={label ? "block text-sm font-medium text-gray-700 mb-1" : "sr-only"}>
        {timeLabel}
      </div>
      <span role="status" aria-atomic="true" className="sr-only">
        {timeLabel} {hours}시 {minutes}분
      </span>
      <div className="flex items-center gap-1">
        {/* 시간 */}
        <button type="button" aria-label={`${timeLabel} 1시간 줄이기`} onClick={() => adjustHour(-1)} className={btnClass}>-</button>
        <span className="w-8 text-center text-lg font-mono font-bold text-gray-900">
          {pad(hours)}
        </span>
        <button type="button" aria-label={`${timeLabel} 1시간 늘리기`} onClick={() => adjustHour(1)} className={btnClass}>+</button>

        <span className="text-lg font-bold text-gray-500 mx-0.5">:</span>

        {/* 분 */}
        <button type="button" aria-label={`${timeLabel} 10분 줄이기`} onClick={() => adjustMinute(-10)} className={btnClass}>-</button>
        <span className="w-8 text-center text-lg font-mono font-bold text-gray-900">
          {pad(minutes)}
        </span>
        <button type="button" aria-label={`${timeLabel} 10분 늘리기`} onClick={() => adjustMinute(10)} className={btnClass}>+</button>
      </div>
    </div>
  );
}
