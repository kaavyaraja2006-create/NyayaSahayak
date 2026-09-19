import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, FileSearch, History, Landmark, Layers, ListChecks, ScrollText, ShieldCheck } from 'lucide-react';
import { Brand } from '../components/shell/Sidebar';
import { ThemeSwitcher } from '../components/shell/ThemeSwitcher';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { DEFAULT_CASE_ID, paths } from '../utils/routes';

function Illustration() {
  return (
    <svg viewBox="0 0 560 430" className="h-auto w-full" role="img" aria-label="Illustration: a claim linked to supporting and potentially conflicting evidence, each traced to a source, with a reviewer decision">
      {/* edges */}
      <path className="flow-line stroke-success" fill="none" strokeWidth="1.8" d="M236 200 C 300 200, 300 78, 352 78" />
      <path className="flow-line stroke-success" fill="none" strokeWidth="1.8" d="M236 208 C 300 208, 300 190, 352 190" />
      <path className="flow-line stroke-conflict" fill="none" strokeWidth="1.8" d="M236 216 C 300 216, 300 306, 352 306" />
      <path className="flow-line stroke-primary" fill="none" strokeWidth="1.4" d="M150 256 C 150 290, 120 300, 110 340" />
      <path className="stroke-line" fill="none" strokeWidth="1.2" strokeDasharray="2 5" d="M464 100 L 464 138" />
      <path className="stroke-line" fill="none" strokeWidth="1.2" strokeDasharray="2 5" d="M464 212 L 464 250" />

      {/* claim */}
      <g>
        <rect x="52" y="160" width="184" height="96" rx="10" className="fill-surface stroke-primary" strokeWidth="1.6" />
        <rect x="52" y="160" width="5" height="96" rx="2" className="fill-primary" />
        <text x="70" y="182" className="fill-subtle font-mono" fontSize="10.5" letterSpacing="0.6">CLAIM C-01</text>
        <text x="70" y="204" className="fill-fg" fontSize="13" fontWeight="600">Potential presence</text>
        <text x="70" y="221" className="fill-fg" fontSize="13" fontWeight="600">near Location A</text>
        <text x="70" y="243" className="fill-muted font-mono" fontSize="10">DOC-005 p.4 ¶2</text>
      </g>

      {/* evidence */}
      <g>
        <rect x="352" y="48" width="176" height="60" rx="8" className="fill-surface stroke-line" strokeWidth="1.2" />
        <text x="366" y="68" className="fill-subtle font-mono" fontSize="10" letterSpacing="0.5">SUPPORTS</text>
        <text x="366" y="88" className="fill-fg" fontSize="12.5" fontWeight="500">PW-3 statement</text>
        <rect x="352" y="160" width="176" height="60" rx="8" className="fill-surface stroke-line" strokeWidth="1.2" />
        <text x="366" y="180" className="fill-subtle font-mono" fontSize="10" letterSpacing="0.5">SUPPORTS</text>
        <text x="366" y="200" className="fill-fg" fontSize="12.5" fontWeight="500">CCTV frame, CAM-2</text>
        <rect x="352" y="276" width="176" height="60" rx="8" className="fill-surface stroke-conflict" strokeWidth="1.5" />
        <text x="366" y="296" className="fill-conflict-ink font-mono" fontSize="10" letterSpacing="0.5">POTENTIAL CONFLICT</text>
        <text x="366" y="316" className="fill-fg" fontSize="12.5" fontWeight="500">Phone metadata</text>
      </g>

      {/* sources */}
      <g>
        <text x="352" y="124" className="fill-subtle font-mono" fontSize="9.5">Source: Statement, p.4</text>
        <text x="352" y="236" className="fill-subtle font-mono" fontSize="9.5">Source: CCTV report, p.2</text>
        <text x="352" y="352" className="fill-subtle font-mono" fontSize="9.5">Source: Phone report, p.3</text>
      </g>

      {/* authority + review */}
      <g>
        <rect x="24" y="336" width="170" height="56" rx="8" className="fill-surface stroke-line" strokeWidth="1.2" />
        <text x="38" y="356" className="fill-subtle font-mono" fontSize="10" letterSpacing="0.5">AUTHORITY</text>
        <text x="38" y="376" className="fill-fg" fontSize="12" fontWeight="500">Potentially relevant</text>
        <rect x="352" y="372" width="176" height="42" rx="21" className="fill-warning/10 stroke-warning" strokeWidth="1.2" />
        <text x="440" y="398" textAnchor="middle" className="fill-warning-ink" fontSize="12" fontWeight="600">Human review required</text>
      </g>
    </svg>
  );
}

