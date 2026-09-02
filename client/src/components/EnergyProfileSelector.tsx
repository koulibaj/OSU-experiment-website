// src/components/EnergyProfileSelector.tsx
import type { EnergyProfile } from '../types/energy'; // Ensure this path is correct relative to the file

interface Props {
  profiles: EnergyProfile[];
  selectedProfile: EnergyProfile;
  onSelect: (profile: EnergyProfile) => void;
}

export default function EnergyProfileSelector({ profiles, selectedProfile, onSelect }: Props) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor="profile-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>
        Select Monthly Profile:
      </label>
      <select
        id="profile-select"
        value={selectedProfile.id}
        onChange={(e) => {
          const profile = profiles.find(p => p.id === e.target.value);
          if (profile) onSelect(profile);
        }}
        style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '4px' }}
      >
        {profiles.map(profile => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>
    </div>
  );
}