/**
 * 선 차트 컴포넌트
 * 급여 추이, 시간별 변화 등에 사용
 */

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface LineChartData {
  name: string;
  [key: string]: string | number;
}

interface LineConfig {
  dataKey: string;
  color: string;
  name?: string;
  strokeWidth?: number;
  dot?: boolean;
}

interface LineChartProps {
  data: LineChartData[];
  lines: LineConfig[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatValue?: (value: number) => string;
}

const defaultFormat = (value: number) =>
  value >= 10000 ? `${(value / 10000).toFixed(0)}만` : value.toLocaleString();

export default function LineChart({
  data,
  lines,
  height = 300,
  showGrid = true,
  showLegend = true,
  formatValue = defaultFormat,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
        {lines.map((line, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            name={line.name || line.dataKey}
            strokeWidth={line.strokeWidth || 2}
            dot={line.dot !== false}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
