import { useState } from 'react';
import type { BuildingLog, EnergySource, BuildingInfo } from '../types/energy';
import { calculateCo2Emissions, calculateCo2Saved, CO2_FACTORS } from '../utils/energyData';
import { PROVIDER_CO2_FACTORS } from '../types/energy'; // <-- Added this import

interface Props {
  logs: BuildingLog[];
  buildings: BuildingInfo[];
  onAddLog: (log: BuildingLog) => void;
}

export default function CO2TrackerPage({ logs, buildings, onAddLog }: Props) {
  const [buildingName, setBuildingName] = useState('');
  const [duration, setDuration] = useState('');
  const [kwh, setKwh] = useState('');
  const [source, setSource] = useState<EnergySource>('coal');
  const [provider, setProvider] = useState<'campus_grid' | 'pacific_power'>('campus_grid');

  // Calculate totals
  const totalCo2Saved = logs.reduce((sum, log) => sum + (log.co2Saved || 0), 0);
  const totalKwh = logs.reduce((sum, log) => sum + log.totalKwh, 0);
  const totalCo2Emitted = logs.reduce((sum, log) => {
    return sum + calculateCo2Emissions(log.totalKwh, log.sourceUsed);
  }, 0);

  // Group logs by building
  const logsByBuilding = buildings.map(b => ({
    building: b,
    buildingLogs: logs.filter(l => l.buildingId === b.id),
  }));

  const handleAddLog = () => {
    if (!buildingName || !duration || !kwh) return;

    const newLog: BuildingLog = {
      id: Date.now().toString(),
      buildingId: buildingName,
      buildingName,
      timestamp: new Date(),
      durationHours: parseFloat(duration),
      totalKwh: parseFloat(kwh),
      sourceUsed: source,
      provider: provider,
      co2Saved: calculateCo2Saved(parseFloat(kwh), source, {} as any), // TODO: calculate against grid
    };

    onAddLog(newLog);
    
    setBuildingName('');
    setDuration('');
    setKwh('');
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      // Clear all logs - this would be handled via parent state
      console.log('Clear all logs called');
    }
  };

  const exportLogsToCSV = () => {
    const headers = 'ID,Building,Date,Duration(hours),kWh,Source,Provider,CO2 Saved(g)\n';
    const rows = logs.map(log => 
      `${log.id},${log.buildingName},${log.timestamp.toISOString()},${log.durationHours},${log.totalKwh},${log.sourceUsed},${log.provider},${log.co2Saved || 0}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'co2_logs_export.csv';
    a.click();
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ color: '#F74902', marginBottom: '1.5rem' }}>
         CO2 Impact Tracker
      </h2>

      {/* Top Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          padding: '1.5rem',
          border: '2px solid #F74902',
          borderRadius: '8px',
          backgroundColor: '#121212',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999999' }}>Total Logs</p>
          <p style={{ margin: 0, color: '#FFFFFF', fontSize: '2rem', fontWeight: 'bold' }}>{logs.length}</p>
        </div>
        <div style={{
          padding: '1.5rem',
          border: '2px solid #4CAF50',
          borderRadius: '8px',
          backgroundColor: '#121212',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999999' }}>Total CO2 Saved</p>
          <p style={{ margin: 0, color: '#4CAF50', fontSize: '2rem', fontWeight: 'bold' }}>{(totalCo2Saved / 1000).toFixed(2)} kg</p>
        </div>
        <div style={{
          padding: '1.5rem',
          border: '2px solid #FF8042',
          borderRadius: '8px',
          backgroundColor: '#121212',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999999' }}>Total CO2 Emitted</p>
          <p style={{ margin: 0, color: '#FF8042', fontSize: '2rem', fontWeight: 'bold' }}>{(totalCo2Emitted / 1000).toFixed(2)} kg</p>
        </div>
        <div style={{
          padding: '1.5rem',
          border: '2px solid #666666',
          borderRadius: '8px',
          backgroundColor: '#121212',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999999' }}>Total Energy Logged</p>
          <p style={{ margin: 0, color: '#FFFFFF', fontSize: '2rem', fontWeight: 'bold' }}>{totalKwh.toLocaleString()} kWh</p>
        </div>
      </div>

      {/* Add New Log Form */}
      <div style={{
        padding: '2rem',
        border: '2px solid #333333',
        borderRadius: '8px',
        backgroundColor: '#121212',
        marginBottom: '2rem',
      }}>
        <h3 style={{ color: '#F74902', marginTop: 0 }}>➕ Add New Energy Log</h3>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#CCCCCC', fontSize: '0.9rem' }}>Building Name</label>
            <select
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #333333',
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                fontSize: '1rem',
              }}
            >
              <option value="">Select a building...</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#CCCCCC', fontSize: '0.9rem' }}>Duration (hours)</label>
            <input
              type="number"
              placeholder="e.g., 8"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #333333',
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#CCCCCC', fontSize: '0.9rem' }}>Total kWh</label>
            <input
              type="number"
              placeholder="e.g., 1200"
              value={kwh}
              onChange={(e) => setKwh(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #333333',
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#CCCCCC', fontSize: '0.9rem' }}>Energy Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as EnergySource)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #333333',
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                fontSize: '1rem',
              }}
            >
              <option value="coal">Coal</option>
              <option value="ng">Natural Gas</option>
              <option value="solar">Solar</option>
              <option value="wind">Wind</option>
              <option value="hydro">Hydro</option>
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#CCCCCC', fontSize: '0.9rem' }}>Power Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'campus_grid' | 'pacific_power')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #333333',
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                fontSize: '1rem',
              }}
            >
              <option value="campus_grid">Campus Grid</option>
              <option value="pacific_power">Pacific Power</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleAddLog}
            style={{
              flex: '0 0 auto',
              padding: '0.75rem 2rem',
              backgroundColor: '#F74902',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            Add Log Entry
          </button>

          <button
            onClick={exportLogsToCSV}
            style={{
              flex: '0 0 auto',
              padding: '0.75rem 2rem',
              backgroundColor: '#333333',
              color: '#FFFFFF',
              border: '2px solid #F74902',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
             Export CSV
          </button>

          <button
            onClick={handleClearLogs}
            style={{
              flex: '0 0 auto',
              padding: '0.75rem 2rem',
              backgroundColor: '#FF4444',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* CO2 Factors Reference */}
      <div style={{
        padding: '1.5rem',
        border: '1px solid #333333',
        borderRadius: '8px',
        backgroundColor: '#0D0D0D',
        marginBottom: '2rem',
      }}>
        <h3 style={{ color: '#F74902', marginTop: 0, marginBottom: '1rem' }}> CO2 Emission Factors (grams/kWh)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#1A1A1A', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Coal</p>
            <p style={{ margin: 0, color: '#FF4444', fontWeight: 'bold' }}>820 g/kWh</p>
          </div>
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#1A1A1A', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Natural Gas</p>
            <p style={{ margin: 0, color: '#FF8042', fontWeight: 'bold' }}>490 g/kWh</p>
          </div>
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#1A1A1A', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Solar</p>
            <p style={{ margin: 0, color: '#F74902', fontWeight: 'bold' }}>40 g/kWh</p>
          </div>
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#1A1A1A', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Wind</p>
            <p style={{ margin: 0, color: '#4CAF50', fontWeight: 'bold' }}>11 g/kWh</p>
          </div>
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#1A1A1A', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Hydro</p>
            <p style={{ margin: 0, color: '#4CAF50', fontWeight: 'bold' }}>12 g/kWh</p>
          </div>
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#1A1A1A', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Pacific Power Avg</p>
            <p style={{ margin: 0, color: '#FF8042', fontWeight: 'bold' }}>680 g/kWh</p>
          </div>
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#1A1A1A', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999999' }}>Campus Grid Avg</p>
            <p style={{ margin: 0, color: '#4CAF50', fontWeight: 'bold' }}>350 g/kWh</p>
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div style={{
        padding: '1.5rem',
        border: '2px solid #333333',
        borderRadius: '8px',
        backgroundColor: '#121212',
        overflowX: 'auto',
      }}>
        <h3 style={{ color: '#F74902', marginTop: 0 }}> Recent Log Entries</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1A1A1A' }}>
              <th style={{ border: '1px solid #333333', padding: '1rem', textAlign: 'left', color: '#F74902' }}>Date</th>
              <th style={{ border: '1px solid #333333', padding: '1rem', textAlign: 'left', color: '#F74902' }}>Building</th>
              <th style={{ border: '1px solid #333333', padding: '1rem', textAlign: 'left', color: '#F74902' }}>Source</th>
              <th style={{ border: '1px solid #333333', padding: '1rem', textAlign: 'left', color: '#F74902' }}>Provider</th>
              <th style={{ border: '1px solid #333333', padding: '1rem', textAlign: 'left', color: '#F74902' }}>kWh</th>
              <th style={{ border: '1px solid #333333', padding: '1rem', textAlign: 'left', color: '#F74902' }}>Duration</th>
              <th style={{ border: '1px solid #333333', padding: '1rem', textAlign: 'left', color: '#F74902' }}>CO2 Saved</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#666666' }}>
                  No logs yet. Add your first entry above!
                </td>
              </tr>
            ) : (
              logs.slice(-20).reverse().map((log, index) => (
                <tr key={log.id} style={{ backgroundColor: index % 2 === 0 ? '#121212' : '#0D0D0D' }}>
                  <td style={{ border: '1px solid #333333', padding: '0.75rem', color: '#CCCCCC' }}>
                    {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString()}
                  </td>
                  <td style={{ border: '1px solid #333333', padding: '0.75rem', color: '#FFFFFF' }}>{log.buildingName}</td>
                  <td style={{ border: '1px solid #333333', padding: '0.75rem', color: '#F74902', fontWeight: 'bold' }}>{log.sourceUsed.toUpperCase()}</td>
                  <td style={{ border: '1px solid #333333', padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      backgroundColor: log.provider === 'campus_grid' ? '#4CAF50' : '#FF8042',
                      color: '#FFFFFF',
                    }}>
                      {log.provider === 'campus_grid' ? 'Campus' : 'Pacific'}
                    </span>
                  </td>
                  <td style={{ border: '1px solid #333333', padding: '0.75rem', color: '#FFFFFF', fontWeight: 'bold' }}>{log.totalKwh}</td>
                  <td style={{ border: '1px solid #333333', padding: '0.75rem', color: '#CCCCCC' }}>{log.durationHours} hrs</td>
                  <td style={{ border: '1px solid #333333', padding: '0.75rem', color: log.co2Saved && log.co2Saved > 0 ? '#4CAF50' : '#666666', fontWeight: 'bold' }}>
                    {log.co2Saved ? `${(log.co2Saved / 1000).toFixed(2)} kg` : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Logs by Building Breakdown */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {logsByBuilding.map(({ building, buildingLogs }) => (
          <div key={building.id} style={{
            padding: '1.5rem',
            border: '1px solid #333333',
            borderRadius: '8px',
            backgroundColor: '#121212',
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#F74902' }}>{building.name}</h4>
            <div style={{ fontSize: '0.9rem', color: '#CCCCCC' }}>
              <p style={{ margin: '0.5rem 0' }}><strong>Logs:</strong> {buildingLogs.length}</p>
              <p style={{ margin: '0.5rem 0' }}><strong>Total kWh:</strong> {buildingLogs.reduce((sum, l) => sum + l.totalKwh, 0)}</p>
              <p style={{ margin: '0.5rem 0' }}><strong>CO2 Saved:</strong> {(buildingLogs.reduce((sum, l) => sum + (l.co2Saved || 0), 0) / 1000).toFixed(2)} kg</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}