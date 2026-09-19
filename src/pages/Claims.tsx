import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useClaimLinks } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ClaimCard } from '../components/domain/ClaimCard';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterChips } from '../components/ui/FilterChips';
import { PageHeader } from '../components/ui/PageHeader';

type F = 'all' | 'reviewed' | 'needs_review' | 'conflict' | 'unresolved';

export default function Claims() {
  useDocumentTitle('Claims');
  const claims = useCaseStore((s) => s.claims);
  const links = useClaimLinks();
  const [f, setF] = useState<F>('all');
  const [q, setQ] = useState('');

  const counts = useMemo(
    () => ({
      all: claims.length,
      reviewed: claims.filter((c) => c.status === 'reviewed').length,
      needs_review: claims.filter((c) => c.status === 'needs_review').length,
      conflict: claims.filter((c) => (links.get(c.claimId)?.conflicts.length ?? 0) > 0).length,
      unresolved: claims.filter((c) => c.status === 'unresolved').length,
    }),
    [claims, links],
  );
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return claims.filter((c) => {
      if (f === 'reviewed' && c.status !== 'reviewed') return false;
      if (f === 'needs_review' && c.status !== 'needs_review') return false;
      if (f === 'unresolved' && c.status !== 'unresolved') return false;
      if (f === 'conflict' && (links.get(c.claimId)?.conflicts.length ?? 0) === 0) return false;
      return !t || `${c.claimId} ${c.title} ${c.text} ${c.type}`.toLowerCase().includes(t);
    });
  }, [claims, links, f, q]);

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="Case"
        title="Claims"
        description={`${counts.all} claims extracted, ${counts.reviewed} reviewed, ${counts.needs_review} need review, ${counts.unresolved} unresolved. Each claim links back to its source passage.`}
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterChips<F>
          ariaLabel="Filter claims"
          value={f}
          onChange={setF}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'reviewed', label: 'Reviewed', count: counts.reviewed },
            { value: 'needs_review', label: 'Needs Review', count: counts.needs_review },
            { value: 'conflict', label: 'Potential Conflict', count: counts.conflict },
            { value: 'unresolved', label: 'Unresolved', count: counts.unresolved },
          ]}
        />
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" aria-hidden />
          <input className="input pl-8" placeholder="Search claims…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search claims" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No claims match" body="Try a different filter or clear the search." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <ClaimCard key={c.claimId} claim={c} links={links.get(c.claimId)} />
          ))}
        </div>
      )}
    </div>
  );
}
