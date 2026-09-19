import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

interface Props {
  trigger: (o: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: 'start' | 'end';
  className?: string;
  panelClassName?: string;
}

/** Click-to-open popover with outside-click and Escape dismissal. */
export function Popover({ trigger, children, align = 'start', className, panelClassName }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cx('relative inline-block', className)}>
      {trigger({ open, toggle })}
      {open && (
        <div
          className={cx(
            'absolute z-40 mt-2 rounded-lg border border-line bg-surface shadow-pop',
            align === 'end' ? 'right-0' : 'left-0',
            panelClassName ?? 'w-72',
          )}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
}
