// Generates INSERT statements that seed `conditions` and `question_steps`
// with the same starter content the local (on-device) backend seeds itself
// with automatically. schema.sql does NOT include this data, so after
// running schema.sql, also run:
//   node supabase/generate-seed-content.mjs > /tmp/seed-content.sql
// and paste the output into the Supabase SQL editor. Without this step the
// app has no conditions and the patient Home screen is empty.

const medicationFields = [
  { key: 'name', label: 'Medication name', type: 'text', placeholder: 'e.g. Amlodipine' },
  { key: 'dose', label: 'Dose in mg', type: 'number', placeholder: 'e.g. 5' },
  { key: 'frequency', label: 'Times per day', type: 'number', placeholder: 'e.g. 1' },
  { key: 'notes', label: 'Notes for doctor', type: 'text', placeholder: 'Optional' },
];
const discontinuedMedicationFields = [
  { key: 'name', label: 'Medication name', type: 'text', placeholder: 'e.g. Metformin' },
  { key: 'dose', label: 'Dosage in mg', type: 'number', placeholder: 'e.g. 500' },
  { key: 'frequency', label: 'Times per day', type: 'number', placeholder: 'e.g. 2' },
  { key: 'reason', label: 'Why was it stopped?', type: 'text', placeholder: 'e.g. Side effects' },
];
const allergyFields = [
  { key: 'medication', label: 'Medication', type: 'text', placeholder: 'e.g. Penicillin' },
  { key: 'reaction', label: 'What happens when you take it?', type: 'text' },
];
const surgeryFields = [
  { key: 'name', label: 'Surgery name', type: 'text' },
  { key: 'date', label: 'Surgery date', type: 'date' },
];
const exerciseFields = [
  { key: 'name', label: 'Exercise name', type: 'text', placeholder: 'e.g. Walking' },
  { key: 'timesPerWeek', label: 'Times per week', type: 'number' },
  { key: 'duration', label: 'Average duration (min)', type: 'number' },
  { key: 'problems', label: 'Problems during exercise', type: 'text', placeholder: 'Optional' },
];

