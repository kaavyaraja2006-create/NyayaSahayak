import { Link } from 'react-router-dom';
import { ArrowRight, Cog, Sparkles, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AuditLog } from '../../types';
import { fmtDate, fmtTime, dayKey } from '../../utils/format';
import { paths } from '../../utils/routes';
import { cx } from '../../utils/cx';
import { IdChip } from '../ui/Badge';

const ACTOR: Record<AuditLog['actorType'], { Icon: LucideIcon; dot: string; label: string }> = {
  ai: { Icon: Sparkles, dot: 'border-primary/50 bg-primary/15 text-primary-ink', label: 'AI pipeline' },
  reviewer: { Icon: User, dot: 'border-success/50 bg-success/15 text-success-ink', label: 'Reviewer' },
  system: { Icon: Cog, dot: 'border-line bg-s2 text-muted', label: 'System' },
};

export function auditObjectPath(caseId: string, log: AuditLog): string | null {
  switch (log.objectType) {
    case 'claim': return paths.claim(caseId, log.objectId);
    case 'finding': return paths.review(caseId, log.objectId);
    case 'document': return paths.document(caseId, log.objectId);
    case 'evidence': return paths.evidence(caseId, log.objectId);
    case 'authority': return paths.authorities(caseId, log.objectId);
    case 'graph': return paths.graph(caseId);
    case 'hearing': return paths.hearing(caseId);
    case 'report': return paths.report(caseId);
    case 'case': return paths.overview(caseId);
    default: return null;
  }
}

interface Props {
  logs: AuditLog[];
  caseId: string;
  compact?: boolean;
}

export function AuditTimeline({ logs, caseId, compact }: Props) {
  let lastDay = '';
  return (
    <ol className="relative" aria-label="Audit trail">
      {logs.map((log, i) => {
        const a = ACTOR[log.actorType];
        const day = dayKey(log.timestamp);
        const showDay = !compact && day !== lastDay;
        lastDay = day;
        const to = auditObjectPath(caseId, log);
        const isLast = i === logs.length - 1;
        return (
          <li key={log.logId}>
            {showDay && <p className="section-label mb-3 mt-1 pl-11">{fmtDate(log.timestamp)}</p>}
            <div className="relative flex gap-3 pb-5">
              {!isLast && <span className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px bg-line" aria-hidden />}
              <span className={cx('z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border', a.dot)}>
                <a.Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-mono text-xs text-muted">{fmtTime(log.timestamp)}</span>
                  <span className="text-[13.5px] font-medium">{log.action}</span>
                  {to ? (
                    <Link to={to} className="hover:opacity-80">
                      <IdChip>{log.objectId}</IdChip>
                    </Link>
                  ) : (
                    <IdChip>{log.objectId}</IdChip>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-subtle">
                  {log.actor} <span className="text-subtle/80">({a.label.toLowerCase()})</span>
                </p>
                {(log.previousState || log.newState) && (
                  <p className="mt-1.5 inline-flex flex-wrap items-center gap-1.5 rounded border border-line bg-s2/60 px-2 py-1 text-xs">
                    <span className="text-muted">{log.previousState ?? '—'}</span>
                    <ArrowRight className="h-3 w-3 text-subtle" aria-hidden />
                    <span className="font-medium">{log.newState ?? '—'}</span>
                  </p>
                )}
                {log.details && !compact && <p className="mt-1.5 text-[13px] text-muted">{log.details}</p>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
