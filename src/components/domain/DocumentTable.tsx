import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, FileText, Loader2 } from 'lucide-react';
import type { CaseDocument } from '../../types';
import { fmtDate } from '../../utils/format';
import { paths } from '../../utils/routes';
import { Badge, IdChip } from '../ui/Badge';

const STATUS = {
  indexed: { label: 'Indexed', tone: 'success', Icon: CheckCircle2 },
  processing: { label: 'Processing', tone: 'primary', Icon: Loader2 },
  queued: { label: 'Queued', tone: 'neutral', Icon: Clock },
} as const;

export function DocumentStatus({ status }: { status: CaseDocument['status'] }) {
  const m = STATUS[status];
  return (
    <Badge tone={m.tone} Icon={m.Icon}>
      {m.label}
    </Badge>
  );
}

export function DocumentTable({ documents, caseId }: { documents: CaseDocument[]; caseId: string }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-line">
            {['Document', 'Type', 'Pages', 'Date', 'Status'].map((h) => (
              <th key={h} className="section-label px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {documents.map((d) => (
            <tr key={d.documentId} className="transition-colors hover:bg-s2/70">
              <td className="px-4 py-3">
                <Link to={paths.document(caseId, d.documentId)} className="group flex items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  <span className="font-medium group-hover:text-primary-ink group-hover:underline">{d.name}</span>
                  <IdChip>{d.documentId}</IdChip>
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{d.type}</td>
              <td className="px-4 py-3 font-mono text-muted">{d.pages}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted">{fmtDate(d.date)}</td>
              <td className="px-4 py-3">
                <DocumentStatus status={d.status} />
              </td>
            </tr>
          ))}
          {documents.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-muted">
                No documents match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
