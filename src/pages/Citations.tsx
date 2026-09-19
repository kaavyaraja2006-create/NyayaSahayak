import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCaseStore } from '../store/caseStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CitationAuditTable, CitationChain } from '../components/domain/CitationAuditTable';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { CitationResultBadge } from '../components/ui/StatusBadge';
import type { CitationResult } from '../types';

export default function Citations() {
  useDocumentTitle('Citation audit');
  const citations = useCaseStore((s) => s.citations);
  const claims = useCaseStore((s) => s.claims);
  const authorities = useCaseStore((s) => s.authorities);
  const [sp, setSp] = useSearchParams();
  const rowParam = sp.get('row');
  const selected = citations.find((c) => c.citationId === rowParam) ?? citations[0] ?? null;

  const summary = useMemo(() => {
    const m = new Map<CitationResult, number>();
    citations.forEach((c) => m.set(c.result, (m.get(c.result) ?? 0) + 1));
    return Array.from(m.entries());
  }, [citations]);

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="Analysis"
        title="Citation audit"
        description="Checks each citation or legal proposition against retrieved authority text. This is a text comparison, not a legal opinion."
        meta={
          <div className="flex flex-wrap gap-2">
            {summary.map(([r, n]) => (
              <span key={r} className="inline-flex items-center gap-1.5">
                <CitationResultBadge result={r} /> <span className="font-mono text-xs text-muted">{n}</span>
              </span>
            ))}
          </div>
        }
      />
      {citations.length === 0 ? (
        <EmptyState title="No citations" body="No citations were found in the analysed material." />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <CitationAuditTable citations={citations} claims={claims} authorities={authorities} selectedId={selected?.citationId ?? null} onSelect={(id) => setSp({ row: id }, { replace: true })} />
          {selected && (
            <div className="lg:sticky lg:top-20">
              <CitationChain citation={selected} claim={claims.find((c) => c.claimId === selected.claimId)} authority={authorities.find((a) => a.authorityId === selected.authorityId)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
