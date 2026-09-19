import { useMemo, useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useCaseId } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AuditTimeline } from '../components/domain/AuditTimeline';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterChips } from '../components/ui/FilterChips';
import { PageHeader } from '../components/ui/PageHeader';

type Actor = 'all' | 'ai' | 'reviewer' | 'system';

export default function Audit() {
  useDocumentTitle('Audit trail');
  const caseId = useCaseId();
  const logs = useCaseStore((s) => s.auditLogs);
  const [actor, setActor] = useState<Actor>('all');
  const [object, setObject] = useState('all');
  const [newestFirst, setNewestFirst] = useState(true);

  const objectTypes = useMemo(() => Array.from(new Set(logs.map((l) => l.objectType))).sort(), [logs]);
  const shown = useMemo(() => {
    const list = logs.filter((l) => (actor === 'all' || l.actorType === actor) && (object === 'all' || l.objectType === object));
    return [...list].sort((a, b) => (a.timestamp === b.timestamp ? 0 : a.timestamp < b.timestamp === newestFirst ? 1 : -1));
  }, [logs, actor, object, newestFirst]);

  const count = (a: Actor): number => (a === 'all' ? logs.length : logs.filter((l) => l.actorType === a).length);

  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader eyebrow="Review" title="Audit trail" description="A record of what the AI pipeline did and what reviewers decided, with who, what and when. New reviewer actions appear here immediately." />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <FilterChips<Actor>
          ariaLabel="Filter by actor"
          value={actor}
          onChange={setActor}
          options={[
            { value: 'all', label: 'All', count: count('all') },
            { value: 'ai', label: 'AI pipeline', count: count('ai') },
            { value: 'reviewer', label: 'Reviewer', count: count('reviewer') },
            { value: 'system', label: 'System', count: count('system') },
          ]}
        />
        <select className="input h-8 w-auto py-0 text-xs" aria-label="Filter by object type" value={object} onChange={(e) => setObject(e.target.value)}>
          <option value="all">All objects</option>
          {objectTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-ghost btn-sm ml-auto" onClick={() => setNewestFirst((v) => !v)}>
          <ArrowDownUp className="h-3.5 w-3.5" aria-hidden /> {newestFirst ? 'Newest first' : 'Oldest first'}
        </button>
      </div>
      <div className="card p-5">
        {shown.length === 0 ? <EmptyState title="No entries" body="No audit entries match these filters." /> : <AuditTimeline logs={shown} caseId={caseId} />}
      </div>
    </div>
  );
}
