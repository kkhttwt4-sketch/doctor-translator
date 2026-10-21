import { SavedPrescription, MedicationReminder, PrescriptionAnalysis } from '../types';
import { SAMPLE_PRESCRIPTIONS } from '../data/samplePrescriptions';

const PRESCRIPTIONS_KEY = 'doctor_translator_prescriptions_v1';
const REMINDERS_KEY = 'doctor_translator_reminders_v1';
const FONT_SIZE_KEY = 'doctor_translator_font_size';

// Initial sample data seed to make the app immediately rich and realistic on first open
function getInitialSamplePrescriptions(): SavedPrescription[] {
  return [
    {
      id: 'saved-sample-1',
      date: '١٨ أكتوبر ٢٠٢٦',
      timestamp: Date.now() - 86400000 * 2,
      medicationName: SAMPLE_PRESCRIPTIONS[0].previewData.medicationName,
      imageThumbnail: SAMPLE_PRESCRIPTIONS[0].imageDataUri,
      analysis: SAMPLE_PRESCRIPTIONS[0].previewData,
      patientNotes: 'تم التأكد مع د. خالد، الجرعة صباحية منتظمة.',
    },
    {
      id: 'saved-sample-2',
      date: '١٥ أكتوبر ٢٠٢٦',
      timestamp: Date.now() - 86400000 * 5,
      medicationName: SAMPLE_PRESCRIPTIONS[1].previewData.medicationName,
      imageThumbnail: SAMPLE_PRESCRIPTIONS[1].imageDataUri,
      analysis: SAMPLE_PRESCRIPTIONS[1].previewData,
      patientNotes: 'علاج التهاب الشعب الهوائية، إكمال 7 أيام.',
    },
  ];
}

export function loadSavedPrescriptions(): SavedPrescription[] {
  try {
    const raw = localStorage.getItem(PRESCRIPTIONS_KEY);
    if (!raw) {
      const initial = getInitialSamplePrescriptions();
      savePrescriptionsList(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading prescriptions:', e);
    return [];
  }
}

export function savePrescriptionsList(items: SavedPrescription[]) {
  try {
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving prescriptions to storage:', e);
  }
}

export function addPrescriptionToStorage(
  analysis: PrescriptionAnalysis,
  imageThumbnail: string,
  notes?: string
): SavedPrescription {
  const existing = loadSavedPrescriptions();
  const dateFormatted = new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const newRecord: SavedPrescription = {
    id: 'rx-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    date: dateFormatted,
    timestamp: Date.now(),
    medicationName: analysis.medicationName || 'دواء غير مسمى',
    imageThumbnail,
    analysis,
    patientNotes: notes,
  };

  const updated = [newRecord, ...existing];
  savePrescriptionsList(updated);
  return newRecord;
}

export function deletePrescriptionFromStorage(id: string): SavedPrescription[] {
  const existing = loadSavedPrescriptions();
  const filtered = existing.filter((item) => item.id !== id);
  savePrescriptionsList(filtered);
  return filtered;
}

export function loadReminders(): MedicationReminder[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) {
      // Default sample reminders
      const initial: MedicationReminder[] = [
        {
          id: 'rem-1',
          prescriptionId: 'saved-sample-1',
          medicationName: 'كونكور ٥ ملغ (Concor)',
          dosage: 'قرص واحد',
          timeSlot: 'morning',
          timeLabel: '٨:٠٠ صباحاً (بعد الإفطار)',
          frequency: 'مرة واحدة يومياً',
        },
        {
          id: 'rem-2',
          prescriptionId: 'saved-sample-2',
          medicationName: 'أوجمنتين ١ غرام (Augmentin)',
          dosage: 'قرص واحد',
          timeSlot: 'noon',
          timeLabel: '٢:٠٠ ظهراً',
          frequency: 'مرتين يومياً (كل ١٢ ساعة)',
        },
        {
          id: 'rem-3',
          prescriptionId: 'saved-sample-2',
          medicationName: 'أوجمنتين ١ غرام (Augmentin)',
          dosage: 'قرص واحد',
          timeSlot: 'bedtime',
          timeLabel: '١٠:٠٠ مساءً',
          frequency: 'الجرعة الثانية',
        },
      ];
      saveRemindersList(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRemindersList(reminders: MedicationReminder[]) {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Error saving reminders:', e);
  }
}

export function addReminder(reminder: Omit<MedicationReminder, 'id'>) {
  const current = loadReminders();
  const newRem: MedicationReminder = {
    ...reminder,
    id: 'rem-' + Date.now().toString(36),
  };
  saveRemindersList([...current, newRem]);
  return newRem;
}

export function deleteReminder(id: string): MedicationReminder[] {
  const current = loadReminders();
  const updated = current.filter((r) => r.id !== id);
  saveRemindersList(updated);
  return updated;
}

export type FontSizeOption = 'normal' | 'large' | 'xlarge';

export function getSavedFontSize(): FontSizeOption {
  return (localStorage.getItem(FONT_SIZE_KEY) as FontSizeOption) || 'large'; // Default to large for elderly comfort
}

export function saveFontSize(size: FontSizeOption) {
  localStorage.setItem(FONT_SIZE_KEY, size);
}
