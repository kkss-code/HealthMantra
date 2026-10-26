import { ConditionSchema } from '../../types/questionnaire';
import { allergyFields, discontinuedMedicationFields, exerciseFields, medicationFields, surgeryFields } from '../repeatableFields';

export const bloodPressure: ConditionSchema = {
  id: 'blood-pressure',
  name: 'Blood Pressure',
  icon: '🩺',
  color: '#1AA6A6',
  tagline: 'How has your blood pressure been?',
  description:
    'Tell us about your blood pressure history so we can prepare an accurate summary for your doctor, including your readings, medications and lifestyle.',
  steps: [
    { id: 'weight', question: 'Patient weight in Kg', type: 'number', maxLength: 3, placeholder: 'e.g. 72' },
    { id: 'diagnosisDate', question: 'When was your blood pressure diagnosis made?', type: 'date' },
    {
      id: 'checkFrequency',
      question: 'Approximately how often do you check your blood pressure?',
      type: 'select',
      options: ['Daily', 'A few times a week', 'Weekly', 'Monthly', 'Rarely'],
    },
    {
      id: 'medications',
      question: 'List all the medications you are currently taking for your blood pressure.',
      type: 'repeatable',
      repeatableFields: medicationFields,
      repeatableItemLabel: 'Medication',
    },
    {
      id: 'discontinuedMedications',
      question: 'Other medications you previously tried and stopped.',
      type: 'repeatable',
      repeatableFields: discontinuedMedicationFields,
      repeatableItemLabel: 'Medication',
    },
    { id: 'otherDisorders', question: 'Do you have any other medical disorders?', type: 'textarea' },
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
    { id: 'smoking', question: 'Do you smoke? If yes, how much?', type: 'text' },
    { id: 'alcohol', question: 'How many alcoholic drinks do you consume on average per week?', type: 'text' },
    {
      id: 'sleep',
      question: 'Tell us about your sleep: usual bedtime, time to fall asleep, wake time, naps, and snoring.',
      type: 'textarea',
    },
    { id: 'goals', question: 'What are your goals for managing your blood pressure?', type: 'textarea' },
  ],
};
