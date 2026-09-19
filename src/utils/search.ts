import type { Authority, CaseDocument, Claim, Evidence, Finding, Hearing, Relationship } from '../types';

export type SearchGroup = 'Claims' | 'Evidence' | 'Documents' | 'Hearing' | 'Authorities' | 'Findings';

export interface SearchResult {
  key: string;
  group: SearchGroup;
  id: string;
  title: string;
  subtitle: string;
  to: string;
  haystack: string;
}

export const SEARCH_GROUP_ORDER: SearchGroup[] = ['Claims', 'Evidence', 'Documents', 'Hearing', 'Authorities', 'Findings'];

interface IndexInput {
  caseId: string;
  claims: Claim[];
  evidence: Evidence[];
  documents: CaseDocument[];
  hearing: Hearing;
  authorities: Authority[];
  findings: Finding[];
  relationships: Relationship[];
}

export function buildSearchIndex(i: IndexInput): SearchResult[] {
  const base = `/cases/${i.caseId}`;
  const evById = new Map(i.evidence.map((e) => [e.evidenceId, e] as const));
  const docName = new Map(i.documents.map((d) => [d.documentId, d.name] as const));
  const out: SearchResult[] = [];

  i.claims.forEach((c) => {
    const linked = i.relationships
      .filter((r) => r.claimId === c.claimId)
      .map((r) => evById.get(r.evidenceId))
      .filter((e): e is Evidence => Boolean(e))
      .map((e) => `${e.type} ${e.description}`)
      .join(' ');
    out.push({
      key: `claim-${c.claimId}`,
      group: 'Claims',
      id: c.claimId,
      title: c.title,
      subtitle: c.text,
      to: `${base}/claims/${c.claimId}`,
      haystack: `${c.claimId} ${c.title} ${c.text} ${c.type} ${linked}`.toLowerCase(),
    });
  });

  i.evidence.forEach((e) => {
    out.push({
      key: `ev-${e.evidenceId}`,
      group: 'Evidence',
      id: e.evidenceId,
      title: e.type,
      subtitle: e.description,
      to: `${base}/evidence?focus=${e.evidenceId}`,
      haystack: `${e.evidenceId} ${e.type} ${e.description} ${docName.get(e.source.documentId) ?? ''}`.toLowerCase(),
    });
  });

  i.documents.forEach((d) => {
    out.push({
      key: `doc-${d.documentId}`,
      group: 'Documents',
      id: d.documentId,
      title: d.name,
      subtitle: `${d.type} · ${d.pages} pages`,
      to: `${base}/documents/${d.documentId}`,
      haystack: `${d.documentId} ${d.name} ${d.type} ${d.source} ${d.category} ${d.content.map((p) => p.paragraphs.map((q) => q.text).join(' ')).join(' ')}`.toLowerCase(),
    });
  });

  i.hearing.statements.forEach((s) => {
    const who = i.hearing.speakers.find((x) => x.id === s.speaker)?.name ?? s.speaker;
    out.push({
      key: `hs-${s.statementId}`,
      group: 'Hearing',
      id: s.time,
      title: `${s.time} — ${s.marker?.kind === 'evidence' && /phone/i.test(s.text) ? 'phone location discussion' : who}`,
      subtitle: s.text,
      to: `${base}/hearing?statement=${s.statementId}`,
      haystack: `${s.time} ${who} ${s.text} ${s.statementId}`.toLowerCase(),
    });
  });

  i.authorities.forEach((a) => {
    out.push({
      key: `auth-${a.authorityId}`,
      group: 'Authorities',
      id: a.label,
      title: a.caseName,
      subtitle: `${a.court} · ${a.year} · ${a.citation}`,
      to: `${base}/authorities?focus=${a.authorityId}`,
      haystack: `${a.label} ${a.caseName} ${a.citation} ${a.passage}`.toLowerCase(),
    });
  });

  i.findings.forEach((f) => {
    out.push({
      key: `f-${f.findingId}`,
      group: 'Findings',
      id: f.findingId,
      title: `${f.category}: ${f.title}`,
      subtitle: f.reason,
      to: `${base}/review?finding=${f.findingId}`,
      haystack: `${f.findingId} ${f.category} ${f.title} ${f.reason} ${f.claimId}`.toLowerCase(),
    });
  });

  return out;
}

export function runSearch(index: SearchResult[], query: string, perGroup = 4): Map<SearchGroup, SearchResult[]> {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const grouped = new Map<SearchGroup, SearchResult[]>();
  if (tokens.length === 0) return grouped;

  const scored = index
    .map((r) => {
      if (!tokens.every((t) => r.haystack.includes(t))) return null;
      const idHit = tokens.some((t) => r.id.toLowerCase().includes(t)) ? 2 : 0;
      const titleHit = tokens.every((t) => r.title.toLowerCase().includes(t)) ? 1 : 0;
      return { r, score: idHit + titleHit };
    })
    .filter((x): x is { r: SearchResult; score: number } => x !== null)
    .sort((a, b) => b.score - a.score);

  scored.forEach(({ r }) => {
    const list = grouped.get(r.group) ?? [];
    if (list.length < perGroup) list.push(r);
    grouped.set(r.group, list);
  });
  return grouped;
}
