import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { REDACTION_SAMPLE, redactText } from '../../utils/redact';
import { useUiStore } from '../../store/uiStore';

export function RedactionDemo() {
  const enabled = useUiStore((s) => s.redactionEnabled);
  const [text, setText] = useState(REDACTION_SAMPLE);
  const result = useMemo(() => redactText(text), [text]);
  const total = result.counts.phone + result.counts.email + result.counts.aadhaar + result.counts.person;
  return (
    <div className="rounded-lg border border-line bg-s2/40 p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-muted" aria-hidden />
        <h3 className="text-sm font-semibold">Redaction preview</h3>
        <span className="ml-auto text-xs text-subtle">{enabled ? 'Enabled for exports' : 'Disabled'}</span>
      </div>
      <p className="mt-1 text-xs text-muted">Pattern-based prototype. Try your own text. It is processed in this browser only and is not sent anywhere.</p>
      <label htmlFor="redact-in" className="section-label mt-3 block">
        Input
      </label>
      <textarea id="redact-in" className="textarea mt-1 min-h-[76px]" value={text} onChange={(e) => setText(e.target.value)} />
      <p className="section-label mt-3">Redacted output</p>
      <p className="mt-1 rounded-md border border-line bg-surface p-3 font-mono text-[12.5px] leading-relaxed">{result.output || '—'}</p>
      <p className="mt-2 text-xs text-subtle">
        {total} item{total === 1 ? '' : 's'} redacted: {result.counts.person} names, {result.counts.phone} phone numbers, {result.counts.email} emails, {result.counts.aadhaar} ID-like numbers. Prototype redaction may miss identifiers and must not be relied on for real data.
      </p>
    </div>
  );
}
