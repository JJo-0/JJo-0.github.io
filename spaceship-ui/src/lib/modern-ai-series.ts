import modernAiSeries from '@/data/modern-ai-series.json';

export interface SeriesReference {
  id: string;
  order: number;
}

export type ModernAiSeriesEntry = (typeof modernAiSeries.entries)[number];

const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const;

export { modernAiSeries };

export function getModernAiSeriesEntry(
  series: SeriesReference | undefined,
): ModernAiSeriesEntry | undefined {
  if (series?.id !== modernAiSeries.id) return undefined;
  return modernAiSeries.entries.find((entry) => entry.order === series.order);
}

export function resolveSeriesPostTitle(
  fallbackTitle: string,
  series: SeriesReference | undefined,
): string {
  const entry = getModernAiSeriesEntry(series);
  if (!entry) return fallbackTitle;

  const numeral = romanNumerals[entry.order] ?? String(entry.order);
  return `${modernAiSeries.title} ${numeral} — ${entry.title}`;
}

export function resolveSeriesPostDescription(
  fallbackDescription: string,
  series: SeriesReference | undefined,
): string {
  return getModernAiSeriesEntry(series)?.description ?? fallbackDescription;
}
