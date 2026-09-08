// src/components/SeasonalBreakdown.tsx
import type { BuildingUtilityData } from '../utils/utilityData';
import { calculateCO2, formatCO2 } from '../utils/utilityData';

interface Props {
  building: BuildingUtilityData;
}

export default function SeasonalBreakdown({ building }: Props) {
  const seasons = [
    { name: 'Summer', value: building.seasonal.summer },
    { name: 'Fall', value: building.seasonal.fall },
    { name: 'Winter', value: building.seasonal.winter },
    { name: 'Spring', value: building.seasonal.spring },
  ];

  const maxValue = Math.max(...seasons.map(s => s.value));

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        Seasonal Breakdown
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {seasons.map((season) => {
          const percentage = maxValue > 0 ? (season.value / maxValue) * 100 : 0;
          const co2 = calculateCO2(season.value, building.utilityType);
          
          return (
            <div 
              key={season.name}
              style={{
                padding: '1rem',
                backgroundColor: '#1E1E1E',
                borderRadius: '6px',
                border: '1px solid #333333',
                textAlign: 'center',
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                {season.name}
              </h4>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                margin: '0.5rem 0',
              }}>
                {season.value >= 1000000 
                  ? `${(season.value / 1000000).toFixed(2)}M`
                  : season.value >= 1000 
                    ? `${(season.value / 1000).toFixed(2)}K`
                    : season.value.toFixed(0)
                }
              </p>
              <p style={{ color: '#999999', fontSize: '0.85rem', margin: '0.25rem 0' }}>
                {building.unit}
              </p>
              <p style={{ color: '#999999', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>
                CO₂: {formatCO2(co2)}
              </p>
              
              <div style={{
                marginTop: '0.75rem',
                height: '6px',
                backgroundColor: '#333333',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: '#F74902',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}