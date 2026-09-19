import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, GitCompare, Network, X } from 'lucide-react';
import { useCaseStore } from '../../store/caseStore';
import { useCaseId } from '../../hooks/useCaseData';
import { linksForClaim, linksForEvidence } from '../../utils/selectors';
import { paths } from '../../utils/routes';
import { IdChip } from '../ui/Badge';
import { ClaimStatusBadge, RelationshipBadge } from '../ui/StatusBadge';
import { AIAssistedBadge } from './AIAssistedBadge';
import { ScorePanel } from './ScorePanel';
import { SourceReference } from './SourceReference';

export interface GraphSelection {
  type: 'claim' | 'evidence' | 'document' | 'authority' | 'relationship';
  id: string;
}

interface Props {
  selection: GraphSelection | null;
  onFocusClaim: (claimId: string) => void;
  onClear: () => void;
}

export function GraphInspector({ selection, onFocusClaim, onClear }: Props) {
  const caseId = useCaseId();
  const claims = useCaseStore((s) => s.claims);
  const evidence = useCaseStore((s) => s.evidence);
  const relationships = useCaseStore((s) => s.relationships);
  const documents = useCaseStore((s) => s.documents);
  const authorities = useCaseStore((s) => s.authorities);
  const findings = useCaseStore((s) => s.findings);

  const shell = (title: string, children: ReactNode) => (
    <aside className="card flex max-h-full flex-col overflow-hidden" aria-label="Graph inspector">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <h2 className="section-label">{title}</h2>
        {selection && (
          <button type="button" className="btn-icon h-7 w-7" onClick={onClear} aria-label="Clear selection">
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
      <div className="scroll-thin space-y-4 overflow-y-auto p-4">{children}</div>
    </aside>
  );

  if (!selection) {
    return shell(
      'Inspector',
      <div className="text-[13px] text-muted">
        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-s2">
          <Network className="h-4 w-4" aria-hidden />
        </span>
        Select a claim, evidence item, source document, authority or relationship line to inspect it. Connected items stay highlighted while the rest fade.
      </div>,
    );
  }

  if (selection.type === 'claim') {
    const c = claims.find((x) => x.claimId === selection.id);
    if (!c) return shell('Claim', <p className="text-sm text-muted">Claim not found.</p>);
    const links = linksForClaim(c.claimId, relationships, evidence);
    return shell(
      'Claim',
      <>
        <div className="flex flex-wrap items-center gap-2">
          <IdChip>{c.claimId}</IdChip>
          <ClaimStatusBadge status={c.status} />
        </div>
        <div>
          <p className="text-sm font-semibold">{c.title}</p>
          <p className="mt-1 text-[13px] text-muted">“{c.text}”</p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-center text-xs">
          {[
            ['Supports', links.supports.length],
            ['Conflicts', links.conflicts.length],
            ['Context', links.context.length],
            ['Uncertain', links.uncertain.length],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-line bg-s2/60 py-1.5">
              <dd className="font-mono text-base">{v}</dd>
              <dt className="text-subtle">{k}</dt>
            </div>
          ))}
        </dl>
        <ScorePanel signals={c.signals} />
        <SourceReference loc={c.source} refId={c.claimId} showQuote />
        <AIAssistedBadge sources={c.source ? [c.source.documentId] : []} />
        <div className="flex flex-wrap gap-2">
          <Link to={paths.claim(caseId, c.claimId)} className="btn btn-primary btn-sm">
            Open claim <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onFocusClaim(c.claimId)}>
            Focus on this claim
          </button>
        </div>
      </>,
    );
  }

  if (selection.type === 'evidence') {
    const e = evidence.find((x) => x.evidenceId === selection.id);
    if (!e) return shell('Evidence', <p className="text-sm text-muted">Evidence not found.</p>);
    const linked = linksForEvidence(e.evidenceId, relationships, claims);
    return shell(
      'Evidence',
      <>
        <div className="flex items-center gap-2">
          <IdChip>{e.evidenceId}</IdChip>
          <span className="text-sm font-semibold">{e.type}</span>
        </div>
        <p className="text-[13px] leading-relaxed">{e.description}</p>
        <SourceReference loc={e.source} refId={e.evidenceId} showQuote />
        <div>
          <p className="section-label mb-1.5">Linked claims</p>
          <ul className="space-y-1.5">
            {linked.map((l) => (
              <li key={l.relationship.relationshipId} className="flex items-center justify-between gap-2 rounded-md border border-line px-2.5 py-2">
                <Link to={paths.claim(caseId, l.claim.claimId)} className="min-w-0 text-[13px] hover:underline">
                  <span className="font-mono text-xs font-medium">{l.claim.claimId}</span> <span className="text-muted">{l.claim.title}</span>
                </Link>
                <RelationshipBadge type={l.relationship.type} />
              </li>
            ))}
          </ul>
        </div>
        <Link to={paths.evidence(caseId, e.evidenceId)} className="btn btn-secondary btn-sm">
          Open in evidence explorer <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </>,
    );
  }

  if (selection.type === 'document') {
    const d = documents.find((x) => x.documentId === selection.id);
    if (!d) return shell('Source document', <p className="text-sm text-muted">Document not found.</p>);
    const claimsHere = claims.filter((c) => c.source?.documentId === d.documentId).length;
    const evHere = evidence.filter((x) => x.source.documentId === d.documentId).length;
    return shell(
      'Source document',
      <>
        <div className="flex items-center gap-2">
          <IdChip>{d.documentId}</IdChip>
          <span className="text-sm font-semibold">{d.name}</span>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
          <dt className="text-subtle">Type</dt>
          <dd>{d.type}</dd>
          <dt className="text-subtle">Category</dt>
          <dd>{d.category}</dd>
          <dt className="text-subtle">Pages</dt>
          <dd className="font-mono">{d.pages}</dd>
          <dt className="text-subtle">Claims from here</dt>
          <dd className="font-mono">{claimsHere}</dd>
          <dt className="text-subtle">Evidence from here</dt>
          <dd className="font-mono">{evHere}</dd>
        </dl>
        <Link to={paths.document(caseId, d.documentId)} className="btn btn-primary btn-sm">
          Open document <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </>,
    );
  }

  if (selection.type === 'authority') {
    const a = authorities.find((x) => x.authorityId === selection.id);
    if (!a) return shell('Authority', <p className="text-sm text-muted">Authority not found.</p>);
    return shell(
      'Authority',
      <>
        <div className="flex items-center gap-2">
          <IdChip>{a.authorityId}</IdChip>
          <span className="text-sm font-semibold">{a.label}</span>
        </div>
        <p className="text-[13px]">{a.caseName}</p>
        <p className="text-xs text-muted">
          {a.court}, {a.year}, <span className="font-mono">{a.citation}</span>
        </p>
        <blockquote className="rounded-md border-l-2 border-primary/60 bg-s2/70 p-3 text-[13px] italic">“{a.passage}”</blockquote>
        <p className="text-xs text-subtle">Potentially relevant. Requires human legal verification.</p>
        <Link to={paths.authorities(caseId, a.authorityId)} className="btn btn-secondary btn-sm">
          Open authority <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </>,
    );
  }

  const rel = relationships.find((r) => r.relationshipId === selection.id);
  if (!rel) return shell('Relationship', <p className="text-sm text-muted">Relationship not found.</p>);
  const claim = claims.find((c) => c.claimId === rel.claimId);
  const ev = evidence.find((e) => e.evidenceId === rel.evidenceId);
  const finding = findings.find((f) => f.relationshipIds.includes(rel.relationshipId) && f.comparison);
  return shell(
    'Relationship',
    <>
      <div className="flex flex-wrap items-center gap-2">
        <IdChip>{rel.relationshipId}</IdChip>
        <RelationshipBadge type={rel.type} />
      </div>
      <div className="space-y-2 text-[13px]">
        <p>
          <span className="font-mono text-xs font-medium">{rel.claimId}</span> <span className="text-muted">{claim?.title}</span>
        </p>
        <p className="text-subtle">is linked to</p>
        <p>
          <span className="font-mono text-xs font-medium">{rel.evidenceId}</span> <span className="text-muted">{ev?.type}</span>
        </p>
      </div>
      <div className="space-y-1.5 rounded-md bg-s2/70 p-3 text-[13px]">
        <p>
          <span className="text-subtle">Why linked: </span>
          {rel.reason}
        </p>
        <p>
          <span className="text-subtle">Assessment: </span>
          {rel.assessment}
        </p>
      </div>
      {ev && <SourceReference loc={ev.source} refId={ev.evidenceId} showQuote />}
      <AIAssistedBadge sources={ev ? [ev.type] : []} />
      {finding && (
        <Link to={paths.conflicts(caseId, finding.findingId)} className="btn btn-secondary btn-sm">
          <GitCompare className="h-3.5 w-3.5" aria-hidden /> Compare sources
        </Link>
      )}
    </>,
  );
}
