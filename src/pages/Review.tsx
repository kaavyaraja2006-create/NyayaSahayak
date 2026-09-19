import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ReviewPanel } from '../components/domain/ReviewPanel';
import { ReviewQueue } from '../components/domain/ReviewQueue';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterChips } from '../components/ui/FilterChips';
import { PageHeader } from '../components/ui/PageHeader';
import { isPending } from '../utils/selectors';

type F = 'open' | 'high' | 'evidence' | 'citation' | 'timeline' | 'all';

export default function Review() {
  useDocumentTitle('Review queue');
  const findings = useCaseStore((s) => s.findings);
  const [sp, setSp] = useSearchParams();
  const [f, setF] = useState<F>('open');
  const selectedParam = sp.get('finding');

  const pending = useMemo(() => findings.filter(isPending), [findings]);
  const list = useMemo(() => {
    const rank = { high: 0, medium: 1, low: 2 } as const;
    const base = f === 'all' ? findings : pending.filter((x) => (f === 'open' ? true : f === 'high' ? x.priority === 'high' : x.group === f));
    return [...base].sort((a, b) => rank[a.priority] - rank[b.priority] || (a.findingId < b.findingId ? -1 : 1));
  }, [findings, pending, f]);

  const selected = findings.find((x) => x.findingId === selectedParam) ?? list[0] ?? null;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Review"
        title="Review queue"
        description={pending.length === 0 ? 'Every finding has a reviewer decision.' : `${pending.length} items require review. Decisions are recorded in the audit trail.`}
      />
      <div className="mb-4">
        <FilterChips<F>
          ariaLabel="Filter findings"
          value={f}
          onChange={setF}
          options={[
            { value: 'open', label: 'Open', count: pending.length },
            { value: 'high', label: 'High attention', count: pending.filter((x) => x.priority === 'high').length },
            { value: 'evidence', label: 'Evidence', count: pending.filter((x) => x.group === 'evidence').length },
            { value: 'citation', label: 'Citation', count: pending.filter((x) => x.group === 'citation').length },
            { value: 'timeline', label: 'Timeline', count: pending.filter((x) => x.group === 'timeline').length },
            { value: 'all', label: 'All findings', count: findings.length },
          ]}
        />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="scroll-thin lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          {list.length === 0 ? (
            <EmptyState Icon={CheckCircle2} title="Nothing in this view" body="No findings match this filter." />
          ) : (
            <ReviewQueue findings={list} selectedId={selected?.findingId ?? null} onSelect={(id) => setSp({ finding: id }, { replace: true })} />
          )}
        </div>
        {selected ? (
          <ReviewPanel key={selected.findingId} finding={selected} />
        ) : (
          <EmptyState title="No finding selected" body="Select a finding from the queue to review it." />
        )}
      </div>
    </div>
  );
}
