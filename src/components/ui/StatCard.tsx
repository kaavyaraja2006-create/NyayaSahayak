import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';
import { TONE_TEXT } from '../../utils/meta';
import type { Tone } from '../../utils/meta';

interface Props {
  value: number | string;
  label: string;
  hint?: string;
  tone?: Tone;
  to?: string;
}

export function StatCard({ value, label, hint, tone = 'neutral', to }: Props) {
  const body = (
    <>
      <div className={cx('font-mono text-[26px] font-medium leading-none tracking-tight', tone === 'neutral' ? 'text-fg' : TONE_TEXT[tone])}>
        {value}
      </div>
      <div className="mt-2 text-[13px] font-medium text-fg">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-subtle">{hint}</div>}
    </>
  );
  const cls = 'card block p-4';
  return to ? (
    <Link to={to} className={cx(cls, 'card-hover')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
