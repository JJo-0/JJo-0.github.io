import part1FormulaHashes from '../../../scripts/modern-ai-formula-hashes.json';
import part2FormulaLedger from '../../data/modern-ai-part2/formula-ledger.json';
import {
  APPROVED_FORMULA_IDS,
  getApprovedLessonOverride,
} from './overrides.mjs';

const DISPLAY_FORMULAS = [
  ...part1FormulaHashes.formulas.map((formula) => ({
    formulaId: formula.id,
    part: 1,
    sourceStatus: 'source-exact',
  })),
  ...part2FormulaLedger.formulas
    .filter((formula) => formula.display === 'display')
    .map((formula) => ({
      formulaId: formula.formulaId,
      part: 2,
      sourceStatus: formula.status,
      pdfPage: formula.pdfPage,
      articleSection: formula.articleSection,
    })),
];

const DISPLAY_FORMULA_BY_ID = new Map(
  DISPLAY_FORMULAS.map((formula) => [formula.formulaId, formula]),
);

/**
 * Exact formula-ID registry used by the reader-facing lesson host.
 *
 * TeX heuristics may propose candidates in an offline authoring tool, but they
 * must never select a production renderer. A formula without an approved
 * override remains `unreviewed` and renders no visualization.
 */
export function getFormulaLessonRef(formulaId) {
  const source = DISPLAY_FORMULA_BY_ID.get(formulaId);
  if (!source) return null;

  const override = getApprovedLessonOverride(formulaId);
  if (override) {
    return {
      formulaId,
      ...override,
      source,
    };
  }

  return {
    formulaId,
    lessonId: null,
    focus: null,
    state: 'unreviewed',
    mode: 'none',
    renderer: null,
    source,
  };
}

export function getFormulaLessonInventory() {
  return DISPLAY_FORMULAS.map((formula) => getFormulaLessonRef(formula.formulaId));
}

export function getApprovedFormulaLessonRefs() {
  return getFormulaLessonInventory().filter((entry) => entry?.renderer);
}

export const FORMULA_LESSON_COUNTS = Object.freeze({
  total: DISPLAY_FORMULAS.length,
  part1: DISPLAY_FORMULAS.filter((formula) => formula.part === 1).length,
  part2: DISPLAY_FORMULAS.filter((formula) => formula.part === 2).length,
  approved: APPROVED_FORMULA_IDS.length,
});
