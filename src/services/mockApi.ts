import { seedBundle } from '../data';
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
  FindingStatus,
  Hearing,
  Relationship,
  ReportRecord,
  Review,
  ReviewDecision,
  ReviewInput,
  TimelineEvent,
} from '../types';
import { nowIso } from '../utils/format';
import type { Api, AnalysisResult, ReviewResult } from './api';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let db: CaseBundle = clone(seedBundle);
let failNext = false;
let counter = 100;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const mockControls = {
  /** The next request rejects once — used to demo the error state. */
  failNextRequest(): void {
    failNext = true;
  },
  reset(): void {
    db = clone(seedBundle);
  },
};

async function respond<T>(caseId: string | null, read: () => T, ms = 380): Promise<T> {
  await delay(ms + Math.random() * 160);
  if (failNext) {
    failNext = false;
    throw new ApiError('Service unavailable', 503);
  }
  if (caseId !== null && caseId !== db.currentCase.caseId) throw new ApiError('Case not found', 404);
  return clone(read());
}

const isoPlus = (seconds: number): string => {
  const d = new Date(Date.now() + seconds * 1000);
  const p2 = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
};

const STATUS_FOR: Record<ReviewDecision, FindingStatus> = {
  accept: 'accepted',
  reject: 'rejected',
  needs_verification: 'needs_verification',
};
const STATUS_LABEL: Record<FindingStatus, string> = {
  open: 'Open',
  accepted: 'Accepted',
  rejected: 'Rejected',
  needs_verification: 'Needs verification',
};

const STAGE_MS = [1100, 1300, 1500, 1900, 1500, 1300];

export const mockApi: Api = {
  getCases: () => respond(null, (): Case[] => [db.currentCase]),
  getCase: (id) => respond(id, (): Case => db.currentCase),
  getDocuments: (id) => respond(id, (): CaseDocument[] => db.documents),
  getDocument: (id, docId) =>
    respond(id, (): CaseDocument => {
      const d = db.documents.find((x) => x.documentId === docId);
      if (!d) throw new ApiError('Document not found', 404);
      return d;
    }),
  getClaims: (id) => respond(id, (): Claim[] => db.claims),
  getClaim: (id, claimId) =>
    respond(id, (): Claim => {
      const c = db.claims.find((x) => x.claimId === claimId);
      if (!c) throw new ApiError('Claim not found', 404);
      return c;
    }),
  getEvidence: (id) => respond(id, (): Evidence[] => db.evidence),
  getRelationships: (id) => respond(id, (): Relationship[] => db.relationships),
  getAuthorities: (id) => respond(id, (): Authority[] => db.authorities),
  getCitations: (id) => respond(id, (): CitationRecord[] => db.citations),
  getFindings: (id) => respond(id, (): Finding[] => db.findings),
  getReviews: (id) => respond(id, (): Review[] => db.reviews),
  getAuditLogs: (id) => respond(id, (): AuditLog[] => db.auditLogs),
  getHearing: (id) => respond(id, (): Hearing => db.hearing),
  getTimeline: (id) => respond(id, (): TimelineEvent[] => db.timeline),
  getCaseBundle: (id) => respond(id, (): CaseBundle => db, 600),

  async updateReview(findingId: string, input: ReviewInput): Promise<ReviewResult> {
    return respond(null, () => {
      const finding = db.findings.find((f) => f.findingId === findingId);
      if (!finding) throw new ApiError('Finding not found', 404);
      const previous = finding.status;
      finding.status = STATUS_FOR[input.decision];
      const review: Review = {
        reviewId: `RV-${String(++counter).padStart(3, '0')}`,
        findingId,
        decision: input.decision,
        comment: input.comment.trim(),
        reviewer: input.reviewer,
        timestamp: isoPlus(2),
      };
      db.reviews.push(review);
      const mk = (offset: number, action: string, extra: Partial<AuditLog>): AuditLog => ({
        logId: `AL-${++counter}`,
        caseId: db.currentCase.caseId,
        timestamp: isoPlus(offset),
        actor: input.reviewer,
        actorType: 'reviewer',
        action,
        objectType: 'finding',
        objectId: findingId,
        ...extra,
      });
      const logs: AuditLog[] = [
        mk(0, 'Status changed', { previousState: STATUS_LABEL[previous], newState: STATUS_LABEL[finding.status] }),
      ];
      if (review.comment) logs.push(mk(1, 'Reviewer comment added', { details: review.comment }));
      logs.push(mk(2, 'Review saved', { previousState: STATUS_LABEL[previous], newState: STATUS_LABEL[finding.status], details: `Review ${review.reviewId}` }));
      db.auditLogs.push(...logs);
      const result: ReviewResult = { finding, review, auditLogs: logs };
      return result;
    }, 450);
  },

  async appendAuditLog(entry: AuditLog): Promise<void> {
    db.auditLogs.push(clone(entry));
  },

  async linkAuthority(authorityId: string, claimId: string): Promise<Authority> {
    return respond(null, () => {
      const a = db.authorities.find((x) => x.authorityId === authorityId);
      if (!a) throw new ApiError('Authority not found', 404);
      if (!a.claimIds.includes(claimId)) a.claimIds.push(claimId);
      return a;
    }, 200);
  },

  async runAnalysis(caseId: string, opts: { onProgress: (p: AnalysisProgress) => void; signal?: AbortSignal }): Promise<AnalysisResult> {
    if (caseId !== db.currentCase.caseId) throw new ApiError('Case not found', 404);
    const total = STAGE_MS.reduce((a, b) => a + b, 0);
    let elapsed = 0;
    for (let stage = 0; stage < STAGE_MS.length; stage += 1) {
      const steps = Math.max(4, Math.round(STAGE_MS[stage] / 90));
      for (let s = 1; s <= steps; s += 1) {
        await delay(STAGE_MS[stage] / steps);
        if (opts.signal?.aborted) throw new DOMException('Analysis cancelled', 'AbortError');
        const at = elapsed + (STAGE_MS[stage] * s) / steps;
        opts.onProgress({ stageIndex: stage, progress: Math.min(100, Math.round((at / total) * 100)) });
      }
      elapsed += STAGE_MS[stage];
    }
    const completedAt = nowIso();
    db.currentCase.lastAnalyzed = completedAt;
    const auditLog: AuditLog = {
      logId: `AL-${++counter}`,
      caseId,
      timestamp: completedAt,
      actor: 'AI pipeline',
      actorType: 'ai',
      action: 'Analysis completed',
      objectType: 'case',
      objectId: caseId,
      details: 'Analysis re-run over the indexed case material.',
    };
    db.auditLogs.push(auditLog);
    return {
      summary: {
        claims: db.claims.length,
        evidence: db.evidence.length,
        relationships: db.relationships.length,
        conflicts: db.findings.filter((f) => f.kind === 'conflict').length,
        authorities: db.authorities.length,
        completedAt,
      },
      auditLog: clone(auditLog),
      lastAnalyzed: completedAt,
    };
  },

  generateReport: (caseId) =>
    respond(caseId, (): ReportRecord => ({
      reportId: `RPT-${String(++counter).padStart(4, '0')}`,
      caseId,
      generatedAt: nowIso(),
      counts: {
        documents: db.documents.length,
        claims: db.claims.length,
        evidence: db.evidence.length,
        conflicts: db.findings.filter((f) => f.kind === 'conflict').length,
        authorities: db.authorities.length,
        reviewActions: db.reviews.length,
      },
    }), 700),
};
