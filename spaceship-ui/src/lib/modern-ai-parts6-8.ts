import part6Ledger from '@/data/modern-ai-part6/formula-ledger.json';
import part7Ledger from '@/data/modern-ai-part7/formula-ledger.json';
import part8Ledger from '@/data/modern-ai-part8/formula-ledger.json';

export interface AdvancedFormula {
  id: string;
  page: number;
  title: string;
  tex: string;
  hash: string;
}

const ledgers: Record<6 | 7 | 8, AdvancedFormula[]> = {
  6: part6Ledger.formulas,
  7: part7Ledger.formulas,
  8: part8Ledger.formulas,
};

export function modernAiFormula(part: 6 | 7 | 8, id: string): AdvancedFormula {
  const formula = ledgers[part].find((record) => record.id === id);
  if (!formula) throw new Error(`Unknown Modern AI Part ${part} formula: ${id}`);
  return formula;
}
