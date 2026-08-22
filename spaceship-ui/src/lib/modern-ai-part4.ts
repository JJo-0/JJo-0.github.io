import formulaLedger from '@/data/modern-ai-part4/formula-ledger.json';
import reviewCorrections from '@/data/modern-ai-part4/review-corrections.json';

export type ModernAiPart4FormulaStatus =
  | 'source-exact'
  | 'source-suspect'
  | 'editorially-completed'
  | 'corrected-variant';

export interface ModernAiPart4Formula {
  formulaId: string;
  pdfPage: number;
  sourceEquationNumber: string | null;
  sourceLatex: string;
  articleSection: string;
  status: ModernAiPart4FormulaStatus;
  display: 'inline' | 'display';
  note: string | null;
  corrects: string | null;
  sha256: string;
}

type ReviewStatusOverride = {
  status: 'source-suspect';
  note: string;
};

if (formulaLedger.source.sha256 !== reviewCorrections.sourceSha256) {
  throw new Error('Modern AI Part IV review overlay is bound to a different source PDF');
}

const statusOverrides = reviewCorrections.statusOverrides as Record<string, ReviewStatusOverride>;
const frozenFormulas = formulaLedger.formulas as ModernAiPart4Formula[];
const effectiveSourceFormulas = frozenFormulas.map((formula) => {
  const override = statusOverrides[formula.formulaId];
  return override
    ? { ...formula, status: override.status, note: override.note }
    : formula;
});

export const part4ReviewCorrections = Object.freeze(
  (reviewCorrections.corrections as ModernAiPart4Formula[]).map((formula) => ({ ...formula })),
);

const formulaMap = new Map<string, ModernAiPart4Formula>([
  ...effectiveSourceFormulas.map((formula) => [formula.formulaId, formula] as const),
  ...part4ReviewCorrections.map((formula) => [formula.formulaId, formula] as const),
]);

export function part4Formula(id: string): ModernAiPart4Formula {
  const formula = formulaMap.get(id);
  if (!formula) throw new Error(`Unknown Modern AI Part IV formula: ${id}`);
  return formula;
}
