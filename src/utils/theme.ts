import type { EffectiveTheme, ThemeChoice } from '../types';

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
};

/** True when `now` falls inside [from, to), supporting windows that cross midnight. */
export function isWithinNightWindow(from: string, to: string, now: Date): boolean {
  const cur = now.getHours() * 60 + now.getMinutes();
  const a = toMinutes(from);
  const b = toMinutes(to);
  if (a === b) return false;
  return a < b ? cur >= a && cur < b : cur >= a || cur < b;
}

export interface ThemeInputs {
  theme: ThemeChoice;
  autoNight: boolean;
  nightFrom: string;
  nightTo: string;
  now: Date;
  systemDark: boolean;
}

export function resolveTheme(i: ThemeInputs): EffectiveTheme {
  if (i.autoNight && isWithinNightWindow(i.nightFrom, i.nightTo, i.now)) return 'night';
  if (i.theme === 'system') return i.systemDark ? 'dark' : 'light';
  return i.theme;
}