const conditions = [
  {
    id: 'blood-pressure', name: 'Blood Pressure', icon: '🩺', color: '#1AA6A6',
    tagline: 'How has your blood pressure been?',
    description: 'Tell us about your blood pressure history so we can prepare an accurate summary for your doctor, including your readings, medications and lifestyle.',
    steps: [
      { id: 'weight', question: 'Patient weight in Kg', type: 'number', maxLength: 3, placeholder: 'e.g. 72' },
      { id: 'diagnosisDate', question: 'When was your blood pressure diagnosis made?', type: 'date' },
      { id: 'checkFrequency', question: 'Approximately how often do you check your blood pressure?', type: 'select', options: ['Daily', 'A few times a week', 'Weekly', 'Monthly', 'Rarely'] },
      { id: 'medications', question: 'List all the medications you are currently taking for your blood pressure.', type: 'repeatable', repeatableFields: medicationFields, repeatableItemLabel: 'Medication' },
      { id: 'discontinuedMedications', question: 'Other medications you previously tried and stopped.', type: 'repeatable', repeatableFields: discontinuedMedicationFields, repeatableItemLabel: 'Medication' },
      { id: 'otherDisorders', question: 'Do you have any other medical disorders?', type: 'textarea' },
      { id: 'allergies', question: 'Do you have any medication allergies?', type: 'repeatable', repeatableFields: allergyFields, repeatableItemLabel: 'Allergy' },
      { id: 'surgicalHistory', question: 'Past surgical history', type: 'repeatable', repeatableFields: surgeryFields, repeatableItemLabel: 'Surgery' },
      { id: 'exercise', question: 'Describe your exercise regimen.', type: 'repeatable', repeatableFields: exerciseFields, repeatableItemLabel: 'Exercise' },
      { id: 'diet', question: 'Describe your diet over the course of a typical week.', type: 'textarea' },
      { id: 'smoking', question: 'Do you smoke? If yes, how much?', type: 'text' },
      { id: 'alcohol', question: 'How many alcoholic drinks do you consume on average per week?', type: 'text' },
      { id: 'sleep', question: 'Tell us about your sleep: usual bedtime, time to fall asleep, wake time, naps, and snoring.', type: 'textarea' },
      { id: 'goals', question: 'What are your goals for managing your blood pressure?', type: 'textarea' },
    ],
  },
  {
    id: 'diabetes', name: 'Diabetes', icon: '🩸', color: '#E0A82E',
    tagline: 'Let’s build your diabetes history',
    description: 'A short structured history about your diabetes — diagnosis, medications, labs and lifestyle — so your doctor has everything needed before your visit.',
    steps: [
      { id: 'weight', question: 'Patient weight in Kg', type: 'number', maxLength: 3, placeholder: 'e.g. 70' },
      { id: 'diagnosisDate', question: 'When was the diagnosis of diabetes made? (mm/yy)', type: 'date' },
      { id: 'checkFrequency', question: 'Approximately how often do you check your blood sugar?', type: 'select', options: ['Multiple times a day', 'Once a day', 'A few times a week', 'Weekly', 'Rarely'] },
      { id: 'labValues', question: 'What are your most recent lab values? (fasting / post-prandial / HbA1c)', type: 'textarea' },
      { id: 'medications', question: 'List all the medications you are currently taking.', type: 'repeatable', repeatableFields: medicationFields, repeatableItemLabel: 'Medication' },
      { id: 'discontinuedMedications', question: 'Other medications previously tried for this condition.', type: 'repeatable', repeatableFields: discontinuedMedicationFields, repeatableItemLabel: 'Medication' },
      { id: 'otherDisorders', question: 'Do you have any other medical disorders?', type: 'textarea' },
      { id: 'hospitalization', question: 'Have you had any previous hospitalizations related to diabetes?', type: 'textarea' },
      { id: 'allergies', question: 'Do you have any medication allergies?', type: 'repeatable', repeatableFields: allergyFields, repeatableItemLabel: 'Allergy' },
      { id: 'surgicalHistory', question: 'Past surgical history', type: 'repeatable', repeatableFields: surgeryFields, repeatableItemLabel: 'Surgery' },
      { id: 'exercise', question: 'Describe your exercise regimen.', type: 'repeatable', repeatableFields: exerciseFields, repeatableItemLabel: 'Exercise' },
      { id: 'diet', question: 'Describe your diet over the course of a typical week.', type: 'textarea' },
      { id: 'smoking', question: 'Do you smoke tobacco, cigars or marijuana? How much?', type: 'text' },
      { id: 'alcohol', question: 'How many alcoholic drinks do you consume on average?', type: 'text' },
      { id: 'sleep', question: 'Tell us about your sleep: usual bedtime, time to fall asleep, wake time, naps, and snoring.', type: 'textarea' },
      { id: 'routineCare', question: 'DM routine care — have you had an eye check, kidney check, and nerve check this year?', type: 'textarea' },
      { id: 'goals', question: 'What are your goals for managing your diabetes?', type: 'textarea' },
    ],
  },
  {
    id: 'dermatology', name: 'Dermatology', icon: '🧴', color: '#C96BA0',
    tagline: 'Tell us about your skin or hair concern',
    description: 'Describe your skin or hair condition, attach a photo if you can, and share any treatments you’ve already tried, so your dermatologist can review it quickly.',
    steps: [
      { id: 'name', question: 'Patient name', type: 'text' },
      { id: 'age', question: 'Patient age', type: 'number', maxLength: 3 },
      { id: 'weight', question: 'Patient weight in Kg', type: 'number', maxLength: 3 },
      { id: 'condition', question: 'What skin or hair condition are you suffering from?', type: 'text' },
      { id: 'photo', question: 'Attach photographs of the area involved', type: 'photo' },
      { id: 'description', question: 'Describe your skin or hair problem in a few sentences.', type: 'textarea' },
      { id: 'medications', question: 'List all the medications you are currently taking for this condition.', type: 'repeatable', repeatableFields: medicationFields, repeatableItemLabel: 'Medication' },
      { id: 'discontinuedMedications', question: 'Other medications and treatments previously tried for this condition.', type: 'repeatable', repeatableFields: discontinuedMedicationFields, repeatableItemLabel: 'Medication' },
      { id: 'otherDisorders', question: 'Do you have any other medical disorders?', type: 'textarea' },
      { id: 'allergies', question: 'Do you have any medication allergies?', type: 'repeatable', repeatableFields: allergyFields, repeatableItemLabel: 'Allergy' },
      { id: 'exercise', question: 'Describe your exercise regimen.', type: 'repeatable', repeatableFields: exerciseFields, repeatableItemLabel: 'Exercise' },
      { id: 'diet', question: 'Describe your diet over the course of a typical week.', type: 'textarea' },
      { id: 'alcohol', question: 'How many alcoholic drinks do you consume on average?', type: 'text' },
      { id: 'goals', question: 'What are your goals for your skin or hair?', type: 'textarea' },
    ],
  },
  {
    id: 'headache', name: 'Headache', icon: '🤕', color: '#E0A82E',
    tagline: 'How are you feeling today?',
    description: 'A structured headache history helps your neurologist tell migraine, tension, cluster and other headache types apart. It takes a few minutes and covers pattern, triggers, and red-flag symptoms.',
    steps: [
      { id: 'enteringFor', question: 'Who are you entering the headache data for?', type: 'select', options: ['Myself', 'My child', 'Somebody else'] },
      { id: 'gender', question: 'What is the gender of the patient?', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to answer'] },
      { id: 'lifetimeCount', question: 'How many headache episodes do you remember experiencing in your lifetime?', type: 'select', options: ['Less than 5', '5 to 20', '20+, multiple types', '20+, one type'] },
      { id: 'headacheType', question: 'Which of these best describes the type of headache you experience?', type: 'select', options: [
        'Throbbing pain, often one-sided, with nausea or light sensitivity (migraine-like)',
        'Dull, pressing pain on both sides, like a tight band (tension-like)',
        'Severe pain around one eye, comes in clusters, with tearing or a stuffy nose (cluster-like)',
        'Brief, electric-shock-like facial pain triggered by touch or chewing (trigeminal-like)',
      ] },
      { id: 'laterality', question: 'Which side of the head do you experience the pain on? (Laterality)', type: 'select', options: ['Right', 'Left', 'Either — changes', 'Both every time', 'Sometimes one, sometimes both'] },
      { id: 'triggers', question: 'Is the headache triggered by anything specific (light, stress, food, sleep)?', type: 'yesno' },
      { id: 'diet', question: 'How do you describe your diet?', type: 'select', options: ['Regular meals, balanced diet', 'Often skip meals', 'Frequent cravings/snacking', 'Irregular, varies a lot'] },
      { id: 'altitude', question: 'Was the patient exposed to high altitude or air travel recently?', type: 'textarea' },
      { id: 'birthHistory', question: 'Birth history (only if patient is less than 10 years old)', type: 'textarea' },
      { id: 'priorImaging', question: 'Have you had a previous MRI of the brain or spine?', type: 'yesno' },
      { id: 'priorDiagnosis', question: 'Do you have a previously diagnosed headache disorder?', type: 'textarea' },
      { id: 'redFlags', question: 'Is this headache sudden/thunderclap onset, worse lying down, or associated with fever, vision loss, or pregnancy?', type: 'yesno' },
      { id: 'lifestyle', question: 'Tell us about your sleep, caffeine intake, screen time, and stress levels.', type: 'textarea' },
      { id: 'familyHistory', question: 'Does anyone in your family have a history of headaches or migraines?', type: 'textarea' },
      { id: 'goals', question: 'What are your goals for managing your headaches?', type: 'textarea' },
    ],
  },
];

function sqlStr(s) {
  if (s === undefined || s === null) return 'null';
  return `'${String(s).replace(/'/g, "''")}'`;
}
function sqlJson(obj) {
  if (obj === undefined) return 'null';
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}
function sqlInt(n) {
  return n === undefined || n === null ? 'null' : String(n);
}

let out = [];
conditions.forEach((c, ci) => {
  out.push(
    `insert into conditions (id, name, icon, color, tagline, description, sort_order) values (${sqlStr(c.id)}, ${sqlStr(c.name)}, ${sqlStr(c.icon)}, ${sqlStr(c.color)}, ${sqlStr(c.tagline)}, ${sqlStr(c.description)}, ${ci}) on conflict (id) do nothing;`
  );
  c.steps.forEach((s, si) => {
    out.push(
      `insert into question_steps (id, condition_id, sort_order, question, helper_text, type, options, max_length, placeholder, repeatable_fields, repeatable_item_label) values (${sqlStr(c.id + '_' + s.id)}, ${sqlStr(c.id)}, ${si}, ${sqlStr(s.question)}, ${sqlStr(s.helperText)}, ${sqlStr(s.type)}, ${sqlJson(s.options)}, ${sqlInt(s.maxLength)}, ${sqlStr(s.placeholder)}, ${sqlJson(s.repeatableFields)}, ${sqlStr(s.repeatableItemLabel)}) on conflict (id) do nothing;`
    );
  });
});

console.log(out.join('\n'));
