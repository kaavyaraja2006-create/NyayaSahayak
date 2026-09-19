import type { AuditLog, Finding, Review } from '../types';

// ─── SYNTHETIC DEMONSTRATION DATA ─────────────────────────────────────────────

export const REVIEWER = 'Demo Reviewer';
const CASE_ID = 'NS-2026-001';

export const findings: Finding[] = [
  {
    findingId: 'F-001',
    kind: 'conflict',
    category: 'Evidence conflict',
    group: 'evidence',
    priority: 'high',
    claimId: 'C-01',
    title: 'PW-3 statement ↔ Phone metadata',
    conflictType: 'Location / Timeline',
    reason:
      'The two sources contain potentially inconsistent location information during overlapping time intervals: PW-3 places Arun Kumar near Location A at about 10:45 PM, while the phone record places the handset registered to him on a Location B sector at 10:43 PM.',
    comparison: {
      a: {
        label: 'PW-3 Statement',
        location: { documentId: 'DOC-005', page: 4, paragraph: 2, quote: 'At about 10:45 PM I was walking home when I saw Arun Kumar near Location A' },
        excerpt: 'At about 10:45 PM I was walking home when I saw Arun Kumar near Location A, standing by the shuttered pharmacy.',
        value: 'Near Location A',
        time: '10:45 PM',
      },
      b: {
        label: 'Phone Metadata',
        location: { documentId: 'DOC-007', page: 3, paragraph: 1, quote: 'At 22:43:05 the handset registered on a cell sector serving the Temple Street Market area (Location B)' },
        excerpt: 'At 22:43:05 the handset registered on a cell sector serving the Temple Street Market area (Location B).',
        value: 'Location B',
        time: '10:43 PM',
      },
    },
    relationshipIds: ['R-001', 'R-003'],
    evidenceIds: ['E-001', 'E-003'],
    authorityId: 'AUTH-A',
    status: 'open',
    createdAt: '2026-09-19T09:38:15',
  },
  {
    findingId: 'F-002',
    kind: 'citation',
    category: 'Citation issue',
    group: 'citation',
    priority: 'medium',
    claimId: 'C-07',
    title: 'Claim has no identified supporting authority',
    reason:
      'The written submission states a legal proposition about delay in lodging the FIR but cites no authority, and no curated authority passed the relevance threshold. Citation requires verification.',
    relationshipIds: ['R-014'],
    evidenceIds: ['E-013'],
    status: 'open',
    createdAt: '2026-09-19T09:40:02',
  },
  {
    findingId: 'F-003',
    kind: 'missing_source',
    category: 'Missing source',
    group: 'evidence',
    priority: 'medium',
    claimId: 'C-09',
    title: 'Claim extracted without an identified source',
    reason:
      'The claim about departure on a two-wheeler appears in a hearing summary, but no statement or record containing it could be located in the indexed documents.',
    relationshipIds: [],
    evidenceIds: [],
    authorityId: 'AUTH-C',
    status: 'open',
    createdAt: '2026-09-19T09:35:09',
  },
  {
    findingId: 'F-004',
    kind: 'conflict',
    category: 'Timeline inconsistency',
    group: 'timeline',
    priority: 'high',
    claimId: 'C-05',
    title: 'PW-1 statement ↔ CCTV CAM-1',
    conflictType: 'Timeline',
    reason:
      'PW-1 states he left the shop at about 10:15 PM, while CAM-1 shows him at the shop frontage pulling down the shutter at 10:38 PM. The camera clock drift is under 30 seconds.',
    comparison: {
      a: {
        label: 'PW-1 Statement',
        location: { documentId: 'DOC-003', page: 2, paragraph: 3, quote: 'I closed the shop and left at about 10:15 PM' },
        excerpt: 'I closed the shop and left at about 10:15 PM, and walked towards the Riverside Road junction.',
        value: 'Left the shop',
        time: '10:15 PM',
      },
      b: {
        label: 'CCTV Analysis (CAM-1)',
        location: { documentId: 'DOC-006', page: 3, paragraph: 1, quote: 'CAM-1 at 22:38:40 shows Ravi Menon inside the shop frontage, pulling down the shutter' },
        excerpt: 'CAM-1 at 22:38:40 shows Ravi Menon inside the shop frontage, pulling down the shutter.',
        value: 'At shop frontage',
        time: '10:38 PM',
      },
    },
    relationshipIds: ['R-010', 'R-011'],
    evidenceIds: ['E-004', 'E-005'],
    status: 'open',
    createdAt: '2026-09-19T09:39:30',
  },
  {
    findingId: 'F-005',
    kind: 'authority',
    category: 'Authority relevance',
    group: 'citation',
    priority: 'low',
    claimId: 'C-04',
    title: 'Authority B may not directly address the finding',
    reason:
      'The cited passage concerns expert opinion in general. It may not directly address a fibre-comparison finding, so its relevance to the claim needs human legal verification.',
    relationshipIds: ['R-008'],
    evidenceIds: ['E-008'],
    authorityId: 'AUTH-B',
    status: 'open',
    createdAt: '2026-09-19T09:40:44',
  },
  {
    findingId: 'F-006',
    kind: 'conflict',
    category: 'Evidence conflict',
    group: 'evidence',
    priority: 'medium',
    claimId: 'C-11',
    title: 'FIR narrative ↔ Medical report',
    conflictType: 'Description / Injury',
    reason:
      'The FIR narrative describes strikes to the head and arms, while the medical report records injuries to the left forearm and shoulder and no head injury.',
    comparison: {
      a: {
        label: 'FIR narrative',
        location: { documentId: 'DOC-001', page: 2, paragraph: 2, quote: 'struck several times on the head and arms' },
        excerpt: 'The complainant alleges that he was struck several times on the head and arms before the assailant left the area on foot.',
        value: 'Head and arms',
        time: '11 Aug',
      },
      b: {
        label: 'Medical Report',
        location: { documentId: 'DOC-009', page: 2, paragraph: 1, quote: 'no injury to the head was recorded' },
        excerpt: 'a 4 cm laceration was noted over the left forearm with bruising over the left shoulder; no injury to the head was recorded.',
        value: 'Forearm and shoulder',
        time: '23:40',
      },
    },
    relationshipIds: ['R-019', 'R-020'],
    evidenceIds: ['E-010', 'E-014'],
    status: 'accepted',
    createdAt: '2026-09-19T09:37:02',
  },
  {
    findingId: 'F-007', kind: 'relationship', category: 'Relationship', group: 'evidence', priority: 'low', claimId: 'C-02',
    title: 'CCTV CAM-2 supports claim C-02', reason: 'Direct description of the footage supports the claim; relationship confirmed by reviewer.',
    relationshipIds: ['R-004'], evidenceIds: ['E-002'], status: 'accepted', createdAt: '2026-09-19T09:36:22',
  },
  {
    findingId: 'F-008', kind: 'relationship', category: 'Relationship', group: 'evidence', priority: 'low', claimId: 'C-04',
    title: 'Forensic fibre finding supports claim C-04', reason: 'Expert finding directly supports the claim; relationship confirmed by reviewer.',
    relationshipIds: ['R-008'], evidenceIds: ['E-008'], status: 'accepted', createdAt: '2026-09-19T09:36:22',
  },
  {
    findingId: 'F-009', kind: 'relationship', category: 'Relationship', group: 'evidence', priority: 'low', claimId: 'C-06',
    title: 'PW-2 and call log support claim C-06', reason: 'Witness statement and control room log are compatible; relationship confirmed by reviewer.',
    relationshipIds: ['R-012', 'R-013'], evidenceIds: ['E-006', 'E-012'], status: 'accepted', createdAt: '2026-09-19T09:36:22',
  },
  {
    findingId: 'F-010', kind: 'relationship', category: 'Relationship', group: 'evidence', priority: 'low', claimId: 'C-08',
    title: 'Cell record supports claim C-08', reason: 'Direct technical record supports the claim; relationship confirmed by reviewer.',
    relationshipIds: ['R-015'], evidenceIds: ['E-003'], status: 'accepted', createdAt: '2026-09-19T09:36:22',
  },
  {
    findingId: 'F-011', kind: 'relationship', category: 'Relationship', group: 'evidence', priority: 'low', claimId: 'C-11',
    title: 'Medical note supports claim C-11', reason: 'Direct clinical record supports the claim; relationship confirmed by reviewer.',
    relationshipIds: ['R-019'], evidenceIds: ['E-010'], status: 'accepted', createdAt: '2026-09-19T09:36:22',
  },
];

