import { AlertTriangle } from 'lucide-react';
import type { ClaimStatus, CitationResult, FindingStatus, RelationshipType } from '../../types';
import { CITATION_RESULT_META, CLAIM_STATUS_META, FINDING_STATUS_META, REL_META } from '../../utils/meta';
import { Badge, MetaBadge } from './Badge';

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  return <MetaBadge meta={CLAIM_STATUS_META[status]} />;
}

export function FindingStatusBadge({ status }: { status: FindingStatus }) {
  return <MetaBadge meta={FINDING_STATUS_META[status]} />;
}

export function RelationshipBadge({ type }: { type: RelationshipType }) {
  return <MetaBadge meta={REL_META[type]} />;
}

export function CitationResultBadge({ result }: { result: CitationResult }) {
  return <MetaBadge meta={CITATION_RESULT_META[result]} />;
}

export function ConflictCountBadge({ count }: { count: number }) {
  if (count === 0) return <span className="text-xs text-subtle">None identified</span>;
  return (
    <Badge tone="conflict" Icon={AlertTriangle}>
      {count} potential {count === 1 ? 'conflict' : 'conflicts'}
    </Badge>
  );
}
