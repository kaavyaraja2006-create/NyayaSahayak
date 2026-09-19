import { Link } from 'react-router-dom';
import { AlertTriangle, GitCompare, ClipboardCheck } from 'lucide-react';
import type { Finding } from '../../types';
import { PRIORITY_META } from '../../utils/meta';
import { useCaseId } from '../../hooks/useCaseData';
import { paths } from '../../utils/routes';
import { cx } from '../../utils/cx';
import { Badge, IdChip } from '../ui/Badge';
import { FindingStatusBadge } from '../ui/StatusBadge';
import { AIAssistedBadge } from './AIAssistedBadge';

interface Props {
  finding: Finding;
  onCompare: (f: Finding) => void;
  active?: boolean;
}

export function ConflictCard({ finding, onCompare, active }: Props) {
  const caseId = useCaseId();
  const pr = PRIORITY_META[finding.priority];
  const sources = finding.comparison ? [finding.comparison.a.label, finding.comparison.b.label] : [];
  return (
    <article className={cx('card border-l-[3px] border-l-conflict p-4', active && 'ring-2 ring-primary/30')}>
      <header className="flex flex-wrap items-center gap-2">
        <Badge tone="conflict" Icon={AlertTriangle}>Potential conflict</Badge>
        <IdChip>{finding.findingId}</IdChip>
        <Link to={paths.claim(caseId, finding.claimId)} className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] hover:bg-s2">
          {finding.claimId}
        </Link>
        <Badge tone={pr.tone}>{pr.label}</Badge>
        <span className="ml-auto">
          <FindingStatusBadge status={finding.status} />
        </span>
      </header>
      <h3 className="mt-3 text-[15px] font-semibold">{finding.title}</h3>
      {finding.conflictType && (
        <p className="mt-1 text-[13px]">
          <span className="text-subtle">Type: </span>
          {finding.conflictType}
        </p>
      )}
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{finding.reason}</p>
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <AIAssistedBadge sources={sources} />
        <div className="flex gap-2">
          {finding.comparison && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => onCompare(finding)}>
              <GitCompare className="h-3.5 w-3.5" aria-hidden /> Compare Sources
            </button>
          )}
          <Link to={paths.review(caseId, finding.findingId)} className="btn btn-primary btn-sm">
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden /> Review Finding
          </Link>
        </div>
      </footer>
    </article>
  );
}
