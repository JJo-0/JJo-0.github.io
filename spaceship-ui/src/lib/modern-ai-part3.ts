import formulaLedger from '@/data/modern-ai-part3/formula-ledger.json';

export type ModernAiPart3FormulaStatus =
  | 'source-exact'
  | 'source-suspect'
  | 'editorially-completed'
  | 'corrected-variant';

export interface ModernAiPart3Formula {
  formulaId: string;
  pdfPage: number;
  sourceEquationNumber: string | null;
  sourceLatex: string;
  articleSection: string;
  status: ModernAiPart3FormulaStatus;
  display: 'inline' | 'display';
  note: string | null;
  corrects: string | null;
  sha256: string;
}

const formulaMap = new Map(
  (formulaLedger.formulas as ModernAiPart3Formula[]).map((formula) => [
    formula.formulaId,
    formula,
  ]),
);

export function part3Formula(id: string): ModernAiPart3Formula {
  const formula = formulaMap.get(id);
  if (!formula) throw new Error(`Unknown Modern AI Part III formula: ${id}`);
  return formula;
}
