import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import type { ToastKind } from '../../store/uiStore';
import { cx } from '../../utils/cx';

const ICONS = { success: CheckCircle2, info: Info, warning: AlertTriangle, error: XCircle } as const;
const TONES: Record<ToastKind, string> = {
  success: 'text-success-ink',
  info: 'text-primary-ink',
  warning: 'text-warning-ink',
  error: 'text-conflict-ink',
};

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2 md:bottom-5" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-3 shadow-pop"
            >
              <Icon className={cx('mt-px h-4 w-4 shrink-0', TONES[t.kind])} aria-hidden />
              <p className="flex-1 text-[13px] leading-snug">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} className="text-subtle hover:text-fg" aria-label="Dismiss notification">
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
