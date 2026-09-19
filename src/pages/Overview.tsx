import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import { useCaseStore } from '../store/caseStore';
import { useCaseId } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CaseHeader } from '../components/domain/CaseHeader';
import { DocumentCard } from '../components/domain/DocumentCard';
import { AuditTimeline } from '../components/domain/AuditTimeline';
import { StatCard } from '../components/ui/StatCard';
import { Badge, IdChip } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { computeCoverage, computeStats, isPending } from '../utils/selectors';
import { PRIORITY_META } from '../utils/meta';
import { paths } from '../utils/routes';

const ORDER = { high: 0, medium: 1, low: 2 } as const;

export default function Overview() {
  useDocumentTitle('Case overview');
  const caseId = useCaseId();
  const currentCase = useCaseStore((s) => s.currentCase);
  const documents = useCaseStore((s) => s.documents);
  const claims = useCaseStore((s) => s.claims);
  const evidence = useCaseStore((s) => s.evidence);
  const relationships = useCaseStore((s) => s.relationships);
  const authorities = useCaseStore((s) => s.authorities);
  const citations = useCaseStore((s) => s.citations);
  const findings = useCaseStore((s) => s.findings);
  const reviews = useCaseStore((s) => s.reviews);
  const auditLogs = useCaseStore((s) => s.auditLogs);

  const stats = useMemo(() => computeStats({ claims, evidence, relationships, findings, documents, reviews, authoritiesCount: authorities.length }), [claims, evidence, relationships, findings, documents, reviews, authorities.length]);
  const coverage = useMemo(() => computeCoverage({ claims, relationships, citations, findings }), [claims, relationships, citations, findings]);
  const attention = useMemo(() => findings.filter(isPending).sort((a, b) => ORDER[a.priority] - ORDER[b.priority]), [findings]);
  const recent = useMemo(() => [...auditLogs].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, 6), [auditLogs]);
  const chart = useMemo(
    () => [
      { name: 'Reviewed', value: claims.filter((c) => c.status === 'reviewed').length, fill: 'rgb(var(--success))' },
      { name: 'Needs review', value: claims.filter((c) => c.status === 'needs_review').length, fill: 'rgb(var(--warning))' },
      { name: 'Unresolved', value: claims.filter((c) => c.status === 'unresolved').length, fill: 'rgb(var(--subtle))' },
    ],
    [claims],
  );

  if (!currentCase) return null;
  const caseDocs = documents.filter((d) => d.category !== 'Hearings');

  return (
    <div className="mx-auto max-w-[1280px] space-y-5">
      <CaseHeader data={currentCase} counts={{ documents: caseDocs.length, hearings: stats.hearings, claims: stats.claims, evidence: stats.evidence }} />

      <section aria-label="Key figures" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard value={stats.claims} label="Claims identified" to={paths.claims(caseId)} />
        <StatCard value={stats.evidence} label="Evidence linked" to={paths.evidence(caseId)} />
        <StatCard value={stats.conflicts} label="Potential conflicts" tone="conflict" to={paths.conflicts(caseId)} />
        <StatCard value={stats.reviewItems} label="Items requiring review" tone="warning" to={paths.review(caseId)} />
        <StatCard value={caseDocs.length} label="Documents" to={paths.documents(caseId)} />
        <StatCard value={stats.hearings} label="Hearing" to={paths.hearing(caseId)} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="card" aria-labelledby="attention-h">
          <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 id="attention-h" className="text-[15px] font-semibold">Needs attention</h2>
            <Badge tone="warning">{attention.length} open</Badge>
          </header>
          {attention.length === 0 ? (
            <EmptyState className="m-4" Icon={CheckCircle2} title="Queue clear" body="Every finding has a reviewer decision. You can generate the audit report." />
          ) : (
            <ul className="divide-y divide-line">
              {attention.map((f) => {
                const pr = PRIORITY_META[f.priority];
                return (
                  <li key={f.findingId}>
                    <Link to={paths.review(caseId, f.findingId)} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-s2/60">
                      <span className="mt-0.5 flex shrink-0 flex-col items-start gap-1.5">
                        <IdChip>{f.findingId}</IdChip>
                        <Badge tone={pr.tone}>{pr.label}</Badge>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs text-muted">{f.category}</span>
                        <span className="block text-[13.5px] font-medium">{f.title}</span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-subtle" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-5" aria-labelledby="coverage-h">
          <h2 id="coverage-h" className="text-[15px] font-semibold">Review progress</h2>
          <p className="mt-0.5 text-xs text-subtle">Workflow coverage. Not a measure of case strength.</p>
          <ul className="mt-4 space-y-4">
            {coverage.map((c) => (
              <li key={c.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-medium">{c.label}</span>
                  <span className="font-mono text-[13px]">{c.value}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-s2" role="img" aria-label={`${c.label}: ${c.value} percent`}>
                  <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${c.value}%` }} />
                </div>
                <p className="mt-1 text-xs text-subtle">{c.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="status-h">
          <h2 id="status-h" className="text-[15px] font-semibold">Claims by review status</h2>
          <div className="mt-3 h-[168px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={96} axisLine={false} tickLine={false} tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }} />
                <ChartTooltip
                  cursor={{ fill: 'rgb(var(--surface-2))' }}
                  contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12, color: 'rgb(var(--fg))' }}
                />
                <Bar dataKey="value" barSize={18} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: 'rgb(var(--fg))', fontSize: 12 }}>
                  {chart.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5" aria-labelledby="recent-h">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-h" className="text-[15px] font-semibold">Recent activity</h2>
            <Link to={paths.audit(caseId)} className="text-[13px] font-medium text-primary-ink hover:underline">View audit trail</Link>
          </div>
          <AuditTimeline logs={recent} caseId={caseId} compact />
        </section>
      </div>

      <section aria-labelledby="mat-h">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="mat-h" className="text-[15px] font-semibold">Case material</h2>
          <Link to={paths.documents(caseId)} className="text-[13px] font-medium text-primary-ink hover:underline">All documents</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {caseDocs.slice(0, 4).map((d) => (
            <DocumentCard key={d.documentId} doc={d} caseId={caseId} />
          ))}
        </div>
      </section>
    </div>
  );
}
