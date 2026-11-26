import selfImprovingSeries from '@/data/self-improving-series.json';

interface SeriesReference {
  id: string;
  order: number;
}

/** Keep the article sequence continuous while displaying the two source lectures separately. */
export function getSelfImprovingPart(series: SeriesReference | undefined) {
  if (series?.id !== selfImprovingSeries.id) return undefined;
  return selfImprovingSeries.parts.find((part) =>
    series.order >= part.firstOrder && (part.lastOrder === null || series.order <= part.lastOrder),
  );
}

export { selfImprovingSeries };
