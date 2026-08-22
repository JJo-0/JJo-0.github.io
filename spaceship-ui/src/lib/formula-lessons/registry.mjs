import part1FormulaHashes from '../../../scripts/modern-ai-formula-hashes.json';
import part2FormulaLedger from '../../data/modern-ai-part2/formula-ledger.json';
import part3FormulaLedger from '../../data/modern-ai-part3/formula-ledger.json';
import part4FormulaLedger from '../../data/modern-ai-part4/formula-ledger.json';
import part5FormulaLedger from '../../data/modern-ai-part5/formula-ledger.json';
import part4ReviewCorrections from '../../data/modern-ai-part4/review-corrections.json';
import { APPROVED_FORMULA_IDS, getApprovedLessonOverride, getNoVisualReason } from './overrides.mjs';
import { PART3_APPROVED_FORMULA_IDS, getPart3ApprovedLessonOverride } from './part3-overrides.mjs';
import { PART4_APPROVED_FORMULA_IDS, getPart4ApprovedLessonOverride, getPart4NoVisualReason } from './part4-overrides.mjs';

const part4StatusOverrides = part4ReviewCorrections.statusOverrides ?? {};
const DISPLAY_FORMULAS = [
  ...part1FormulaHashes.formulas.map((formula) => ({ formulaId: formula.id, part: 1, sourceStatus: 'source-exact' })),
  ...part2FormulaLedger.formulas.filter((formula) => formula.display === 'display').map((formula) => ({
    formulaId: formula.formulaId, part: 2, sourceStatus: formula.status, pdfPage: formula.pdfPage, articleSection: formula.articleSection,
  })),
  ...part3FormulaLedger.formulas.filter((formula) => formula.display === 'display').map((formula) => ({
    formulaId: formula.formulaId, part: 3, sourceStatus: formula.status, pdfPage: formula.pdfPage, articleSection: formula.articleSection,
  })),
  ...part4FormulaLedger.formulas.filter((formula) => formula.display === 'display').map((formula) => ({
    formulaId: formula.formulaId,
    part: 4,
    sourceStatus: part4StatusOverrides[formula.formulaId]?.status ?? formula.status,
    pdfPage: formula.pdfPage,
    articleSection: formula.articleSection,
  })),
  ...part4ReviewCorrections.corrections.filter((formula) => formula.display === 'display').map((formula) => ({
    formulaId: formula.formulaId,
    part: 4,
    sourceStatus: formula.status,
    pdfPage: formula.pdfPage,
    articleSection: formula.articleSection,
  })),
  ...part5FormulaLedger.formulas.filter((formula) => formula.display === 'display').map((formula) => ({
    formulaId: formula.formulaId,
    part: 5,
    sourceStatus: formula.status,
    pdfPage: formula.pdfPage,
    articleSection: formula.articleSection,
  })),
];
const DISPLAY_FORMULA_BY_ID = new Map(DISPLAY_FORMULAS.map((formula) => [formula.formulaId, formula]));
const ALL_APPROVED_FORMULA_IDS = Object.freeze([...APPROVED_FORMULA_IDS, ...PART3_APPROVED_FORMULA_IDS, ...PART4_APPROVED_FORMULA_IDS]);

export function getFormulaLessonRef(formulaId) {
  const source = DISPLAY_FORMULA_BY_ID.get(formulaId); if (!source) return null;
  const override = getApprovedLessonOverride(formulaId) ?? getPart3ApprovedLessonOverride(formulaId) ?? getPart4ApprovedLessonOverride(formulaId);
  if (override) return { formulaId, ...override, source, reason: null };
  const reason = getPart4NoVisualReason(formulaId) ?? getNoVisualReason(formulaId, source);
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
 part4:DISPLAY_FORMULAS.filter((formula)=>formula.part===4).length,
 part5:DISPLAY_FORMULAS.filter((formula)=>formula.part===5).length,
 approved:ALL_APPROVED_FORMULA_IDS.length,
 noVisual:getFormulaLessonInventory().filter((entry)=>entry?.state==='no-visual-with-reason').length,
 unreviewed:getFormulaLessonInventory().filter((entry)=>entry?.state==='unreviewed').length,
});
