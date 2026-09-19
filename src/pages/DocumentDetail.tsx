import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import type { SourceLocation } from '../types';
import { useCaseStore } from '../store/caseStore';
import { useUiStore } from '../store/uiStore';
import { useCaseId, useClaimLinks } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFocusReset } from '../hooks/useFocusReset';
import { DocumentNav, DocumentViewer, IntelligencePanel } from '../components/domain/DocumentViewer';
import type { Highlight } from '../components/domain/DocumentViewer';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge, IdChip } from '../components/ui/Badge';
import { DocumentStatus } from '../components/domain/DocumentTable';
import { fmtDate } from '../utils/format';
import { paths } from '../utils/routes';
import { cx } from '../utils/cx';

export default function DocumentDetail() {
  const { documentId = '' } = useParams<{ documentId: string }>();
  const [sp, setSp] = useSearchParams();
  const caseId = useCaseId();
  const documents = useCaseStore((s) => s.documents);
  const claims = useCaseStore((s) => s.claims);
  const evidence = useCaseStore((s) => s.evidence);
  const citations = useCaseStore((s) => s.citations);
  const authorities = useCaseStore((s) => s.authorities);
  const findings = useCaseStore((s) => s.findings);
  const linksByClaim = useClaimLinks();
  const focusMode = useUiStore((s) => s.focusMode);
  const setFocusMode = useUiStore((s) => s.setFocusMode);
  useFocusReset();

  const doc = documents.find((d) => d.documentId === documentId);
  useDocumentTitle(doc?.name ?? 'Document');

  const claimsHere = useMemo(() => claims.filter((c) => c.source?.documentId === documentId), [claims, documentId]);
  const evidenceHere = useMemo(() => evidence.filter((e) => e.source.documentId === documentId), [evidence, documentId]);
  const citationsHere = useMemo(() => citations.filter((c) => c.citedAt?.documentId === documentId), [citations, documentId]);

  const refParam = sp.get('ref') ?? undefined;
  const pageParam = Number(sp.get('page')) || 0;
  const paraParam = Number(sp.get('para')) || 0;

  const highlight = useMemo<Highlight | null>(() => {
    if (!doc) return null;
    const refClaim = claims.find((c) => c.claimId === refParam);
    const refEv = evidence.find((e) => e.evidenceId === refParam);
    const refSrc: SourceLocation | null = refClaim?.source ?? refEv?.source ?? null;
    let loc: { page: number; paragraph: number } | null = pageParam && paraParam ? { page: pageParam, paragraph: paraParam } : null;
    if (!loc && refSrc && refSrc.documentId === doc.documentId) loc = { page: refSrc.page, paragraph: refSrc.paragraph };
    if (!loc) return null;
    const same = (s: SourceLocation | null | undefined): s is SourceLocation =>
      !!s && s.documentId === doc.documentId && s.page === loc?.page && s.paragraph === loc.paragraph;
    let quote: string | undefined = same(refSrc) ? refSrc.quote : undefined;
    if (!quote) {
      const pool: (SourceLocation | null | undefined)[] = [
        ...claims.map((c) => c.source),
        ...evidence.map((e) => e.source),
        ...findings.flatMap((f) => (f.comparison ? [f.comparison.a.location, f.comparison.b.location] : [])),
      ];
      quote = pool.find((s): s is SourceLocation => same(s) && !!s.quote)?.quote;
    }
    return { page: loc.page, paragraph: loc.paragraph, quote };
  }, [doc, claims, evidence, findings, refParam, pageParam, paraParam]);

  const markers = useMemo(() => {
    const m = new Map<string, { id: string; kind: 'claim' | 'evidence' }[]>();
    const add = (loc: SourceLocation | null, id: string, kind: 'claim' | 'evidence'): void => {
      if (!loc) return;
      const key = `${loc.page}-${loc.paragraph}`;
      m.set(key, [...(m.get(key) ?? []), { id, kind }]);
    };
    claimsHere.forEach((c) => add(c.source, c.claimId, 'claim'));
    evidenceHere.forEach((e) => add(e.source, e.evidenceId, 'evidence'));
    return m;
  }, [claimsHere, evidenceHere]);

  if (!doc) {
    return (
      <EmptyState
        title="Document not found"
        body="This document is not part of the loaded case."
        action={<Link to={paths.documents(caseId)} className="btn btn-secondary">Back to documents</Link>}
      />
    );
  }

  const selectedRef =
    refParam ?? (highlight ? claimsHere.find((c) => c.source?.page === highlight.page && c.source.paragraph === highlight.paragraph)?.claimId : undefined);

  const pickRef = (id: string): void => {
    const src = claims.find((c) => c.claimId === id)?.source ?? evidence.find((e) => e.evidenceId === id)?.source;
    if (!src) return;
    setSp({ page: String(src.page), para: String(src.paragraph), ref: id }, { replace: true });
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow={doc.type}
        title={doc.name}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <IdChip>{doc.documentId}</IdChip>
            <span className="font-mono">{doc.pages} pages</span>
            <span>{fmtDate(doc.date)}</span>
            <DocumentStatus status={doc.status} />
            <Badge tone="neutral">{doc.confidentiality}</Badge>
          </div>
        }
        actions={
          <>
            <Link to={paths.documents(caseId)} className="btn btn-ghost lg:hidden">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All documents
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => setFocusMode(!focusMode)} aria-pressed={focusMode}>
              <Maximize2 className="h-3.5 w-3.5" aria-hidden /> {focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
            </button>
          </>
        }
      />
      <div className={cx('grid items-start gap-5', !focusMode && 'lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px]')}>
        {!focusMode && (
          <div className="scroll-thin sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto lg:block">
            <DocumentNav caseId={caseId} documents={documents} activeId={doc.documentId} pages={doc.content.map((p) => p.page)} />
          </div>
        )}
        <DocumentViewer doc={doc} highlight={highlight} markers={markers} onPickRef={pickRef} activeRef={selectedRef} wide={focusMode} />
        {!focusMode && (
          <div className="scroll-thin xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
            <IntelligencePanel
              caseId={caseId}
              claims={claimsHere}
              evidence={evidenceHere}
              citations={citationsHere}
              authorities={authorities}
              entities={doc.entities}
              linksByClaim={linksByClaim}
              selectedRef={selectedRef}
              onSelectRef={pickRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}
