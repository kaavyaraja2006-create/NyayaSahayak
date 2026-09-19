import { useEffect, useMemo, useState } from 'react';
import { useUiStore } from '../store/uiStore';
import { isWithinNightWindow, resolveTheme } from '../utils/theme';
import type { EffectiveTheme } from '../types';

const DARK_MQ = '(prefers-color-scheme: dark)';

export interface EffectiveThemeInfo {
  effective: EffectiveTheme;
  /** True when the automatic Night schedule is currently overriding the chosen theme. */
  scheduleActive: boolean;
}

/**
 * Resolves the theme that should be on screen right now.
 * Precedence: automatic Night window > explicit choice > operating-system preference.
 * A 30-second tick (and a visibility check) lets the schedule fire without a reload.
 */
export function useEffectiveTheme(): EffectiveThemeInfo {
  const theme = useUiStore((s) => s.theme);
  const autoNight = useUiStore((s) => s.autoNight);
  const nightFrom = useUiStore((s) => s.nightFrom);
  const nightTo = useUiStore((s) => s.nightTo);
  const [tick, setTick] = useState(0);
  const [systemDark, setSystemDark] = useState<boolean>(() => window.matchMedia(DARK_MQ).matches);

  useEffect(() => {
    const mq = window.matchMedia(DARK_MQ);
    const onChange = (e: MediaQueryListEvent): void => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const bump = (): void => setTick((t) => t + 1);
    const id = window.setInterval(bump, 30000);
    document.addEventListener('visibilitychange', bump);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', bump);
    };
  }, []);

  return useMemo(() => {
    const now = new Date();
    const effective = resolveTheme({ theme, autoNight, nightFrom, nightTo, now, systemDark });
    const scheduleActive = autoNight && isWithinNightWindow(nightFrom, nightTo, now);
    return { effective, scheduleActive };
    // `tick` is intentionally a dependency so the schedule re-evaluates over time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, autoNight, nightFrom, nightTo, systemDark, tick]);
}