const STEPS = [
  { Icon: ListChecks, title: 'Claim', body: 'Assertions are extracted from statements, reports and hearings.' },
  { Icon: Layers, title: 'Evidence', body: 'Each claim is linked to the material that supports, conflicts with or contextualises it.' },
  { Icon: Landmark, title: 'Authority', body: 'Candidate authorities are retrieved for legal propositions.' },
  { Icon: ClipboardCheck, title: 'Human review', body: 'A reviewer accepts, rejects or flags every finding.' },
  { Icon: History, title: 'Audit trail', body: 'Every action is recorded with who, what and when.' },
];

const PILLARS = [
  { Icon: FileSearch, title: 'Source-grounded', body: 'Every claim and finding points to a document, page and paragraph. One click highlights the exact passage.' },
  { Icon: ShieldCheck, title: 'Human in the loop', body: 'The system flags potential conflicts and gaps. It never decides them. Reviewers do.' },
  { Icon: ScrollText, title: 'Audit ready', body: 'A complete, exportable record of what was flagged, what was reviewed and why.' },
];

export default function Landing() {
  useDocumentTitle('Evidence. Context. Traceability.');
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="relative z-10 mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Link to={paths.overview(DEFAULT_CASE_ID)} className="btn btn-secondary">
            Enter workspace
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-16 pt-10 lg:grid-cols-[1fr_1.05fr] lg:pb-24 lg:pt-16">
          <div>
            <p className="section-label">Source-traceable legal evidence analysis</p>
            <h1 className="mt-4 text-[40px] font-semibold leading-[1.05] tracking-tight sm:text-[56px]">
              Evidence.
              <br />
              Context.
              <br />
              <span className="text-primary-ink">Traceability.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted">
              Turn scattered case material into a traceable map of claims, evidence, authorities and human review, where every finding points back to the exact source passage.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to={paths.overview(DEFAULT_CASE_ID)} className="btn btn-primary btn-lg">
                Enter Case Workspace <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a href="#how" className="btn btn-ghost btn-lg">
                How it works
              </a>
            </div>
            <p className="mt-6 max-w-md text-xs text-subtle">Synthetic demonstration. All persons, places, records and authorities are fictional. No real case data is used.</p>
          </div>
          <div className="rounded-xl border border-line bg-surface/70 p-3 shadow-card sm:p-5">
            <Illustration />
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-[1240px] px-5 py-16">
          <p className="section-label">From material to a reviewed record</p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold sm:text-3xl">A single chain of custody for every claim</h2>
          <ol className="mt-8 grid gap-3 md:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-lg border border-line bg-surface p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-s2 text-muted">
                  <s.Icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="font-mono text-xs text-subtle">0{i + 1}</span> {s.title}
                </p>
                <p className="mt-1 text-[13px] text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title}>
              <p.Icon className="h-5 w-5 text-primary-ink" aria-hidden />
              <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-xl border border-line bg-surface p-5 sm:p-6">
          <p className="text-sm font-semibold">What NyayaSahayak does not do</p>
          <p className="mt-1.5 max-w-3xl text-sm text-muted">
            It does not determine facts, guilt, or the outcome of a case, and it does not replace legal judgment. It surfaces potential conflicts and gaps as AI-assisted findings that require human verification.
          </p>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-subtle">
          <span>NyayaSahayak prototype. Synthetic demonstration data.</span>
          <Link to="/help" className="hover:text-fg">Help and glossary</Link>
        </div>
      </footer>
    </div>
  );
}
