import type { EnergyProfile, HourlyEnergyData, EnergySource, Co2Factors } from '../types/energy';

// CO2 emission factors (grams per kWh) - EPA/industry standard estimates
export const CO2_FACTORS: Co2Factors = {
  coal: 820,
  ng: 490,
  solar: 40,
  wind: 11,
  hydro: 12,
};

// Parse the Excel data (you'll need to export as CSV first)
export function parseEnergyData(csvData: string): HourlyEnergyData[] {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      month: parseInt(values[0]),
      time: parseInt(values[1]),
      coal: parseFloat(values[2]),
      ng: parseFloat(values[3]),
      solar: parseFloat(values[4]),
      wind: parseFloat(values[5]),
      hydro: parseFloat(values[6]),
    };
  });
}

// Group data by month
export function groupByMonth(data: HourlyEnergyData[]): Map<number, HourlyEnergyData[]> {
  const map = new Map<number, HourlyEnergyData[]>();
  data.forEach(row => {
    if (!map.has(row.month)) {
      map.set(row.month, []);
    }
    map.get(row.month)!.push(row);
  });
  return map;
}

// Calculate average source breakdown for a month
export function calculateSourceBreakdown(hourlyData: HourlyEnergyData[]): Record<EnergySource, number> {
  const totals = { coal: 0, ng: 0, solar: 0, wind: 0, hydro: 0 };
  const count = hourlyData.length;
  
  hourlyData.forEach(row => {
    totals.coal += row.coal;
    totals.ng += row.ng;
    totals.solar += row.solar;
    totals.wind += row.wind;
    totals.hydro += row.hydro;
  });
  
  return {
    coal: (totals.coal / count) * 100,
    ng: (totals.ng / count) * 100,
    solar: (totals.solar / count) * 100,
    wind: (totals.wind / count) * 100,
    hydro: (totals.hydro / count) * 100,
  };
}

// Calculate average hourly consumption pattern
export function getHourlyPattern(hourlyData: HourlyEnergyData[]): number[] {
  return hourlyData.map(row => row.time); // Returns 0-23 array
}

// Find peak consumption hours
export function findPeakHours(hourlyData: HourlyEnergyData[]): number[] {
  const maxSolar = Math.max(...hourlyData.map(d => d.solar));
  return hourlyData
    .filter(d => d.solar === maxSolar)
    .map(d => d.time);
}

// Calculate CO2 emissions for a given energy mix
export function calculateCo2Emissions(kwh: number, source: EnergySource): number {
  return kwh * CO2_FACTORS[source];
}

// Calculate CO2 saved vs grid average
export function calculateCo2Saved(kwh: number, userSource: EnergySource, gridMix: Record<EnergySource, number>): number {
  const gridAvgCo2 = Object.entries(gridMix).reduce((sum, [source, pct]) => {
    return sum + (pct / 100) * CO2_FACTORS[source as EnergySource];
  }, 0);
  
  const userCo2 = CO2_FACTORS[userSource];
  const savedPerKwh = gridAvgCo2 - userCo2;
  
  return savedPerKwh > 0 ? kwh * savedPerKwh : 0;
}

// Generate profiles for all months
export function generateMonthlyProfiles(rawData: HourlyEnergyData[]): EnergyProfile[] {
  const monthMap = groupByMonth(rawData);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  const profiles: EnergyProfile[] = [];
  
  monthMap.forEach((hourlyData, month) => {
    profiles.push({
      id: `month-${month}`,
      name: `${monthNames[month - 1]} Campus Profile`,
      month,
      hourlyData,
      sourceBreakdown: calculateSourceBreakdown(hourlyData),
      co2Factors: CO2_FACTORS,
    });
  });
  
  return profiles;
}

// client/src/utils/energyData.ts

export async function loadEnergyDataFromCSV(filePath: string): Promise<HourlyEnergyData[]> {
  try {
    // filePath should be '/fake-power-source-data.csv'
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    return parseEnergyData(csvText);
  } catch (error) {
    console.error('Failed to load energy data:', error);
    // Return empty array or throw to handle in App.tsx
    return []; 
  }
}