import { create } from 'zustand';
import { backend } from '../services/backend';
import { assembleSchema, StoredCondition, StoredQuestionStep } from '../types/content';
import { ConditionSchema } from '../types/questionnaire';

interface ContentState {
  conditions: StoredCondition[];
  stepsByCondition: Record<string, StoredQuestionStep[]>;
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  getSchema: (conditionId: string) => ConditionSchema | null;
}

export const useContentStore = create<ContentState>((set, get) => ({
  conditions: [],
  stepsByCondition: {},
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    const conditions = await backend.listConditions();
    const stepsEntries = await Promise.all(conditions.map(async (c) => [c.id, await backend.listQuestionSteps(c.id)] as const));
    set({
      conditions,
      stepsByCondition: Object.fromEntries(stepsEntries),
      loaded: true,
      loading: false,
    });
  },

  getSchema: (conditionId) => {
    const { conditions, stepsByCondition } = get();
    const condition = conditions.find((c) => c.id === conditionId);
    if (!condition) return null;
    return assembleSchema(condition, stepsByCondition[conditionId] ?? []);
  },
}));
