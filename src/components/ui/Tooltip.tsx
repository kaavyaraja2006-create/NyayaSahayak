import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

interface Props {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'center' | 'start' | 'end';
  className?: string;
  width?: string;
}

/** CSS-only tooltip: appears on hover and on keyboard focus of the wrapped control. */
export function Tooltip({ content, children, side = 'top', align = 'center', className, width = 'w-56' }: Props) {
  return (
    <span className={cx('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cx(
          'pointer-events-none absolute z-40 rounded-md border border-line bg-surface px-2.5 py-1.5 text-left text-xs font-normal normal-case leading-snug tracking-normal text-fg opacity-0 shadow-pop transition-opacity duration-150 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
          width,
          side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
          align === 'center' && 'left-1/2 -translate-x-1/2',
          align === 'start' && 'left-0',
          align === 'end' && 'right-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}
