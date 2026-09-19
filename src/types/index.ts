// Strongly typed domain model. These shapes intentionally mirror the REST
// resources a FastAPI backend would expose (see README → "Replacing the mock API").

export type ThemeChoice = 'light' | 'dark' | 'night' | 'system';
export type EffectiveTheme = 'light' | 'dark' | 'night';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type ConflictSensitivity = 'low' | 'balanced' | 'high';

export type ClaimStatus = 'reviewed' | 'needs_review' | 'unresolved' | 'processing';
export type RelationshipType = 'SUPPORTS' | 'CONFLICTS' | 'CONTEXTUALIZES' | 'UNCERTAIN';

export type ClaimType =
  | 'Presence'
  | 'Timeline'
  | 'Identity'
  | 'CCTV interpretation'
  | 'Phone metadata'
  | 'Forensic finding'
  | 'Medical finding'
  | 'Witness statement'
  | 'Legal proposition'
  | 'Submission claim'
  | 'Movement'
  | 'Uncertainty';

export type EvidenceType =
  | 'Witness Statement'
  | 'CCTV'
  | 'Phone Metadata'
  | 'Forensic Report'
  | 'Medical Record'
  | 'Photograph'
  | 'Digital Record'
  | 'Document'
  | 'Hearing Statement';

/** Pointer to an exact passage inside a case document. */
export interface SourceLocation {
  documentId: string;
  page: number;
  paragraph: number;
  /** Exact substring of the paragraph that is highlighted in the viewer. */
  quote?: string;
}

export interface Case {
  caseId: string;
  name: string;
  caseType: string;
  status: 'Under Review' | 'Analysis Pending' | 'Closed';
  synthetic: boolean;
  court: string;
  filedOn: string; // ISO date
  lastAnalyzed: string; // ISO datetime
  summary: string;
}

export interface DocParagraph {
  n: number;
  text: string;
}
export interface DocPage {
  page: number;
  paragraphs: DocParagraph[];
}
export interface DocEntity {
  label: string;
  kind: 'person' | 'location' | 'date' | 'reference';
}

export type DocumentCategory = 'Statements' | 'Reports' | 'Evidence' | 'Submissions' | 'Hearings';

export interface CaseDocument {
  documentId: string;
  name: string;
  type: string;
  category: DocumentCategory;
  date: string; // ISO date
  pages: number;
  status: 'indexed' | 'processing' | 'queued';
  source: string;
  uploadedAt: string;
  confidentiality: 'Synthetic — public demo';
  /** Only the pages included in the synthetic excerpt. */
  content: DocPage[];
  entities: DocEntity[];
}

export interface AssessmentSignals {
  directness: number;
  quality: number;
  sources: number;
  consistency: number;
  conflict: number;
  uncertainty: number;
}

export interface Claim {
  claimId: string;
  title: string;
  text: string;
  type: ClaimType;
  source: SourceLocation | null;
  originNote?: string;
  status: ClaimStatus;
  signals: AssessmentSignals;
  hearingStatementIds: string[];
}

export interface Evidence {
  evidenceId: string;
  type: EvidenceType;
  description: string;
  source: SourceLocation;
  date: string; // ISO date
}

export interface Relationship {
  relationshipId: string;
  claimId: string;
  evidenceId: string;
  type: RelationshipType;
  reason: string;
  assessment: string;
}

export interface Authority {
  authorityId: string;
  label: string;
  caseName: string;
  court: string;
  year: number;
  citation: string;
  paragraph: number;
  passage: string;
  claimIds: string[];
  relevance: number | null;
  whyRetrieved: string;
  status: 'verification_required' | 'weak_relevance' | 'unmapped';
  corpus: string;
}

export type CitationResult = 'potentially_relevant' | 'weak_relevance' | 'no_authority' | 'unable_to_map';

export interface CitationRecord {
  citationId: string;
  claimId: string;
  authorityId: string | null;
  result: CitationResult;
  citedAt: SourceLocation | null;
  note: string;
}

export type FindingKind = 'conflict' | 'citation' | 'missing_source' | 'authority' | 'relationship';
export type FindingGroup = 'evidence' | 'citation' | 'timeline';
export type FindingStatus = 'open' | 'accepted' | 'rejected' | 'needs_verification';
export type ReviewDecision = 'accept' | 'reject' | 'needs_verification';

export interface ComparisonSide {
  label: string;
  location: SourceLocation;
  excerpt: string;
  value: string;
  time: string;
}

export interface Finding {
  findingId: string;
  kind: FindingKind;
  category: string;
  group: FindingGroup;
  priority: 'high' | 'medium' | 'low';
  claimId: string;
  title: string;
  reason: string;
  conflictType?: string;
  comparison?: { a: ComparisonSide; b: ComparisonSide };
  relationshipIds: string[];
  evidenceIds: string[];
  authorityId?: string;
  status: FindingStatus;
  createdAt: string;
}

export interface Review {
  reviewId: string;
  findingId: string;
  decision: ReviewDecision;
  comment: string;
  reviewer: string;
  timestamp: string;
}

export interface AuditLog {
  logId: string;
  caseId: string;
  timestamp: string;
  actor: string;
  actorType: 'ai' | 'reviewer' | 'system';
  action: string;
  objectType: 'case' | 'document' | 'claim' | 'evidence' | 'finding' | 'authority' | 'report' | 'graph' | 'hearing';
  objectId: string;
  previousState?: string;
  newState?: string;
  details?: string;
}

export type MarkerKind = 'claim' | 'evidence' | 'question' | 'uncertainty' | 'conflict' | 'legal_argument';
export type SpeakerId = 'judge' | 'counsel' | 'pw1' | 'pw2' | 'pw3';

export interface Speaker {
  id: SpeakerId;
  name: string;
  role: string;
}

export interface HearingStatement {
  statementId: string;
  time: string; // HH:MM:SS
  speaker: SpeakerId;
  text: string;
  location: SourceLocation;
  marker?: { kind: MarkerKind; label: string };
  claimIds: string[];
  evidenceIds: string[];
  findingIds: string[];
}

export interface Hearing {
  hearingId: string;
  date: string; // ISO date
  court: string;
  documentId: string;
  speakers: Speaker[];
  statements: HearingStatement[];
}

export interface TimelineEvent {
  eventId: string;
  time: string; // "10:20 PM"
  label: string;
  detail: string;
  kind: 'phone' | 'cctv' | 'witness' | 'incident' | 'record';
  source: SourceLocation;
  claimIds: string[];
  conflict?: boolean;
}

export interface ReportRecord {
  reportId: string;
  caseId: string;
  generatedAt: string;
  counts: {
    documents: number;
    claims: number;
    evidence: number;
    conflicts: number;
    authorities: number;
    reviewActions: number;
  };
}

export interface AnalysisProgress {
  stageIndex: number;
  progress: number; // 0-100
}

export interface AnalysisSummary {
  claims: number;
  evidence: number;
  relationships: number;
  conflicts: number;
  authorities: number;
  completedAt: string;
}

export interface ReviewInput {
  decision: ReviewDecision;
  comment: string;
  reviewer: string;
}

export interface CaseBundle {
  currentCase: Case;
  documents: CaseDocument[];
  claims: Claim[];
  evidence: Evidence[];
  relationships: Relationship[];
  authorities: Authority[];
  citations: CitationRecord[];
  findings: Finding[];
  reviews: Review[];
  auditLogs: AuditLog[];
  hearing: Hearing;
  timeline: TimelineEvent[];
}
