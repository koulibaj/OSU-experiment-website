import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HourlyEnergyData } from '../types/energy';

interface Props {
  hourlyData: HourlyEnergyData[];
}

export default function HourlyConsumptionChart({ hourlyData }: Props) {
  const chartData = hourlyData.map(row => ({
    hour: `${row.time}:00`,
    coal: row.coal * 100,
    ng: row.ng * 100,
    solar: row.solar * 100,
    wind: row.wind * 100,
    hydro: row.hydro * 100,
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3>Hourly Energy Source Mix (%)</h3>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="coal" stroke="#666666" strokeWidth={2} />
          <Line type="monotone" dataKey="ng" stroke="#FF8042" strokeWidth={2} />
          <Line type="monotone" dataKey="solar" stroke="#FFD700" strokeWidth={2} />
          <Line type="monotone" dataKey="wind" stroke="#87CEEB" strokeWidth={2} />
          <Line type="monotone" dataKey="hydro" stroke="#4169E1" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}