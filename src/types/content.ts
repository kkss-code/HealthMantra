import { ConditionSchema, FieldType, QuestionStep, RepeatableFieldDef } from './questionnaire';

// Admin-editable, backend-stored versions of the condition/question content
// that used to live as static TS literals in src/data/questionnaires. A
// StoredCondition + its ordered StoredQuestionStep rows assemble into a
// ConditionSchema at read time (see state/contentStore.ts), so the rest of
// the app (QuestionScreen, ReportScreen, ...) is unchanged.

export interface StoredCondition {
  id: string;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  description: string;
  order: number;
}

export interface StoredQuestionStep {
  id: string;
  conditionId: string;
  order: number;
  question: string;
  helperText?: string;
  type: FieldType | 'repeatable';
  options?: string[];
  maxLength?: number;
  placeholder?: string;
  repeatableFields?: RepeatableFieldDef[];
  repeatableItemLabel?: string;
}

export function assembleSchema(condition: StoredCondition, steps: StoredQuestionStep[]): ConditionSchema {
  const orderedSteps: QuestionStep[] = [...steps]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      id: s.id,
      question: s.question,
      helperText: s.helperText,
      type: s.type,
      options: s.options,
      maxLength: s.maxLength,
      placeholder: s.placeholder,
      repeatableFields: s.repeatableFields,
      repeatableItemLabel: s.repeatableItemLabel,
    }));

  return {
    id: condition.id,
    name: condition.name,
    icon: condition.icon,
    color: condition.color,
    tagline: condition.tagline,
    description: condition.description,
    steps: orderedSteps,
  };
}
