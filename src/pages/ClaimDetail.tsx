import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useCaseId, useClaimLinks, useDocNames } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { scrollBehavior } from '../hooks/useMotionPref';
import { AIAssistedBadge } from '../components/domain/AIAssistedBadge';
import { ClaimGraph } from '../components/domain/EvidenceGraph';
import { EvidenceCard } from '../components/domain/EvidenceCard';
import { ScorePanel } from '../components/domain/ScorePanel';
import { SourceReference } from '../components/domain/SourceReference';
import { IdChip } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ClaimStatusBadge, CitationResultBadge, FindingStatusBadge } from '../components/ui/StatusBadge';
import { linksForClaim } from '../utils/selectors';
import type { LinkedEvidence } from '../utils/selectors';
import { paths } from '../utils/routes';

function Group({ title, items, focus }: { title: string; items: LinkedEvidence[]; focus: string | null }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <h3 className="mb-2.5 text-[13px] font-semibold">
        {title} <span className="ml-1 font-mono text-xs font-normal text-subtle">{items.length}</span>
      </h3>
      <div className="space-y-3">
        {items.map((l) => (
          <EvidenceCard key={l.relationship.relationshipId} evidence={l.evidence} relationship={l.relationship} highlighted={focus === l.evidence.evidenceId} />
        ))}
      </div>
    </section>
  );
}

