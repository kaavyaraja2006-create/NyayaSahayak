import type { CaseBundle } from '../types';

export function download(filename: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const csvCell = (v: string | number): string => `"${String(v).replace(/"/g, '""')}"`;

export function buildCsv(b: CaseBundle): string {
  const docName = new Map(b.documents.map((d) => [d.documentId, d.name] as const));
  const evById = new Map(b.evidence.map((e) => [e.evidenceId, e] as const));
  const header = [
    'claim_id', 'claim_text', 'claim_status', 'claim_source', 'claim_page', 'claim_paragraph',
    'evidence_id', 'evidence_type', 'relationship', 'reason',
  ];
  const rows: string[] = [header.join(',')];
  b.claims.forEach((c) => {
    const rels = b.relationships.filter((r) => r.claimId === c.claimId);
    const src = c.source;
    const base = [
      c.claimId, c.text, c.status,
      src ? docName.get(src.documentId) ?? src.documentId : 'NO SOURCE IDENTIFIED',
      src ? src.page : '', src ? src.paragraph : '',
    ];
    if (rels.length === 0) rows.push([...base, '', '', '', ''].map(csvCell).join(','));
    rels.forEach((r) => {
      const ev = evById.get(r.evidenceId);
      rows.push([...base, r.evidenceId, ev?.type ?? '', r.type, r.reason].map(csvCell).join(','));
    });
  });
  return rows.join('\n');
}

export function buildJson(b: CaseBundle, pretty = true): string {
  const payload = {
    exportedAt: new Date().toISOString(),
    notice: 'Synthetic demonstration data. AI-assisted findings require human review. Not a legal determination.',
    case: b.currentCase,
    documents: b.documents.map(({ content: _content, ...rest }) => rest),
    claims: b.claims,
    evidence: b.evidence,
    relationships: b.relationships,
    authorities: b.authorities,
    citations: b.citations,
    findings: b.findings,
    reviews: b.reviews,
    auditLogs: b.auditLogs,
  };
  return JSON.stringify(payload, null, pretty ? 2 : 0);
}
