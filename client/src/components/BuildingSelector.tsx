// src/components/BuildingSelector.tsx
import type { BuildingUtilityData } from '../utils/utilityData';

interface Props {
  buildings: BuildingUtilityData[];
  selectedBuilding: BuildingUtilityData | null;
  onSelect: (building: BuildingUtilityData) => void;
}

export default function BuildingSelector({ buildings, selectedBuilding, onSelect }: Props) {
  const sortedBuildings = [...buildings].sort((a, b) => 
    a.buildingName.localeCompare(b.buildingName)
  );

  return (
    <div style={{ marginBottom: '20px' }}>
      <label 
        htmlFor="building-select" 
        style={{ 
          marginRight: '10px', 
          fontWeight: 'bold',
        }}
      >
        Select Building:
      </label>
      <select
        id="building-select"
        value={selectedBuilding?.meterId || ''}
        onChange={(e) => {
          const building = buildings.find(b => b.meterId === e.target.value);
          if (building) onSelect(building);
        }}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: '4px',
          border: '1px solid #333333',
          backgroundColor: '#1E1E1E',
          color: '#E0E0E0',
          minWidth: '300px',
        }}
      >
        <option value="">-- All Buildings --</option>
        {sortedBuildings.map(building => (
          <option key={building.meterId} value={building.meterId}>
            {building.buildingName} ({building.buildingCode})
          </option>
        ))}
      </select>
    </div>
  );
}