import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info, Search } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useUiStore } from '../store/uiStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { scrollBehavior } from '../hooks/useMotionPref';
import { AuthorityCard } from '../components/domain/AuthorityCard';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';

export default function Authorities() {
  useDocumentTitle('Authorities');
  const authorities = useCaseStore((s) => s.authorities);
  const topK = useUiStore((s) => s.authorityTopK);
  const [sp] = useSearchParams();
  const focus = sp.get('focus');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return authorities.filter((a) => !t || `${a.label} ${a.caseName} ${a.citation} ${a.passage} ${a.claimIds.join(' ')}`.toLowerCase().includes(t));
  }, [authorities, q]);

  useEffect(() => {
    if (!focus) return undefined;
    const t = window.setTimeout(() => document.getElementById(`auth-${focus}`)?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' }), 120);
    return () => window.clearTimeout(t);
  }, [focus]);

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader eyebrow="Case" title="Authorities" description="Candidate authorities retrieved for legal propositions. Retrieval shows what may be relevant, never what is correct." />
      <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-line bg-s2/50 p-3.5 text-[13px] text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Corpus: Synthetic / Curated Demonstration Data. All authorities are fictional. Retrieval depth is set to the top {topK} per claim in Settings. Every passage requires human legal verification before it is relied upon.
        </p>
      </div>
      <div className="relative mb-4 w-full sm:w-72">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" aria-hidden />
        <input className="input pl-8" placeholder="Search authorities…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search authorities" />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No authorities match" body="Try a different search." />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <AuthorityCard key={a.authorityId} authority={a} highlighted={focus === a.authorityId} />
          ))}
        </div>
      )}
    </div>
  );
}
