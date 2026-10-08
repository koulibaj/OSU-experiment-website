// src/components/RecentSubmissions.tsx
import type { EnergySubmission } from '../types/submissions';
import { getRecentSubmissions, getActiveExperiments } from '../types/submissions';
import { ACTIVITY_TYPES } from '../types/submissions';

interface Props {
  buildingCode?: string;
}

export default function RecentSubmissions({ buildingCode }: Props) {
  const submissions = buildingCode
    ? getRecentSubmissions(5).filter(s => s.buildingCode === buildingCode)
    : getRecentSubmissions(10);

  const activeExperiments = getActiveExperiments();

  const getActivityLabel = (type: string) => {
    return ACTIVITY_TYPES.find(t => t.value === type)?.label || type;
  };

  const formatTime = (timestamp: string, hour: number) => {
    const date = new Date(timestamp);
    const timeStr = hour.toString().padStart(2, '0') + ':00';
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return isToday ? `Today at ${timeStr}` : `${date.toLocaleDateString()} ${timeStr}`;
  };

  return (
    <div className="card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#F74902' }}>
         Recent Energy Submissions
      </h3>

      {/* Active Experiments Alert */}
      {activeExperiments.length > 0 && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(247, 73, 2, 0.1)',
          border: '1px solid #F74902',
          borderRadius: '6px',
          marginBottom: '1.5rem',
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#F74902' }}>
            🔬 Active Experiments ({activeExperiments.length})
          </h4>
          <p style={{ color: '#999999', fontSize: '0.9rem', margin: 0 }}>
            High energy activity reported in the last 2 hours
          </p>
        </div>
      )}

      {submissions.length === 0 ? (
        <p style={{ color: '#999999', textAlign: 'center', padding: '2rem' }}>
          No submissions yet. Be the first to contribute!
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {submissions.map((sub) => (
            <div
              key={sub.id}
              style={{
                padding: '1rem',
                backgroundColor: '#1E1E1E',
                borderRadius: '6px',
                border: '1px solid #333333',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#333333',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    color: '#F74902',
                    marginBottom: '0.5rem',
                  }}>
                    {getActivityLabel(sub.activityType)}
                  </span>
                  <h4 style={{ margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
                    {sub.buildingName}
                  </h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F74902', margin: 0 }}>
                    {sub.consumptionKWH.toFixed(1)}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#999999', margin: 0 }}>KWH</p>
                </div>
              </div>
              
              {sub.description && (
                <p style={{ color: '#999999', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                  {sub.description}
                </p>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #333333',
              }}>
                <span style={{ color: '#999999', fontSize: '0.85rem' }}>
                  by {sub.submittedBy}
                </span>
                <span style={{ color: '#999999', fontSize: '0.85rem' }}>
                  {formatTime(sub.timestamp, sub.hour)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}