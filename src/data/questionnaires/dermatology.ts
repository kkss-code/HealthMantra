import { ConditionSchema } from '../../types/questionnaire';
import { allergyFields, discontinuedMedicationFields, exerciseFields, medicationFields } from '../repeatableFields';

export const dermatology: ConditionSchema = {
  id: 'dermatology',
  name: 'Dermatology',
  icon: '🧴',
  color: '#C96BA0',
  tagline: 'Tell us about your skin or hair concern',
  description:
    'Describe your skin or hair condition, attach a photo if you can, and share any treatments you’ve already tried, so your dermatologist can review it quickly.',
  steps: [
    { id: 'name', question: 'Patient name', type: 'text' },
    { id: 'age', question: 'Patient age', type: 'number', maxLength: 3 },
    { id: 'weight', question: 'Patient weight in Kg', type: 'number', maxLength: 3 },
    { id: 'condition', question: 'What skin or hair condition are you suffering from?', type: 'text' },
    { id: 'photo', question: 'Attach photographs of the area involved', type: 'photo' },
    { id: 'description', question: 'Describe your skin or hair problem in a few sentences.', type: 'textarea' },
    {
      id: 'medications',
      question: 'List all the medications you are currently taking for this condition.',
      type: 'repeatable',
      repeatableFields: medicationFields,
      repeatableItemLabel: 'Medication',
    },
    {
      id: 'discontinuedMedications',
      question: 'Other medications and treatments previously tried for this condition.',
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
      id: 'exercise',
      question: 'Describe your exercise regimen.',
      type: 'repeatable',
      repeatableFields: exerciseFields,
      repeatableItemLabel: 'Exercise',
    },
    { id: 'diet', question: 'Describe your diet over the course of a typical week.', type: 'textarea' },
    { id: 'alcohol', question: 'How many alcoholic drinks do you consume on average?', type: 'text' },
    { id: 'goals', question: 'What are your goals for your skin or hair?', type: 'textarea' },
  ],
};
