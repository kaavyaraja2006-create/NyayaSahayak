import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Circle, Loader2, ShieldCheck } from 'lucide-react';
import type { AnalysisSummary } from '../../types';
import { useCaseStore } from '../../store/caseStore';
import { toast, useUiStore } from '../../store/uiStore';
import { paths } from '../../utils/routes';
import { cx } from '../../utils/cx';
import { Modal } from '../ui/Modal';

const STAGES = ['Documents indexed', 'Hearing processed', 'Claims extracted', 'Mapping evidence', 'Detecting conflicts', 'Retrieving authorities'];

interface RunState {
  stage: number;
  progress: number;
  status: 'running' | 'done' | 'error';
  summary?: AnalysisSummary;
}

/** Global "Analyze Materials" dialog: a six-stage animated pipeline driven by the service layer. */
export function AnalysisPipeline() {
  const open = useUiStore((s) => s.analysisOpen);
  const setOpen = useUiStore((s) => s.setAnalysisOpen);
  const runAnalysis = useCaseStore((s) => s.runAnalysis);
  const caseId = useCaseStore((s) => s.caseId);
  const navigate = useNavigate();
  const [run, setRun] = useState<RunState>({ stage: 0, progress: 0, status: 'running' });
  const [controller, setController] = useState<AbortController | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const ac = new AbortController();
    setController(ac);
    setRun({ stage: 0, progress: 0, status: 'running' });
    runAnalysis((p) => setRun((r) => ({ ...r, stage: p.stageIndex, progress: p.progress })), ac.signal)
      .then((res) => {
        if (ac.signal.aborted) return;
        setRun({ stage: STAGES.length, progress: 100, status: 'done', summary: res.summary });
        toast('Analysis completed');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!ac.signal.aborted) setRun((r) => ({ ...r, status: 'error' }));
      });
    return () => ac.abort();
  }, [open, runAnalysis]);

  const cancel = (): void => {
    controller?.abort();
    setOpen(false);
    toast('Analysis cancelled', 'info');
  };
  const close = (): void => setOpen(false);

  return (
    <Modal open={open} onClose={close} dismissible={run.status !== 'running'} title="Analyzing case material" description="Synthetic demonstration pipeline" size="md" label="Analysis pipeline">
      <ol className="space-y-2.5" aria-label="Pipeline stages">
        {STAGES.map((label, i) => {
          const done = run.status === 'done' || i < run.stage;
          const active = run.status === 'running' && i === run.stage;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cx(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                  done ? 'border-success/50 bg-success/15 text-success-ink' : active ? 'border-primary/50 bg-primary/15 text-primary-ink' : 'border-line text-subtle',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Circle className="h-2.5 w-2.5" aria-hidden />}
              </span>
              <span className={cx(done || active ? 'text-fg' : 'text-subtle')}>{label}</span>
              {done && <span className="sr-only">complete</span>}
            </li>
          );
        })}
      </ol>

      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-xs text-muted">
          <span>{run.status === 'done' ? 'Analysis complete' : run.status === 'error' ? 'Analysis interrupted' : 'Processing…'}</span>
          <span className="font-mono">{run.progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-s2" role="progressbar" aria-valuenow={run.progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${run.progress}%` }} />
        </div>
      </div>

      {run.status === 'done' && run.summary && (
        <div className="mt-5 rounded-lg border border-success/30 bg-success/10 p-3.5 text-[13px]">
          <p className="flex items-center gap-1.5 font-medium text-success-ink">
            <ShieldCheck className="h-4 w-4" aria-hidden /> Analysis complete
          </p>
          <p className="mt-1.5 text-muted">
            {run.summary.claims} claims, {run.summary.evidence} evidence items, {run.summary.relationships} relationships, {run.summary.conflicts} potential conflicts and {run.summary.authorities} candidate authorities are available for human review. Existing reviewer decisions were preserved.
          </p>
        </div>
      )}
      {run.status === 'error' && (
        <p className="mt-5 rounded-lg border border-warning/40 bg-warning/10 p-3 text-[13px] text-warning-ink">The analysis could not be completed. Please retry.</p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        {run.status === 'running' ? (
          <button type="button" className="btn btn-secondary" onClick={cancel}>
            Cancel
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={close}>
              Close
            </button>
            {run.status === 'done' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  close();
                  if (caseId) navigate(paths.review(caseId));
                }}
              >
                View Findings
              </button>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
