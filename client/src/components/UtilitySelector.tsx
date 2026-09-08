// src/components/UtilitySelector.tsx
import type { UtilityType } from '../utils/utilityData';
import { UTILITY_LABELS } from '../utils/utilityData';

interface Props {
  utilityType: UtilityType;
  onSelect: (type: UtilityType) => void;
}

export default function UtilitySelector({ utilityType, onSelect }: Props) {
  const utilities: UtilityType[] = ['electricity', 'naturalGas', 'steam'];

  return (
    <div style={{ marginBottom: '20px' }}>
      <label 
        htmlFor="utility-select" 
        style={{ 
          marginRight: '10px', 
          fontWeight: 'bold',
        }}
      >
        Utility Type:
      </label>
      <select
        id="utility-select"
        value={utilityType}
        onChange={(e) => onSelect(e.target.value as UtilityType)}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: '4px',
          border: '2px solid #F74902',
          backgroundColor: '#1E1E1E',
          color: '#E0E0E0',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {utilities.map((type) => (
          <option key={type} value={type}>
            {UTILITY_LABELS[type]}
          </option>
        ))}
      </select>
    </div>
  );
}