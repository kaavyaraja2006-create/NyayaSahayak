import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

interface Props {
  title?: string;
  body?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

/** Professional error UI. Never renders raw error text. */
export function ErrorState({
  title = 'Unable to load case material.',
  body = 'Please retry. If the problem continues, the case service may be temporarily unavailable.',
  onRetry,
  action,
  className,
}: Props) {
  return (
    <div role="alert" className={cx('mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center', className)}>
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-warning/40 bg-warning/10 text-warning-ink">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <div className="mt-5 flex items-center gap-2">
        {onRetry && (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
