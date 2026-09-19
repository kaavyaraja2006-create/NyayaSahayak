import { useMemo } from 'react';
import { useCaseStore } from '../store/caseStore';
import { linksForClaim } from '../utils/selectors';
import type { ClaimLinks } from '../utils/selectors';
import { DEFAULT_CASE_ID } from '../utils/routes';

/** Active case id (falls back to the demo case before the store has loaded). */
export function useCaseId(): string {
  return useCaseStore((s) => s.caseId) ?? DEFAULT_CASE_ID;
}

/** claimId → linked evidence grouped by relationship type. */
export function useClaimLinks(): Map<string, ClaimLinks> {
  const claims = useCaseStore((s) => s.claims);
  const relationships = useCaseStore((s) => s.relationships);
  const evidence = useCaseStore((s) => s.evidence);
  return useMemo(
    () => new Map(claims.map((c) => [c.claimId, linksForClaim(c.claimId, relationships, evidence)] as const)),
    [claims, relationships, evidence],
  );
}

/** documentId → document name. */
export function useDocNames(): Map<string, string> {
  const documents = useCaseStore((s) => s.documents);
  return useMemo(() => new Map(documents.map((d) => [d.documentId, d.name] as const)), [documents]);
}
