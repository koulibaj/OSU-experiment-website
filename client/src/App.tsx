// src/App.tsx
import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import UtilitySelector from './components/UtilitySelector';
import BuildingSelector from './components/BuildingSelector';
import CampusOverview from './components/CampusOverview';
import MonthlyUsageChart from './components/MonthlyUsageChart';
import SeasonalBreakdown from './components/SeasonalBreakdown';
import type { UtilityType, BuildingUtilityData, CampusAggregate } from './utils/utilityData';
import { loadUtilityData, aggregateCampusData, UTILITY_LABELS } from './utils/utilityData';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [utilityType, setUtilityType] = useState<UtilityType>('electricity');
  const [buildingData, setBuildingData] = useState<BuildingUtilityData[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingUtilityData | null>(null);
  const [campusAggregate, setCampusAggregate] = useState<CampusAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load utility data when utility type changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    loadUtilityData(utilityType)
      .then(data => {
        if (data.length > 0) {
          setBuildingData(data);
          const aggregate = aggregateCampusData(data);
          setCampusAggregate(aggregate);
          setSelectedBuilding(null);
        } else {
          setError(`No data found for ${utilityType}.`);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(`Failed to load ${utilityType} data. Check console.`);
        setLoading(false);
      });
  }, [utilityType]);

  // Page content renderer
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <>
            <section id="dashboard">
              <h2 style={{ marginBottom: '1.5rem' }}>Campus Utilities Dashboard - FY26</h2>
              <p style={{ color: '#999999', marginBottom: '2rem' }}>
                Real-time utility consumption data across Oregon State University campus buildings
              </p>
              
              <UtilitySelector utilityType={utilityType} onSelect={setUtilityType} />

              {loading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#F74902', fontSize: '1.2rem' }}>
                  Loading {UTILITY_LABELS[utilityType]} data...
                </div>
              )}

              {error && (
                <div style={{ 
                  padding: '2rem', 
                  backgroundColor: '#1E1E1E',
                  border: '2px solid #ff4444',
                  borderRadius: '8px',
                  color: '#ff4444',
                  marginBottom: '2rem',
                }}>
                  <h3>Error Loading Data</h3>
                  <p>{error}</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                    Check the Console (F12) for details.
                  </p>
                </div>
              )}

              {!loading && !error && campusAggregate && (
                <>
                  <CampusOverview aggregate={campusAggregate} utilityType={utilityType} />

                  <div style={{ marginBottom: '2rem' }}>
                    <BuildingSelector
                      buildings={buildingData}
                      selectedBuilding={selectedBuilding}
                      onSelect={setSelectedBuilding}
                    />
                  </div>

                  {selectedBuilding ? (
                    <div className="analytics-grid" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
                      gap: '20px',
                    }}>
                      <MonthlyUsageChart 
                        building={selectedBuilding} 
                        title={`${selectedBuilding.buildingName} - Monthly Usage`}
                      />
                      <SeasonalBreakdown building={selectedBuilding} />
                    </div>
                  ) : (
                    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                      <p style={{ color: '#999999', fontSize: '1.1rem' }}>
                        Select a building above to view detailed usage patterns
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        );

      case 'buildings':
        return (
          <section id="buildings-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Building Directory</h2>
            <p style={{ color: '#999999', marginBottom: '2rem' }}>
              Complete list of all campus buildings with {UTILITY_LABELS[utilityType]} meters
            </p>
            
            <UtilitySelector utilityType={utilityType} onSelect={setUtilityType} />

            {!loading && !error && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem', color: '#999999' }}>
                  Showing {buildingData.length} buildings/meters
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #F74902' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Building</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Code</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Meter ID</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Annual Usage</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>CO₂ Emissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...buildingData]
                      .sort((a, b) => a.buildingName.localeCompare(b.buildingName))
                      .map((building) => (
                        <tr key={building.meterId} style={{ borderBottom: '1px solid #333333' }}>
                          <td style={{ padding: '12px' }}>{building.buildingName}</td>
                          <td style={{ padding: '12px', color: '#999999' }}>{building.buildingCode}</td>
                          <td style={{ padding: '12px', color: '#999999', fontSize: '0.85rem' }}>{building.meterId}</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#F74902' }}>
                            {building.annual >= 1000000
                              ? `${(building.annual / 1000000).toFixed(2)}M ${building.unit}`
                              : building.annual >= 1000
                                ? `${(building.annual / 1000).toFixed(2)}K ${building.unit}`
                                : `${building.annual.toFixed(0)} ${building.unit}`
                            }
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#999999' }}>
                            {formatCO2Inline(building.annual, building.utilityType)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );

      case 'co2-tracker':
        return (
          <section id="co2-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>CO₂ Emissions Tracker</h2>
            <p style={{ color: '#999999', marginBottom: '2rem' }}>
              Campus-wide carbon footprint based on actual utility consumption
            </p>

            <UtilitySelector utilityType={utilityType} onSelect={setUtilityType} />

            {!loading && !error && campusAggregate && (
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '2rem' }}>
                  <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1E1E1E', borderRadius: '6px' }}>
                    <h3 style={{ color: '#999999', marginBottom: '0.5rem', fontSize: '1rem' }}>Total Annual CO₂</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F74902', margin: '0.5rem 0' }}>
                      {formatCO2Display(calculateCO2Total(campusAggregate.totalAnnual, utilityType))}
                    </p>
                    <p style={{ color: '#999999', fontSize: '0.9rem' }}>metric tons</p>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1E1E1E', borderRadius: '6px' }}>
                    <h3 style={{ color: '#999999', marginBottom: '0.5rem', fontSize: '1rem' }}>Per Building Average</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F74902', margin: '0.5rem 0' }}>
                      {formatCO2Display(calculateCO2Total(
                        campusAggregate.totalAnnual / campusAggregate.buildingCount, 
                        utilityType
                      ))}
                    </p>
                    <p style={{ color: '#999999', fontSize: '0.9rem' }}>metric tons</p>
                  </div>

                  <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1E1E1E', borderRadius: '6px' }}>
                    <h3 style={{ color: '#999999', marginBottom: '0.5rem', fontSize: '1rem' }}>Buildings Tracked</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F74902', margin: '0.5rem 0' }}>
                      {campusAggregate.buildingCount}
                    </p>
                    <p style={{ color: '#999999', fontSize: '0.9rem' }}>meters</p>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: '#1E1E1E', borderRadius: '6px' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Emission Factors Used</h4>
                  <ul style={{ color: '#999999', lineHeight: '2', margin: 0, paddingLeft: '1.5rem' }}>
                    <li><strong>Electricity:</strong> 0.386 kg CO₂ per KWH (Oregon grid mix)</li>
                    <li><strong>Natural Gas:</strong> 5.3 kg CO₂ per therm</li>
                    <li><strong>Steam:</strong> 0.052 kg CO₂ per pound</li>
                  </ul>
                  <p style={{ color: '#999999', fontSize: '0.85rem', marginTop: '1rem', marginBottom: 0 }}>
                    Sources: EPA eGRID 2022, EIA
                  </p>
                </div>
              </div>
            )}
          </section>
        );

      case 'analytics':
  return (
    <section id="analytics-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Advanced Analytics</h2>
      <p style={{ color: '#999999', marginBottom: '2rem' }}>
        Detailed utility consumption analytics and comparisons
      </p>

      <UtilitySelector utilityType={utilityType} onSelect={setUtilityType} />

      {!loading && !error && campusAggregate && (
        <>
          {/* Top 20 Consumers */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Top 20 Energy Consumers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
              {campusAggregate.topConsumers.map((building, idx) => (
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
                    <span style={{ fontWeight: 'bold', color: '#F74902', marginRight: '10px' }}>
                      #{idx + 1}
                    </span>
                    <span>{building.buildingName}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {building.annual >= 1000000
                      ? `${(building.annual / 1000000).toFixed(2)}M`
                      : building.annual >= 1000
                        ? `${(building.annual / 1000).toFixed(2)}K`
                        : building.annual.toFixed(0)
                    } {building.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal Comparison */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Campus-Wide Seasonal Comparison</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {[
                { name: 'Summer', value: campusAggregate.totalSummer, color: '#F74902' },
                { name: 'Fall', value: campusAggregate.totalFall, color: '#E67E22' },
                { name: 'Winter', value: campusAggregate.totalWinter, color: '#3498DB' },
                { name: 'Spring', value: campusAggregate.totalSpring, color: '#2ECC71' },
              ].map((season) => {
                const maxValue = Math.max(
                  campusAggregate.totalSummer,
                  campusAggregate.totalFall,
                  campusAggregate.totalWinter,
                  campusAggregate.totalSpring
                );
                const percentage = maxValue > 0 ? (season.value / maxValue) * 100 : 0;
                
                return (
                  <div key={season.name} style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <h4 style={{ color: season.color, marginBottom: '0.5rem' }}>{season.name}</h4>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                      {season.value >= 1000000
                        ? `${(season.value / 1000000).toFixed(2)}M`
                        : season.value >= 1000
                          ? `${(season.value / 1000).toFixed(2)}K`
                          : season.value.toFixed(0)
                      }
                    </p>
                    <p style={{ color: '#999999', fontSize: '0.85rem' }}>{campusAggregate.unit}</p>
                    <div style={{
                      marginTop: '1rem',
                      height: '8px',
                      backgroundColor: '#333333',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: season.color,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Utility Comparison */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Quick Utility Comparison</h3>
            <p style={{ color: '#999999', marginBottom: '1.5rem' }}>
              Switch between utility types to compare consumption patterns
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {(['electricity', 'naturalGas', 'steam'] as UtilityType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setUtilityType(type)}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: utilityType === type ? '#F74902' : '#1E1E1E',
                    color: utilityType === type ? '#FFFFFF' : '#E0E0E0',
                    border: `2px solid ${utilityType === type ? '#F74902' : '#333333'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {UTILITY_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );

      case 'settings':
        return (
          <section id="settings-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Settings</h2>
            <p style={{ color: '#999999', marginBottom: '2rem' }}>
              Configure your dashboard preferences
            </p>
            <div className="card" style={{ padding: '2rem' }}>
              <p style={{ color: '#999999' }}>Settings options coming soon...</p>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading && buildingData.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontSize: '20px', 
        color: '#F74902' 
      }}>
        Loading Utility Data...
      </div>
    );
  }

  // Error state
  if (error && buildingData.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        flexDirection: 'column', 
        color: '#ff4444',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h2>Error Loading App</h2>
        <p>{error}</p>
        <p style={{ fontSize: '0.9rem', color: '#999999', marginTop: '1rem' }}>
          Check the Console (F12) for details.
        </p>
      </div>
    );
  }

  // Main render
  return (
    <>
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {renderPageContent()}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#1E1E1E',
        borderTop: '1px solid #333333',
        marginTop: '3rem',
      }}>
        <p style={{ color: '#F74902', margin: 0 }}>Oregon State University © 2026</p>
        <p style={{ color: '#999999', margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
          Campus Utilities Tracking System
        </p>
      </footer>
    </>
  );
}

// Helper functions for CO2 formatting
function calculateCO2Total(usage: number, utilityType: UtilityType): number {
  const factors: Record<UtilityType, number> = {
    electricity: 0.386,
    naturalGas: 5.3,
    steam: 0.052,
  };
  return usage * factors[utilityType];
}

function formatCO2Display(kg: number): string {
  if (kg >= 1000000) {
    return `${(kg / 1000000).toFixed(2)}K`;
  }
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)}`;
  }
  return kg.toFixed(0);
}

function formatCO2Inline(usage: number, utilityType: UtilityType): string {
  const co2 = calculateCO2Total(usage, utilityType);
  if (co2 >= 1000000) {
    return `${(co2 / 1000000).toFixed(2)} metric tons`;
  }
  if (co2 >= 1000) {
    return `${(co2 / 1000).toFixed(2)} metric tons`;
  }
  return `${co2.toFixed(0)} kg`;
}

export default App;