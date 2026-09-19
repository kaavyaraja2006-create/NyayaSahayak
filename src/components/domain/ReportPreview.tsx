import type { CaseBundle } from '../../types';
import { fmtDate, fmtDateTime } from '../../utils/format';
import { supportStrength } from '../../utils/selectors';
import { CLAIM_STATUS_META, FINDING_STATUS_META } from '../../utils/meta';
import { REVIEWER } from '../../data/findings';

const DECISION: Record<string, string> = { accept: 'Accepted', reject: 'Rejected', needs_verification: 'Needs verification' };

function H({ n, children }: { n: number; children: string }) {
  return (
    <h2 className="mb-2 mt-7 border-b border-line pb-1 text-[15px] font-semibold">
      {n}. {children}
    </h2>
  );
}

/** Printable audit report. Rendered in an always-light palette so "Export PDF" prints cleanly in any theme. */
export function ReportPreview({ bundle, generatedAt }: { bundle: CaseBundle; generatedAt: string | null }) {
  const c = bundle.currentCase;
  const docName = new Map(bundle.documents.map((d) => [d.documentId, d.name] as const));
  const authById = new Map(bundle.authorities.map((a) => [a.authorityId, a] as const));
  const evById = new Map(bundle.evidence.map((e) => [e.evidenceId, e] as const));
  const conflicts = bundle.findings.filter((f) => f.kind === 'conflict');
  const others = bundle.findings.filter((f) => f.kind !== 'conflict' && f.kind !== 'relationship');
  const latest = (id: string) => bundle.reviews.filter((r) => r.findingId === id).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))[0];
  const recentLogs = [...bundle.auditLogs].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, 15);
  const th = 'border-b border-line px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-subtle';
  const td = 'border-b border-line px-2 py-1.5 align-top';

  return (
    <article id="print-root" className="report-light mx-auto max-w-[860px] rounded-lg border border-line p-6 text-[12.5px] leading-relaxed shadow-card sm:p-10" aria-label="Report preview">
      <header className="border-b-2 border-fg pb-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-subtle">NyayaSahayak, Evidence audit report</p>
        <h1 className="mt-1 text-2xl font-semibold uppercase">{c.name}</h1>
        <p className="mt-1 text-muted">
          <span className="font-mono">{c.caseId}</span>, {c.caseType}, {c.court}
        </p>
        <p className="mt-2 inline-block rounded border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-primary-ink">Synthetic demonstration</p>
        <p className="mt-3 text-xs text-muted">
          Generated {generatedAt ? fmtDateTime(generatedAt) : 'on request'} for reviewer {REVIEWER}. Last analyzed {fmtDateTime(c.lastAnalyzed)}.
        </p>
      </header>

      <p className="mt-4 rounded border border-warning/40 bg-warning/10 p-3 text-warning-ink">
        This report contains AI-assisted findings compiled from synthetic case material. It is not legal advice and not a legal determination. Every finding requires human verification.
      </p>

      <H n={1}>Summary</H>
      <table className="w-full">
        <tbody>
          {[
            ['Documents', bundle.documents.filter((d) => d.category !== 'Hearings').length],
            ['Hearings', 1],
            ['Claims identified', bundle.claims.length],
            ['Evidence items', bundle.evidence.length],
            ['Potential conflicts flagged', conflicts.length],
            ['Candidate authorities (require verification)', bundle.authorities.length],
            ['Reviewer actions recorded', bundle.reviews.length],
          ].map(([k, v]) => (
            <tr key={k}>
              <td className={td}>{k}</td>
              <td className={`${td} text-right font-mono`}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <H n={2}>Claims and linked evidence</H>
      <table className="w-full">
        <thead>
          <tr>
            <th className={th}>Claim</th>
            <th className={th}>Statement</th>
            <th className={th}>Status</th>
            <th className={th}>Evidence</th>
            <th className={th}>Source</th>
          </tr>
        </thead>
        <tbody>
          {bundle.claims.map((cl) => {
            const rels = bundle.relationships.filter((r) => r.claimId === cl.claimId);
            const conf = rels.filter((r) => r.type === 'CONFLICTS').length;
            return (
              <tr key={cl.claimId}>
                <td className={`${td} font-mono`}>{cl.claimId}</td>
                <td className={td}>
                  {cl.text}
                  <span className="block text-[11px] text-subtle">Support signal {supportStrength(cl.signals)}/100 (prototype)</span>
                </td>
                <td className={td}>{CLAIM_STATUS_META[cl.status].label}</td>
                <td className={td}>
                  {rels.length} linked{conf > 0 && `, ${conf} potential conflict${conf > 1 ? 's' : ''}`}
                </td>
                <td className={td}>{cl.source ? `${docName.get(cl.source.documentId) ?? cl.source.documentId}, p.${cl.source.page}, ¶${cl.source.paragraph}` : 'No source identified'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <H n={3}>Potential conflicts</H>
      {conflicts.map((f) => {
        const r = latest(f.findingId);
        return (
          <div key={f.findingId} className="mb-3 break-inside-avoid rounded border border-line p-3">
            <p className="font-semibold">
              <span className="font-mono">{f.findingId}</span> {f.title} <span className="font-normal text-subtle">({f.claimId})</span>
            </p>
            <p className="mt-1 text-muted">{f.reason}</p>
            {f.comparison && (
              <p className="mt-1 text-[11.5px] text-subtle">
                Compared: {f.comparison.a.label} (p.{f.comparison.a.location.page}) and {f.comparison.b.label} (p.{f.comparison.b.location.page}).
              </p>
            )}
            <p className="mt-1.5 text-[11.5px]">
              Status: <strong>{FINDING_STATUS_META[f.status].label}</strong>
              {r && (
                <>
                  , last reviewer decision: {DECISION[r.decision]}
                  {r.comment ? ` ("${r.comment}")` : ''}
                </>
              )}
            </p>
          </div>
        );
      })}

      <H n={4}>Missing sources and citation issues</H>
      {others.length === 0 ? (
        <p className="text-muted">None flagged.</p>
      ) : (
        <ul className="list-disc space-y-1.5 pl-5">
          {others.map((f) => (
            <li key={f.findingId}>
              <span className="font-mono">{f.findingId}</span> {f.category}: {f.title}. {FINDING_STATUS_META[f.status].label}.
            </li>
          ))}
        </ul>
      )}

      <H n={5}>Candidate authorities (human legal verification required)</H>
      <ul className="space-y-2">
        {bundle.authorities.map((a) => (
          <li key={a.authorityId}>
            <strong>{a.label}</strong>, {a.caseName} ({a.court}, {a.year}). Relevance assessment: {a.relevance ?? 'not assessed'}
            {a.relevance !== null && '/100'}. Linked claims: {a.claimIds.join(', ') || 'none'}.
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11.5px] text-subtle">Authorities are fictional and drawn from a synthetic corpus. Potentially relevant does not mean supportive.</p>

      <H n={6}>Reviewer actions</H>
      <table className="w-full">
        <thead>
          <tr>
            <th className={th}>When</th>
            <th className={th}>Finding</th>
            <th className={th}>Decision</th>
            <th className={th}>Comment</th>
          </tr>
        </thead>
        <tbody>
          {[...bundle.reviews]
            .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
            .map((r) => (
              <tr key={r.reviewId}>
                <td className={`${td} font-mono text-[11px]`}>{fmtDateTime(r.timestamp)}</td>
                <td className={`${td} font-mono`}>{r.findingId}</td>
                <td className={td}>{DECISION[r.decision]}</td>
                <td className={td}>{r.comment || '—'}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <H n={7}>Audit trail (most recent 15 events)</H>
      <table className="w-full">
        <tbody>
          {recentLogs.map((l) => (
            <tr key={l.logId}>
              <td className={`${td} whitespace-nowrap font-mono text-[11px]`}>{fmtDateTime(l.timestamp)}</td>
              <td className={td}>
                {l.action} <span className="font-mono text-subtle">{l.objectId}</span>
              </td>
              <td className={`${td} text-subtle`}>{l.actor}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="mt-8 border-t border-line pt-3 text-[11px] text-subtle">
        NyayaSahayak prototype. Synthetic demonstration data, {fmtDate(c.filedOn)}. Evidence-assessment signals are prototype indicators, not probabilities. {evById.size} evidence items and {authById.size} authorities referenced.
      </footer>
    </article>
  );
}
