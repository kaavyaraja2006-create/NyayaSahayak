import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { scrollBehavior } from '../hooks/useMotionPref';
import { EvidenceCard } from '../components/domain/EvidenceCard';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterChips } from '../components/ui/FilterChips';
import { PageHeader } from '../components/ui/PageHeader';
import { linksForEvidence } from '../utils/selectors';
import type { EvidenceType } from '../types';

type F = 'all' | EvidenceType;

export default function Evidence() {
  useDocumentTitle('Evidence');
  const evidence = useCaseStore((s) => s.evidence);
  const claims = useCaseStore((s) => s.claims);
  const relationships = useCaseStore((s) => s.relationships);
  const [sp] = useSearchParams();
  const focus = sp.get('focus');
  const [f, setF] = useState<F>('all');
  const [q, setQ] = useState('');

  const types = useMemo(() => Array.from(new Set(evidence.map((e) => e.type))), [evidence]);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return evidence.filter((e) => (f === 'all' || e.type === f) && (!t || `${e.evidenceId} ${e.type} ${e.description}`.toLowerCase().includes(t)));
  }, [evidence, f, q]);

  useEffect(() => {
    if (!focus) return undefined;
    setF('all');
    const t = window.setTimeout(() => document.getElementById(`ev-${focus}`)?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' }), 120);
    return () => window.clearTimeout(t);
  }, [focus]);

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader eyebrow="Case" title="Evidence" description={`${evidence.length} evidence items, each tied to a source passage and to the claims it supports, conflicts with or contextualises.`} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterChips<F>
          ariaLabel="Filter by evidence type"
          value={f}
          onChange={setF}
          options={[{ value: 'all', label: 'All', count: evidence.length }, ...types.map((t) => ({ value: t as F, label: t, count: evidence.filter((e) => e.type === t).length }))]}
        />
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" aria-hidden />
          <input className="input pl-8" placeholder="Search evidence…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search evidence" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No evidence matches" body="Try a different filter or clear the search." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((e) => (
            <EvidenceCard key={e.evidenceId} evidence={e} highlighted={focus === e.evidenceId} claimLinks={linksForEvidence(e.evidenceId, relationships, claims)} />
          ))}
        </div>
      )}
    </div>
  );
}
