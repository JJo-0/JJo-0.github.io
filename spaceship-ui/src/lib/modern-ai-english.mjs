import strings from '../data/modern-ai-english-strings.json';
export function englishFormulaText(value) {
  if (typeof value !== 'string' || !/[가-힣]/.test(value)) return value;
  if (!(value in strings)) throw new Error(`Missing English formula text: ${value}`);
  return strings[value];
}
export function englishFormulaTree(value) {
  if (typeof value === 'string') return englishFormulaText(value);
  if (Array.isArray(value)) return value.map(englishFormulaTree);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, key === 'tex' || key === 'sourceLatex' ? item : englishFormulaTree(item)]));
  return value;
}