export const reviews: Review[] = [
  { reviewId: 'RV-001', findingId: 'F-006', decision: 'needs_verification', comment: 'Compare the FIR narrative against the treating doctor’s notes.', reviewer: REVIEWER, timestamp: '2026-09-18T15:02:11' },
  { reviewId: 'RV-002', findingId: 'F-006', decision: 'accept', comment: 'Descriptions differ; keep flagged for the hearing bundle.', reviewer: REVIEWER, timestamp: '2026-09-18T15:10:40' },
  { reviewId: 'RV-003', findingId: 'F-007', decision: 'accept', comment: 'Camera clock drift under 30 seconds noted.', reviewer: REVIEWER, timestamp: '2026-09-18T15:24:02' },
  { reviewId: 'RV-004', findingId: 'F-008', decision: 'accept', comment: '', reviewer: REVIEWER, timestamp: '2026-09-18T15:31:15' },
  { reviewId: 'RV-005', findingId: 'F-009', decision: 'accept', comment: '', reviewer: REVIEWER, timestamp: '2026-09-18T15:38:50' },
  { reviewId: 'RV-006', findingId: 'F-010', decision: 'accept', comment: '', reviewer: REVIEWER, timestamp: '2026-09-18T15:44:27' },
  { reviewId: 'RV-007', findingId: 'F-011', decision: 'accept', comment: '', reviewer: REVIEWER, timestamp: '2026-09-18T15:52:09' },
];

