import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical } from 'lucide-react';
import type { Case } from '../types';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { ErrorState } from '../components/ui/ErrorState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { fmtDate, fmtDateTime } from '../utils/format';
import { paths } from '../utils/routes';

export default function Cases() {
  useDocumentTitle('Cases');
  const [cases, setCases] = useState<Case[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    api
      .getCases()
      .then((c) => alive && setCases(c))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [attempt]);

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader eyebrow="Workspace" title="Cases" description="Cases available for review in this demonstration workspace." />
      {failed && <ErrorState onRetry={() => setAttempt((n) => n + 1)} />}
      {!failed && !cases && <CardSkeleton lines={3} />}
      {cases && (
        <ul className="grid gap-4 md:grid-cols-2">
          {cases.map((c) => (
            <li key={c.caseId}>
              <Link to={paths.overview(c.caseId)} className="card card-hover block h-full p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-xs text-muted">{c.caseId}</p>
                  <Badge tone="primary" Icon={FlaskConical}>Synthetic</Badge>
                </div>
                <h2 className="mt-2 text-lg font-semibold uppercase">{c.name}</h2>
                <p className="mt-1 text-[13px] text-muted">{c.court}</p>
                <dl className="mt-4 grid grid-cols-2 gap-y-2 text-[13px]">
                  <dt className="text-subtle">Status</dt>
                  <dd className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />{c.status}</dd>
                  <dt className="text-subtle">Filed</dt>
                  <dd>{fmtDate(c.filedOn)}</dd>
                  <dt className="text-subtle">Last analyzed</dt>
                  <dd>{fmtDateTime(c.lastAnalyzed)}</dd>
                </dl>
                <p className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-primary-ink">
                  Open workspace <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
