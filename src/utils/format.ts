const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number): string => String(n).padStart(2, '0');

export function fmtDate(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function fmtTime12(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  return `${pad(h % 12 === 0 ? 12 : h % 12)}:${pad(d.getMinutes())} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)}, ${fmtTime12(iso)}`;
}

export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "22:00" → "10:00 PM" */
export function to12h(hhmm: string): string {
  const [hs, ms] = hhmm.split(':');
  const h = Number(hs);
  return `${pad(h % 12 === 0 ? 12 : h % 12)}:${ms} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** "10:06:18" → seconds since midnight */
export function timeToSeconds(t: string): number {
  const [h, m, s] = t.split(':').map(Number);
  return h * 3600 + m * 60 + (s || 0);
}

export function plural(n: number, one: string, many?: string): string {
  return `${n} ${n === 1 ? one : many ?? `${one}s`}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function nowIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
