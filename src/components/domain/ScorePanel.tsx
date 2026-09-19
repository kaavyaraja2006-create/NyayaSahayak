import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import type { AssessmentSignals } from '../../types';
import { SIGNAL_WEIGHTS, supportStrength } from '../../utils/selectors';
import { Tooltip } from '../ui/Tooltip';
import { cx } from '../../utils/cx';

interface RowProps {
  label: string;
  value: number;
  bar: string;
  help: string;
}

function ScoreRow({ label, value, bar, help }: RowProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
          {label}
          <Tooltip content={help} align="start">
            <button type="button" className="text-subtle hover:text-fg" aria-label={`About ${label}`}>
              <Info className="h-3.5 w-3.5" aria-hidden />
            </button>
          </Tooltip>
        </span>
        <span className="font-mono text-[13px]">
          <span className="text-base font-medium">{value}</span>
          <span className="text-subtle"> / 100</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-s2" role="img" aria-label={`${label}: ${value} out of 100`}>
        <div className={cx('h-full rounded-full transition-[width] duration-500', bar)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

const FACTORS: { key: keyof typeof SIGNAL_WEIGHTS; label: string; help: string }[] = [
  { key: 'directness', label: 'Source directness', help: 'How directly the source addresses the claim (first-hand observation vs. inference or hearsay).' },
  { key: 'quality', label: 'Source quality', help: 'Provenance and completeness of the source record, including how it was produced.' },
  { key: 'sources', label: 'Number of supporting sources', help: 'How many independent sources point in the same direction.' },
  { key: 'consistency', label: 'Extraction consistency', help: 'Agreement between repeated automated extractions of this item.' },
];

export function ScorePanel({ signals, className }: { signals: AssessmentSignals; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <section className={className} aria-label="System assessment">
      <div className="space-y-4">
        <ScoreRow
          label="Support Strength"
          value={supportStrength(signals)}
          bar="bg-primary"
          help="Weighted from source directness (30%), source quality (25%), number of supporting sources (25%) and extraction consistency (20%). A prototype signal, not a probability."
        />
        <ScoreRow
          label="Conflict Strength"
          value={signals.conflict}
          bar="bg-conflict"
          help="Observable factors suggesting two pieces of information may be inconsistent. It does not indicate that any source is wrong."
        />
        <ScoreRow
          label="Uncertainty"
          value={signals.uncertainty}
          bar="bg-warning"
          help="How ambiguous, incomplete or hedged the available sources are on this point."
        />
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-fg"
      >
        <ChevronDown className={cx('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} aria-hidden />
        How is Support Strength derived?
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5 rounded-md border border-line bg-s2/60 p-3 text-xs">
          {FACTORS.map((f) => (
            <li key={f.key} className="flex items-center justify-between gap-3">
              <Tooltip content={f.help} align="start" width="w-64">
                <span className="cursor-help border-b border-dotted border-subtle">{f.label}</span>
              </Tooltip>
              <span className="font-mono text-muted">
                {signals[f.key]} × {Math.round(SIGNAL_WEIGHTS[f.key] * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[11.5px] leading-snug text-subtle">Prototype evidence-assessment signals. Not legal probabilities or conclusions.</p>
    </section>
  );
}