const AI = 'AI pipeline';

const seedAiLogs: AuditLog[] = [
  { logId: 'AL-001', caseId: CASE_ID, timestamp: '2026-09-19T09:21:04', actor: 'System', actorType: 'system', action: 'Case opened', objectType: 'case', objectId: CASE_ID },
  { logId: 'AL-002', caseId: CASE_ID, timestamp: '2026-09-19T09:27:12', actor: AI, actorType: 'ai', action: 'Documents indexed', objectType: 'document', objectId: 'DOC-001…DOC-011', details: '11 documents indexed with page and paragraph locations.' },
  { logId: 'AL-003', caseId: CASE_ID, timestamp: '2026-09-19T09:31:40', actor: AI, actorType: 'ai', action: 'Hearing transcript processed', objectType: 'hearing', objectId: 'DOC-011', details: '13 statements, 5 speakers.' },
  { logId: 'AL-004', caseId: CASE_ID, timestamp: '2026-09-19T09:35:09', actor: AI, actorType: 'ai', action: 'Claims extracted', objectType: 'claim', objectId: 'C-01…C-12', details: '12 claims identified; C-09 has no identified source.' },
  { logId: 'AL-005', caseId: CASE_ID, timestamp: '2026-09-19T09:36:22', actor: AI, actorType: 'ai', action: 'Evidence relationships created', objectType: 'evidence', objectId: 'E-001…E-017', details: '21 claim–evidence relationships.' },
  { logId: 'AL-006', caseId: CASE_ID, timestamp: '2026-09-19T09:38:15', actor: AI, actorType: 'ai', action: 'Potential conflict detected', objectType: 'finding', objectId: 'F-001', previousState: '—', newState: 'Open', details: 'Claim C-01: PW-3 statement ↔ Phone metadata.' },
  { logId: 'AL-007', caseId: CASE_ID, timestamp: '2026-09-19T09:39:30', actor: AI, actorType: 'ai', action: 'Potential conflict detected', objectType: 'finding', objectId: 'F-004', previousState: '—', newState: 'Open', details: 'Claim C-05: PW-1 statement ↔ CCTV CAM-1.' },
  { logId: 'AL-008', caseId: CASE_ID, timestamp: '2026-09-19T09:40:02', actor: AI, actorType: 'ai', action: 'Authority references retrieved', objectType: 'authority', objectId: 'AUTH-A…AUTH-D', details: '4 references from the curated demonstration corpus.' },
  { logId: 'AL-009', caseId: CASE_ID, timestamp: '2026-09-19T09:42:11', actor: AI, actorType: 'ai', action: 'Analysis completed', objectType: 'case', objectId: CASE_ID, details: '5 findings require human review.' },
];

const decisionLabel: Record<Review['decision'], string> = {
  accept: 'Accepted',
  reject: 'Rejected',
  needs_verification: 'Needs verification',
};

const seedReviewLogs: AuditLog[] = reviews.map((r, i) => ({
  logId: `AL-R${i + 1}`,
  caseId: CASE_ID,
  timestamp: r.timestamp,
  actor: r.reviewer,
  actorType: 'reviewer' as const,
  action: 'Review saved',
  objectType: 'finding' as const,
  objectId: r.findingId,
  previousState: i === 1 ? 'Needs verification' : 'Open',
  newState: decisionLabel[r.decision],
  details: r.comment || undefined,
}));

export const auditLogs: AuditLog[] = [...seedAiLogs, ...seedReviewLogs].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
