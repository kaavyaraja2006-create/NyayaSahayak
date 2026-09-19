import type { SourceLocation } from '../types';

export const DEFAULT_CASE_ID = 'NS-2026-001';

const qs = (params: Record<string, string | number | undefined>): string => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

/** Central place for every in-app URL so links stay consistent. */
export const paths = {
  overview: (c: string) => `/cases/${c}`,
  documents: (c: string) => `/cases/${c}/documents`,
  document: (c: string, d: string, o: { page?: number; para?: number; ref?: string } = {}) =>
    `/cases/${c}/documents/${d}${qs({ page: o.page, para: o.para, ref: o.ref })}`,
  hearing: (c: string, statement?: string) => `/cases/${c}/hearing${qs({ statement })}`,
  claims: (c: string) => `/cases/${c}/claims`,
  claim: (c: string, id: string) => `/cases/${c}/claims/${id}`,
  evidence: (c: string, focus?: string) => `/cases/${c}/evidence${qs({ focus })}`,
  timeline: (c: string) => `/cases/${c}/timeline`,
  graph: (c: string, focus?: string) => `/cases/${c}/graph${qs({ focus })}`,
  authorities: (c: string, focus?: string) => `/cases/${c}/authorities${qs({ focus })}`,
  conflicts: (c: string, compare?: string) => `/cases/${c}/conflicts${qs({ compare })}`,
  citations: (c: string, row?: string) => `/cases/${c}/citations${qs({ row })}`,
  review: (c: string, finding?: string) => `/cases/${c}/review${qs({ finding })}`,
  audit: (c: string) => `/cases/${c}/audit`,
  report: (c: string) => `/cases/${c}/report`,
};

/** Link that opens the exact page + paragraph of a document, highlighting the quoted passage. */
export function sourcePath(caseId: string, loc: SourceLocation, ref?: string): string {
  return paths.document(caseId, loc.documentId, { page: loc.page, para: loc.paragraph, ref });
}
