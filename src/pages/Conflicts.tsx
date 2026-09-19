import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import type { Finding } from '../types';
import { useCaseStore } from '../store/caseStore';
import { useCaseId } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ConflictCard } from '../components/domain/ConflictCard';
import { SourceComparison } from '../components/domain/SourceComparison';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { paths } from '../utils/routes';

export default function Conflicts() {
  useDocumentTitle('Conflict review');
  const caseId = useCaseId();
  const findings = useCaseStore((s) => s.findings);
  const logEvent = useCaseStore((s) => s.logEvent);
  const [sp, setSp] = useSearchParams();
  const compareId = sp.get('compare');

  const conflicts = findings.filter((f) => f.kind === 'conflict');
  const open = conflicts.find((f) => f.findingId === compareId) ?? null;
  const pending = conflicts.filter((f) => f.status === 'open' || f.status === 'needs_verification').length;

  useEffect(() => {
    if (open) logEvent({ action: 'Sources compared', objectType: 'finding', objectId: open.findingId }, true);
  }, [open, logEvent]);

  const openCompare = (f: Finding): void => setSp({ compare: f.findingId });
  const close = (): void => setSp({});

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        eyebrow="Analysis"
        title="Conflict review"
        description={`${conflicts.length} potential conflicts flagged, ${pending} awaiting a decision. A potential conflict means two sources may be inconsistent. It does not mean either is wrong.`}
      />
      {conflicts.length === 0 ? (
        <EmptyState title="No potential conflicts" body="No inconsistencies were flagged in the analysed material." />
      ) : (
        <div className="space-y-4">
          {conflicts.map((f) => (
            <ConflictCard key={f.findingId} finding={f} onCompare={openCompare} active={open?.findingId === f.findingId} />
          ))}
        </div>
      )}
      <Modal
        open={!!open}
        onClose={close}
        size="xl"
        title={open ? `Compare sources: ${open.title}` : undefined}
        description={open ? `Finding ${open.findingId} on claim ${open.claimId}` : undefined}
        footer={
          open && (
            <>
              <button type="button" className="btn btn-secondary" onClick={close}>Close</button>
              <Link to={paths.review(caseId, open.findingId)} className="btn btn-primary">
                <ClipboardCheck className="h-4 w-4" aria-hidden /> Review Finding
              </Link>
            </>
          )
        }
      >
        {open && <SourceComparison finding={open} />}
      </Modal>
    </div>
  );
}
