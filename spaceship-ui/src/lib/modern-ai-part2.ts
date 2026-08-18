import formulaLedger from '@/data/modern-ai-part2/formula-ledger.json';

export interface ModernAiPart2Formula {
  formulaId: string;
  pdfPage: number;
  sourceEquationNumber: string | null;
  sourceLatex: string;
  articleSection: string;
  status: 'source-exact' | 'source-suspect' | 'editorially-completed' | 'corrected-variant';
  display: 'inline' | 'display';
  note: string | null;
  corrects: string | null;
  sha256: string;
}

const formulaMap = new Map(
  (formulaLedger.formulas as ModernAiPart2Formula[]).map((formula) => [formula.formulaId, formula]),
);

export function part2Formula(id: string): ModernAiPart2Formula {
  const formula = formulaMap.get(id);
  if (!formula) throw new Error(`Unknown Modern AI Part II formula: ${id}`);
  return formula;
}
