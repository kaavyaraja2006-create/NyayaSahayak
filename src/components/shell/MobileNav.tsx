import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardCheck, LayoutDashboard, ListChecks, MoreHorizontal, Network, X } from 'lucide-react';
import { useCaseStore } from '../../store/caseStore';
import { useUiStore } from '../../store/uiStore';
import { isPending } from '../../utils/selectors';
import { paths } from '../../utils/routes';
import { cx } from '../../utils/cx';
import { Brand, CaseIdentity, NavList } from './Sidebar';

/** Slide-over navigation for tablet and phone widths. */
export function MobileDrawer({ caseId }: { caseId: string }) {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div className="absolute inset-0 bg-black/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} aria-hidden />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[86vw] flex-col border-r border-line bg-surface shadow-pop"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
              <Brand />
              <button type="button" className="btn-icon" onClick={() => setOpen(false)} aria-label="Close navigation">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-2 py-4">
              <CaseIdentity caseId={caseId} />
              <NavList caseId={caseId} onNavigate={() => setOpen(false)} />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Phone-only bottom navigation. */
export function BottomNav({ caseId }: { caseId: string }) {
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  const pending = useCaseStore((s) => s.findings.filter(isPending).length);
  const items = [
    { to: paths.overview(caseId), label: 'Overview', Icon: LayoutDashboard, end: true },
    { to: paths.claims(caseId), label: 'Claims', Icon: ListChecks, end: false },
    { to: paths.graph(caseId), label: 'Graph', Icon: Network, end: false },
    { to: paths.review(caseId), label: 'Review', Icon: ClipboardCheck, end: false },
  ];
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface md:hidden">
      {items.map((it) => (
        <NavLink
          key={it.label}
          to={it.to}
          end={it.end}
          className={({ isActive }) => cx('relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10.5px]', isActive ? 'font-medium text-primary-ink' : 'text-muted')}
        >
          <it.Icon className="h-[18px] w-[18px]" aria-hidden />
          {it.label}
          {it.label === 'Review' && pending > 0 && <span className="absolute right-[26%] top-2 h-2 w-2 rounded-full bg-warning" aria-hidden />}
        </NavLink>
      ))}
      <button type="button" onClick={() => setOpen(true)} className="flex h-14 flex-col items-center justify-center gap-0.5 text-[10.5px] text-muted" aria-label="More navigation">
        <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden />
        More
      </button>
    </nav>
  );
}
