import { Link } from 'react-router-dom';
import { ExternalLink, Gavel, Users } from 'lucide-react';
import type { Claim, Evidence, Finding, Hearing, HearingStatement, Speaker } from '../../types';
import type { ClaimLinks } from '../../utils/selectors';
import { MARKER_META } from '../../utils/meta';
import { paths } from '../../utils/routes';
import { cx } from '../../utils/cx';
import { IdChip } from '../ui/Badge';
import { ClaimStatusBadge, ConflictCountBadge } from '../ui/StatusBadge';
import { AIAssistedBadge } from './AIAssistedBadge';
import { SourceReference } from './SourceReference';

/* ── Speakers ────────────────────────────────────────────────────────────── */

interface SpeakersProps {
  speakers: Speaker[];
  counts: Map<string, number>;
  active: string | null;
  onToggle: (id: string) => void;
}

export function SpeakerList({ speakers, counts, active, onToggle }: SpeakersProps) {
  return (
    <section aria-label="Speakers">
      <h2 className="section-label mb-2 px-1">Speakers</h2>
      <ul className="space-y-1">
        {speakers.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              aria-pressed={active === s.id}
              onClick={() => onToggle(s.id)}
              className={cx(
                'flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors',
                active === s.id ? 'border-primary/60 bg-primary/10' : 'border-transparent hover:bg-s2',
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-s2 text-muted">
                {s.id === 'judge' ? <Gavel className="h-3.5 w-3.5" aria-hidden /> : <Users className="h-3.5 w-3.5" aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium">{s.name}</span>
                <span className="block truncate text-[11.5px] text-subtle">{s.role}</span>
              </span>
              <span className="font-mono text-[11px] text-subtle">{counts.get(s.id) ?? 0}</span>
            </button>
          </li>
        ))}
      </ul>
      {active && (
        <button type="button" className="mt-2 px-1 text-xs font-medium text-primary-ink hover:underline" onClick={() => onToggle(active)}>
          Show all speakers
        </button>
      )}
    </section>
  );
}

/* ── Transcript ──────────────────────────────────────────────────────────── */

interface TranscriptProps {
  hearing: Hearing;
  statements: HearingStatement[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function HearingTranscript({ hearing, statements, activeId, onSelect }: TranscriptProps) {
  const byId = new Map(hearing.speakers.map((s) => [s.id, s] as const));
  return (
    <ol className="card divide-y divide-line" aria-label="Hearing transcript">
      {statements.map((st) => {
        const sp = byId.get(st.speaker);
        const active = st.statementId === activeId;
        const meta = st.marker ? MARKER_META[st.marker.kind] : null;
        return (
          <li
            key={st.statementId}
            id={`st-${st.statementId}`}
            className={cx('scroll-mt-24 border-l-2 px-4 py-3.5 transition-colors', active ? 'border-l-primary bg-primary/5' : 'border-l-transparent')}
          >
            <button type="button" onClick={() => onSelect(st.statementId)} className="block w-full text-left" aria-current={active ? 'true' : undefined}>
              <span className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-muted">{st.time}</span>
                <span className="rounded border border-line bg-s2 px-1.5 py-0.5 text-[11.5px] font-semibold">{sp?.name ?? st.speaker}</span>
              </span>
              <span className="mt-1.5 block text-[14.5px] leading-relaxed">“{st.text}”</span>
            </button>
            {(st.marker || st.evidenceIds.length > 0 || st.findingIds.length > 0) && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {st.claimIds.length > 0
                  ? st.claimIds.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onSelect(st.statementId)}
                        className="inline-flex h-[22px] items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 font-mono text-[11px] font-medium text-primary-ink hover:bg-primary/15"
                        aria-label={`Claim marker ${id}`}
                      >
                        {meta && <meta.Icon className="h-3 w-3" aria-hidden />}
                        {id}
                      </button>
                    ))
                  : meta && (
                      <span className="inline-flex h-[22px] items-center gap-1 rounded border border-line bg-s2 px-1.5 text-[11px] font-medium text-muted">
                        <meta.Icon className="h-3 w-3" aria-hidden />
                        {st.marker?.label}
                      </span>
                    )}
                {st.evidenceIds.map((id) => (
                  <IdChip key={id}>{id}</IdChip>
                ))}
                {st.findingIds.map((id) => (
                  <IdChip key={id} className="border-conflict/40 text-conflict-ink">{id}</IdChip>
                ))}
              </div>
            )}
          </li>
        );
      })}
      {statements.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">No statements for this speaker.</li>}
    </ol>
  );
}

