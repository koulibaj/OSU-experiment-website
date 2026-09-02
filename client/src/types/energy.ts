// src/types/energy.ts

export type EnergySource = 'coal' | 'ng' | 'solar' | 'wind' | 'hydro';
export type PowerProvider = 'campus_grid' | 'pacific_power';

export interface HourlyEnergyData {
  month: number;
  time: number;
  coal: number;
  ng: number;
  solar: number;
  wind: number;
  hydro: number;
}

export interface EnergyProfile {
  id: string;
  name: string;
  month: number;
  hourlyData: HourlyEnergyData[];
  sourceBreakdown: Record<EnergySource, number>;
  co2Factors: Record<EnergySource, number>;
}

export interface BuildingInfo {
  id: string;
  name: string;
  location: string;
  powerProvider: PowerProvider;
  peakLoadKW: number;
  currentConsumption: number; // kWh
  primarySource: EnergySource;
  co2Factor: number; // grams/kWh for this building's power mix
  activeHours: { start: number; end: number }; // 24-hour format
}

export interface BuildingLog {
  id: string;
  buildingId: string;
  buildingName: string;
  timestamp: Date;
  durationHours: number;
  totalKwh: number;
  sourceUsed: EnergySource;
  provider: PowerProvider;
  co2Saved?: number;
  userId?: string;
}

export interface Co2Factors {
  coal: 820;
  ng: 490;
  solar: 40;
  wind: 11;
  hydro: 12;
}

// CO2 factors by provider (grams per kWh)
export const PROVIDER_CO2_FACTORS: Record<PowerProvider, number> = {
  campus_grid: 350, // Average of OSU renewable mix
  pacific_power: 680, // Pacific Power's typical coal/gas mix
};