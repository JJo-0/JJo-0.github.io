import formulaLedger from '@/data/modern-ai-part5/formula-ledger.json';

export type ModernAiPart5FormulaStatus =
  | 'source-exact'
  | 'source-suspect'
  | 'editorially-completed'
  | 'corrected-variant';

export interface ModernAiPart5Formula {
  formulaId: string;
  pdfPage: number;
  sourceEquationNumber: string | null;
  sourceLatex: string;
  articleSection: string;
  status: ModernAiPart5FormulaStatus;
  display: 'inline' | 'display';
  note: string | null;
  corrects: string | null;
  sha256: string;
}

const formulas = formulaLedger.formulas as ModernAiPart5Formula[];
const formulaMap = new Map(formulas.map((formula) => [formula.formulaId, formula] as const));

export function part5Formula(id: string): ModernAiPart5Formula {
  const formula = formulaMap.get(id);
  if (!formula) throw new Error(`Unknown Modern AI Part V formula: ${id}`);
  return formula;
}
