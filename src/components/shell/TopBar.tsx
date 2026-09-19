import { Link } from 'react-router-dom';
import { Bell, FlaskConical, HelpCircle, Menu, Search } from 'lucide-react';
import { useCaseStore } from '../../store/caseStore';
import { useUiStore } from '../../store/uiStore';
import { useCaseId } from '../../hooks/useCaseData';
import { isPending } from '../../utils/selectors';
import { paths } from '../../utils/routes';
import { Popover } from '../ui/Popover';
import { Badge, IdChip } from '../ui/Badge';
import { Breadcrumbs } from './Breadcrumbs';
import { ThemeSwitcher } from './ThemeSwitcher';

function Notifications() {
  const caseId = useCaseId();
  const findings = useCaseStore((s) => s.findings);
  const pending = findings.filter(isPending);
  return (
    <Popover
      align="end"
      panelClassName="w-80"
      trigger={({ open, toggle }) => (
        <button type="button" className="btn-icon relative" onClick={toggle} aria-expanded={open} aria-label={`Notifications, ${pending.length} items need review`}>
          <Bell className="h-4 w-4" aria-hidden />
          {pending.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-warning" aria-hidden />}
        </button>
      )}
    >
      {(close) => (
        <div>
          <p className="section-label border-b border-line px-4 py-2.5">Requires review</p>
          {pending.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted">Nothing is waiting for review.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-line overflow-y-auto">
              {pending.slice(0, 6).map((f) => (
                <li key={f.findingId}>
                  <Link to={paths.review(caseId, f.findingId)} onClick={close} className="block px-4 py-2.5 hover:bg-s2">
                    <span className="flex items-center gap-2">
                      <IdChip>{f.findingId}</IdChip>
                      <span className="text-xs text-muted">{f.category}</span>
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[13px]">{f.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to={paths.review(caseId)} onClick={close} className="block border-t border-line px-4 py-2.5 text-center text-[13px] font-medium text-primary-ink hover:bg-s2">
            Open review queue
          </Link>
        </div>
      )}
    </Popover>
  );
}

export function TopBar() {
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-bg px-3 sm:gap-3 sm:px-5">
      <button type="button" className="btn-icon lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
        <Menu className="h-[18px] w-[18px]" aria-hidden />
      </button>
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="hidden h-8 w-[260px] items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-[13px] text-subtle transition-colors hover:bg-s2 md:flex"
        aria-label="Search claims, evidence, documents and authorities"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        Search the case
        <span className="ml-auto flex gap-1">
          <kbd className="kbd">Ctrl</kbd>
          <kbd className="kbd">K</kbd>
        </span>
      </button>
      <button type="button" className="btn-icon md:hidden" onClick={() => setPaletteOpen(true)} aria-label="Search">
        <Search className="h-4 w-4" aria-hidden />
      </button>
      <Badge tone="primary" Icon={FlaskConical} className="hidden xl:inline-flex">
        Demo mode
      </Badge>
      <Notifications />
      <ThemeSwitcher />
      <Link to="/help" className="btn-icon hidden sm:inline-flex" aria-label="Help">
        <HelpCircle className="h-4 w-4" aria-hidden />
      </Link>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-s2 text-[11px] font-semibold" title="Demo Reviewer" aria-label="Signed in as Demo Reviewer">
        DR
      </span>
    </header>
  );
}
