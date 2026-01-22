/**
 * 도넛 차트 컴포넌트
 * 급여 구성 비율을 시각적으로 표시
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  centerLabel?: string;
  centerValue?: string;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean; // 어두운 배경용
}

const SIZE_CONFIG = {
  sm: { outer: 60, inner: 40, width: 150, height: 150 },
  md: { outer: 80, inner: 55, width: 200, height: 200 },
  lg: { outer: 100, inner: 70, width: 250, height: 250 },
};

const formatMoney = (value: number | undefined) =>
  value !== undefined ? value.toLocaleString('ko-KR') + '원' : '';

export default function DonutChart({
  data,
  centerLabel,
  centerValue,
  size = 'md',
  darkMode = false,
}: DonutChartProps) {
  const config = SIZE_CONFIG[size];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // 다크모드/라이트모드 텍스트 색상
  const textColors = darkMode
    ? { label: 'text-white/80', value: 'text-white', name: 'text-white/90', amount: 'text-white', percent: 'text-white/60' }
    : { label: 'text-gray-500', value: 'text-gray-900', name: 'text-gray-600', amount: 'text-gray-900', percent: 'text-gray-400' };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={config.inner}
              outerRadius={config.outer}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatMoney(typeof value === 'number' ? value : undefined)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* 중앙 라벨 */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerLabel && (
              <span className={`text-xs ${textColors.label}`}>{centerLabel}</span>
            )}
            {centerValue && (
              <span className={`text-sm font-bold ${textColors.value}`}>{centerValue}</span>
            )}
          </div>
        )}
      </div>

      {/* 범례 */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className={textColors.name}>{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${textColors.amount}`}>{formatMoney(item.value)}</span>
              <span className={`text-xs ${textColors.percent}`}>
                ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
