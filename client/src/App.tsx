import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EnergyProfileSelector from './components/EnergyProfileSelector';
import SourceBreakdownChart from './components/SourceBreakdownChart';
import HourlyConsumptionChart from './components/HourlyConsumptionChart';
import IdealUsageWindow from './components/IdealUsageWindow';
import BuildingList from './components/BuildingList';
import CO2TrackerPage from './components/CO2TrackerPage';
import type { EnergyProfile, BuildingLog, BuildingInfo } from './types/energy';
import { generateMonthlyProfiles, loadEnergyDataFromCSV } from './utils/energyData';

// Mock building data
const INITIAL_BUILDINGS: BuildingInfo[] = [
  {
    id: 'KEC',
    name: 'Kelley Engineering Center',
    location: 'Corvallis, OR - North Campus',
    powerProvider: 'campus_grid',
    peakLoadKW: 2500,
    currentConsumption: 18500,
    primarySource: 'solar',
    co2Factor: 40,
    activeHours: { start: 6, end: 22 },
  },
  {
    id: 'MU',
    name: 'Memorial Union',
    location: 'Corvallis, OR - Central Campus',
    powerProvider: 'pacific_power',
    peakLoadKW: 1800,
    currentConsumption: 12300,
    primarySource: 'ng',
    co2Factor: 490,
    activeHours: { start: 7, end: 24 },
  },
  {
    id: 'VL',
    name: 'Valley Library',
    location: 'Corvallis, OR - Central Campus',
    powerProvider: 'campus_grid',
    peakLoadKW: 1200,
    currentConsumption: 9500,
    primarySource: 'wind',
    co2Factor: 11,
    activeHours: { start: 6, end: 2 }, // 2 AM
  },
  {
    id: 'LPSC',
    name: 'Linus Pauling Science Center',
    location: 'Corvallis, OR - LPSC Building',
    powerProvider: 'pacific_power',
    peakLoadKW: 950,
    currentConsumption: 7200,
    primarySource: 'coal',
    co2Factor: 820,
    activeHours: { start: 7, end: 20 },
  },
  {
    id: 'ARC',
    name: 'Agriculture Research Center',
    location: 'Eastern Oregon, OR - Burns',
    powerProvider: 'campus_grid',
    peakLoadKW: 1500,
    currentConsumption: 11000,
    primarySource: 'hydro',
    co2Factor: 12,
    activeHours: { start: 5, end: 21 },
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [profiles, setProfiles] = useState<EnergyProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<EnergyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buildings, setBuildings] = useState<BuildingInfo[]>(INITIAL_BUILDINGS);
  const [logs, setLogs] = useState<BuildingLog[]>([
    { id: "1", buildingId: "1", buildingName: "Kelley Engineering", timestamp: new Date(), durationHours: 8, totalKwh: 1200, sourceUsed: 'solar', provider: 'campus_grid', co2Saved: 4000 },
    { id: "2", buildingId: "2", buildingName: "Memorial Union", timestamp: new Date(), durationHours: 10, totalKwh: 800, sourceUsed: 'ng', provider: 'pacific_power', co2Saved: 0 },
  ]);

  useEffect(() => {
    loadEnergyDataFromCSV('/fake-power-source-data.csv')
      .then(data => {
        if (data.length > 0) {
          const generatedProfiles = generateMonthlyProfiles(data);
          setProfiles(generatedProfiles);
          setSelectedProfile(generatedProfiles[0]);
        } else {
          setError("No data found in CSV.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load energy data. Check console.");
        setLoading(false);
      });
  }, []);

  const handleEditBuilding = (updatedBuilding: BuildingInfo) => {
    setBuildings(prev => prev.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
  };

  const handleAddLog = (newLog: BuildingLog) => {
    setLogs(prev => [...prev, newLog]);
  };

  // Page content renderer
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <>
            <section id="energy-dashboard">
              <h2> Energy Portfolio & Analytics</h2>
              
              {profiles.length > 0 && selectedProfile && (
                <div className="profile-controls">
                  <EnergyProfileSelector 
                    profiles={profiles} 
                    selectedProfile={selectedProfile}
                    onSelect={setSelectedProfile} 
                  />
                </div>
              )}

              <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                {selectedProfile && (
                  <>
                    <div className="card" style={{ padding: '20px', border: '1px solid #333333', borderRadius: '8px' }}>
                      <h3>Energy Source Mix</h3>
                      <SourceBreakdownChart data={selectedProfile.sourceBreakdown} />
                      <p><strong>Renewable Estimate:</strong> {(selectedProfile.sourceBreakdown.solar + selectedProfile.sourceBreakdown.wind + selectedProfile.sourceBreakdown.hydro).toFixed(1)}%</p>
                    </div>

                    <div className="card" style={{ padding: '20px', border: '1px solid #333333', borderRadius: '8px' }}>
                      <HourlyConsumptionChart hourlyData={selectedProfile.hourlyData} />
                      <IdealUsageWindow hourlyData={selectedProfile.hourlyData} />
                    </div>
                  </>
                )}
              </div>
            </section>
          </>
        );

      case 'buildings':
        return (
          <section id="buildings-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <BuildingList buildings={buildings} onEditBuilding={handleEditBuilding} />
          </section>
        );

      case 'co2-tracker':
        return (
          <section id="co2-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <CO2TrackerPage 
              logs={logs} 
              buildings={buildings} 
              onAddLog={handleAddLog} 
            />
          </section>
        );

      case 'analytics':
        return (
          <section id="analytics-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <h2 style={{ color: '#F74902' }}> Advanced Analytics</h2>
            <p style={{ color: '#CCCCCC' }}>Detailed energy analytics coming soon</p>
          </section>
        );

      case 'settings':
        return (
          <section id="settings-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <h2 style={{ color: '#F74902' }}> Settings</h2>
            <p style={{ color: '#CCCCCC' }}>Configure your dashboard preferences...</p>
          </section>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px', backgroundColor: '#000000', color: '#F74902' }}>
        Loading Energy Data...
      </div>
    );
  }

  // Error state
  if (error || !selectedProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: 'red', backgroundColor: '#000000' }}>
        <h2>Error Loading App</h2>
        <p>{error || "No profile selected."}</p>
        <p>Check the Console (F12) for details.</p>
        <p>Make sure <code>public/fake-power-source-data.csv</code> exists.</p>
      </div>
    );
  }

  // Main render
  return (
    <>
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {currentPage === 'dashboard' && (
          <section id="center">
            <Hero />
            
          </section>
        )}

        {renderPageContent()}
      </main>

      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        backgroundColor: '#000000', 
        borderTop: '1px solid #333333',
        marginTop: '3rem',
      }}>
        <p style={{ color: '#F74902', margin: 0 }}>Oregon State University © 2026</p>
        <p style={{ color: '#666666', margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>Campus Energy Tracking System</p>
      </footer>
    </>
  );
}

export default App;