import { Monitor, Moon, Sun, SunMoon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import type { ThemeChoice, Density } from '../../types';
import { useEffectiveTheme } from '../../hooks/useEffectiveTheme';
import { to12h } from '../../utils/format';
import { cx } from '../../utils/cx';

const THEMES: { value: ThemeChoice; label: string; hint: string; Icon: LucideIcon; swatch: [string, string, string] }[] = [
  { value: 'light', label: 'Light', hint: 'Bright, high clarity', Icon: Sun, swatch: ['#F4F6F8', '#FFFFFF', '#4F6BFF'] },
  { value: 'dark', label: 'Dark', hint: 'Default. Deep neutral', Icon: Moon, swatch: ['#0B0F14', '#111720', '#4F6BFF'] },
  { value: 'night', label: 'Night', hint: 'Warm, low contrast', Icon: SunMoon, swatch: ['#181512', '#211D19', '#C99C5E'] },
  { value: 'system', label: 'Follow system', hint: 'Match your device', Icon: Monitor, swatch: ['#F4F6F8', '#0B0F14', '#4F6BFF'] },
];

const DENSITIES: { value: Density; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

export function ThemeSettings() {
  const ui = useUiStore();
  const { effective, scheduleActive } = useEffectiveTheme();
  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Theme</legend>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {THEMES.map((t) => {
            const active = ui.theme === t.value;
            return (
              <label key={t.value} className={cx('cursor-pointer rounded-lg border p-3 transition-colors', active ? 'border-primary bg-primary/10' : 'border-line hover:bg-s2/70')}>
                <input type="radio" name="theme" className="sr-only" checked={active} onChange={() => ui.set({ theme: t.value })} />
                <span className="flex items-center gap-2 text-[13px] font-medium">
                  <t.Icon className="h-4 w-4" aria-hidden /> {t.label}
                </span>
                <span className="mt-2.5 flex h-7 overflow-hidden rounded border border-line" aria-hidden>
                  <span className="flex-1" style={{ background: t.swatch[0] }} />
                  <span className="flex-1" style={{ background: t.swatch[1] }} />
                  <span className="w-3" style={{ background: t.swatch[2] }} />
                </span>
                <span className="mt-2 block text-xs text-muted">{t.hint}</span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-subtle">
          Showing: <span className="font-medium capitalize text-fg">{effective}</span>
          {scheduleActive && ' (automatic Night Mode is active)'}
        </p>
      </fieldset>

      <fieldset className="rounded-lg border border-line p-4">
        <legend className="px-1 text-sm font-semibold">Automatic Night Mode</legend>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[rgb(var(--primary))]" checked={ui.autoNight} onChange={(e) => ui.set({ autoNight: e.target.checked })} />
          <span>
            <span className="block text-[13px] font-medium">Switch to Night theme on a schedule</span>
            <span className="block text-xs text-muted">Night uses warmer, lower-contrast colours to reduce eye strain during long review sessions. It takes priority over the theme chosen above while active.</span>
          </span>
        </label>
        <div className={cx('mt-4 flex flex-wrap items-center gap-4', !ui.autoNight && 'pointer-events-none opacity-50')}>
          <label className="text-xs text-muted">
            From
            <input type="time" className="input ml-2 inline-block w-32" value={ui.nightFrom} onChange={(e) => ui.set({ nightFrom: e.target.value })} aria-label="Night mode start time" />
          </label>
          <label className="text-xs text-muted">
            Until
            <input type="time" className="input ml-2 inline-block w-32" value={ui.nightTo} onChange={(e) => ui.set({ nightTo: e.target.value })} aria-label="Night mode end time" />
          </label>
          <span className="text-xs text-subtle">
            Active {to12h(ui.nightFrom)} to {to12h(ui.nightTo)}
          </span>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Interface density</legend>
        <div role="radiogroup" aria-label="Interface density" className="inline-flex rounded-md border border-line p-0.5">
          {DENSITIES.map((d) => (
            <button
              key={d.value}
              type="button"
              role="radio"
              aria-checked={ui.density === d.value}
              onClick={() => ui.set({ density: d.value })}
              className={cx('h-7 rounded px-3 text-xs font-medium transition-colors', ui.density === d.value ? 'bg-primary text-on-primary' : 'text-muted hover:text-fg')}
            >
              {d.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-[rgb(var(--primary))]" checked={ui.reduceMotion} onChange={(e) => ui.set({ reduceMotion: e.target.checked })} />
        <span>
          <span className="block text-[13px] font-medium">Reduce animations</span>
          <span className="block text-xs text-muted">Removes transitions and moving lines. Your operating system’s reduced-motion setting is always respected.</span>
        </span>
      </label>
    </div>
  );
}
