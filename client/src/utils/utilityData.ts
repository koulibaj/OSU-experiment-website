// src/utils/utilityData.ts

export type UtilityType = 'electricity' | 'naturalGas' | 'steam';

export interface BuildingUtilityData {
  meterId: string;
  description: string;
  buildingName: string;
  buildingCode: string;
  monthlyUsage: {
    'Jul-25': number;
    'Aug-25': number;
    'Sep-25': number;
    'Oct-25': number;
    'Nov-25': number;
    'Dec-25': number;
    'Jan-26': number;
    'Feb-26': number;
    'Mar-26': number;
    'Apr-26': number;
    'May-26': number;
    'Jun-26': number;
  };
  seasonal: {
    summer: number;
    fall: number;
    winter: number;
    spring: number;
  };
  annual: number;
  unit: string;
  utilityType: UtilityType;
}

export interface CampusAggregate {
  totalAnnual: number;
  totalSummer: number;
  totalFall: number;
  totalWinter: number;
  totalSpring: number;
  buildingCount: number;
  topConsumers: BuildingUtilityData[];
  unit: string;
}

export const MONTH_LABELS = [
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'
];

export const UTILITY_LABELS: Record<UtilityType, string> = {
  electricity: 'Electricity',
  naturalGas: 'Natural Gas',
  steam: 'Steam',
};

export const UTILITY_UNITS: Record<UtilityType, string> = {
  electricity: 'KWH',
  naturalGas: 'Therms',
  steam: 'lbs',
};

export const UTILITY_FILES: Record<UtilityType, string> = {
  electricity: '/Utilities per meter FY25 & FY26(Electricity FY26).csv',
  naturalGas: '/Utilities per meter FY25 & FY26(Natural Gas FY26).csv',
  steam: '/Utilities per meter FY25 & FY26(Steam FY26).csv',
};

// CO₂ emission factors (kg CO₂ per unit)
// Source: EPA eGRID 2022, EIA
export const CO2_FACTORS: Record<UtilityType, number> = {
  electricity: 0.386, // kg CO₂ per KWH (Oregon grid mix)
  naturalGas: 5.3,    // kg CO₂ per therm
  steam: 0.052,       // kg CO₂ per lb of steam
};

// Format large numbers with K/M/B suffixes
export function formatNumber(num: number, unit: string): string {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B ${unit}`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M ${unit}`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K ${unit}`;
  }
  return `${num.toFixed(0)} ${unit}`;
}

// Calculate CO₂ emissions from usage
export function calculateCO2(usage: number, utilityType: UtilityType): number {
  return usage * CO2_FACTORS[utilityType];
}

// Format CO₂ in metric tons or kg
export function formatCO2(kg: number): string {
  if (kg >= 1000000) {
    return `${(kg / 1000000).toFixed(2)} metric tons`;
  }
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} metric tons`;
  }
  return `${kg.toFixed(0)} kg`;
}

// Clean quoted CSV values
function cleanValue(str: string): string {
  return str.replace(/^"|"$/g, '').trim();
}

