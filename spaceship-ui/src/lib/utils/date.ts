export type PublicationTimeZone = 'UTC' | 'Asia/Seoul';

/** Keep the publication instant separate from its editorial calendar date. */
export function formatDate(date: Date, timeZone: PublicationTimeZone = 'UTC') {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone,
  }).format(date);
}

export function formatDateKey(date: Date, timeZone: PublicationTimeZone = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
