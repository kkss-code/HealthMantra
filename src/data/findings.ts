import { AnswerMap, Finding } from '../types/questionnaire';

// Diagnostic-likelihood scoring is condition-specific logic, not admin-
// editable content, so it stays in code keyed by condition id rather than
// living in the backend-stored question schema. A condition with no entry
// here simply gets no computed findings section on its report.
const CALCULATORS: Record<string, (answers: AnswerMap) => Finding[]> = {
  headache: computeHeadacheFindings,
};

export function computeFindings(conditionId: string, answers: AnswerMap): Finding[] | undefined {
  const calculator = CALCULATORS[conditionId];
  return calculator ? calculator(answers) : undefined;
}

function computeHeadacheFindings(answers: AnswerMap): Finding[] {
  const laterality = String(answers.laterality ?? '').toLowerCase();
  const triggers = String(answers.triggers ?? '').toLowerCase();
  const findings: Finding[] = [];

  findings.push({ label: 'Migraine with Aura', percent: laterality.includes('one') || laterality.includes('right') || laterality.includes('left') ? 50 : 30 });
  findings.push({ label: 'Tension headache', percent: triggers.includes('yes') ? 33 : 45 });
  findings.push({ label: 'TAC (SUNCT/SUNA and PH)', percent: laterality.includes('every time') ? 67 : 20 });
  findings.push({ label: 'Trigeminal Neuralgia', percent: 40 });

  const redFlagAnswer = String(answers.redFlags ?? '').toLowerCase();
  if (redFlagAnswer.includes('yes')) {
    findings.push({ label: 'Red Flag Headache — recommend urgent review', percent: 100, flag: 'red' });
  }
  return findings;
}
