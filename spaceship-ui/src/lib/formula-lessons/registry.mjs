import part1FormulaHashes from '../../../scripts/modern-ai-formula-hashes.json';
import part2FormulaLedger from '../../data/modern-ai-part2/formula-ledger.json';
import part3FormulaLedger from '../../data/modern-ai-part3/formula-ledger.json';
import { APPROVED_FORMULA_IDS, getApprovedLessonOverride, getNoVisualReason } from './overrides.mjs';
import { PART3_APPROVED_FORMULA_IDS, getPart3ApprovedLessonOverride } from './part3-overrides.mjs';

const DISPLAY_FORMULAS = [
  ...part1FormulaHashes.formulas.map((formula) => ({ formulaId: formula.id, part: 1, sourceStatus: 'source-exact' })),
  ...part2FormulaLedger.formulas.filter((formula) => formula.display === 'display').map((formula) => ({
    formulaId: formula.formulaId, part: 2, sourceStatus: formula.status, pdfPage: formula.pdfPage, articleSection: formula.articleSection,
  })),
  ...part3FormulaLedger.formulas.filter((formula) => formula.display === 'display').map((formula) => ({
    formulaId: formula.formulaId, part: 3, sourceStatus: formula.status, pdfPage: formula.pdfPage, articleSection: formula.articleSection,
  })),
];
const DISPLAY_FORMULA_BY_ID = new Map(DISPLAY_FORMULAS.map((formula) => [formula.formulaId, formula]));
const ALL_APPROVED_FORMULA_IDS = Object.freeze([...APPROVED_FORMULA_IDS, ...PART3_APPROVED_FORMULA_IDS]);

export function getFormulaLessonRef(formulaId) {
  const source = DISPLAY_FORMULA_BY_ID.get(formulaId); if (!source) return null;
  const override = getApprovedLessonOverride(formulaId) ?? getPart3ApprovedLessonOverride(formulaId);
  if (override) return { formulaId, ...override, source, reason: null };
  const reason = getNoVisualReason(formulaId, source);
  if (reason) return { formulaId, lessonId: null, focus: null, state: 'no-visual-with-reason', mode: 'none', renderer: null, reason, source };
  return { formulaId, lessonId: null, focus: null, state: 'unreviewed', mode: 'none', renderer: null, reason: null, source };
}
export function getFormulaLessonInventory(){return DISPLAY_FORMULAS.map((formula)=>getFormulaLessonRef(formula.formulaId));}
export function getApprovedFormulaLessonRefs(){return getFormulaLessonInventory().filter((entry)=>entry?.renderer);}
export const FORMULA_LESSON_COUNTS=Object.freeze({
 total:DISPLAY_FORMULAS.length,
 part1:DISPLAY_FORMULAS.filter((formula)=>formula.part===1).length,
 part2:DISPLAY_FORMULAS.filter((formula)=>formula.part===2).length,
 part3:DISPLAY_FORMULAS.filter((formula)=>formula.part===3).length,
 approved:ALL_APPROVED_FORMULA_IDS.length,
 noVisual:getFormulaLessonInventory().filter((entry)=>entry?.state==='no-visual-with-reason').length,
 unreviewed:getFormulaLessonInventory().filter((entry)=>entry?.state==='unreviewed').length,
});
