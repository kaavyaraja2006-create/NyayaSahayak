import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

interface Props {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, meta, className }: Props) {
  return (
    <header className={cx('mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="section-label mb-1.5">{eyebrow}</p>}
        <h1 className="text-[22px] font-semibold leading-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-sm text-muted">{description}</p>}
        {meta && <div className="mt-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