// Parse numbers with commas (e.g., "445,200" → 445200)
function parseNumber(str: string): number {
  if (!str) return 0;
  const cleaned = cleanValue(str).replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Parse CSV line handling quoted values with commas
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char; // Keep the quotes, we'll remove them later
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

// Parse CSV text into BuildingUtilityData array
function parseCSV(csvText: string, utilityType: UtilityType, unit: string): BuildingUtilityData[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const buildings: BuildingUtilityData[] = [];

  // Find the header row (contains "meter" and "building")
  let dataStartIndex = 0;
  let hasBuildingCodes = false;
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('meter') && line.includes('building')) {
      dataStartIndex = i + 1;
      // Check if this format includes building codes (e.g., "0079 - Building Name")
      // Steam files don't have codes, just names
      hasBuildingCodes = utilityType !== 'steam';
      break;
    }
  }

  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);

      if (values.length < 19) continue;

      const meterId = cleanValue(values[0]);
      const description = cleanValue(values[1]);
      
      let buildingCode = '';
      let buildingName = '';
      
      if (hasBuildingCodes) {
        // Electricity/Natural Gas format: "0079 - Agricultural & Life Sciences Building"
        const buildingFull = cleanValue(values[2]);
        const buildingParts = buildingFull.split(' - ');
        buildingCode = buildingParts[0]?.trim() || '';
        buildingName = buildingParts.slice(1).join(' - ').trim() || buildingFull;
      } else {
        // Steam format: "Ag Life Science" (name only in column 1)
        buildingCode = meterId.split('-')[0] || ''; // Extract from meter ID (e.g., "079" from "079-000-S")
        buildingName = description || 'Unknown Building';
      }

      // Skip if no building name or if it's a total/empty row
      if (!buildingName || buildingName === 'Total' || buildingName === 'Unknown Building') continue;

      // Determine column offsets based on CSV format
      const monthlyOffset = hasBuildingCodes ? 3 : 2;
      
      const monthlyUsage = {
        'Jul-25': parseNumber(values[monthlyOffset]),
        'Aug-25': parseNumber(values[monthlyOffset + 1]),
        'Sep-25': parseNumber(values[monthlyOffset + 2]),
        'Oct-25': parseNumber(values[monthlyOffset + 3]),
        'Nov-25': parseNumber(values[monthlyOffset + 4]),
        'Dec-25': parseNumber(values[monthlyOffset + 5]),
        'Jan-26': parseNumber(values[monthlyOffset + 6]),
        'Feb-26': parseNumber(values[monthlyOffset + 7]),
        'Mar-26': parseNumber(values[monthlyOffset + 8]),
        'Apr-26': parseNumber(values[monthlyOffset + 9]),
        'May-26': parseNumber(values[monthlyOffset + 10]),
        'Jun-26': parseNumber(values[monthlyOffset + 11]),
      };

      const seasonalOffset = monthlyOffset + 12;
      const seasonal = {
        summer: parseNumber(values[seasonalOffset]),
        fall: parseNumber(values[seasonalOffset + 1]),
        winter: parseNumber(values[seasonalOffset + 2]),
        spring: parseNumber(values[seasonalOffset + 3]),
      };

      const annualIndex = seasonalOffset + 4;
      const annual = parseNumber(values[annualIndex]) || 
                     Object.values(monthlyUsage).reduce((a, b) => a + b, 0);

      buildings.push({
        meterId,
        description: hasBuildingCodes ? description : '',
        buildingName,
        buildingCode,
        monthlyUsage,
        seasonal,
        annual,
        unit,
        utilityType,
      });
    } catch (err) {
      console.warn(`Failed to parse line ${i}:`, line.substring(0, 100), err);
    }
  }

  return buildings;
}

// Load utility data from CSV file
export async function loadUtilityData(utilityType: UtilityType): Promise<BuildingUtilityData[]> {
  const csvUrl = UTILITY_FILES[utilityType];
  const unit = UTILITY_UNITS[utilityType];

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${csvUrl}: ${response.statusText}`);
    }

    const csvText = await response.text();
    const buildings = parseCSV(csvText, utilityType, unit);

    console.log(`Loaded ${buildings.length} buildings from ${utilityType} CSV`);
    return buildings;
  } catch (error) {
    console.error(`Error loading ${utilityType} data:`, error);
    throw error;
  }
}

// Aggregate campus-wide data from all buildings
export function aggregateCampusData(buildings: BuildingUtilityData[]): CampusAggregate {
  const totalAnnual = buildings.reduce((sum, b) => sum + b.annual, 0);
  const totalSummer = buildings.reduce((sum, b) => sum + b.seasonal.summer, 0);
  const totalFall = buildings.reduce((sum, b) => sum + b.seasonal.fall, 0);
  const totalWinter = buildings.reduce((sum, b) => sum + b.seasonal.winter, 0);
  const totalSpring = buildings.reduce((sum, b) => sum + b.seasonal.spring, 0);

  const topConsumers = [...buildings]
    .sort((a, b) => b.annual - a.annual)
    .slice(0, 10);

  return {
    totalAnnual,
    totalSummer,
    totalFall,
    totalWinter,
    totalSpring,
    buildingCount: buildings.length,
    topConsumers,
    unit: buildings[0]?.unit || 'units',
  };
}