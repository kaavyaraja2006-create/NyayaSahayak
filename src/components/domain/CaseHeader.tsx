import { Link } from 'react-router-dom';
import { FlaskConical, Play } from 'lucide-react';
import type { Case } from '../../types';
import { fmtDateTime } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { useUiStore } from '../../store/uiStore';
import { useCaseStore } from '../../store/caseStore';
import { paths } from '../../utils/routes';

interface Props {
  data: Case;
  counts: { documents: number; hearings: number; claims: number; evidence: number };
}

/** Case identity block — keeps the case, its synthetic status and review state visible. */
export function CaseHeader({ data, counts }: Props) {
  const setAnalysisOpen = useUiStore((s) => s.setAnalysisOpen);
  const pending = useCaseStore((s) => s.findings.filter((f) => f.status === 'open' || f.status === 'needs_verification').length);
  return (
    <section className="card overflow-hidden" aria-label="Case identity">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between lg:p-6">
        <div className="min-w-0">
          <p className="section-label mb-2">Criminal case, review workspace</p>
          <h1 className="text-2xl font-semibold uppercase tracking-tight sm:text-[28px]">{data.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-muted">
            <span className="font-mono">{data.caseId}</span>
            <Badge tone="primary" Icon={FlaskConical} className="uppercase tracking-wide">
              Synthetic demonstration
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-warning" aria-hidden />
              {data.status}
            </span>
            <span className="text-xs text-subtle">Last analyzed {fmtDateTime(data.lastAnalyzed)}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-muted">{data.summary}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setAnalysisOpen(true)}>
            <Play className="h-4 w-4" aria-hidden /> Analyze Materials
          </button>
          <Link to={paths.review(data.caseId)} className="btn btn-secondary btn-lg">
            Open Review Queue
            <span className="rounded bg-warning/15 px-1.5 font-mono text-xs text-warning-ink">{pending}</span>
          </Link>
        </div>
      </div>
      <dl className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
        {[
          ['Documents', counts.documents],
          ['Hearing', counts.hearings],
          ['Claims', counts.claims],
          ['Evidence items', counts.evidence],
        ].map(([label, n]) => (
          <div key={label} className="border-r border-line px-5 py-3 last:border-r-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r">
            <dt className="text-xs text-subtle">{label}</dt>
            <dd className="font-mono text-lg">{n}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
