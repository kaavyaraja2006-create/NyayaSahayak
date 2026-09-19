import type { ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Authority, CitationRecord, Claim } from '../../types';
import { CITATION_RESULT_META } from '../../utils/meta';
import { useCaseId, useDocNames } from '../../hooks/useCaseData';
import { paths } from '../../utils/routes';
import { cx } from '../../utils/cx';
import { IdChip } from '../ui/Badge';
import { CitationResultBadge } from '../ui/StatusBadge';
import { AIAssistedBadge } from './AIAssistedBadge';
import { SourceReference } from './SourceReference';

interface TableProps {
  citations: CitationRecord[];
  claims: Claim[];
  authorities: Authority[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CitationAuditTable({ citations, claims, authorities, selectedId, onSelect }: TableProps) {
  const names = useDocNames();
  const claimById = new Map(claims.map((c) => [c.claimId, c] as const));
  const authById = new Map(authorities.map((a) => [a.authorityId, a] as const));
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-line text-xs text-subtle">
            <th className="section-label px-4 py-2.5 font-semibold">Claim</th>
            <th className="section-label px-3 py-2.5 font-semibold">Citation</th>
            <th className="section-label px-3 py-2.5 font-semibold">Result</th>
            <th className="section-label px-3 py-2.5 font-semibold">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {citations.map((c) => {
            const a = c.authorityId ? authById.get(c.authorityId) : undefined;
            const active = c.citationId === selectedId;
            return (
              <tr
                key={c.citationId}
                onClick={() => onSelect(c.citationId)}
                aria-selected={active}
                className={cx('cursor-pointer transition-colors hover:bg-s2/70', active && 'bg-primary/5')}
              >
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onSelect(c.citationId)} className="text-left">
                    <span className="font-mono font-medium">{c.claimId}</span>
                    <span className="mt-0.5 line-clamp-1 block max-w-[220px] text-xs text-muted">{claimById.get(c.claimId)?.title}</span>
                  </button>
                </td>
                <td className="px-3 py-3">{a ? a.label : <span className="text-subtle">—</span>}</td>
                <td className="px-3 py-3">
                  <CitationResultBadge result={c.result} />
                </td>
                <td className="px-3 py-3 text-xs text-muted">
                  {c.citedAt ? (
                    <>
                      {names.get(c.citedAt.documentId) ?? c.citedAt.documentId}
                      <span className="meta ml-1.5">p.{c.citedAt.page}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Step({ tag, children }: { tag: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-surface p-3">
      <p className="section-label mb-1.5">{tag}</p>
      {children}
    </div>
  );
}

const Arrow = () => (
  <div className="flex justify-center py-1 text-subtle" aria-hidden>
    <ArrowDown className="h-4 w-4" />
  </div>
);

interface ChainProps {
  citation: CitationRecord;
  claim: Claim | undefined;
  authority: Authority | undefined;
}

/** Claim → Citation → Retrieved passage → Relevance assessment. */
export function CitationChain({ citation, claim, authority }: ChainProps) {
  const caseId = useCaseId();
  const meta = CITATION_RESULT_META[citation.result];
  return (
    <div className="card p-4" aria-label="Citation trace">
      <div className="mb-3 flex items-center justify-between gap-2">
        <IdChip>{citation.citationId}</IdChip>
        <AIAssistedBadge sources={authority ? [authority.label, authority.corpus] : []} />
      </div>
      <Step tag="Claim">
        {claim ? (
          <>
            <Link to={paths.claim(caseId, claim.claimId)} className="font-mono text-xs font-medium text-primary-ink hover:underline">
              {claim.claimId}
            </Link>
            <p className="mt-1 text-[13px]">“{claim.text}”</p>
          </>
        ) : (
          <p className="text-[13px] text-muted">Claim not found.</p>
        )}
      </Step>
      <Arrow />
      <Step tag="Citation">
        {authority ? (
          <>
            <p className="text-[13px] font-medium">{authority.label}: {authority.caseName}</p>
            <p className="mt-0.5 text-xs text-muted">{authority.court}, {authority.year}, <span className="font-mono">{authority.citation}</span></p>
          </>
        ) : (
          <p className="text-[13px] text-muted">No authority identified for this claim.</p>
        )}
        {citation.citedAt && <SourceReference loc={citation.citedAt} variant="inline" className="mt-2" buttonLabel="View cited location" />}
      </Step>
      <Arrow />
      <Step tag="Retrieved passage">
        {authority ? (
          <blockquote className="text-[13px] italic leading-relaxed">“{authority.passage}”</blockquote>
        ) : (
          <p className="text-[13px] text-muted">No passage retrieved.</p>
        )}
      </Step>
      <Arrow />
      <Step tag="Relevance assessment">
        <div className="flex flex-wrap items-center gap-2">
          <CitationResultBadge result={citation.result} />
          {authority?.relevance != null && <span className="font-mono text-[13px]">{authority.relevance} / 100</span>}
        </div>
        <p className={cx('mt-2 text-[13px]', meta.tone === 'neutral' ? 'text-muted' : '')}>{citation.note}</p>
        <p className="mt-2 text-[11.5px] text-subtle">Citation-to-text comparison only. Requires human legal verification.</p>
      </Step>
    </div>
  );
}
