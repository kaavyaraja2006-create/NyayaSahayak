import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cx } from '../../utils/cx';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'center' | 'top';
  /** Hides the standard header (used by the command palette). */
  bare?: boolean;
  dismissible?: boolean;
  label?: string;
}

const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' } as const;

export function Modal({ open, onClose, title, description, children, footer, size = 'md', align = 'center', bare, dismissible = true, label }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && dismissible) {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => {
      const el = panelRef.current;
      if (el && !el.contains(document.activeElement)) el.focus();
    }, 30);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose, dismissible]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cx('fixed inset-0 z-50 flex justify-center overflow-y-auto p-3 sm:p-8', align === 'top' ? 'items-start pt-[10vh]' : 'items-start sm:items-center')}
        >
          <motion.div
            className="fixed inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={dismissible ? onClose : undefined}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label ?? title}
            tabIndex={-1}
            className={cx('relative w-full rounded-xl border border-line bg-surface shadow-pop focus:outline-none', SIZES[size])}
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {!bare && (
              <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                <div>
                  {title && <h2 className="text-base font-semibold">{title}</h2>}
                  {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
                </div>
                {dismissible && (
                  <button type="button" className="btn-icon -mr-2 -mt-1" onClick={onClose} aria-label="Close dialog">
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            )}
            <div className={bare ? '' : 'px-5 py-4'}>{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
