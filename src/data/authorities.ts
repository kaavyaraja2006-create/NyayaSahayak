import type { Authority, CitationRecord } from '../types';

// ─── SYNTHETIC / CURATED DEMONSTRATION DATA ───────────────────────────────────
// These authorities are fictional. They are NOT retrieved from any real court
// database and must not be cited as law.

const CORPUS = 'Synthetic / Curated Demonstration Data';

export const authorities: Authority[] = [
  {
    authorityId: 'AUTH-A',
    label: 'Authority A',
    caseName: 'Meera Iyer v. State of Synthetic Pradesh (fictional)',
    court: 'Synthetic High Court (fictional)',
    year: 2024,
    citation: 'SHC 2024 (3) 118',
    paragraph: 27,
    passage:
      'Where a witness who knew the accused earlier identifies him at night, the court should ask whether the lighting and distance allowed a reliable recognition, and whether the account is supported by other material on the record.',
    claimIds: ['C-01'],
    relevance: 82,
    whyRetrieved: 'Matched legal issue (recognition of an acquaintance in low light) and high semantic similarity to the claim text.',
    status: 'verification_required',
    corpus: CORPUS,
  },
  {
    authorityId: 'AUTH-B',
    label: 'Authority B',
    caseName: 'Kamal Rao v. State of Synthetic Pradesh (fictional)',
    court: 'Synthetic High Court (fictional)',
    year: 2022,
    citation: 'SHC 2022 (1) 57',
    paragraph: 9,
    passage:
      'An expert opinion is an aid to the court. It should be examined together with the reasoning and the material on which it rests, and it does not bind the court.',
    claimIds: ['C-04'],
    relevance: 41,
    whyRetrieved: 'Matched on the terms "expert" and "consistent"; low topical similarity to a fibre-comparison finding.',
    status: 'weak_relevance',
    corpus: CORPUS,
  },
  {
    authorityId: 'AUTH-C',
    label: 'Authority C',
    caseName: 'Joseph Thomas v. State of Synthetic Pradesh (fictional)',
    court: 'Synthetic High Court (fictional)',
    year: 2021,
    citation: 'SHC 2021 (4) 302',
    paragraph: 15,
    passage:
      'A description of a vehicle given by a passer-by should be examined for whether it was recorded at the earliest opportunity and whether it was tested in cross-examination.',
    claimIds: ['C-09'],
    relevance: null,
    whyRetrieved: 'Cited in the written submission; the cited paragraph could not be reliably mapped to the proposition in the claim.',
    status: 'unmapped',
    corpus: CORPUS,
  },
  {
    authorityId: 'AUTH-D',
    label: 'Authority D',
    caseName: 'Sunita Devi v. State of Synthetic Pradesh (fictional)',
    court: 'Synthetic High Court (fictional)',
    year: 2023,
    citation: 'SHC 2023 (2) 190',
    paragraph: 14,
    passage:
      'The absence of a test identification parade does not by itself bar identification in court, but the court should look for other reliable material on the question of identity.',
    claimIds: ['C-03'],
    relevance: 74,
    whyRetrieved: 'Matched legal issue (identification without a test identification parade) and cited in the written submission.',
    status: 'verification_required',
    corpus: CORPUS,
  },
];

export const citations: CitationRecord[] = [
  {
    citationId: 'CIT-01',
    claimId: 'C-01',
    authorityId: 'AUTH-A',
    result: 'potentially_relevant',
    citedAt: {
      documentId: 'DOC-010', page: 5, paragraph: 2,
      quote: 'Authority A (paragraph 27) is relied upon on the weight of a single eyewitness who knew the accused previously.',
    },
    note: 'Retrieved passage addresses recognition of a previously known person at night, which appears related to the claim. Requires human legal verification.',
  },
  {
    citationId: 'CIT-02',
    claimId: 'C-04',
    authorityId: 'AUTH-B',
    result: 'weak_relevance',
    citedAt: {
      documentId: 'DOC-010', page: 7, paragraph: 1,
      quote: 'Authority B (paragraph 9) is relied upon on the treatment of expert opinion in the forensic report.',
    },
    note: 'The passage is about expert opinion in general and may not directly address the fibre-comparison finding.',
  },
  {
    citationId: 'CIT-03',
    claimId: 'C-07',
    authorityId: null,
    result: 'no_authority',
    citedAt: null,
    note: 'The submission states a legal proposition about delay in lodging the FIR but cites no authority, and no curated authority passed the relevance threshold.',
  },
  {
    citationId: 'CIT-04',
    claimId: 'C-09',
    authorityId: 'AUTH-C',
    result: 'unable_to_map',
    citedAt: {
      documentId: 'DOC-010', page: 8, paragraph: 1,
      quote: 'Authority C is cited on the description of vehicles seen after an incident.',
    },
    note: 'The cited paragraph could not be reliably mapped to the claim, which also lacks an identified source passage.',
  },
  {
    citationId: 'CIT-05',
    claimId: 'C-03',
    authorityId: 'AUTH-D',
    result: 'potentially_relevant',
    citedAt: {
      documentId: 'DOC-010', page: 6, paragraph: 4,
      quote: 'Authority D (paragraph 14) is relied upon on the approach to identification without a test identification parade.',
    },
    note: 'Retrieved passage addresses identification without a parade, which appears related to the claim. Requires human legal verification.',
  },
];
