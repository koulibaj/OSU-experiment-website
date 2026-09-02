import React from 'react';
import type { HourlyEnergyData } from '../types/energy';

interface Props {
  hourlyData: HourlyEnergyData[];
}

export default function IdealUsageWindow({ hourlyData }: Props) {
  // Find hours with highest solar percentage
  const maxSolar = Math.max(...hourlyData.map(d => d.solar));
  const peakHours = hourlyData.filter(d => d.solar === maxSolar);
  const startHour = Math.min(...peakHours.map(d => d.time));
  const endHour = Math.max(...peakHours.map(d => d.time));

  // Calculate average solar during peak
  const avgSolar = peakHours.reduce((sum, d) => sum + d.solar, 0) / peakHours.length * 100;

  return (
    <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
      <h3> Ideal Usage Window</h3>
      <p><strong>Best Time:</strong> {startHour}:00 - {endHour}:00</p>
      <p><strong>Solar Contribution:</strong> {avgSolar.toFixed(1)}%</p>
      <p><strong></strong> Schedule high-energy tasks during peak solar hours to maximize renewable usage and minimize CO2 emissions.</p>
    </div>
  );
}