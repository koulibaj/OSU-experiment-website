// src/components/MonthlyUsageChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MONTH_LABELS } from '../utils/utilityData';
import type { BuildingUtilityData } from '../utils/utilityData';

interface Props {
  building: BuildingUtilityData;
  title?: string;
}

export default function MonthlyUsageChart({ building, title }: Props) {
  const data = MONTH_LABELS.map((label, index) => ({
    name: label,
    usage: Object.values(building.monthlyUsage)[index],
  }));

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>
        {title || 'Monthly Usage Pattern'}
      </h3>
      
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis dataKey="name" stroke="#999999" />
            <YAxis 
              stroke="#999999"
              tickFormatter={(value) => {
                if (value >= 1000000) return `${value / 1000000}M`;
                if (value >= 1000) return `${value / 1000}K`;
                return value.toString();
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E1E1E',
                border: '1px solid #333333',
                color: '#E0E0E0',
              }}
              formatter={(value: number) => [
                value.toLocaleString() + ' ' + building.unit, 
                'Usage'
              ]}
            />
            <Bar dataKey="usage" fill="#F74902" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}