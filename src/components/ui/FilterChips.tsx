import { cx } from '../../utils/cx';

interface Option<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
  className?: string;
}

export function FilterChips<T extends string>({ options, value, onChange, ariaLabel, className }: Props<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className={cx('flex flex-wrap items-center gap-1.5', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cx(
              'inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors duration-150',
              active ? 'border-primary/60 bg-primary/10 text-primary-ink' : 'border-line bg-surface text-muted hover:bg-s2 hover:text-fg',
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cx('font-mono text-[10.5px]', active ? 'text-primary-ink/80' : 'text-subtle')}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
