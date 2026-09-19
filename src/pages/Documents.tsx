import { useMemo, useState } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useCaseId } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { DocumentCard } from '../components/domain/DocumentCard';
import { DocumentTable } from '../components/domain/DocumentTable';
import { FilterChips } from '../components/ui/FilterChips';
import { PageHeader } from '../components/ui/PageHeader';
import type { DocumentCategory } from '../types';
import { cx } from '../utils/cx';

type Cat = 'all' | DocumentCategory;

export default function Documents() {
  useDocumentTitle('Documents');
  const caseId = useCaseId();
  const documents = useCaseStore((s) => s.documents);
  const [cat, setCat] = useState<Cat>('all');
  const [q, setQ] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    documents.forEach((d) => m.set(d.category, (m.get(d.category) ?? 0) + 1));
    return m;
  }, [documents]);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return documents.filter((d) => (cat === 'all' || d.category === cat) && (!t || `${d.name} ${d.type} ${d.documentId} ${d.source}`.toLowerCase().includes(t)));
  }, [documents, cat, q]);

  const cats: DocumentCategory[] = ['Statements', 'Reports', 'Evidence', 'Submissions', 'Hearings'];
  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader eyebrow="Case" title="Documents" description={`${documents.length} documents in this case bundle. Open one to read it with extracted claims and evidence alongside.`} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterChips<Cat>
          ariaLabel="Filter by category"
          value={cat}
          onChange={setCat}
          options={[{ value: 'all', label: 'All', count: documents.length }, ...cats.map((c) => ({ value: c, label: c, count: counts.get(c) ?? 0 }))]}
        />
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" aria-hidden />
          <input className="input pl-8" placeholder="Filter documents…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter documents" />
        </div>
        <div role="group" aria-label="View" className="inline-flex rounded-md border border-line p-0.5">
          {([['list', List], ['grid', LayoutGrid]] as const).map(([v, Icon]) => (
            <button key={v} type="button" aria-pressed={view === v} aria-label={`${v} view`} onClick={() => setView(v)} className={cx('flex h-7 w-8 items-center justify-center rounded', view === v ? 'bg-s2 text-fg' : 'text-subtle hover:text-fg')}>
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </button>
          ))}
        </div>
      </div>
      {view === 'list' ? (
        <DocumentTable documents={filtered} caseId={caseId} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <DocumentCard key={d.documentId} doc={d} caseId={caseId} />
          ))}
        </div>
      )}
    </div>
  );
}
