import { create } from 'zustand';
import { api } from '../services/api';
import type { AnalysisResult } from '../services/api';
import type {
  AnalysisProgress,
  AuditLog,
  Authority,
  Case,
  CaseBundle,
  CaseDocument,
  CitationRecord,
  Claim,
  Evidence,
  Finding,
  Hearing,
  Relationship,
  ReportRecord,
  Review,
  ReviewInput,
  TimelineEvent,
} from '../types';
import { nowIso } from '../utils/format';
import { REVIEWER } from '../data/findings';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface CaseData {
  currentCase: Case | null;
  documents: CaseDocument[];
  claims: Claim[];
  evidence: Evidence[];
  relationships: Relationship[];
  authorities: Authority[];
  citations: CitationRecord[];
  findings: Finding[];
  reviews: Review[];
  auditLogs: AuditLog[];
  hearing: Hearing | null;
  timeline: TimelineEvent[];
}

interface CaseState extends CaseData {
  status: LoadStatus;
  caseId: string | null;
  lastReport: ReportRecord | null;
  load: (caseId: string, force?: boolean) => Promise<void>;
  saveReview: (findingId: string, input: Omit<ReviewInput, 'reviewer'>) => Promise<Review>;
  runAnalysis: (onProgress: (p: AnalysisProgress) => void, signal?: AbortSignal) => Promise<AnalysisResult>;
  generateReport: () => Promise<ReportRecord>;
  linkAuthority: (authorityId: string, claimId: string) => Promise<void>;
  logEvent: (entry: Pick<AuditLog, 'action' | 'objectType' | 'objectId'> & Partial<Pick<AuditLog, 'details' | 'previousState' | 'newState'>>, once?: boolean) => void;
  bundle: () => CaseBundle | null;
}

const EMPTY: CaseData = {
  currentCase: null,
  documents: [],
  claims: [],
  evidence: [],
  relationships: [],
  authorities: [],
  citations: [],
  findings: [],
  reviews: [],
  auditLogs: [],
  hearing: null,
  timeline: [],
};

const onceKeys = new Set<string>();
let logCounter = 0;

export const useCaseStore = create<CaseState>()((set, get) => ({
  ...EMPTY,
  status: 'idle',
  caseId: null,
  lastReport: null,

  async load(caseId, force = false) {
    const s = get();
    if (!force && s.caseId === caseId && (s.status === 'ready' || s.status === 'loading')) return;
    set({ status: 'loading', caseId });
    try {
      const [
        currentCase, documents, claims, evidence, relationships, authorities,
        citations, findings, reviews, auditLogs, hearing, timeline,
      ] = await Promise.all([
        api.getCase(caseId),
        api.getDocuments(caseId),
        api.getClaims(caseId),
        api.getEvidence(caseId),
        api.getRelationships(caseId),
        api.getAuthorities(caseId),
        api.getCitations(caseId),
        api.getFindings(caseId),
        api.getReviews(caseId),
        api.getAuditLogs(caseId),
        api.getHearing(caseId),
        api.getTimeline(caseId),
      ]);
      onceKeys.clear();
      set({
        currentCase, documents, claims, evidence, relationships, authorities,
        citations, findings, reviews, auditLogs, hearing, timeline,
        status: 'ready',
      });
    } catch {
      set({ status: 'error' });
    }
  },

  async saveReview(findingId, input) {
    const result = await api.updateReview(findingId, { ...input, reviewer: REVIEWER });
    set((s) => ({
      findings: s.findings.map((f) => (f.findingId === findingId ? result.finding : f)),
      reviews: [...s.reviews, result.review],
      auditLogs: [...s.auditLogs, ...result.auditLogs],
    }));
    return result.review;
  },

  async runAnalysis(onProgress, signal) {
    const caseId = get().caseId;
    if (!caseId) throw new Error('No case loaded');
    const result = await api.runAnalysis(caseId, { onProgress, signal });
    set((s) => ({
      currentCase: s.currentCase ? { ...s.currentCase, lastAnalyzed: result.lastAnalyzed } : s.currentCase,
      auditLogs: [...s.auditLogs, result.auditLog],
    }));
    return result;
  },

  async generateReport() {
    const caseId = get().caseId;
    if (!caseId) throw new Error('No case loaded');
    const report = await api.generateReport(caseId);
    set({ lastReport: report });
    get().logEvent({ action: 'Report generated', objectType: 'report', objectId: report.reportId, details: 'Audit report generated for export and preview.' });
    return report;
  },

  async linkAuthority(authorityId, claimId) {
    const updated = await api.linkAuthority(authorityId, claimId);
    set((s) => ({ authorities: s.authorities.map((a) => (a.authorityId === authorityId ? updated : a)) }));
    get().logEvent({ action: 'Authority linked to claim', objectType: 'authority', objectId: authorityId, details: `Linked to ${claimId}` });
  },

  logEvent(entry, once = false) {
    const caseId = get().caseId;
    if (!caseId) return;
    const key = `${entry.action}|${entry.objectType}|${entry.objectId}`;
    if (once) {
      if (onceKeys.has(key)) return;
      onceKeys.add(key);
    }
    logCounter += 1;
    const log: AuditLog = {
      logId: `AL-U${Date.now()}-${logCounter}`,
      caseId,
      timestamp: nowIso(),
      actor: REVIEWER,
      actorType: 'reviewer',
      ...entry,
    };
    set((s) => ({ auditLogs: [...s.auditLogs, log] }));
    void api.appendAuditLog(log);
  },

  bundle() {
    const s = get();
    if (!s.currentCase || !s.hearing) return null;
    return {
      currentCase: s.currentCase, documents: s.documents, claims: s.claims, evidence: s.evidence,
      relationships: s.relationships, authorities: s.authorities, citations: s.citations,
      findings: s.findings, reviews: s.reviews, auditLogs: s.auditLogs, hearing: s.hearing, timeline: s.timeline,
    };
  },
}));
