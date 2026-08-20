import { getFormulaLessonSpec as getBaseFormulaLessonSpec, getAllFormulaLessonSpecs as getAllBaseFormulaLessonSpecs } from './specs.mjs';
import { getExtendedFormulaLessonSpec, getAllExtendedFormulaLessonSpecs } from './extended-specs.mjs';

export function getFormulaLessonSpec(lessonId) {
  return getExtendedFormulaLessonSpec(lessonId) ?? getBaseFormulaLessonSpec(lessonId);
}
export function getAllFormulaLessonSpecs() {
  return [...getAllBaseFormulaLessonSpecs(), ...getAllExtendedFormulaLessonSpecs()];
}
