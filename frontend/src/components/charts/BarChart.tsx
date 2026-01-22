/**
 * 막대 차트 컴포넌트
 * 직원별 비교, 월별 추이 등에 사용
 */

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface BarChartData {
  name: string;
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  color: string;
  name?: string;
}

interface BarChartProps {
  data: BarChartData[];
  bars: BarConfig[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatValue?: (value: number) => string;
}

const defaultFormat = (value: number) =>
  value >= 10000 ? `${(value / 10000).toFixed(0)}만` : value.toLocaleString();

export default function BarChart({
  data,
  bars,
  height = 300,
  showGrid = true,
  showLegend = true,
  formatValue = defaultFormat,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickFormatter={formatValue}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip
          formatter={(value) => typeof value === 'number' ? value.toLocaleString('ko-KR') + '원' : ''}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            fill={bar.color}
            name={bar.name || bar.dataKey}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
