import { RepeatableFieldDef } from '../types/questionnaire';

export const medicationFields: RepeatableFieldDef[] = [
  { key: 'name', label: 'Medication name', type: 'text', placeholder: 'e.g. Amlodipine' },
  { key: 'dose', label: 'Dose in mg', type: 'number', placeholder: 'e.g. 5' },
  { key: 'frequency', label: 'Times per day', type: 'number', placeholder: 'e.g. 1' },
  { key: 'notes', label: 'Notes for doctor', type: 'text', placeholder: 'Optional' },
];

export const discontinuedMedicationFields: RepeatableFieldDef[] = [
  { key: 'name', label: 'Medication name', type: 'text', placeholder: 'e.g. Metformin' },
  { key: 'dose', label: 'Dosage in mg', type: 'number', placeholder: 'e.g. 500' },
  { key: 'frequency', label: 'Times per day', type: 'number', placeholder: 'e.g. 2' },
  { key: 'reason', label: 'Why was it stopped?', type: 'text', placeholder: 'e.g. Side effects' },
];

export const allergyFields: RepeatableFieldDef[] = [
  { key: 'medication', label: 'Medication', type: 'text', placeholder: 'e.g. Penicillin' },
  { key: 'reaction', label: 'What happens when you take it?', type: 'text' },
];

export const surgeryFields: RepeatableFieldDef[] = [
  { key: 'name', label: 'Surgery name', type: 'text' },
  { key: 'date', label: 'Surgery date', type: 'date' },
];

export const exerciseFields: RepeatableFieldDef[] = [
  { key: 'name', label: 'Exercise name', type: 'text', placeholder: 'e.g. Walking' },
  { key: 'timesPerWeek', label: 'Times per week', type: 'number' },
  { key: 'duration', label: 'Average duration (min)', type: 'number' },
  { key: 'problems', label: 'Problems during exercise', type: 'text', placeholder: 'Optional' },
];
