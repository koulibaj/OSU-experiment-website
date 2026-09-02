import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { EnergySource } from '../types/energy';

interface Props {
  data: Record<EnergySource, number>;
}

const COLORS = {
  coal: '#666666',
  ng: '#FF8042',
  solar: '#FFD700',
  wind: '#87CEEB',
  hydro: '#4169E1',
};

export default function SourceBreakdownChart({ data }: Props) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.toUpperCase(),
    value: Number(value.toFixed(1)),
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as EnergySource]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}