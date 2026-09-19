import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { CaseDocument } from '../../types';
import { fmtDate } from '../../utils/format';
import { paths } from '../../utils/routes';
import { IdChip } from '../ui/Badge';
import { DocumentStatus } from './DocumentTable';

export function DocumentCard({ doc, caseId }: { doc: CaseDocument; caseId: string }) {
  return (
    <Link to={paths.document(caseId, doc.documentId)} className="card card-hover block p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-s2 text-muted">
          <FileText className="h-4 w-4" aria-hidden />
        </span>
        <DocumentStatus status={doc.status} />
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-snug">{doc.name}</h3>
      <p className="mt-0.5 text-xs text-muted">{doc.type}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-subtle">
        <IdChip>{doc.documentId}</IdChip>
        <span className="font-mono">{doc.pages} pp.</span>
        <span className="ml-auto font-mono">{fmtDate(doc.date)}</span>
      </div>
    </Link>
  );
}
