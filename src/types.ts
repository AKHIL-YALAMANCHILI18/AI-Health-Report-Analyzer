/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Biomarker {
  name: string;
  category: string;
  value: number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  explanation: string;
  whyItMatters: string;
  possibleCauses: string;
  lifestyleSuggestions: string;
  followUpQuestions: string;
}

export interface PatientMetadata {
  patientName: string;
  age: string;
  gender: string;
  hospital: string;
  doctor: string;
  testDate: string;
  reportDate: string;
  confidenceScore: number;
}

export interface HealthScores {
  overallWellnessScore: number;
  bloodHealth: number;
  kidneyHealth: number;
  liverHealth: number;
  heartHealth: number;
  metabolicHealth: number;
  immuneIndicators: number;
}

export interface RiskIndicator {
  condition: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  description: string;
}

export interface ReportAnalysis {
  metadata: PatientMetadata;
  healthScores: HealthScores;
  biomarkers: Biomarker[];
  summary: string;
  riskIndicators: RiskIndicator[];
}

export interface HealthReport {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'pending' | 'analyzing' | 'success' | 'error';
  errorMessage?: string;
  analysis?: ReportAnalysis;
  userId?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  bloodGroup: string;
  emergencyContact: string;
  medicalConditions: string;
  allergies: string;
  currentMedications: string;
  lifestyle: string;
  avatarUrl?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  privacyMode: boolean;
}

export interface MarkerComparison {
  name: string;
  previous: string;
  current: string;
  reason: string;
}

export interface ScoreComparison {
  wellness: number;
  blood: number;
  kidney: number;
  liver: number;
  heart: number;
  metabolic: number;
  immune: number;
}

export interface ComparisonResult {
  scoreChange: ScoreComparison;
  improvedMarkers: MarkerComparison[];
  worsenedMarkers: MarkerComparison[];
  overallProgressSummary: string;
}
