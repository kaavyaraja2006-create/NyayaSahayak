import { useState } from 'react';
import { Download, Eye, EyeOff, FileJson, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { toast, useUiStore } from '../store/uiStore';
import { useCaseId } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ReportPreview } from '../components/domain/ReportPreview';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { buildCsv, buildJson, download } from '../utils/export';
import { redactText } from '../utils/redact';

export default function Report() {
  useDocumentTitle('Reports');
  const caseId = useCaseId();
  const state = useCaseStore();
  const redaction = useUiStore((s) => s.redactionEnabled);
  const pageSize = useUiStore((s) => s.pdfPageSize);
  const jsonPretty = useUiStore((s) => s.jsonPretty);
  const [showPreview, setShowPreview] = useState(false);
  const [busy, setBusy] = useState(false);

  const bundle = state.bundle();
  if (!bundle) return null;
  const conflicts = bundle.findings.filter((f) => f.kind === 'conflict').length;
  const maybeRedact = (text: string): string => (redaction ? redactText(text).output : text);

  const generate = async (): Promise<void> => {
    setBusy(true);
    try {
      await state.generateReport();
      setShowPreview(true);
      toast('Report generated');
    } catch {
      toast('The report could not be generated. Please retry.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const exportPdf = (): void => {
    setShowPreview(true);
    state.logEvent({ action: 'Report exported (PDF)', objectType: 'report', objectId: `${caseId}-report` });
    toast('Opening the print dialog. Choose "Save as PDF".', 'info');
    window.setTimeout(() => window.print(), 250);
  };
  const exportJson = (): void => {
    download(`${caseId}-audit.json`, 'application/json', maybeRedact(buildJson(bundle, jsonPretty)));
    state.logEvent({ action: 'Report exported (JSON)', objectType: 'report', objectId: `${caseId}-report` });
    toast('JSON exported');
  };
  const exportCsv = (): void => {
    download(`${caseId}-claims-evidence.csv`, 'text/csv', maybeRedact(buildCsv(bundle)));
    state.logEvent({ action: 'Report exported (CSV)', objectType: 'report', objectId: `${caseId}-report` });
    toast('CSV exported');
  };

  return (
    <div className="mx-auto max-w-[980px]">
      <style>{`@media print { @page { size: ${pageSize}; } }`}</style>
      <PageHeader eyebrow="Output" title="Reports" description="Compile the reviewed case into an audit report. Every finding, reviewer decision and source reference is included." />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Report contents">
        <StatCard value={bundle.documents.filter((d) => d.category !== 'Hearings').length} label="Documents" />
        <StatCard value={bundle.claims.length} label="Claims" />
        <StatCard value={bundle.evidence.length} label="Evidence" />
        <StatCard value={conflicts} label="Potential conflicts" tone="conflict" />
        <StatCard value={bundle.authorities.length} label="Authority findings" />
        <StatCard value={bundle.reviews.length} label="Review actions" />
      </section>

      <section className="card mt-5 p-5" aria-label="Report actions">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => void generate()} disabled={busy}>
            <FileText className="h-4 w-4" aria-hidden /> {busy ? 'Generating…' : 'Generate Report'}
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => setShowPreview((v) => !v)} aria-pressed={showPreview}>
            {showPreview ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />} {showPreview ? 'Hide Preview' : 'Preview Report'}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="mr-1 inline-flex items-center gap-1.5 text-[13px] text-muted">
            <Download className="h-3.5 w-3.5" aria-hidden /> Export
          </span>
          <button type="button" className="btn btn-secondary" onClick={exportPdf}>
            <Printer className="h-3.5 w-3.5" aria-hidden /> PDF
          </button>
          <button type="button" className="btn btn-secondary" onClick={exportJson}>
            <FileJson className="h-3.5 w-3.5" aria-hidden /> JSON
          </button>
          <button type="button" className="btn btn-secondary" onClick={exportCsv}>
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden /> CSV
          </button>
        </div>
        <p className="mt-3 text-xs text-subtle">
          PDF export uses your browser’s print dialog ({pageSize}). Choose “Save as PDF”. Exports {redaction ? 'apply' : 'do not apply'} prototype PII redaction (Settings, Privacy).
        </p>
      </section>

      {showPreview && (
        <div className="mt-6">
          <ReportPreview bundle={bundle} generatedAt={state.lastReport?.generatedAt ?? null} />
        </div>
      )}
    </div>
  );
}
