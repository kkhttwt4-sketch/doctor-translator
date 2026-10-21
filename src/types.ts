export interface PrescriptionAnalysis {
  medicationName: string;
  concentration: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
  doctorInstructions?: string;
  simplifiedExplanation: string;
  importantWarnings: string[];
  clarityStatus: 'clear' | 'partially_clear' | 'unclear';
  unclearNotice?: string;
  allMedications?: Array<{
    name: string;
    concentration?: string;
    dosage?: string;
    frequency?: string;
    timing?: string;
    instructions?: string;
  }>;
}

export interface SavedPrescription {
  id: string;
  date: string;
  timestamp: number;
  medicationName: string;
  imageThumbnail: string; // Base64 or object URL
  analysis: PrescriptionAnalysis;
  patientNotes?: string;
}

export interface MedicationReminder {
  id: string;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  timeSlot: 'morning' | 'noon' | 'evening' | 'bedtime';
  timeLabel: string;
  frequency: string;
}

export type AppTab = 'home' | 'scan' | 'result' | 'history' | 'schedule';
