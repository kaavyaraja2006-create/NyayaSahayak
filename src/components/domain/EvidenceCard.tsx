import { Link } from 'react-router-dom';
import type { Claim, Evidence, Relationship } from '../../types';
import { EVIDENCE_ICON } from '../../utils/meta';
import { fmtDate } from '../../utils/format';
import { useCaseId } from '../../hooks/useCaseData';
import { paths } from '../../utils/routes';
import { cx } from '../../utils/cx';
import { IdChip } from '../ui/Badge';
import { RelationshipBadge } from '../ui/StatusBadge';
import { SourceReference } from './SourceReference';

interface Props {
  evidence: Evidence;
  /** When shown inside a claim context: the relationship being explained. */
  relationship?: Relationship;
  /** When shown in the evidence explorer: the claims this evidence is linked to. */
  claimLinks?: { relationship: Relationship; claim: Claim }[];
  highlighted?: boolean;
  className?: string;
}

export function EvidenceCard({ evidence, relationship, claimLinks, highlighted, className }: Props) {
  const caseId = useCaseId();
  const Icon = EVIDENCE_ICON[evidence.type];
  return (
    <article
      id={`ev-${evidence.evidenceId}`}
      className={cx('card scroll-mt-24 p-4 transition-shadow', highlighted && 'border-primary/70 ring-2 ring-primary/25', className)}
    >
      <header className="flex flex-wrap items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-s2 text-muted">
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="text-sm font-semibold">{evidence.type}</span>
        <IdChip>{evidence.evidenceId}</IdChip>
        {relationship && <RelationshipBadge type={relationship.type} />}
        <span className="meta ml-auto">{fmtDate(evidence.date)}</span>
      </header>
      <p className="mt-2.5 text-[13px] leading-relaxed">{evidence.description}</p>
      {relationship && (
        <div className="mt-3 space-y-1.5 rounded-md bg-s2/70 p-3 text-[13px]">
          <p>
            <span className="text-subtle">Why linked: </span>
            {relationship.reason}
          </p>
          <p>
            <span className="text-subtle">Assessment: </span>
            {relationship.assessment}
          </p>
        </div>
      )}
      <SourceReference loc={evidence.source} refId={evidence.evidenceId} variant="inline" className="mt-3" />
      {claimLinks && claimLinks.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
          <span className="mr-1 text-xs text-subtle">Linked claims</span>
          {claimLinks.map((l) => (
            <Link
              key={l.relationship.relationshipId}
              to={paths.claim(caseId, l.claim.claimId)}
              className="inline-flex items-center gap-1.5 rounded border border-line px-1.5 py-0.5 text-xs hover:bg-s2"
              title={`${l.claim.title}: ${l.relationship.type.toLowerCase()}`}
            >
              <span className="font-mono">{l.claim.claimId}</span>
              <RelationshipBadge type={l.relationship.type} />
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
