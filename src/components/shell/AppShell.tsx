import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Minimize2 } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { cx } from '../../utils/cx';
import { AnalysisPipeline } from '../domain/AnalysisPipeline';
import { CommandPalette } from './CommandPalette';
import { BottomNav, MobileDrawer } from './MobileNav';
import { Brand, Sidebar } from './Sidebar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { TopBar } from './TopBar';

function FocusBar() {
  const setFocusMode = useUiStore((s) => s.setFocusMode);
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-line bg-bg px-4">
      <Link to="/" aria-label="NyayaSahayak home"><Brand compact /></Link>
      <p className="text-[13px] font-medium text-muted">Focus mode</p>
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher />
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFocusMode(false)}>
          <Minimize2 className="h-3.5 w-3.5" aria-hidden /> Exit Focus Mode <kbd className="kbd">Esc</kbd>
        </button>
      </div>
    </header>
  );
}

export function AppShell({ caseId, children }: { caseId: string; children: ReactNode }) {
  const focusMode = useUiStore((s) => s.focusMode);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const setFocusMode = useUiStore((s) => s.setFocusMode);
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const { pathname } = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(!useUiStore.getState().paletteOpen);
      } else if (e.key === 'Escape') {
        const s = useUiStore.getState();
        if (s.focusMode && !s.paletteOpen) setFocusMode(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setFocusMode, setPaletteOpen]);

  useEffect(() => {
    setFocusMode(false);
    useUiStore.getState().setMobileNavOpen(false);
  }, [pathname, setFocusMode]);

  return (
    <div className="min-h-screen bg-bg">
      <a href="#main" className="sr-only z-[70] rounded-md bg-primary px-3 py-2 text-on-primary focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      {!focusMode && <Sidebar caseId={caseId} />}
      <div className={cx(!focusMode && (collapsed ? 'lg:pl-[68px]' : 'lg:pl-[264px]'))}>
        {focusMode ? <FocusBar /> : <TopBar />}
        <main id="main" className="px-4 py-5 pb-24 sm:px-6 sm:py-6 md:pb-8">
          {children}
        </main>
      </div>
      {!focusMode && <BottomNav caseId={caseId} />}
      <MobileDrawer caseId={caseId} />
      <CommandPalette />
      <AnalysisPipeline />
    </div>
  );
}
