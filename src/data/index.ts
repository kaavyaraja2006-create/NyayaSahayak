import type { CaseBundle } from '../types';
import { caseRecord } from './case';
import { documents } from './documents';
import { claims, evidence, relationships, timeline } from './claims';
import { authorities, citations } from './authorities';
import { findings, reviews, auditLogs } from './findings';
import { hearing } from './hearing';

/** Pristine seed bundle. The mock API deep-clones this so mutations never touch the seed. */
export const seedBundle: CaseBundle = {
  currentCase: caseRecord,
  documents,
  claims,
  evidence,
  relationships,
  authorities,
  citations,
  findings,
  reviews,
  auditLogs,
  hearing,
  timeline,
};
