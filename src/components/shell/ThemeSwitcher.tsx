import { Check, Monitor, Moon, Sun, SunMoon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Popover } from '../ui/Popover';
import { useUiStore, toast } from '../../store/uiStore';
import { useEffectiveTheme } from '../../hooks/useEffectiveTheme';
import type { EffectiveTheme, ThemeChoice } from '../../types';
import { to12h } from '../../utils/format';
import { cx } from '../../utils/cx';

const ICON: Record<EffectiveTheme, LucideIcon> = { light: Sun, dark: Moon, night: SunMoon };
const OPTIONS: { value: ThemeChoice; label: string; Icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'night', label: 'Night', Icon: SunMoon },
  { value: 'system', label: 'Follow system', Icon: Monitor },
];

export function ThemeSwitcher() {
  const theme = useUiStore((s) => s.theme);
  const autoNight = useUiStore((s) => s.autoNight);
  const nightTo = useUiStore((s) => s.nightTo);
  const set = useUiStore((s) => s.set);
  const { effective, scheduleActive } = useEffectiveTheme();
  const Icon = ICON[effective];
  return (
    <Popover
      align="end"
      panelClassName="w-64"
      trigger={({ open, toggle }) => (
        <button type="button" className="btn-icon" onClick={toggle} aria-expanded={open} aria-haspopup="menu" aria-label={`Appearance: ${effective} theme`}>
          <Icon className="h-4 w-4" aria-hidden />
        </button>
      )}
    >
      {(close) => (
        <div className="p-1.5" role="menu" aria-label="Appearance">
          <p className="section-label px-2.5 pb-1 pt-1.5">Appearance</p>
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === o.value}
              onClick={() => {
                set({ theme: o.value });
                toast('Theme updated', 'info');
                close();
              }}
              className={cx('flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-s2', theme === o.value && 'font-medium')}
            >
              <o.Icon className="h-4 w-4 text-muted" aria-hidden />
              {o.label}
              {theme === o.value && <Check className="ml-auto h-3.5 w-3.5 text-primary-ink" aria-hidden />}
            </button>
          ))}
          {scheduleActive && (
            <div className="mx-1 mb-1 mt-1.5 rounded-md border border-line bg-s2/60 p-2.5 text-xs text-muted">
              Automatic Night Mode is active until {to12h(nightTo)} and overrides this choice.
              <button type="button" className="mt-1.5 block font-medium text-primary-ink hover:underline" onClick={() => { set({ autoNight: false }); toast('Automatic Night Mode turned off', 'info'); close(); }}>
                Turn off the schedule
              </button>
            </div>
          )}
          {!scheduleActive && autoNight && <p className="px-2.5 pb-1.5 pt-1 text-[11.5px] text-subtle">Night Mode switches on automatically on your schedule.</p>}
        </div>
      )}
    </Popover>
  );
}
