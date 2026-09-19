import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import type { ComparisonSide, Finding } from '../../types';
import { splitByQuote } from '../../utils/text';
import { SourceReference } from './SourceReference';
import { AIAssistedBadge } from './AIAssistedBadge';
import { Badge } from '../ui/Badge';

function Side({ tag, side, refId }: { tag: string; side: ComparisonSide; refId: string }) {
  const parts = splitByQuote(side.excerpt, side.location.quote);
  return (
    <section className="flex min-w-0 flex-col rounded-lg border border-line bg-surface p-4" aria-label={tag}>
      <p className="section-label">{tag}</p>
      <h3 className="mt-1 text-base font-semibold">{side.label}</h3>
      <blockquote className="mt-3 flex-1 rounded-md bg-s2/70 p-3 text-[13px] leading-relaxed">
        {parts ? (
          <>
            “{parts.before}
            <mark className="source-mark">{parts.match}</mark>
            {parts.after}”
          </>
        ) : (
          <>“{side.excerpt}”</>
        )}
      </blockquote>
      <dl className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 text-[13px]">
        <dt className="inline-flex items-center gap-1.5 text-subtle">
          <MapPin className="h-3.5 w-3.5" aria-hidden /> Location
        </dt>
        <dd className="font-medium">{side.value}</dd>
        <dt className="inline-flex items-center gap-1.5 text-subtle">
          <Clock className="h-3.5 w-3.5" aria-hidden /> Time
        </dt>
        <dd className="font-mono">{side.time}</dd>
      </dl>
      <SourceReference loc={side.location} refId={refId} className="mt-4" />
    </section>
  );
}

export function SourceComparison({ finding }: { finding: Finding }) {
  const cmp = finding.comparison;
  if (!cmp) return null;
  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <Side tag="Source A" side={cmp.a} refId={finding.evidenceIds[0] ?? finding.claimId} />
        <div className="flex items-center justify-center md:flex-col">
          <span className="h-px w-8 bg-line md:h-8 md:w-px" aria-hidden />
          <span className="mx-2 rounded-full border border-line bg-s2 px-2.5 py-1 font-mono text-[11px] font-medium text-muted md:my-2 md:mx-0">VS</span>
          <span className="h-px w-8 bg-line md:h-8 md:w-px" aria-hidden />
        </div>
        <Side tag="Source B" side={cmp.b} refId={finding.evidenceIds[1] ?? finding.claimId} />
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-conflict/40 bg-conflict/10 p-4 sm:flex-row sm:items-start">
        <AlertTriangle className="h-5 w-5 shrink-0 text-conflict-ink" aria-hidden />
        <div className="flex-1 text-[13px]">
          <p className="font-semibold text-conflict-ink">Potential inconsistency detected.</p>
          <p className="mt-1 text-muted">
            This is an AI-assisted assessment and requires human verification. It does not indicate that either source is inaccurate.
          </p>
          {finding.conflictType && <Badge tone="neutral" className="mt-2">Type: {finding.conflictType}</Badge>}
        </div>
        <AIAssistedBadge sources={[cmp.a.label, cmp.b.label]} />
      </div>
    </div>
  );
}