/* ── Inspector for the selected statement ────────────────────────────────── */

interface InspectorProps {
  caseId: string;
  statement: HearingStatement | null;
  speaker: Speaker | undefined;
  claims: Claim[];
  evidence: Evidence[];
  findings: Finding[];
  linksByClaim: Map<string, ClaimLinks>;
}

export function StatementInspector({ caseId, statement, speaker, claims, evidence, findings, linksByClaim }: InspectorProps) {
  if (!statement) {
    return (
      <div className="card p-5 text-sm text-muted">
        <p className="section-label mb-2">Statement detail</p>
        Select a statement or a marker to see the claims, evidence and findings linked to it.
      </div>
    );
  }
  const meta = statement.marker ? MARKER_META[statement.marker.kind] : null;
  const linkedClaims = claims.filter((c) => statement.claimIds.includes(c.claimId));
  const linkedEvidence = evidence.filter((e) => statement.evidenceIds.includes(e.evidenceId));
  const linkedFindings = findings.filter((f) => statement.findingIds.includes(f.findingId));
  return (
    <aside className="card p-4" aria-label="Statement detail">
      <p className="section-label mb-2">Statement detail</p>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono">{statement.time}</span>
        <span className="font-semibold">{speaker?.name ?? statement.speaker}</span>
        {meta && <span className="text-muted">{meta.label}</span>}
      </div>
      <p className="mt-2 text-[13.5px] leading-relaxed">“{statement.text}”</p>
      <SourceReference loc={statement.location} refId={statement.statementId} variant="inline" className="mt-3" buttonLabel="View in transcript" />

      {statement.marker?.kind === 'uncertainty' && (
        <p className="mt-3 rounded-md bg-warning/10 p-2.5 text-[13px] text-warning-ink">
          The speaker expressed uncertainty. This is recorded as a signal, not as a contradiction.
        </p>
      )}
      {statement.marker?.kind === 'question' && (
        <p className="mt-3 rounded-md bg-s2 p-2.5 text-[13px] text-muted">A question put to a witness. No claim is extracted from questions.</p>
      )}

      {linkedClaims.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="section-label">Linked claims</p>
          {linkedClaims.map((c) => (
            <div key={c.claimId} className="rounded-md border border-line p-3">
              <div className="flex items-center gap-2">
                <IdChip>{c.claimId}</IdChip>
                <ClaimStatusBadge status={c.status} />
              </div>
              <p className="mt-1.5 text-[13px] font-medium">{c.title}</p>
              <div className="mt-1.5">
                <ConflictCountBadge count={linksByClaim.get(c.claimId)?.conflicts.length ?? 0} />
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <AIAssistedBadge />
                <Link to={paths.claim(caseId, c.claimId)} className="btn btn-secondary btn-sm">
                  Open claim <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {linkedEvidence.length > 0 && (
        <div className="mt-4">
          <p className="section-label mb-1.5">Evidence referenced</p>
          <ul className="space-y-1.5">
            {linkedEvidence.map((e) => (
              <li key={e.evidenceId}>
                <Link to={paths.evidence(caseId, e.evidenceId)} className="block rounded-md border border-line px-2.5 py-2 text-[13px] hover:bg-s2">
                  <span className="font-mono text-xs font-medium">{e.evidenceId}</span> <span className="text-muted">{e.type}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {linkedFindings.length > 0 && (
        <div className="mt-4">
          <p className="section-label mb-1.5">Findings</p>
          <ul className="space-y-1.5">
            {linkedFindings.map((f) => (
              <li key={f.findingId}>
                <Link to={paths.review(caseId, f.findingId)} className="block rounded-md border border-conflict/30 bg-conflict/5 px-2.5 py-2 text-[13px] hover:bg-conflict/10">
                  <span className="font-mono text-xs font-medium">{f.findingId}</span> {f.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
