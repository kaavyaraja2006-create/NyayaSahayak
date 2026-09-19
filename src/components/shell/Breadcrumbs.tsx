import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCaseStore } from '../../store/caseStore';
import { SECTION_LABELS } from './nav';

interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const caseName = useCaseStore((s) => s.currentCase?.name);
  const parts = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const crumbs: Crumb[] = [];
  if (parts[0] === 'settings') crumbs.push({ label: 'Settings' });
  else if (parts[0] === 'help') crumbs.push({ label: 'Help' });
  else if (parts[0] === 'cases') {
    crumbs.push({ label: 'Cases', to: '/cases' });
    if (parts[1]) crumbs.push({ label: caseName ?? parts[1], to: `/cases/${parts[1]}` });
    if (parts[2]) crumbs.push({ label: SECTION_LABELS[parts[2]] ?? parts[2], to: `/cases/${parts[1]}/${parts[2]}` });
    if (parts[3]) crumbs.push({ label: parts[3] });
  } else crumbs.push({ label: 'Page not found' });

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1 text-[13px] text-muted">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${c.label}-${i}`} className={last ? 'flex min-w-0 items-center' : 'hidden min-w-0 items-center sm:flex'}>
              {i > 0 && <ChevronRight className="mx-1 hidden h-3.5 w-3.5 shrink-0 text-subtle sm:block" aria-hidden />}
              {last || !c.to ? (
                <span className="truncate font-medium text-fg" aria-current="page">
                  {c.label}
                </span>
              ) : (
                <Link to={c.to} className="truncate hover:text-fg">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
