import type { BuildingInfo, PowerProvider, EnergySource } from '../types/energy';

const BUILDING_CO2_FACTORS: Record<EnergySource, number> = {
  coal: 820,
  ng: 490,
  solar: 40,
  wind: 11,
  hydro: 12,
};

const PROVIDER_COLORS: Record<PowerProvider, string> = {
  campus_grid: '#4CAF50', // Green for cleaner campus grid
  pacific_power: '#FF8042', // Orange-red for Pacific Power
};

interface Props {
  buildings: BuildingInfo[];
  onEditBuilding: (building: BuildingInfo) => void;
}

export default function BuildingList({ buildings, onEditBuilding }: Props) {
  const toggleProvider = (building: BuildingInfo) => {
    const newProvider: PowerProvider = building.powerProvider === 'campus_grid' 
      ? 'pacific_power' 
      : 'campus_grid';
    onEditBuilding({ ...building, powerProvider: newProvider });
  };

  const getProviderBadge = (provider: PowerProvider) => (
    <span style={{
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      backgroundColor: PROVIDER_COLORS[provider],
      color: '#FFFFFF',
      fontSize: '0.8rem',
      fontWeight: 'bold',
    }}>
      {provider === 'campus_grid' ? ' Campus Grid' : ' Pacific Power'}
    </span>
  );

  return (
    <div>
      <h2 style={{ color: '#F74902', marginBottom: '1.5rem' }}>
        Campus Buildings
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {buildings.map((building) => (
          <div key={building.id} style={{
            padding: '1.5rem',
            border: '2px solid #333333',
            borderRadius: '8px',
            backgroundColor: '#121212',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.3rem' }}>
                  {building.name}
                </h3>
                <p style={{ margin: '0.25rem 0', color: '#CCCCCC', fontSize: '0.9rem' }}>
                  {building.location}
                </p>
              </div>
              {getProviderBadge(building.powerProvider)}
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #333333',
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Primary Source</p>
                <p style={{ margin: 0.5, color: '#F74902', fontWeight: 'bold' }}>
                  {building.primarySource.toUpperCase()}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Peak Load</p>
                <p style={{ margin: 0, color: '#FFFFFF' }}>{building.peakLoadKW} kW</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Current Usage</p>
                <p style={{ margin: 0, color: '#FFFFFF' }}>{building.currentConsumption} kWh</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Operating Hours</p>
                <p style={{ margin: 0, color: '#FFFFFF' }}>
                  {building.activeHours.start.toString().padStart(2, '0')}:00 - {building.activeHours.end.toString().padStart(2, '0')}:00
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#999999' }}>CO₂ Factor</p>
              <p style={{ margin: 0, color: '#CCCCCC' }}>
                {BUILDING_CO2_FACTORS[building.primarySource]} g/kWh
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => toggleProvider(building)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: building.powerProvider === 'campus_grid' ? '#FF8042' : '#4CAF50',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Switch Provider
              </button>
              <button
                onClick={() => onEditBuilding(building)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#333333',
                  color: '#FFFFFF',
                  border: '2px solid #F74902',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div style={{
        backgroundColor: '#121212',
        border: '2px solid #F74902',
        borderRadius: '8px',
        padding: '1.5rem',
        marginTop: '2rem',
      }}>
        <h3 style={{ color: '#F74902', marginTop: 0 }}>Building Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#999999' }}>Total Buildings</p>
            <p style={{ margin: 0, color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 'bold' }}>{buildings.length}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#999999' }}>On Campus Grid</p>
            <p style={{ margin: 0, color: '#4CAF50', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {buildings.filter(b => b.powerProvider === 'campus_grid').length}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#999999' }}>On Pacific Power</p>
            <p style={{ margin: 0, color: '#FF8042', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {buildings.filter(b => b.powerProvider === 'pacific_power').length}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#999999' }}>Total Current Usage</p>
            <p style={{ margin: 0, color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {buildings.reduce((sum, b) => sum + b.currentConsumption, 0).toLocaleString()} kWh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}