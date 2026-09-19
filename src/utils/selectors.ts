import type {
  AssessmentSignals,
  Claim,
  CitationRecord,
  Evidence,
  Finding,
  Relationship,
  RelationshipType,
  Review,
  CaseDocument,
} from '../types';

/** Weighted "support strength" signal (prototype). Weights are shown in the UI. */
export const SIGNAL_WEIGHTS = { directness: 0.3, quality: 0.25, sources: 0.25, consistency: 0.2 } as const;

export function supportStrength(s: AssessmentSignals): number {
  return Math.round(
    s.directness * SIGNAL_WEIGHTS.directness +
      s.quality * SIGNAL_WEIGHTS.quality +
      s.sources * SIGNAL_WEIGHTS.sources +
      s.consistency * SIGNAL_WEIGHTS.consistency,
  );
}

export interface LinkedEvidence {
  relationship: Relationship;
  evidence: Evidence;
}

export interface ClaimLinks {
  all: LinkedEvidence[];
  supports: LinkedEvidence[];
  conflicts: LinkedEvidence[];
  context: LinkedEvidence[];
  uncertain: LinkedEvidence[];
}

export function linksForClaim(claimId: string, relationships: Relationship[], evidence: Evidence[]): ClaimLinks {
  const byId = new Map(evidence.map((e) => [e.evidenceId, e] as const));
  const all: LinkedEvidence[] = [];
  relationships.forEach((r) => {
    if (r.claimId !== claimId) return;
    const ev = byId.get(r.evidenceId);
    if (ev) all.push({ relationship: r, evidence: ev });
  });
  const pick = (t: RelationshipType) => all.filter((l) => l.relationship.type === t);
  return {
    all,
    supports: pick('SUPPORTS'),
    conflicts: pick('CONFLICTS'),
    context: pick('CONTEXTUALIZES'),
    uncertain: pick('UNCERTAIN'),
  };
}

export function linksForEvidence(evidenceId: string, relationships: Relationship[], claims: Claim[]) {
  const byId = new Map(claims.map((c) => [c.claimId, c] as const));
  const out: { relationship: Relationship; claim: Claim }[] = [];
  relationships.forEach((r) => {
    if (r.evidenceId !== evidenceId) return;
    const claim = byId.get(r.claimId);
    if (claim) out.push({ relationship: r, claim });
  });
  return out;
}

export const isPending = (f: Finding): boolean => f.status === 'open' || f.status === 'needs_verification';

export interface Stats {
  claims: number;
  evidence: number;
  conflicts: number;
  reviewItems: number;
  awaitingDecision: number;
  needsVerification: number;
  documents: number;
  hearings: number;
  relationships: number;
  authorities: number;
  reviewActions: number;
}

export function computeStats(input: {
  claims: Claim[];
  evidence: Evidence[];
  relationships: Relationship[];
  findings: Finding[];
  documents: CaseDocument[];
  reviews: Review[];
  authoritiesCount: number;
}): Stats {
  return {
    claims: input.claims.length,
    evidence: input.evidence.length,
    conflicts: input.findings.filter((f) => f.kind === 'conflict').length,
    reviewItems: input.findings.filter(isPending).length,
    awaitingDecision: input.findings.filter((f) => f.status === 'open').length,
    needsVerification: input.findings.filter((f) => f.status === 'needs_verification').length,
    documents: input.documents.length,
    hearings: 1,
    relationships: input.relationships.length,
    authorities: input.authoritiesCount,
    reviewActions: input.reviews.length,
  };
}

export interface Coverage {
  label: string;
  value: number;
  detail: string;
}

/** Workflow-coverage indicators. Not case-strength metrics and not predictions. */
export function computeCoverage(input: {
  claims: Claim[];
  relationships: Relationship[];
  citations: CitationRecord[];
  findings: Finding[];
}): Coverage[] {
  const pct = (a: number, b: number): number => (b === 0 ? 0 : Math.round((a / b) * 100));
  const linked = new Set(input.relationships.map((r) => r.claimId));
  const withEvidence = input.claims.filter((c) => linked.has(c.claimId)).length;
  const reviewed = input.claims.filter((c) => c.status === 'reviewed').length;
  const resolvedCitations = input.citations.filter((c) => c.result === 'potentially_relevant' || c.result === 'weak_relevance').length;
  const actioned = input.findings.filter((f) => f.status !== 'open').length;
  return [
    { label: 'Evidence coverage', value: pct(withEvidence, input.claims.length), detail: `${withEvidence} of ${input.claims.length} claims have linked evidence` },
    { label: 'Claims reviewed', value: pct(reviewed, input.claims.length), detail: `${reviewed} of ${input.claims.length} claims reviewed` },
    { label: 'Citation coverage', value: pct(resolvedCitations, input.citations.length), detail: `${resolvedCitations} of ${input.citations.length} citations mapped to an authority` },
    { label: 'Human review', value: pct(actioned, input.findings.length), detail: `${actioned} of ${input.findings.length} findings have a reviewer action` },
  ];
}

export function latestReviewFor(findingId: string, reviews: Review[]): Review | undefined {
  return reviews
    .filter((r) => r.findingId === findingId)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))[0];
}
