export interface QuoteSplit {
  before: string;
  match: string;
  after: string;
}

/** Splits `text` around the first occurrence of `quote` (case-insensitive fallback). Null when absent. */
export function splitByQuote(text: string, quote: string | undefined): QuoteSplit | null {
  if (!quote) return null;
  let i = text.indexOf(quote);
  if (i < 0) i = text.toLowerCase().indexOf(quote.toLowerCase());
  if (i < 0) return null;
  return { before: text.slice(0, i), match: text.slice(i, i + quote.length), after: text.slice(i + quote.length) };
}

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

export const truncate = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
