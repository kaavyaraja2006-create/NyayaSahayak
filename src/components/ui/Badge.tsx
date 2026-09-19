import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../../utils/cx';
import { TONE_BADGE } from '../../utils/meta';
import type { Meta, Tone } from '../../utils/meta';

interface BadgeProps {
  tone?: Tone;
  Icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  mono?: boolean;
}

/** Small status pill. Colour is always paired with an icon or label, never colour alone. */
export function Badge({ tone = 'neutral', Icon, children, className, mono }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded border px-1.5 text-[11.5px] font-medium leading-none',
        mono && 'font-mono',
        TONE_BADGE[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden />}
      {children}
    </span>
  );
}

/** Renders a Meta entry ({label, tone, Icon}) as a badge. */
export function MetaBadge({ meta, className, label }: { meta: Meta; className?: string; label?: string }) {
  return (
    <Badge tone={meta.tone} Icon={meta.Icon} className={className}>
      {label ?? meta.label}
    </Badge>
  );
}

/** Monospace identifier chip, e.g. C-01, E-003, DOC-005. */
export function IdChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex h-[20px] items-center rounded border border-line bg-s2 px-1.5 font-mono text-[11px] font-medium text-fg/85', className)}>
      {children}
    </span>
  );
}
