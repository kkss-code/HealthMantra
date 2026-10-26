import { ConditionSchema } from '../../types/questionnaire';
import { bloodPressure } from './bloodPressure';
import { diabetes } from './diabetes';
import { dermatology } from './dermatology';
import { headache } from './headache';

export const conditionSchemas: ConditionSchema[] = [headache, bloodPressure, diabetes, dermatology];

export function getConditionSchema(id: string): ConditionSchema | undefined {
  return conditionSchemas.find((c) => c.id === id);
}
