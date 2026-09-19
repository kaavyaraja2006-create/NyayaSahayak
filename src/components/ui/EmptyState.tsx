import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cx } from '../../utils/cx';

interface Props {
  title: string;
  body: string;
  Icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, body, Icon = Inbox, action, className }: Props) {
  return (
    <div className={cx('flex flex-col items-center justify-center rounded-lg border border-dashed border-line px-6 py-12 text-center', className)}>
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-s2 text-muted">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="section-label">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
