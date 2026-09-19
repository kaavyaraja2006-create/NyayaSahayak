import type {
  AnalysisProgress,
  AnalysisSummary,
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
import { mockApi, mockControls } from './mockApi';

export interface AnalysisResult {
  summary: AnalysisSummary;
  auditLog: AuditLog;
  lastAnalyzed: string;
}

export interface ReviewResult {
  finding: Finding;
  review: Review;
  auditLogs: AuditLog[];
}

/**
 * The service contract used by the whole UI. `mockApi.ts` implements it in memory.
 * To connect a real FastAPI backend, implement this interface with `fetch` calls
 * (endpoint mapping is documented per method and in README.md) and change the
 * single export at the bottom of this file.
 */
export interface Api {
  /** GET /cases */
  getCases(): Promise<Case[]>;
  /** GET /cases/{id} */
  getCase(caseId: string): Promise<Case>;
  /** GET /cases/{id}/documents */
  getDocuments(caseId: string): Promise<CaseDocument[]>;
  /** GET /cases/{id}/documents/{documentId} */
  getDocument(caseId: string, documentId: string): Promise<CaseDocument>;
  /** GET /cases/{id}/claims */
  getClaims(caseId: string): Promise<Claim[]>;
  /** GET /cases/{id}/claims/{claimId} */
  getClaim(caseId: string, claimId: string): Promise<Claim>;
  /** GET /cases/{id}/evidence */
  getEvidence(caseId: string): Promise<Evidence[]>;
  /** GET /cases/{id}/relationships */
  getRelationships(caseId: string): Promise<Relationship[]>;
  /** GET /cases/{id}/authorities */
  getAuthorities(caseId: string): Promise<Authority[]>;
  /** GET /cases/{id}/citations */
  getCitations(caseId: string): Promise<CitationRecord[]>;
  /** GET /cases/{id}/findings */
  getFindings(caseId: string): Promise<Finding[]>;
  /** GET /cases/{id}/reviews */
  getReviews(caseId: string): Promise<Review[]>;
  /** GET /cases/{id}/audit-log */
  getAuditLogs(caseId: string): Promise<AuditLog[]>;
  /** GET /cases/{id}/hearing */
  getHearing(caseId: string): Promise<Hearing>;
  /** GET /cases/{id}/timeline */
  getTimeline(caseId: string): Promise<TimelineEvent[]>;
  /** Convenience: everything for a case in one round trip. */
  getCaseBundle(caseId: string): Promise<CaseBundle>;
  /** POST /findings/{id}/review */
  updateReview(findingId: string, input: ReviewInput): Promise<ReviewResult>;
  /** POST /cases/{id}/audit-log */
  appendAuditLog(entry: AuditLog): Promise<void>;
  /** POST /authorities/{id}/link  { claimId } */
  linkAuthority(authorityId: string, claimId: string): Promise<Authority>;
  /** POST /cases/{id}/analyze  (long-running: poll or stream progress) */
  runAnalysis(caseId: string, opts: { onProgress: (p: AnalysisProgress) => void; signal?: AbortSignal }): Promise<AnalysisResult>;
  /** POST /cases/{id}/generate-report */
  generateReport(caseId: string): Promise<ReportRecord>;
}

// ── Swap this line to connect a real backend ──────────────────────────────────
export const api: Api = mockApi;

/** Developer-only helpers for demonstrating loading/error states with the mock. */
export const devControls = mockControls;
