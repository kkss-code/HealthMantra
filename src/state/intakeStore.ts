import { create } from 'zustand';
import { AnswerMap, AnswerValue, ConditionSchema } from '../types/questionnaire';
import { useContentStore } from './contentStore';

interface IntakeState {
  schema: ConditionSchema | null;
  stepIndex: number;
  answers: AnswerMap;
  start: (conditionId: string) => void;
  setAnswer: (stepId: string, value: AnswerValue) => void;
  next: () => boolean; // returns true if this was the last step
  back: () => boolean; // returns false if already at the first step
  reset: () => void;
  currentStep: () => ConditionSchema['steps'][number] | null;
  progress: () => number; // 0..1
}

export const useIntakeStore = create<IntakeState>((set, get) => ({
  schema: null,
  stepIndex: 0,
  answers: {},

  start: (conditionId) => {
    const schema = useContentStore.getState().getSchema(conditionId);
    set({ schema, stepIndex: 0, answers: {} });
  },

  setAnswer: (stepId, value) => {
    set((state) => ({ answers: { ...state.answers, [stepId]: value } }));
  },

  next: () => {
    const { schema, stepIndex } = get();
    if (!schema) return true;
    const isLast = stepIndex >= schema.steps.length - 1;
    if (!isLast) set({ stepIndex: stepIndex + 1 });
    return isLast;
  },

  back: () => {
    const { stepIndex } = get();
    if (stepIndex === 0) return false;
    set({ stepIndex: stepIndex - 1 });
    return true;
  },

  reset: () => set({ schema: null, stepIndex: 0, answers: {} }),

  currentStep: () => {
    const { schema, stepIndex } = get();
    return schema ? schema.steps[stepIndex] ?? null : null;
  },

  progress: () => {
    const { schema, stepIndex } = get();
    if (!schema || schema.steps.length === 0) return 0;
    return (stepIndex + 1) / schema.steps.length;
  },
}));
