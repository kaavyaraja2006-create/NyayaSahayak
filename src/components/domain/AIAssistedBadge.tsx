import { Sparkles } from 'lucide-react';
import { Popover } from '../ui/Popover';
import { cx } from '../../utils/cx';

interface Props {
  /** Names of the linked sources shown in the popover. */
  sources?: string[];
  className?: string;
}

/** Clickable transparency label required on every AI-generated finding. */
export function AIAssistedBadge({ sources = [], className }: Props) {
  return (
    <Popover
      className={className}
      panelClassName="w-80"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cx(
            'inline-flex h-[22px] items-center gap-1 rounded border px-1.5 font-mono text-[10.5px] font-medium uppercase tracking-wide transition-colors',
            open ? 'border-primary/60 bg-primary/15 text-primary-ink' : 'border-primary/30 bg-primary/10 text-primary-ink hover:bg-primary/15',
          )}
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          AI-assisted finding
        </button>
      )}
    >
      <div className="p-4 text-[13px]" role="dialog" aria-label="About AI-assisted findings">
        <p className="section-label mb-2 text-primary-ink">AI-assisted finding</p>
        <p>Generated through automated document analysis.</p>
        {sources.length > 0 && (
          <div className="mt-3">
            <p className="text-subtle">Linked sources:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-3 text-muted">This finding has not been independently verified.</p>
        <p className="mt-1 font-medium">Human review required.</p>
      </div>
    </Popover>
  );
}
