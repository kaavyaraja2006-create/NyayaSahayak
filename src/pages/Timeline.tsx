import { Link } from 'react-router-dom';
import { AlertTriangle, FileText, Smartphone, Users, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useCaseId } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SourceReference } from '../components/domain/SourceReference';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { paths } from '../utils/routes';
import { cx } from '../utils/cx';
import type { TimelineEvent } from '../types';

const ICON: Record<TimelineEvent['kind'], LucideIcon> = {
  phone: Smartphone,
  cctv: Video,
  witness: Users,
  incident: AlertTriangle,
  record: FileText,
};

export default function Timeline() {
  useDocumentTitle('Timeline');
  const caseId = useCaseId();
  const timeline = useCaseStore((s) => s.timeline);
  const flagged = timeline.filter((t) => t.conflict).length;
  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader eyebrow="Case" title="Timeline" description="Events assembled from statements, records and recordings, in the order they are reported to have occurred." />
      {flagged > 0 && (
        <p className="mb-5 rounded-lg border border-conflict/40 bg-conflict/10 p-3.5 text-[13px]">
          <span className="font-medium text-conflict-ink">{flagged} events are involved in a potential timeline inconsistency.</span>{' '}
          <span className="text-muted">This is an AI-assisted observation that requires human verification.</span>{' '}
          <Link to={paths.conflicts(caseId)} className="font-medium text-primary-ink hover:underline">Open conflict review</Link>
        </p>
      )}
      <ol className="relative space-y-4">
        {timeline.map((ev, i) => {
          const Icon = ICON[ev.kind];
          return (
            <li key={ev.eventId} className="relative flex gap-4">
              {i < timeline.length - 1 && <span className="absolute left-[19px] top-10 h-[calc(100%-1rem)] w-px bg-line" aria-hidden />}
              <span className={cx('z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-surface', ev.conflict ? 'border-conflict/60 text-conflict-ink' : 'border-line text-muted')}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <article className={cx('card min-w-0 flex-1 p-4', ev.conflict && 'border-conflict/40')}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[13px] font-medium">{ev.time}</span>
                  <h2 className="text-[14.5px] font-semibold">{ev.label}</h2>
                  {ev.conflict && <Badge tone="conflict" Icon={AlertTriangle}>Potential conflict</Badge>}
                </div>
                <p className="mt-1.5 text-[13px] text-muted">{ev.detail}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <SourceReference loc={ev.source} variant="inline" />
                  {ev.claimIds.map((id) => (
                    <Link key={id} to={paths.claim(caseId, id)} className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] hover:bg-s2">
                      {id}
                    </Link>
                  ))}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
