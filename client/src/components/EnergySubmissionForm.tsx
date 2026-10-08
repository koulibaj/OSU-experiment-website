// src/components/EnergySubmissionForm.tsx
import { useState } from 'react';
import type { EnergySubmission } from '../types/submissions';
import { generateSubmissionId, saveSubmission, ACTIVITY_TYPES } from '../types/submissions';

interface Props {
  buildingCode?: string;
  buildingName?: string;
  onSubmit?: () => void;
}

export default function EnergySubmissionForm({ buildingCode, buildingName, onSubmit }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    hour: new Date().getHours(),
    consumptionKWH: '',
    activityType: 'experiment' as const,
    description: '',
    submittedBy: '',
    contactEmail: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submission: EnergySubmission = {
      id: generateSubmissionId(),
      buildingCode: buildingCode || 'UNKNOWN',
      buildingName: buildingName || 'Unknown Building',
      timestamp: new Date().toISOString(),
      hour: formData.hour,
      consumptionKWH: parseFloat(formData.consumptionKWH) || 0,
      activityType: formData.activityType,
      description: formData.description,
      submittedBy: formData.submittedBy,
      contactEmail: formData.contactEmail,
    };

    saveSubmission(submission);
    setSubmitted(true);
    
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setFormData({
        hour: new Date().getHours(),
        consumptionKWH: '',
        activityType: 'experiment',
        description: '',
        submittedBy: '',
        contactEmail: '',
      });
      onSubmit?.();
    }, 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: '#F74902',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '1rem',
          transition: 'opacity 0.2s ease',
        }}
      >
         Submit Energy Usage Data
      </button>
    );
  }

  if (submitted) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: '#1E1E1E',
        borderRadius: '6px',
        border: '2px solid #2ECC71',
        textAlign: 'center',
        marginTop: '1rem',
      }}>
        <h3 style={{ color: '#2ECC71', margin: '0 0 0.5rem 0' }}>✅ Submission Received!</h3>
        <p style={{ color: '#999999' }}>Thank you for contributing to campus energy monitoring.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0 }}>Submit Energy Usage</h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#999999',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
        >
          ×
        </button>
      </div>

      {buildingName && (
        <p style={{ color: '#999999', marginBottom: '1.5rem' }}>
          Building: <strong style={{ color: '#F74902' }}>{buildingName}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999999' }}>
              Hour of Day
            </label>
            <select
              value={formData.hour}
              onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) })}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#1E1E1E',
                border: '1px solid #333333',
                borderRadius: '4px',
                color: '#E0E0E0',
                fontSize: '1rem',
              }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999999' }}>
              Consumption (KWH)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.consumptionKWH}
              onChange={(e) => setFormData({ ...formData, consumptionKWH: e.target.value })}
              placeholder="e.g., 125.5"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#1E1E1E',
                border: '1px solid #333333',
                borderRadius: '4px',
                color: '#E0E0E0',
                fontSize: '1rem',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999999' }}>
            Activity Type
          </label>
          <select
            value={formData.activityType}
            onChange={(e) => setFormData({ ...formData, activityType: e.target.value as any })}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#1E1E1E',
              border: '1px solid #333333',
              borderRadius: '4px',
              color: '#E0E0E0',
              fontSize: '1rem',
            }}
          >
            {ACTIVITY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999999' }}>
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of activity or experiment..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#1E1E1E',
              border: '1px solid #333333',
              borderRadius: '4px',
              color: '#E0E0E0',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999999' }}>
              Your Name *
            </label>
            <input
              type="text"
              value={formData.submittedBy}
              onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
              placeholder="Dr. John Doe"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#1E1E1E',
                border: '1px solid #333333',
                borderRadius: '4px',
                color: '#E0E0E0',
                fontSize: '1rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999999' }}>
              Contact Email (Optional)
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="smithj@oregonstate.edu"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#1E1E1E',
                border: '1px solid #333333',
                borderRadius: '4px',
                color: '#E0E0E0',
                fontSize: '1rem',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: '#F74902',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Submit Energy Data
        </button>
      </form>
    </div>
  );
}