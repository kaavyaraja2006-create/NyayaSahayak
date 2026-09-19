import { Link } from 'react-router-dom';
import { useCaseId } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageHeader } from '../components/ui/PageHeader';
import { paths } from '../utils/routes';

const GLOSSARY: [string, string][] = [
  ['AI-assisted finding', 'Produced by automated analysis. Not independently verified.'],
  ['Potential conflict', 'Two sources may be inconsistent. Neither is presumed wrong.'],
  ['Needs human verification', 'A reviewer must check the finding against the source before relying on it.'],
  ['Source-grounded', 'The item points to a document, page and paragraph you can open.'],
  ['Potentially relevant authority', 'A retrieved passage that may bear on a proposition. It does not prove it.'],
  ['Prototype assessment signal', 'An indicative 0 to 100 score. Not a probability and not a legal conclusion.'],
];

const STEPS = [
  'Open Overview and check what needs attention.',
  'Open a claim and use View Source to see the exact highlighted passage.',
  'Open the Evidence Graph and select a claim to see what supports or conflicts with it.',
  'Open Conflict Review and compare two sources side by side.',
  'Record a decision in the Review Queue and add a comment.',
  'Check the Audit Trail to see the decision recorded, then generate a report.',
];

export default function Help() {
  useDocumentTitle('Help');
  const caseId = useCaseId();
  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader eyebrow="System" title="Help" description="How to read what NyayaSahayak shows you, and a suggested walkthrough." />
      <div className="space-y-5">
        <section className="card p-5 sm:p-6">
          <h2 className="text-base font-semibold">What this is</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
            NyayaSahayak is a review workspace. It organises case material into claims, evidence and authorities, points out potential conflicts and gaps, and keeps a record of every human decision. It does not decide facts, guilt or outcomes. All data in this build is synthetic.
          </p>
        </section>
        <section className="card p-5 sm:p-6">
          <h2 className="text-base font-semibold">Suggested walkthrough</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[13.5px] text-muted">
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <Link to={paths.overview(caseId)} className="btn btn-primary mt-4">Start at the overview</Link>
        </section>
        <section className="card p-5 sm:p-6">
          <h2 className="text-base font-semibold">Terms used</h2>
          <dl className="mt-3 divide-y divide-line">
            {GLOSSARY.map(([t, d]) => (
              <div key={t} className="grid gap-1 py-2.5 sm:grid-cols-[220px_1fr]">
                <dt className="text-[13.5px] font-medium">{t}</dt>
                <dd className="text-[13.5px] text-muted">{d}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="card p-5 sm:p-6">
          <h2 className="text-base font-semibold">Keyboard shortcuts</h2>
          <dl className="mt-3 space-y-2 text-[13.5px]">
            <div className="flex items-center gap-3"><dt className="flex gap-1"><kbd className="kbd">Ctrl</kbd><kbd className="kbd">K</kbd></dt><dd className="text-muted">Search claims, evidence, documents, hearing, authorities and findings (Cmd K on Mac)</dd></div>
            <div className="flex items-center gap-3"><dt><kbd className="kbd">Esc</kbd></dt><dd className="text-muted">Close a dialog, or leave Focus Mode</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}
