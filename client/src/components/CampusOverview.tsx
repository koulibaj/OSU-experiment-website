// src/components/CampusOverview.tsx
import type { CampusAggregate, UtilityType } from '../utils/utilityData';
import { formatNumber, calculateCO2, formatCO2 } from '../utils/utilityData';
import { UTILITY_LABELS } from '../utils/utilityData';

interface Props {
  aggregate: CampusAggregate;
  utilityType: UtilityType;
}

export default function CampusOverview({ aggregate, utilityType }: Props) {
  const totalCO2 = calculateCO2(aggregate.totalAnnual, utilityType);

  return (
    <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>
        Campus Overview - {UTILITY_LABELS[utilityType]} (FY26)
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '2rem',
      }}>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <h3 style={{ 
            color: '#F74902', 
            fontSize: '2rem', 
            margin: '0 0 0.5rem 0',
          }}>
            {formatNumber(aggregate.totalAnnual, aggregate.unit)}
          </h3>
          <p style={{ color: '#999999', fontSize: '0.9rem' }}>
            Total Annual Usage
          </p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <h3 style={{ 
            color: '#F74902', 
            fontSize: '2rem', 
            margin: '0 0 0.5rem 0',
          }}>
            {formatNumber(aggregate.totalWinter, aggregate.unit)}
          </h3>
          <p style={{ color: '#999999', fontSize: '0.9rem' }}>
            Winter Peak
          </p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <h3 style={{ 
            color: '#F74902', 
            fontSize: '2rem', 
            margin: '0 0 0.5rem 0',
          }}>
            {aggregate.buildingCount}
          </h3>
          <p style={{ color: '#999999', fontSize: '0.9rem' }}>
            Buildings/Meters
          </p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <h3 style={{ 
            color: '#F74902', 
            fontSize: '1.5rem', 
            margin: '0 0 0.5rem 0',
          }}>
            {formatCO2(totalCO2)}
          </h3>
          <p style={{ color: '#999999', fontSize: '0.9rem' }}>
            Annual CO₂ Emissions
          </p>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Top 10 Consumers</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '10px',
      }}>
        {aggregate.topConsumers.map((building, idx) => (
          <div 
            key={building.meterId} 
            style={{ 
              padding: '12px',
              backgroundColor: '#1E1E1E',
              borderRadius: '6px',
              border: '1px solid #333333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ 
                fontWeight: 'bold', 
                color: '#F74902',
                marginRight: '10px',
              }}>
                #{idx + 1}
              </span>
              <span>{building.buildingName}</span>
            </div>
            <span style={{ 
              fontWeight: 'bold',
              fontSize: '0.9rem',
            }}>
              {formatNumber(building.annual, building.unit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}