export type ClassValue = string | false | null | undefined;

/** Tiny class-name joiner. */
export const cx = (...values: ClassValue[]): string => values.filter(Boolean).join(' ');
