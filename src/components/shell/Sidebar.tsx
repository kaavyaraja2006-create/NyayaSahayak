import { NavLink, Link } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Scale } from 'lucide-react';
import { useCaseStore } from '../../store/caseStore';
import { useUiStore } from '../../store/uiStore';
import { isPending } from '../../utils/selectors';
import { cx } from '../../utils/cx';
import { Skeleton } from '../ui/Skeleton';
import { NAV } from './nav';

interface NavListProps {
  caseId: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavList({ caseId, collapsed, onNavigate }: NavListProps) {
  const pending = useCaseStore((s) => s.findings.filter(isPending).length);
  return (
    <nav aria-label="Primary" className="space-y-5">
      {NAV.map((section) => (
        <div key={section.label}>
          {!collapsed && <p className="section-label mb-1.5 px-3">{section.label}</p>}
          {collapsed && <div className="mx-3 mb-1.5 h-px bg-line" aria-hidden />}
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.key}>
                <NavLink
                  to={item.to(caseId)}
                  end={item.end}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cx(
                      'group relative flex h-9 items-center gap-2.5 rounded-md px-3 text-[13.5px] transition-colors',
                      collapsed && 'justify-center px-0',
                      isActive ? 'bg-primary/10 font-medium text-primary-ink' : 'text-muted hover:bg-s2 hover:text-fg',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-primary" aria-hidden />}
                      <item.Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {item.badge === 'review' && pending > 0 && (
                        <span
                          className={cx(
                            'rounded-full bg-warning/20 px-1.5 font-mono text-[10.5px] font-medium text-warning-ink',
                            collapsed ? 'absolute right-1 top-1' : 'ml-auto',
                          )}
                          aria-label={`${pending} items awaiting review`}
                        >
                          {pending}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="NyayaSahayak home">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-on-primary">
        <Scale className="h-[18px] w-[18px]" aria-hidden />
      </span>
      {!compact && <span className="text-[15px] font-semibold tracking-tight">NyayaSahayak</span>}
    </Link>
  );
}

export function CaseIdentity({ caseId }: { caseId: string }) {
  const c = useCaseStore((s) => s.currentCase);
  if (!c) {
    return (
      <div className="space-y-2 px-3" aria-hidden>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }
  return (
    <div className="mx-3 rounded-lg border border-line bg-s2/50 p-3">
      <p className="text-[13px] font-semibold uppercase leading-tight">{c.name}</p>
      <p className="mt-1 font-mono text-[11px] text-muted">{caseId}</p>
      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-primary-ink">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden /> Synthetic demonstration
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden /> {c.status}
      </p>
    </div>
  );
}

export function Sidebar({ caseId }: { caseId: string }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const set = useUiStore((s) => s.set);
  return (
    <aside
      className={cx('fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex', collapsed ? 'w-[68px]' : 'w-[264px]')}
      aria-label="Sidebar"
    >
      <div className={cx('flex h-14 shrink-0 items-center border-b border-line', collapsed ? 'justify-center' : 'px-4')}>
        <Brand compact={collapsed} />
      </div>
      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-2 py-4">
        {!collapsed && <CaseIdentity caseId={caseId} />}
        <NavList caseId={caseId} collapsed={collapsed} />
      </div>
      <div className="border-t border-line p-2">
        <button
          type="button"
          onClick={() => set({ sidebarCollapsed: !collapsed })}
          className={cx('flex h-8 w-full items-center gap-2 rounded-md px-3 text-xs text-muted hover:bg-s2 hover:text-fg', collapsed && 'justify-center px-0')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" aria-hidden /> : <PanelLeftClose className="h-4 w-4" aria-hidden />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
