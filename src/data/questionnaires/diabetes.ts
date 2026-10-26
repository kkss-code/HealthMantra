import { ConditionSchema } from '../../types/questionnaire';
import { allergyFields, discontinuedMedicationFields, exerciseFields, medicationFields, surgeryFields } from '../repeatableFields';

export const diabetes: ConditionSchema = {
  id: 'diabetes',
  name: 'Diabetes',
  icon: '🩸',
  color: '#E0A82E',
  tagline: 'Let’s build your diabetes history',
  description:
    'A short structured history about your diabetes — diagnosis, medications, labs and lifestyle — so your doctor has everything needed before your visit.',
  steps: [
    { id: 'weight', question: 'Patient weight in Kg', type: 'number', maxLength: 3, placeholder: 'e.g. 70' },
    { id: 'diagnosisDate', question: 'When was the diagnosis of diabetes made? (mm/yy)', type: 'date' },
    {
      id: 'checkFrequency',
      question: 'Approximately how often do you check your blood sugar?',
      type: 'select',
      options: ['Multiple times a day', 'Once a day', 'A few times a week', 'Weekly', 'Rarely'],
    },
    { id: 'labValues', question: 'What are your most recent lab values? (fasting / post-prandial / HbA1c)', type: 'textarea' },
    {
      id: 'medications',
      question: 'List all the medications you are currently taking.',
      type: 'repeatable',
      repeatableFields: medicationFields,
      repeatableItemLabel: 'Medication',
    },
    {
      id: 'discontinuedMedications',
      question: 'Other medications previously tried for this condition.',
      type: 'repeatable',
      repeatableFields: discontinuedMedicationFields,
      repeatableItemLabel: 'Medication',
    },
    { id: 'otherDisorders', question: 'Do you have any other medical disorders?', type: 'textarea' },
    { id: 'hospitalization', question: 'Have you had any previous hospitalizations related to diabetes?', type: 'textarea' },
    {
      id: 'allergies',
      question: 'Do you have any medication allergies?',
      type: 'repeatable',
      repeatableFields: allergyFields,
      repeatableItemLabel: 'Allergy',
    },
    {
      id: 'surgicalHistory',
      question: 'Past surgical history',
      type: 'repeatable',
      repeatableFields: surgeryFields,
      repeatableItemLabel: 'Surgery',
    },
    {
      id: 'exercise',
      question: 'Describe your exercise regimen.',
      type: 'repeatable',
      repeatableFields: exerciseFields,
      repeatableItemLabel: 'Exercise',
    },
    { id: 'diet', question: 'Describe your diet over the course of a typical week.', type: 'textarea' },
    { id: 'smoking', question: 'Do you smoke tobacco, cigars or marijuana? How much?', type: 'text' },
    { id: 'alcohol', question: 'How many alcoholic drinks do you consume on average?', type: 'text' },
    {
      id: 'sleep',
      question: 'Tell us about your sleep: usual bedtime, time to fall asleep, wake time, naps, and snoring.',
      type: 'textarea',
    },
    {
      id: 'routineCare',
      question: 'DM routine care — have you had an eye check, kidney check, and nerve check this year?',
      type: 'textarea',
    },
    { id: 'goals', question: 'What are your goals for managing your diabetes?', type: 'textarea' },
  ],
};
