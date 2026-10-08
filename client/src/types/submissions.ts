// src/types/submissions.ts

export interface EnergySubmission {
  id: string;
  buildingCode: string;
  buildingName: string;
  timestamp: string; // ISO string
  hour: number; // 0-23
  consumptionKWH: number;
  activityType: 'experiment' | 'routine' | 'maintenance' | 'other';
  description: string;
  submittedBy: string; // Name or email
  contactEmail?: string;
}

export const ACTIVITY_TYPES = [
  { value: 'experiment', label: 'Experiment' },
  { value: 'routine', label: 'Routine Operations' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
] as const;

export function generateSubmissionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function saveSubmission(submission: EnergySubmission): void {
  const existing = getSubmissions();
  const updated = [submission, ...existing].slice(0, 100); // Keep last 100
  localStorage.setItem('energy_submissions', JSON.stringify(updated));
}

export function getSubmissions(): EnergySubmission[] {
  try {
    const data = localStorage.getItem('energy_submissions');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getSubmissionsByBuilding(buildingCode: string): EnergySubmission[] {
  return getSubmissions().filter(sub => sub.buildingCode === buildingCode);
}

export function getRecentSubmissions(limit = 10): EnergySubmission[] {
  return getSubmissions().slice(0, limit);
}

export function getActiveExperiments(): EnergySubmission[] {
  const now = new Date();
  const currentHour = now.getHours();
  
  return getSubmissions().filter(sub => {
    const subHour = sub.hour;
    const isRecent = Math.abs(currentHour - subHour) <= 2; // Within 2 hours
    return sub.activityType === 'experiment' && isRecent;
  });
}