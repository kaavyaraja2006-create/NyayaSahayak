import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search } from 'lucide-react';
import { useCaseStore } from '../../store/caseStore';
import { toast, useUiStore } from '../../store/uiStore';
import { useCaseId } from '../../hooks/useCaseData';
import { buildSearchIndex, runSearch, SEARCH_GROUP_ORDER } from '../../utils/search';
import { paths } from '../../utils/routes';
import { cx } from '../../utils/cx';
import { Modal } from '../ui/Modal';

interface Cmd {
  key: string;
  group: string;
  title: string;
  subtitle?: string;
  run: () => void;
}

export function CommandPalette() {
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPaletteOpen);
  const setAnalysisOpen = useUiStore((s) => s.setAnalysisOpen);
  const setUi = useUiStore((s) => s.set);
  const navigate = useNavigate();
  const caseId = useCaseId();
  const claims = useCaseStore((s) => s.claims);
  const evidence = useCaseStore((s) => s.evidence);
  const documents = useCaseStore((s) => s.documents);
  const hearing = useCaseStore((s) => s.hearing);
  const authorities = useCaseStore((s) => s.authorities);
  const findings = useCaseStore((s) => s.findings);
  const relationships = useCaseStore((s) => s.relationships);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
    }
  }, [open]);

  const index = useMemo(
    () => (hearing ? buildSearchIndex({ caseId, claims, evidence, documents, hearing, authorities, findings, relationships }) : []),
    [caseId, claims, evidence, documents, hearing, authorities, findings, relationships],
  );

  const go = (to: string) => () => {
    setOpen(false);
    navigate(to);
  };

  const quick: Cmd[] = useMemo(
    () => [
      { key: 'g-overview', group: 'Go to', title: 'Case overview', run: go(paths.overview(caseId)) },
      { key: 'g-docs', group: 'Go to', title: 'Documents', run: go(paths.documents(caseId)) },
      { key: 'g-hearing', group: 'Go to', title: 'Hearings', run: go(paths.hearing(caseId)) },
      { key: 'g-claims', group: 'Go to', title: 'Claims', run: go(paths.claims(caseId)) },
      { key: 'g-graph', group: 'Go to', title: 'Evidence graph', run: go(paths.graph(caseId)) },
      { key: 'g-conflicts', group: 'Go to', title: 'Conflict review', run: go(paths.conflicts(caseId)) },
      { key: 'g-review', group: 'Go to', title: 'Review queue', run: go(paths.review(caseId)) },
      { key: 'g-audit', group: 'Go to', title: 'Audit trail', run: go(paths.audit(caseId)) },
      { key: 'g-report', group: 'Go to', title: 'Reports', run: go(paths.report(caseId)) },
      {
        key: 'a-analyze', group: 'Actions', title: 'Analyze materials', subtitle: 'Run the analysis pipeline',
        run: () => { setOpen(false); setAnalysisOpen(true); },
      },
      { key: 't-light', group: 'Appearance', title: 'Switch to Light theme', run: () => { setUi({ theme: 'light' }); toast('Theme updated', 'info'); setOpen(false); } },
      { key: 't-dark', group: 'Appearance', title: 'Switch to Dark theme', run: () => { setUi({ theme: 'dark' }); toast('Theme updated', 'info'); setOpen(false); } },
      { key: 't-night', group: 'Appearance', title: 'Switch to Night theme', run: () => { setUi({ theme: 'night' }); toast('Theme updated', 'info'); setOpen(false); } },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caseId, navigate],
  );

  const items: Cmd[] = useMemo(() => {
    if (!query.trim()) return quick;
    const grouped = runSearch(index, query, 4);
    const out: Cmd[] = [];
    SEARCH_GROUP_ORDER.forEach((g) => {
      (grouped.get(g) ?? []).forEach((r) => out.push({ key: r.key, group: g, title: `${r.id !== r.title ? `${r.id}: ` : ''}${r.title}`, subtitle: r.subtitle, run: go(r.to) }));
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, index, quick]);

  useEffect(() => setCursor(0), [query]);
  useEffect(() => {
    document.getElementById(`cmd-${cursor}`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const onKey = (e: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(items.length - 1, c + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[cursor]?.run();
    }
  };

  let lastGroup = '';
  return (
    <Modal open={open} onClose={() => setOpen(false)} bare align="top" size="lg" label="Search the case">
      <div className="flex items-center gap-2.5 border-b border-line px-4">
        <Search className="h-4 w-4 text-subtle" aria-hidden />
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={items[cursor] ? `cmd-${cursor}` : undefined}
          className="h-12 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-subtle"
          placeholder="Search claims, evidence, documents, hearing, authorities…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
        />
        <kbd className="kbd">Esc</kbd>
      </div>
      <ul id="cmd-list" role="listbox" className="scroll-thin max-h-[52vh] overflow-y-auto p-2">
        {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No matches for “{query}”.</li>}
        {items.map((it, i) => {
          const head = it.group !== lastGroup;
          lastGroup = it.group;
          return (
            <li key={it.key} role="presentation">
              {head && <p className="section-label px-3 pb-1 pt-3">{it.group}</p>}
              <button
                id={`cmd-${i}`}
                type="button"
                role="option"
                aria-selected={i === cursor}
                onMouseMove={() => setCursor(i)}
                onClick={it.run}
                className={cx('flex w-full items-start gap-3 rounded-md px-3 py-2 text-left', i === cursor ? 'bg-primary/10' : 'hover:bg-s2')}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{it.title}</span>
                  {it.subtitle && <span className="block truncate text-xs text-muted">{it.subtitle}</span>}
                </span>
                {i === cursor && <CornerDownLeft className="mt-1 h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11.5px] text-subtle">
        <span><kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> navigate</span>
        <span><kbd className="kbd">Enter</kbd> open</span>
      </div>
    </Modal>
  );
}
