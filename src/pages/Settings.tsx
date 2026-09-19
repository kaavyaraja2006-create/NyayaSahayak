import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../store/caseStore';
import { toast, useUiStore } from '../store/uiStore';
import { devControls } from '../services/api';
import { useCaseId } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { RedactionDemo } from '../components/domain/RedactionDemo';
import { ThemeSettings } from '../components/domain/ThemeSettings';
import { PageHeader } from '../components/ui/PageHeader';
import { SIGNAL_WEIGHTS } from '../utils/selectors';
import { paths } from '../utils/routes';
import { cx } from '../utils/cx';
import type { ConflictSensitivity } from '../types';

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-24 p-5 sm:p-6" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="text-base font-semibold">{title}</h2>
      <p className="mb-5 mt-0.5 text-[13px] text-muted">{description}</p>
      {children}
    </section>
  );
}

function Toggle({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange?: (v: boolean) => void; label: string; hint: string; disabled?: boolean }) {
  return (
    <label className={cx('flex items-start gap-3', disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer')}>
      <input type="checkbox" className="mt-1 h-4 w-4 accent-[rgb(var(--primary))]" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
      <span>
        <span className="block text-[13px] font-medium">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
    </label>
  );
}

const SENSITIVITY: { value: ConflictSensitivity; label: string; hint: string }[] = [
  { value: 'low', label: 'Low', hint: 'Flags only clear inconsistencies' },
  { value: 'balanced', label: 'Balanced', hint: 'Default' },
  { value: 'high', label: 'High', hint: 'Also flags weaker signals' },
];

const NAV = [
  ['appearance', 'Appearance'],
  ['analysis', 'Analysis'],
  ['privacy', 'Privacy'],
  ['export', 'Export'],
  ['system', 'System'],
] as const;

export default function Settings() {
  useDocumentTitle('Settings');
  const ui = useUiStore();
  const navigate = useNavigate();
  const caseId = useCaseId();
  const load = useCaseStore((s) => s.load);

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader eyebrow="System" title="Settings" description="Preferences are saved in this browser." />
      <div className="grid items-start gap-6 lg:grid-cols-[170px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="hidden lg:sticky lg:top-20 lg:block">
          <ul className="space-y-0.5">
            {NAV.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block rounded-md px-3 py-1.5 text-[13px] text-muted hover:bg-s2 hover:text-fg">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-5">
          <Section id="appearance" title="Appearance" description="Theme, automatic Night Mode, density and motion.">
            <ThemeSettings />
          </Section>

          <Section id="analysis" title="Analysis" description="Controls for how findings are presented in this demonstration.">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Conflict sensitivity</legend>
              <div role="radiogroup" aria-label="Conflict sensitivity" className="grid gap-2 sm:grid-cols-3">
                {SENSITIVITY.map((s) => (
                  <label key={s.value} className={cx('cursor-pointer rounded-md border p-3 transition-colors', ui.conflictSensitivity === s.value ? 'border-primary bg-primary/10' : 'border-line hover:bg-s2/70')}>
                    <input type="radio" name="sens" className="sr-only" checked={ui.conflictSensitivity === s.value} onChange={() => ui.set({ conflictSensitivity: s.value })} />
                    <span className="block text-[13px] font-medium">{s.label}</span>
                    <span className="block text-xs text-muted">{s.hint}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-subtle">In this demonstration the findings are precomputed, so this preference is stored but does not re-run detection.</p>
            </fieldset>
            <div className="mt-6">
              <label htmlFor="topk" className="text-sm font-semibold">Authority retrieval depth</label>
              <select id="topk" className="input mt-2 w-40" value={ui.authorityTopK} onChange={(e) => ui.set({ authorityTopK: Number(e.target.value) })}>
                {[3, 5, 8, 10].map((n) => (
                  <option key={n} value={n}>Top {n}</option>
                ))}
              </select>
            </div>
            <div className="mt-6">
              <p className="text-sm font-semibold">Evidence assessment weights</p>
              <p className="mt-0.5 text-xs text-muted">Support Strength is a weighted prototype signal. It is not a probability.</p>
              <dl className="mt-2 grid max-w-sm grid-cols-[1fr_auto] gap-y-1.5 text-[13px]">
                {(Object.keys(SIGNAL_WEIGHTS) as (keyof typeof SIGNAL_WEIGHTS)[]).map((k) => (
                  <div key={k} className="contents">
                    <dt className="capitalize text-muted">{k === 'sources' ? 'Number of sources' : `Source ${k}`.replace('Source consistency', 'Extraction consistency')}</dt>
                    <dd className="font-mono">{Math.round(SIGNAL_WEIGHTS[k] * 100)}%</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Section>

          <Section id="privacy" title="Privacy" description="How personal information is handled in exports and in this demonstration.">
            <div className="space-y-4">
              <Toggle checked={ui.redactionEnabled} onChange={(v) => ui.set({ redactionEnabled: v })} label="Redact personal identifiers in exports" hint="Replaces names, phone numbers, emails and ID-like numbers in JSON and CSV exports. Prototype pattern matching." />
              <Toggle checked disabled label="Synthetic data mode" hint="Locked on. This build contains only fictional demonstration data." />
            </div>
            <div className="mt-6">
              <RedactionDemo />
            </div>
          </Section>

          <Section id="export" title="Export" description="Defaults for downloaded and printed reports.">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">PDF page size</legend>
              <div role="radiogroup" aria-label="PDF page size" className="inline-flex rounded-md border border-line p-0.5">
                {(['A4', 'Letter'] as const).map((p) => (
                  <button key={p} type="button" role="radio" aria-checked={ui.pdfPageSize === p} onClick={() => ui.set({ pdfPageSize: p })} className={cx('h-7 rounded px-4 text-xs font-medium', ui.pdfPageSize === p ? 'bg-primary text-on-primary' : 'text-muted hover:text-fg')}>
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-5">
              <Toggle checked={ui.jsonPretty} onChange={(v) => ui.set({ jsonPretty: v })} label="Pretty-print JSON exports" hint="Indented and human-readable. Turn off for compact files." />
            </div>
          </Section>

          <Section id="system" title="System" description="Connection status for this build.">
            <dl className="grid max-w-lg grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[13px]">
              <dt className="text-subtle">Frontend version</dt>
              <dd className="font-mono">0.1.0</dd>
              <dt className="text-subtle">API</dt>
              <dd>Mock service (in memory). Ready to replace with FastAPI.</dd>
              <dt className="text-subtle">Model service</dt>
              <dd>Not connected. Demonstration data only.</dd>
              <dt className="text-subtle">Storage</dt>
              <dd>In-memory seed data. Reviewer actions reset on reload.</dd>
            </dl>
            <div className="mt-5 rounded-lg border border-line bg-s2/40 p-4">
              <p className="text-sm font-semibold">Developer: error-state preview</p>
              <p className="mt-0.5 text-xs text-muted">Makes the next case request fail once so you can see the error and retry experience.</p>
              <button
                type="button"
                className="btn btn-secondary mt-3"
                onClick={() => {
                  devControls.failNextRequest();
                  void load(caseId, true);
                  toast('The next request will fail once', 'warning');
                  navigate(paths.overview(caseId));
                }}
              >
                Simulate a load failure
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
