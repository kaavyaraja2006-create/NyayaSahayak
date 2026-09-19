import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, Save } from 'lucide-react';
import type { Finding, ReviewDecision } from '../../types';
import { useCaseStore } from '../../store/caseStore';
import { toast } from '../../store/uiStore';
import { useCaseId } from '../../hooks/useCaseData';
import { paths } from '../../utils/routes';
import { fmtDateTime } from '../../utils/format';
import { cx } from '../../utils/cx';
import { PRIORITY_META } from '../../utils/meta';
import { Badge, IdChip } from '../ui/Badge';
import { FindingStatusBadge } from '../ui/StatusBadge';
import { AIAssistedBadge } from './AIAssistedBadge';

const OPTIONS: { value: ReviewDecision; label: string; hint: string }[] = [
  { value: 'accept', label: 'Accept finding', hint: 'The flagged issue is valid and should be tracked.' },
  { value: 'reject', label: 'Reject finding', hint: 'The flagged issue is not valid for this case.' },
  { value: 'needs_verification', label: 'Needs verification', hint: 'More information is needed before deciding.' },
];

const DECISION_LABEL: Record<ReviewDecision, string> = {
  accept: 'Accepted',
  reject: 'Rejected',
  needs_verification: 'Needs verification',
};

export function ReviewPanel({ finding }: { finding: Finding }) {
  const caseId = useCaseId();
  const saveReview = useCaseStore((s) => s.saveReview);
  const logEvent = useCaseStore((s) => s.logEvent);
  const allReviews = useCaseStore((s) => s.reviews);
  const claims = useCaseStore((s) => s.claims);
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const history = useMemo(
    () => allReviews.filter((r) => r.findingId === finding.findingId).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)),
    [allReviews, finding.findingId],
  );
  const claim = claims.find((c) => c.claimId === finding.claimId);
  const pr = PRIORITY_META[finding.priority];

  useEffect(() => {
    logEvent({ action: finding.kind === 'conflict' ? 'Conflict finding opened' : 'Finding opened', objectType: 'finding', objectId: finding.findingId }, true);
  }, [finding.findingId, finding.kind, logEvent]);

  const onSave = async (): Promise<void> => {
    if (!decision) return;
    setSaving(true);
    try {
      await saveReview(finding.findingId, { decision, comment: comment.trim() });
      toast(`Finding ${finding.findingId} updated.`);
      if (comment.trim()) toast('Comment added', 'info');
      setDecision(null);
      setComment('');
    } catch {
      toast('The review could not be saved. Please retry.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card" aria-label={`Review finding ${finding.findingId}`}>
      <header className="border-b border-line p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="section-label">Finding</span>
          <IdChip>{finding.findingId}</IdChip>
          <Badge tone={pr.tone}>{pr.label}</Badge>
          <FindingStatusBadge status={finding.status} />
          <span className="ml-auto">
            <AIAssistedBadge sources={finding.comparison ? [finding.comparison.a.label, finding.comparison.b.label] : claim?.source ? [claim.title] : []} />
          </span>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-snug">
          {finding.kind === 'conflict' && finding.comparison ? (
            <>
              <span className="block text-sm font-normal text-muted">Potential conflict between</span>
              {finding.comparison.a.label}
              <span className="mx-2 font-mono text-xs font-normal text-subtle">VS</span>
              {finding.comparison.b.label}
            </>
          ) : (
            finding.title
          )}
        </h2>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
          <div>
            Claim{' '}
            <Link to={paths.claim(caseId, finding.claimId)} className="font-mono text-primary-ink hover:underline">
              {finding.claimId}
            </Link>
          </div>
          {finding.evidenceIds.length > 0 && (
            <div>
              Evidence <span className="font-mono">{finding.evidenceIds.join(', ')}</span>
            </div>
          )}
          {finding.authorityId && (
            <div>
              Authority{' '}
              <Link to={paths.authorities(caseId, finding.authorityId)} className="font-mono text-primary-ink hover:underline">
                {finding.authorityId}
              </Link>
            </div>
          )}
          <div>Flagged {fmtDateTime(finding.createdAt)}</div>
        </dl>
      </header>

      <div className="space-y-5 p-5">
        <div>
          <h3 className="section-label mb-1.5">Why flagged?</h3>
          <p className="text-[13.5px] leading-relaxed">{finding.reason}</p>
          {finding.comparison && (
            <Link to={paths.conflicts(caseId, finding.findingId)} className="btn btn-secondary btn-sm mt-3">
              <GitCompare className="h-3.5 w-3.5" aria-hidden /> Compare Sources
            </Link>
          )}
        </div>

        <fieldset>
          <legend className="section-label mb-2">Reviewer decision</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {OPTIONS.map((o) => {
              const active = decision === o.value;
              return (
                <label
                  key={o.value}
                  className={cx(
                    'flex cursor-pointer items-start gap-2.5 rounded-md border p-3 transition-colors',
                    active ? 'border-primary bg-primary/10' : 'border-line hover:bg-s2/70',
                  )}
                >
                  <input
                    type="radio"
                    name={`decision-${finding.findingId}`}
                    value={o.value}
                    checked={active}
                    onChange={() => setDecision(o.value)}
                    className="mt-0.5 h-4 w-4 accent-[rgb(var(--primary))]"
                  />
                  <span>
                    <span className="block text-[13px] font-medium">{o.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{o.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor={`comment-${finding.findingId}`} className="section-label mb-1.5 block">
            Reviewer comment
          </label>
          <textarea
            id={`comment-${finding.findingId}`}
            className="textarea min-h-[92px] resize-y"
            placeholder="Add a note for the audit trail, for example: Verify phone ownership and location accuracy."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-subtle">Your decision is recorded in the audit trail with your name and a timestamp.</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={onSave} disabled={!decision || saving}>
            <Save className="h-4 w-4" aria-hidden /> {saving ? 'Saving…' : 'Save Review'}
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="border-t border-line p-5">
          <h3 className="section-label mb-3">Review history</h3>
          <ol className="space-y-3">
            {history.map((r) => (
              <li key={r.reviewId} className="rounded-md border border-line bg-s2/50 p-3 text-[13px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{DECISION_LABEL[r.decision]}</span>
                  <span className="text-xs text-muted">by {r.reviewer}</span>
                  <span className="meta ml-auto">{fmtDateTime(r.timestamp)}</span>
                </div>
                {r.comment && <p className="mt-1.5 text-muted">“{r.comment}”</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
