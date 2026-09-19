import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, FileText, MapPin, Quote, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Authority, CaseDocument, CitationRecord, Claim, DocEntity, Evidence } from '../../types';
import { scrollBehavior } from '../../hooks/useMotionPref';
import { paths } from '../../utils/routes';
import { splitByQuote } from '../../utils/text';
import { cx } from '../../utils/cx';
import { IdChip } from '../ui/Badge';
import { CitationResultBadge, ClaimStatusBadge, ConflictCountBadge } from '../ui/StatusBadge';
import type { ClaimLinks } from '../../utils/selectors';

export interface Highlight {
  page: number;
  paragraph: number;
  quote?: string;
}

/* ── Left column: document + page navigation ─────────────────────────────── */

interface NavProps {
  caseId: string;
  documents: CaseDocument[];
  activeId: string;
  pages: number[];
}

export function DocumentNav({ caseId, documents, activeId, pages }: NavProps) {
  const jump = (page: number): void => {
    document.getElementById(`page-${page}`)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  };
  return (
    <nav aria-label="Document navigation" className="space-y-5">
      <div>
        <h2 className="section-label mb-2 px-2">Documents</h2>
        <ul className="scroll-thin max-h-[46vh] space-y-0.5 overflow-y-auto pr-1">
          {documents.map((d) => (
            <li key={d.documentId}>
              <Link
                to={paths.document(caseId, d.documentId)}
                aria-current={d.documentId === activeId ? 'page' : undefined}
                className={cx(
                  'flex items-start gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors',
                  d.documentId === activeId ? 'bg-primary/10 font-medium text-primary-ink' : 'text-muted hover:bg-s2 hover:text-fg',
                )}
              >
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate">{d.name}</span>
                  <span className="font-mono text-[10.5px] text-subtle">{d.documentId}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="section-label mb-2 px-2">Pages in excerpt</h2>
        <div className="flex flex-wrap gap-1.5 px-2">
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => jump(p)}
              className="h-7 min-w-[2rem] rounded border border-line bg-surface px-2 font-mono text-xs text-muted hover:bg-s2 hover:text-fg"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ── Centre column: document pages with source highlighting ──────────────── */

interface Marker {
  id: string;
  kind: 'claim' | 'evidence';
}

interface ViewerProps {
  doc: CaseDocument;
  highlight: Highlight | null;
  markers: Map<string, Marker[]>; // key `${page}-${paragraph}`
  onPickRef: (id: string) => void;
  activeRef?: string;
  wide?: boolean;
}

export function DocumentViewer({ doc, highlight, markers, onPickRef, activeRef, wide }: ViewerProps) {
  useEffect(() => {
    if (!highlight) return;
    const t = window.setTimeout(() => {
      document.getElementById(`p-${highlight.page}-${highlight.paragraph}`)?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    }, 60);
    return () => window.clearTimeout(t);
  }, [doc.documentId, highlight?.page, highlight?.paragraph, highlight?.quote]);

  return (
    <div className="space-y-4">
      {doc.content.map((pg) => (
        <section key={pg.page} id={`page-${pg.page}`} className={cx('paper mx-auto scroll-mt-24', wide ? 'max-w-[860px]' : 'max-w-[780px]')} aria-label={`Page ${pg.page}`}>
          <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-2.5 sm:px-8">
            <span className="truncate text-xs text-muted">{doc.name}</span>
            <span className="meta shrink-0">
              {doc.documentId} · PAGE {String(pg.page).padStart(2, '0')} OF {doc.pages}
            </span>
          </header>
          <div className="space-y-1.5 px-5 py-6 sm:px-8">
            {pg.paragraphs.map((p) => {
              const isHl = highlight?.page === pg.page && highlight.paragraph === p.n;
              const split = isHl ? splitByQuote(p.text, highlight?.quote) : null;
              const ms = markers.get(`${pg.page}-${p.n}`) ?? [];
              return (
                <div key={p.n} className="flex gap-3 sm:gap-4">
                  <span className="w-5 shrink-0 select-none pt-[7px] text-right font-mono text-[10.5px] text-subtle" aria-label={`Paragraph ${p.n}`}>
                    {p.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      id={`p-${pg.page}-${p.n}`}
                      className={cx('-mx-2 scroll-mt-32 rounded px-2 py-1 font-serif text-[15px] leading-[1.75] transition-colors', isHl && 'source-para')}
                      tabIndex={isHl ? -1 : undefined}
                    >
                      {split ? (
                        <>
                          {split.before}
                          <mark className="source-mark">{split.match}</mark>
                          {split.after}
                        </>
                      ) : (
                        p.text
                      )}
                    </p>
                    {ms.length > 0 && (
                      <div className="mb-1 mt-0.5 flex flex-wrap gap-1.5">
                        {ms.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => onPickRef(m.id)}
                            className={cx(
                              'inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10.5px] transition-colors',
                              activeRef === m.id ? 'border-primary bg-primary/15 text-primary-ink' : 'border-line text-muted hover:bg-s2 hover:text-fg',
                            )}
                            aria-label={`Show ${m.kind} ${m.id}`}
                          >
                            {m.kind === 'claim' ? <Quote className="h-2.5 w-2.5" aria-hidden /> : <FileText className="h-2.5 w-2.5" aria-hidden />}
                            {m.id}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {doc.pages > doc.content.length && (
        <p className="mx-auto max-w-[780px] text-center text-xs text-subtle">
          Synthetic excerpt: {doc.content.length} of {doc.pages} pages are included in this demonstration.
        </p>
      )}
    </div>
  );
}

/* ── Right column: extracted intelligence ────────────────────────────────── */

const ENTITY_ICON: Record<DocEntity['kind'], LucideIcon> = {
  person: User,
  location: MapPin,
  date: Calendar,
  reference: FileText,
};

interface IntelProps {
  caseId: string;
  claims: Claim[];
  evidence: Evidence[];
  citations: CitationRecord[];
  authorities: Authority[];
  entities: DocEntity[];
  linksByClaim: Map<string, ClaimLinks>;
  selectedRef: string | undefined;
  onSelectRef: (id: string) => void;
}

export function IntelligencePanel({ caseId, claims, evidence, citations, authorities, entities, linksByClaim, selectedRef, onSelectRef }: IntelProps) {
  const selClaim = claims.find((c) => c.claimId === selectedRef);
  const selEvidence = evidence.find((e) => e.evidenceId === selectedRef);
  const authById = new Map(authorities.map((a) => [a.authorityId, a] as const));

  return (
    <aside aria-label="Extracted intelligence" className="space-y-5">
      {(selClaim || selEvidence) && (
        <div className="card border-primary/40 p-3.5">
          <p className="section-label mb-2 text-primary-ink">Selected</p>
          {selClaim && (
            <>
              <div className="flex items-center gap-2">
                <IdChip>{selClaim.claimId}</IdChip>
                <ClaimStatusBadge status={selClaim.status} />
              </div>
              <p className="mt-2 text-[13px] font-medium">{selClaim.title}</p>
              <p className="mt-1 text-[13px] text-muted">“{selClaim.text}”</p>
              <div className="mt-2">
                <ConflictCountBadge count={linksByClaim.get(selClaim.claimId)?.conflicts.length ?? 0} />
              </div>
              <Link to={paths.claim(caseId, selClaim.claimId)} className="btn btn-secondary btn-sm mt-3">
                Open claim details <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </>
          )}
          {selEvidence && (
            <>
              <div className="flex items-center gap-2">
                <IdChip>{selEvidence.evidenceId}</IdChip>
                <span className="text-xs text-muted">{selEvidence.type}</span>
              </div>
              <p className="mt-2 text-[13px]">{selEvidence.description}</p>
              <Link to={paths.evidence(caseId, selEvidence.evidenceId)} className="btn btn-secondary btn-sm mt-3">
                Open evidence <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </>
          )}
        </div>
      )}

      <section>
        <h2 className="section-label mb-2">Claims</h2>
        {claims.length === 0 ? (
          <p className="text-[13px] text-subtle">No claims extracted from this document.</p>
        ) : (
          <ul className="space-y-1.5">
            {claims.map((c) => (
              <li key={c.claimId}>
                <button
                  type="button"
                  onClick={() => onSelectRef(c.claimId)}
                  aria-pressed={selectedRef === c.claimId}
                  className={cx(
                    'w-full rounded-md border px-2.5 py-2 text-left transition-colors',
                    selectedRef === c.claimId ? 'border-primary/60 bg-primary/10' : 'border-line hover:bg-s2',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium">{c.claimId}</span>
                    <span className="meta">
                      p.{c.source?.page}, ¶{c.source?.paragraph}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[12.5px] text-muted">{c.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="section-label mb-2">Evidence</h2>
        {evidence.length === 0 ? (
          <p className="text-[13px] text-subtle">No evidence items reference this document.</p>
        ) : (
          <ul className="space-y-1.5">
            {evidence.map((e) => (
              <li key={e.evidenceId}>
                <button
                  type="button"
                  onClick={() => onSelectRef(e.evidenceId)}
                  aria-pressed={selectedRef === e.evidenceId}
                  className={cx(
                    'w-full rounded-md border px-2.5 py-2 text-left transition-colors',
                    selectedRef === e.evidenceId ? 'border-primary/60 bg-primary/10' : 'border-line hover:bg-s2',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium">{e.evidenceId}</span>
                    <span className="meta">
                      p.{e.source.page}, ¶{e.source.paragraph}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[12.5px] text-muted">{e.type}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="section-label mb-2">Citations</h2>
        {citations.length === 0 ? (
          <p className="text-[13px] text-subtle">No citations appear in this document.</p>
        ) : (
          <ul className="space-y-1.5">
            {citations.map((c) => {
              const a = c.authorityId ? authById.get(c.authorityId) : undefined;
              return (
                <li key={c.citationId}>
                  <Link to={paths.citations(caseId, c.citationId)} className="block rounded-md border border-line px-2.5 py-2 hover:bg-s2">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-medium">{a ? a.label : 'No authority identified'}</span>
                      <span className="meta">{c.claimId}</span>
                    </span>
                    <span className="mt-1.5 block">
                      <CitationResultBadge result={c.result} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="section-label mb-2">Entities</h2>
        <ul className="flex flex-wrap gap-1.5">
          {entities.map((en) => {
            const Icon = ENTITY_ICON[en.kind];
            return (
              <li key={`${en.kind}-${en.label}`} className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-muted">
                <Icon className="h-3 w-3" aria-hidden />
                {en.label}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11.5px] text-subtle">Entities and references are extracted automatically and may be incomplete.</p>
      </section>
    </aside>
  );
}
