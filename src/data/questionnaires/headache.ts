import { ConditionSchema } from '../../types/questionnaire';

export const headache: ConditionSchema = {
  id: 'headache',
  name: 'Headache',
  icon: '🤕',
  color: '#E0A82E',
  tagline: 'How are you feeling today?',
  description:
    'A structured headache history helps your neurologist tell migraine, tension, cluster and other headache types apart. It takes a few minutes and covers pattern, triggers, and red-flag symptoms.',
  steps: [
    {
      id: 'enteringFor',
      question: 'Who are you entering the headache data for?',
      type: 'select',
      options: ['Myself', 'My child', 'Somebody else'],
    },
    {
      id: 'gender',
      question: 'What is the gender of the patient?',
      type: 'select',
      options: ['Male', 'Female', 'Other', 'Prefer not to answer'],
    },
    {
      id: 'lifetimeCount',
      question: 'How many headache episodes do you remember experiencing in your lifetime?',
      type: 'select',
      options: ['Less than 5', '5 to 20', '20+, multiple types', '20+, one type'],
    },
    {
      id: 'headacheType',
      question: 'Which of these best describes the type of headache you experience?',
      type: 'select',
      options: [
        'Throbbing pain, often one-sided, with nausea or light sensitivity (migraine-like)',
        'Dull, pressing pain on both sides, like a tight band (tension-like)',
        'Severe pain around one eye, comes in clusters, with tearing or a stuffy nose (cluster-like)',
        'Brief, electric-shock-like facial pain triggered by touch or chewing (trigeminal-like)',
      ],
    },
    {
      id: 'laterality',
      question: 'Which side of the head do you experience the pain on? (Laterality)',
      type: 'select',
      options: ['Right', 'Left', 'Either — changes', 'Both every time', 'Sometimes one, sometimes both'],
    },
    { id: 'triggers', question: 'Is the headache triggered by anything specific (light, stress, food, sleep)?', type: 'yesno' },
    {
      id: 'diet',
      question: 'How do you describe your diet?',
      type: 'select',
      options: ['Regular meals, balanced diet', 'Often skip meals', 'Frequent cravings/snacking', 'Irregular, varies a lot'],
    },
    { id: 'altitude', question: 'Was the patient exposed to high altitude or air travel recently?', type: 'textarea' },
    { id: 'birthHistory', question: 'Birth history (only if patient is less than 10 years old)', type: 'textarea' },
    { id: 'priorImaging', question: 'Have you had a previous MRI of the brain or spine?', type: 'yesno' },
    { id: 'priorDiagnosis', question: 'Do you have a previously diagnosed headache disorder?', type: 'textarea' },
    { id: 'redFlags', question: 'Is this headache sudden/thunderclap onset, worse lying down, or associated with fever, vision loss, or pregnancy?', type: 'yesno' },
    { id: 'lifestyle', question: 'Tell us about your sleep, caffeine intake, screen time, and stress levels.', type: 'textarea' },
    { id: 'familyHistory', question: 'Does anyone in your family have a history of headaches or migraines?', type: 'textarea' },
    { id: 'goals', question: 'What are your goals for managing your headaches?', type: 'textarea' },
  ],
};
