import type { Finding } from '../../types';
import { PRIORITY_META } from '../../utils/meta';
import { cx } from '../../utils/cx';
import { Badge, IdChip } from '../ui/Badge';
import { FindingStatusBadge } from '../ui/StatusBadge';

interface Props {
  findings: Finding[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ReviewQueue({ findings, selectedId, onSelect }: Props) {
  return (
    <ul className="card divide-y divide-line overflow-hidden" aria-label="Findings">
      {findings.map((f) => {
        const active = f.findingId === selectedId;
        const pr = PRIORITY_META[f.priority];
        return (
          <li key={f.findingId}>
            <button
              type="button"
              onClick={() => onSelect(f.findingId)}
              aria-current={active ? 'true' : undefined}
              className={cx(
                'block w-full border-l-2 px-4 py-3 text-left transition-colors hover:bg-s2/70',
                active ? 'border-l-primary bg-primary/5' : 'border-l-transparent',
              )}
            >
              <div className="flex items-center gap-2">
                <IdChip>{f.findingId}</IdChip>
                <span className="text-[13px] font-medium">{f.category}</span>
                {f.priority === 'high' && <Badge tone={pr.tone} className="ml-auto">{pr.label}</Badge>}
              </div>
              <p className="mt-1.5 line-clamp-2 text-[13px] text-muted">{f.title}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <FindingStatusBadge status={f.status} />
                <span className="font-mono text-[11px] text-subtle">{f.claimId}</span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
