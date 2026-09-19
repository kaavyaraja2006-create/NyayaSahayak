import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExternalLink, Maximize2 } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useUiStore } from '../store/uiStore';
import { useCaseId, useClaimLinks } from '../hooks/useCaseData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFocusReset } from '../hooks/useFocusReset';
import { scrollBehavior } from '../hooks/useMotionPref';
import { HearingTimeline } from '../components/domain/HearingTimeline';
import { HearingTranscript, SpeakerList, StatementInspector } from '../components/domain/HearingTranscript';
import { PageHeader } from '../components/ui/PageHeader';
import { fmtDate } from '../utils/format';
import { paths } from '../utils/routes';
import { cx } from '../utils/cx';

export default function Hearing() {
  useDocumentTitle('Hearing');
  const caseId = useCaseId();
  const hearing = useCaseStore((s) => s.hearing);
  const claims = useCaseStore((s) => s.claims);
  const evidence = useCaseStore((s) => s.evidence);
  const findings = useCaseStore((s) => s.findings);
  const logEvent = useCaseStore((s) => s.logEvent);
  const linksByClaim = useClaimLinks();
  const focusMode = useUiStore((s) => s.focusMode);
  const setFocusMode = useUiStore((s) => s.setFocusMode);
  useFocusReset();

  const [sp, setSp] = useSearchParams();
  const param = sp.get('statement');
  const [activeId, setActiveId] = useState<string | null>(param);
  const [speaker, setSpeaker] = useState<string | null>(null);

  useEffect(() => {
    if (!param) return undefined;
    setActiveId(param);
    const t = window.setTimeout(() => document.getElementById(`st-${param}`)?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' }), 80);
    return () => window.clearTimeout(t);
  }, [param]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    hearing?.statements.forEach((s) => m.set(s.speaker, (m.get(s.speaker) ?? 0) + 1));
    return m;
  }, [hearing]);

  if (!hearing) return null;
  const statements = speaker ? hearing.statements.filter((s) => s.speaker === speaker) : hearing.statements;
  const active = hearing.statements.find((s) => s.statementId === activeId) ?? null;

  const select = (id: string): void => {
    setActiveId(id);
    setSp({ statement: id }, { replace: true });
    logEvent({ action: 'Hearing statement opened', objectType: 'hearing', objectId: id }, true);
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Hearing"
        title={`Hearing of ${fmtDate(hearing.date)}`}
        description={`${hearing.court}. Timestamped transcript with claims, evidence references and uncertainty marked.`}
        actions={
          <>
            <Link to={paths.document(caseId, hearing.documentId)} className="btn btn-secondary">
              Transcript document <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <button type="button" className="btn btn-secondary" aria-pressed={focusMode} onClick={() => setFocusMode(!focusMode)}>
              <Maximize2 className="h-3.5 w-3.5" aria-hidden /> {focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
            </button>
          </>
        }
      />
      <div className={cx('grid items-start gap-5', !focusMode && 'lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)_340px]', focusMode && 'mx-auto max-w-[860px]')}>
        {!focusMode && (
          <div className="lg:sticky lg:top-20">
            <SpeakerList speakers={hearing.speakers} counts={counts} active={speaker} onToggle={(id) => setSpeaker((cur) => (cur === id ? null : id))} />
          </div>
        )}
        <HearingTranscript hearing={hearing} statements={statements} activeId={activeId} onSelect={select} />
        {!focusMode && (
          <div className="lg:col-span-2 xl:col-span-1 xl:sticky xl:top-20">
            <StatementInspector
              caseId={caseId}
              statement={active}
              speaker={hearing.speakers.find((s) => s.id === active?.speaker)}
              claims={claims}
              evidence={evidence}
              findings={findings}
              linksByClaim={linksByClaim}
            />
          </div>
        )}
      </div>
      {!focusMode && (
        <div className="mt-5">
          <HearingTimeline statements={hearing.statements} activeId={activeId} onSelect={select} />
        </div>
      )}
    </div>
  );
}
