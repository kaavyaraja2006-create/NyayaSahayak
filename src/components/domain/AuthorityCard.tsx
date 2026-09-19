import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Landmark, Link2 } from 'lucide-react';
import type { Authority } from '../../types';
import { useCaseStore } from '../../store/caseStore';
import { toast } from '../../store/uiStore';
import { useCaseId } from '../../hooks/useCaseData';
import { paths } from '../../utils/routes';
import { cx } from '../../utils/cx';
import { Badge, IdChip } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Popover } from '../ui/Popover';
import { AIAssistedBadge } from './AIAssistedBadge';

const STATUS: Record<Authority['status'], { label: string; tone: 'warning' | 'neutral' }> = {
  verification_required: { label: 'Human verification required', tone: 'warning' },
  weak_relevance: { label: 'Weak relevance, human verification required', tone: 'warning' },
  unmapped: { label: 'Unable to map', tone: 'neutral' },
};

function LinkClaim({ authority }: { authority: Authority }) {
  const claims = useCaseStore((s) => s.claims);
  const linkAuthority = useCaseStore((s) => s.linkAuthority);
  const options = useMemo(() => claims.filter((c) => !authority.claimIds.includes(c.claimId)), [claims, authority.claimIds]);
  const [pick, setPick] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <Popover
      align="end"
      panelClassName="w-72"
      trigger={({ open, toggle }) => (
        <button type="button" className="btn btn-secondary btn-sm" onClick={toggle} aria-expanded={open}>
          <Link2 className="h-3.5 w-3.5" aria-hidden /> Link to Claim
        </button>
      )}
    >
      {(close) => (
        <div className="space-y-3 p-3">
          <label className="block text-xs font-medium text-muted" htmlFor={`link-${authority.authorityId}`}>
            Link {authority.label} to a claim
          </label>
          <select id={`link-${authority.authorityId}`} className="input" value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">Select a claim…</option>
            {options.map((c) => (
              <option key={c.claimId} value={c.claimId}>
                {c.claimId}: {c.title}
              </option>
            ))}
          </select>
          <p className="text-[11.5px] text-subtle">Linking records a reviewer action. It does not assert that the authority supports the claim.</p>
          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={!pick || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await linkAuthority(authority.authorityId, pick);
                toast(`${authority.label} linked to ${pick}`);
                setPick('');
                close();
              } catch {
                toast('Could not link the authority. Please retry.', 'error');
              } finally {
                setBusy(false);
              }
            }}
          >
            Link authority
          </button>
        </div>
      )}
    </Popover>
  );
}

interface Props {
  authority: Authority;
  highlighted?: boolean;
}

export function AuthorityCard({ authority, highlighted }: Props) {
  const caseId = useCaseId();
  const [open, setOpen] = useState(false);
  const st = STATUS[authority.status];
  return (
    <article id={`auth-${authority.authorityId}`} className={cx('card scroll-mt-24 p-4 sm:p-5', highlighted && 'border-primary/70 ring-2 ring-primary/25')}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Landmark className="h-4 w-4 text-muted" aria-hidden />
            <h3 className="text-base font-semibold">{authority.label}</h3>
            <IdChip>{authority.authorityId}</IdChip>
          </div>
          <p className="mt-1 text-sm">{authority.caseName}</p>
          <p className="mt-0.5 text-xs text-muted">
            {authority.court}, {authority.year}, <span className="font-mono">{authority.citation}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-subtle">Relevance assessment</p>
          <p className="font-mono text-lg">
            {authority.relevance !== null ? authority.relevance : '—'}
            <span className="text-xs text-subtle">{authority.relevance !== null ? ' / 100' : ' not assessed'}</span>
          </p>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-subtle">Relevant to:</span>
        {authority.claimIds.length === 0 && <span className="text-muted">No claim linked</span>}
        {authority.claimIds.map((id) => (
          <Link key={id} to={paths.claim(caseId, id)} className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] hover:bg-s2">
            {id}
          </Link>
        ))}
      </div>

      <figure className="mt-3 rounded-md border-l-2 border-primary/60 bg-s2/70 p-3">
        <figcaption className="mb-1 text-xs text-subtle">
          Retrieved passage, paragraph <span className="font-mono">{authority.paragraph}</span>
        </figcaption>
        <blockquote className="text-[13px] italic leading-relaxed">“{authority.passage}”</blockquote>
      </figure>
      <p className="mt-2 text-xs text-muted">
        <span className="text-subtle">Why retrieved: </span>
        {authority.whyRetrieved}
      </p>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {authority.status === 'verification_required' && <Badge tone="success">Potentially relevant</Badge>}
          <Badge tone={st.tone}>{st.label}</Badge>
          <AIAssistedBadge sources={[authority.corpus]} />
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
            <BookOpen className="h-3.5 w-3.5" aria-hidden /> Open Source
          </button>
          <LinkClaim authority={authority} />
        </div>
      </footer>
      <p className="mt-3 text-[11.5px] text-subtle">
        Requires human legal verification. Corpus: {authority.corpus}. This passage is not a statement that the authority proves any proposition.
      </p>

      <Modal open={open} onClose={() => setOpen(false)} title={authority.caseName} description={`${authority.court}, ${authority.year}`} size="md">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
          <dt className="text-subtle">Citation</dt>
          <dd className="font-mono">{authority.citation}</dd>
          <dt className="text-subtle">Paragraph</dt>
          <dd className="font-mono">{authority.paragraph}</dd>
          <dt className="text-subtle">Corpus</dt>
          <dd>{authority.corpus}</dd>
        </dl>
        <blockquote className="mt-4 rounded-md border-l-2 border-primary/60 bg-s2/70 p-3 text-sm italic leading-relaxed">“{authority.passage}”</blockquote>
        <p className="mt-4 text-xs text-muted">
          This is a fictional authority in a synthetic demonstration corpus. In a production deployment the full source judgment would open here for verification.
        </p>
      </Modal>
    </article>
  );
}
