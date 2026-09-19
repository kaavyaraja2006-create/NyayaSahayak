import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Claim } from '../../types';
import type { ClaimLinks } from '../../utils/selectors';
import { useCaseId, useDocNames } from '../../hooks/useCaseData';
import { paths } from '../../utils/routes';
import { IdChip } from '../ui/Badge';
import { ClaimStatusBadge, ConflictCountBadge } from '../ui/StatusBadge';
import { AIAssistedBadge } from './AIAssistedBadge';
import { cx } from '../../utils/cx';

interface Props {
  claim: Claim;
  links: ClaimLinks | undefined;
  className?: string;
}

export function ClaimCard({ claim, links, className }: Props) {
  const caseId = useCaseId();
  const names = useDocNames();
  const src = claim.source;
  return (
    <article className={cx('card card-hover flex h-full flex-col p-4', className)}>
      <header className="flex items-start justify-between gap-3">
        <IdChip>{claim.claimId}</IdChip>
        <ClaimStatusBadge status={claim.status} />
      </header>
      <h3 className="mt-3 text-[15px] font-semibold leading-snug">
        <Link to={paths.claim(caseId, claim.claimId)} className="hover:text-primary-ink hover:underline">
          {claim.title}
        </Link>
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">“{claim.text}”</p>
      <dl className="mt-4 grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 border-t border-line pt-3 text-[13px]">
        <dt className="text-subtle">Source</dt>
        <dd>
          {src ? (
            <>
              {names.get(src.documentId) ?? src.documentId}
              <span className="meta ml-2">Page {src.page}</span>
            </>
          ) : (
            <span className="text-warning-ink">No source identified</span>
          )}
        </dd>
        <dt className="text-subtle">Evidence</dt>
        <dd>{links ? `${links.all.length} linked` : '—'}</dd>
        <dt className="text-subtle">Conflicts</dt>
        <dd>
          <ConflictCountBadge count={links?.conflicts.length ?? 0} />
        </dd>
      </dl>
      <footer className="mt-auto flex items-center justify-between gap-2 pt-4">
        <AIAssistedBadge sources={src ? [names.get(src.documentId) ?? src.documentId] : []} />
        <Link to={paths.claim(caseId, claim.claimId)} className="btn btn-secondary btn-sm">
          View Claim <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </footer>
    </article>
  );
}
