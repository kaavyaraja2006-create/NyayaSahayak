import { Link } from 'react-router-dom';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import type { SourceLocation } from '../../types';
import { useCaseStore } from '../../store/caseStore';
import { toast } from '../../store/uiStore';
import { useCaseId, useDocNames } from '../../hooks/useCaseData';
import { sourcePath } from '../../utils/routes';
import { cx } from '../../utils/cx';
import { Badge, IdChip } from '../ui/Badge';

interface Props {
  loc: SourceLocation | null;
  /** Object (claim / evidence id) whose quoted passage should be highlighted. */
  refId?: string;
  variant?: 'block' | 'inline';
  showQuote?: boolean;
  buttonLabel?: string;
  className?: string;
}

/**
 * The single most important traceability control: every extracted object shows where it came from
 * and offers a one-click jump to the exact highlighted passage.
 */
export function SourceReference({ loc, refId, variant = 'block', showQuote, buttonLabel = 'View Source', className }: Props) {
  const caseId = useCaseId();
  const names = useDocNames();
  const logEvent = useCaseStore((s) => s.logEvent);

  if (!loc) {
    return (
      <div className={cx('rounded-md border border-warning/40 bg-warning/10 p-3 text-[13px]', className)}>
        <Badge tone="warning" Icon={AlertTriangle}>No source identified</Badge>
        <p className="mt-2 text-muted">This item was extracted without a traceable source location. Human review is required.</p>
      </div>
    );
  }

  const name = names.get(loc.documentId) ?? loc.documentId;
  const to = sourcePath(caseId, loc, refId);
  const open = (): void => {
    toast('Source opened', 'info');
    logEvent({ action: 'Source opened', objectType: 'document', objectId: loc.documentId, details: `${name}, page ${loc.page}, paragraph ${loc.paragraph}` });
  };

  if (variant === 'inline') {
    return (
      <span className={cx('inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted', className)}>
        <span>
          <span className="text-subtle">Source:</span> {name}
        </span>
        <span className="meta">Page {loc.page}, ¶{loc.paragraph}</span>
        <Link to={to} onClick={open} className="inline-flex items-center gap-1 font-medium text-primary-ink hover:underline">
          {buttonLabel}
          <ExternalLink className="h-3 w-3" aria-hidden />
        </Link>
      </span>
    );
  }

  return (
    <div className={cx('rounded-md border border-line bg-s2/60 p-3', className)}>
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 text-[13px]">
        <dt className="text-subtle">Source</dt>
        <dd className="flex flex-wrap items-center gap-2 font-medium">
          {name} <IdChip>{loc.documentId}</IdChip>
        </dd>
        <dt className="text-subtle">Page</dt>
        <dd className="font-mono">{loc.page}</dd>
        <dt className="text-subtle">Paragraph</dt>
        <dd className="font-mono">{loc.paragraph}</dd>
      </dl>
      {showQuote && loc.quote && (
        <blockquote className="mt-3 border-l-2 border-primary/60 pl-3 text-[13px] italic text-muted">“{loc.quote}”</blockquote>
      )}
      <Link to={to} onClick={open} className="btn btn-secondary btn-sm mt-3">
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        {buttonLabel}
      </Link>
    </div>
  );
}
