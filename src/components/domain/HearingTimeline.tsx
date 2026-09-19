import type { HearingStatement, MarkerKind } from '../../types';
import { MARKER_META, TONE_BADGE } from '../../utils/meta';
import { timeToSeconds } from '../../utils/format';
import { cx } from '../../utils/cx';
import { Tooltip } from '../ui/Tooltip';

interface Props {
  statements: HearingStatement[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const LANE_ORDER: MarkerKind[] = ['claim', 'evidence', 'question', 'uncertainty', 'conflict', 'legal_argument'];
const LANE_H = 34;
const fmtTick = (secs: number): string => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Horizontal hearing timeline. Each marker kind has its own lane, colour and icon, so it never relies on colour alone. */
export function HearingTimeline({ statements, activeId, onSelect }: Props) {
  const marked = statements.filter((s) => s.marker);
  if (marked.length === 0) return null;
  const secs = statements.map((s) => timeToSeconds(s.time));
  const start = Math.floor(Math.min(...secs) / 600) * 600;
  const end = Math.max(start + 600, Math.ceil(Math.max(...secs) / 600) * 600);
  const span = end - start;
  const pos = (t: number): number => ((t - start) / span) * 100;
  const lanes = LANE_ORDER.filter((k) => marked.some((s) => s.marker?.kind === k));
  const ticks: number[] = [];
  for (let t = start; t <= end; t += 600) ticks.push(t);

  return (
    <section className="card p-4" aria-label="Hearing timeline">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="section-label">Hearing timeline</h2>
        <p className="text-xs text-subtle">Select a marker to jump to the statement.</p>
      </div>
      <div className="overflow-x-auto scroll-thin pb-1">
        <div className="relative min-w-[680px]" style={{ height: lanes.length * LANE_H + 28 }}>
          <div className="absolute inset-y-0 left-[124px] right-3">
            {ticks.map((t) => (
              <div key={t} className="absolute inset-y-0 border-l border-dashed border-line" style={{ left: `${pos(t)}%` }}>
                <span className="absolute -bottom-0.5 left-0 -translate-x-1/2 font-mono text-[10.5px] text-subtle">{fmtTick(t)}</span>
              </div>
            ))}
          </div>
          {lanes.map((kind, i) => {
            const meta = MARKER_META[kind];
            return (
              <div key={kind} className="absolute inset-x-0 flex items-center" style={{ top: i * LANE_H, height: LANE_H }}>
                <span className="flex w-[116px] shrink-0 items-center gap-1.5 text-xs text-muted">
                  <meta.Icon className="h-3.5 w-3.5" aria-hidden />
                  {meta.label}
                </span>
                <span className="ml-2 h-px flex-1 bg-line/70" aria-hidden />
              </div>
            );
          })}
          <div className="absolute inset-y-0 left-[124px] right-3">
            {marked.map((s) => {
              const kind = s.marker?.kind as MarkerKind;
              const meta = MARKER_META[kind];
              const lane = lanes.indexOf(kind);
              const active = s.statementId === activeId;
              return (
                <div key={s.statementId} className="absolute -translate-x-1/2" style={{ left: `${pos(timeToSeconds(s.time))}%`, top: lane * LANE_H + (LANE_H - 24) / 2 }}>
                  <Tooltip content={`${s.time}: ${s.marker?.label}`} width="w-44">
                    <button
                      type="button"
                      onClick={() => onSelect(s.statementId)}
                      aria-label={`${meta.label} at ${s.time}`}
                      aria-pressed={active}
                      className={cx(
                        'flex h-6 w-6 items-center justify-center rounded-full border transition-transform hover:scale-110',
                        TONE_BADGE[meta.tone],
                        active && 'ring-2 ring-primary ring-offset-2 ring-offset-surface',
                      )}
                    >
                      <meta.Icon className="h-3 w-3" aria-hidden />
                    </button>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