export default function ClaimDetail() {
  const { claimId = '' } = useParams<{ claimId: string }>();
  const caseId = useCaseId();
  const claims = useCaseStore((s) => s.claims);
  const evidence = useCaseStore((s) => s.evidence);
  const relationships = useCaseStore((s) => s.relationships);
  const authorities = useCaseStore((s) => s.authorities);
  const citations = useCaseStore((s) => s.citations);
  const findings = useCaseStore((s) => s.findings);
  const hearing = useCaseStore((s) => s.hearing);
  const logEvent = useCaseStore((s) => s.logEvent);
  const names = useDocNames();
  const allLinks = useClaimLinks();
  const [focus, setFocus] = useState<string | null>(null);

  const idx = claims.findIndex((c) => c.claimId === claimId);
  const claim = idx >= 0 ? claims[idx] : undefined;
  useDocumentTitle(claim ? `${claim.claimId} ${claim.title}` : 'Claim');

  useEffect(() => {
    if (claim) logEvent({ action: 'Claim opened', objectType: 'claim', objectId: claim.claimId }, true);
  }, [claim, logEvent]);

  const links = useMemo(() => (claim ? allLinks.get(claim.claimId) ?? linksForClaim(claim.claimId, relationships, evidence) : null), [claim, allLinks, relationships, evidence]);

  if (!claim || !links) {
    return (
      <EmptyState
        title="Claim not found"
        body="This claim is not part of the loaded case."
        action={<Link to={paths.claims(caseId)} className="btn btn-secondary">Back to claims</Link>}
      />
    );
  }

  const prev = claims[idx - 1];
  const next = claims[idx + 1];
  const authoritiesHere = authorities.filter((a) => a.claimIds.includes(claim.claimId));
  const citationsHere = citations.filter((c) => c.claimId === claim.claimId);
  const findingsHere = findings.filter((f) => f.claimId === claim.claimId);
  const statements = hearing?.statements.filter((s) => claim.hearingStatementIds.includes(s.statementId)) ?? [];
  const onSelectEvidence = (id: string): void => {
    setFocus(id);
    document.getElementById(`ev-${id}`)?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link to={paths.claims(caseId)} className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-fg">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All claims
        </Link>
        <div className="flex gap-1.5">
          {prev ? (
            <Link to={paths.claim(caseId, prev.claimId)} className="btn btn-secondary btn-sm" aria-label={`Previous claim ${prev.claimId}`}>
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> {prev.claimId}
            </Link>
          ) : null}
          {next ? (
            <Link to={paths.claim(caseId, next.claimId)} className="btn btn-secondary btn-sm" aria-label={`Next claim ${next.claimId}`}>
              {next.claimId} <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>

      <header className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <IdChip>{claim.claimId}</IdChip>
          <ClaimStatusBadge status={claim.status} />
          <span className="text-xs text-muted">{claim.type}</span>
          <span className="ml-auto">
            <AIAssistedBadge sources={claim.source ? [names.get(claim.source.documentId) ?? claim.source.documentId] : []} />
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold">{claim.title}</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted">“{claim.text}”</p>
        {claim.originNote && <p className="mt-3 text-[13px] text-subtle">{claim.originNote}</p>}
      </header>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="card p-5" aria-labelledby="src-h">
            <h2 id="src-h" className="mb-3 text-[15px] font-semibold">Source</h2>
            <SourceReference loc={claim.source} refId={claim.claimId} showQuote />
          </section>

          <section className="card p-5" aria-labelledby="graph-h">
            <h2 id="graph-h" className="text-[15px] font-semibold">Evidence relationships</h2>
            <p className="mb-3 mt-0.5 text-xs text-subtle">Select an evidence node to jump to its details. Relationships are AI-assisted and require human verification.</p>
            {links.all.length === 0 ? (
              <EmptyState title="No linked evidence" body="No evidence has been linked to this claim. Human review is required." />
            ) : (
              <ClaimGraph claimId={claim.claimId} onSelectEvidence={onSelectEvidence} />
            )}
          </section>

          <div className="space-y-6">
            <Group title="Supporting evidence" items={links.supports} focus={focus} />
            <Group title="Potential conflicts" items={links.conflicts} focus={focus} />
            <Group title="Context" items={links.context} focus={focus} />
            <Group title="Uncertain" items={links.uncertain} focus={focus} />
          </div>

          {statements.length > 0 && (
            <section className="card p-5" aria-labelledby="hs-h">
              <h2 id="hs-h" className="mb-3 text-[15px] font-semibold">Hearing statements</h2>
              <ul className="space-y-2">
                {statements.map((s) => (
                  <li key={s.statementId}>
                    <Link to={paths.hearing(caseId, s.statementId)} className="block rounded-md border border-line p-3 hover:bg-s2/60">
                      <span className="font-mono text-xs text-muted">{s.time}</span>{' '}
                      <span className="text-xs font-semibold">{hearing?.speakers.find((x) => x.id === s.speaker)?.name}</span>
                      <span className="mt-1 block text-[13.5px]">“{s.text}”</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-5" aria-labelledby="auth-h">
            <h2 id="auth-h" className="text-[15px] font-semibold">Legal authorities</h2>
            {authoritiesHere.length === 0 && citationsHere.length === 0 ? (
              <p className="mt-2 text-[13px] text-muted">No authority is linked to this claim.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {authoritiesHere.map((a) => (
                  <li key={a.authorityId}>
                    <Link to={paths.authorities(caseId, a.authorityId)} className="block rounded-md border border-line p-3 hover:bg-s2/60">
                      <span className="text-[13.5px] font-medium">{a.label}: {a.caseName}</span>
                      <span className="mt-0.5 block text-xs text-muted">{a.court}, {a.year}. Potentially relevant, requires human legal verification.</span>
                    </Link>
                  </li>
                ))}
                {citationsHere.filter((c) => !c.authorityId).map((c) => (
                  <li key={c.citationId} className="rounded-md border border-line p-3">
                    <CitationResultBadge result={c.result} />
                    <p className="mt-1.5 text-[13px] text-muted">{c.note}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20" aria-label="Assessment and review">
          <section className="card p-5">
            <h2 className="section-label mb-4">System assessment</h2>
            <ScorePanel signals={claim.signals} />
          </section>
          <section className="card p-5">
            <h2 className="section-label mb-3">Findings for this claim</h2>
            {findingsHere.length === 0 ? (
              <p className="text-[13px] text-muted">No findings were flagged.</p>
            ) : (
              <ul className="space-y-2">
                {findingsHere.map((f) => (
                  <li key={f.findingId}>
                    <Link to={paths.review(caseId, f.findingId)} className="block rounded-md border border-line p-2.5 hover:bg-s2/60">
                      <span className="flex items-center justify-between gap-2">
                        <IdChip>{f.findingId}</IdChip>
                        <FindingStatusBadge status={f.status} />
                      </span>
                      <span className="mt-1.5 block text-[13px]">{f.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link to={paths.review(caseId)} className="btn btn-secondary btn-sm mt-3">
              Open review queue <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
