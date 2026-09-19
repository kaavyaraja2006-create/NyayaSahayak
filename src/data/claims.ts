import type { Claim, Evidence, Relationship, TimelineEvent } from '../types';
import { hearingStatements, locationOfStatement } from './hearing';

// ─── SYNTHETIC DEMONSTRATION DATA ─────────────────────────────────────────────

const stmtIdsFor = (claimId: string): string[] =>
  hearingStatements.filter((s) => s.claimIds.includes(claimId)).map((s) => s.statementId);

type ClaimSeed = Omit<Claim, 'hearingStatementIds'>;

const claimSeeds: ClaimSeed[] = [
  {
    claimId: 'C-01',
    title: 'Potential presence near Location A',
    text: 'Arun Kumar was near Location A at approximately 10:45 PM.',
    type: 'Presence',
    source: {
      documentId: 'DOC-005',
      page: 4,
      paragraph: 2,
      quote: 'At about 10:45 PM I was walking home when I saw Arun Kumar near Location A, standing by the shuttered pharmacy.',
    },
    status: 'needs_review',
    signals: { directness: 92, quality: 80, sources: 80, consistency: 80, conflict: 67, uncertainty: 31 },
  },
  {
    claimId: 'C-02',
    title: 'CCTV figure near Location A',
    text: 'CCTV footage shows a person in a grey jacket near Location A at approximately 10:35 PM.',
    type: 'CCTV interpretation',
    source: {
      documentId: 'DOC-006',
      page: 2,
      paragraph: 1,
      quote: 'CAM-2 at 22:35:10 shows a figure in a grey jacket standing near the junction.',
    },
    status: 'reviewed',
    signals: { directness: 88, quality: 74, sources: 60, consistency: 84, conflict: 12, uncertainty: 38 },
  },
  {
    claimId: 'C-03',
    title: 'Identity of the CCTV figure',
    text: 'The figure in the CCTV footage is Arun Kumar.',
    type: 'Identity',
    source: {
      documentId: 'DOC-010',
      page: 6,
      paragraph: 3,
      quote: 'the figure in the CCTV footage is the accused, Arun Kumar, as corroborated by the identification of PW-3',
    },
    status: 'unresolved',
    signals: { directness: 55, quality: 58, sources: 42, consistency: 70, conflict: 22, uncertainty: 61 },
  },
  {
    claimId: 'C-04',
    title: 'Fibre consistent with grey jacket',
    text: "A grey fibre recovered from the complainant's shirt is consistent with the grey jacket seized from the accused.",
    type: 'Forensic finding',
    source: {
      documentId: 'DOC-008',
      page: 5,
      paragraph: 1,
      quote: 'consistent in colour and composition with fibres from the grey jacket seized under memo 08',
    },
    status: 'reviewed',
    signals: { directness: 80, quality: 82, sources: 60, consistency: 88, conflict: 10, uncertainty: 34 },
  },
  {
    claimId: 'C-05',
    title: 'Complainant departure time',
    text: 'The complainant left his shop at approximately 10:15 PM.',
    type: 'Timeline',
    source: {
      documentId: 'DOC-003',
      page: 2,
      paragraph: 3,
      quote: 'I closed the shop and left at about 10:15 PM',
    },
    status: 'needs_review',
    signals: { directness: 78, quality: 70, sources: 68, consistency: 74, conflict: 58, uncertainty: 27 },
  },
  {
    claimId: 'C-06',
    title: 'Raised voices heard after 10:50 PM',
    text: 'PW-2 heard raised voices near Location A after 10:50 PM.',
    type: 'Witness statement',
    source: {
      documentId: 'DOC-004',
      page: 2,
      paragraph: 2,
      quote: 'I heard raised voices near Location A after 10:50 PM',
    },
    status: 'reviewed',
    signals: { directness: 84, quality: 72, sources: 84, consistency: 86, conflict: 8, uncertainty: 22 },
  },
  {
    claimId: 'C-07',
    title: 'Delay in lodging the FIR',
    text: 'The one-day delay in lodging the FIR does not affect the reliability of the complaint.',
    type: 'Legal proposition',
    source: {
      documentId: 'DOC-010',
      page: 9,
      paragraph: 2,
      quote: 'The delay of one day in lodging the FIR does not affect the reliability of the complaint.',
    },
    status: 'needs_review',
    signals: { directness: 40, quality: 45, sources: 30, consistency: 60, conflict: 5, uncertainty: 55 },
  },
  {
    claimId: 'C-08',
    title: 'Handset registered near Location B',
    text: 'The handset registered to Arun Kumar connected to a cell sector serving Location B at 10:43 PM.',
    type: 'Phone metadata',
    source: {
      documentId: 'DOC-007',
      page: 3,
      paragraph: 1,
      quote: 'At 22:43:05 the handset registered on a cell sector serving the Temple Street Market area (Location B).',
    },
    status: 'reviewed',
    signals: { directness: 90, quality: 92, sources: 74, consistency: 90, conflict: 14, uncertainty: 41 },
  },
  {
    claimId: 'C-09',
    title: 'Departure on a two-wheeler',
    text: 'The accused was seen leaving the area on a two-wheeler after the incident.',
    type: 'Movement',
    source: null,
    originNote: 'Extracted from the hearing summary; no underlying statement or record could be identified.',
    status: 'unresolved',
    signals: { directness: 20, quality: 15, sources: 0, consistency: 40, conflict: 0, uncertainty: 82 },
  },
  {
    claimId: 'C-10',
    title: 'Witness could not recall the exact time',
    text: 'PW-3 could not recall the exact time of the sighting.',
    type: 'Uncertainty',
    source: { ...locationOfStatement('S-007') },
    status: 'needs_review',
    signals: { directness: 82, quality: 70, sources: 60, consistency: 90, conflict: 6, uncertainty: 78 },
  },
  {
    claimId: 'C-11',
    title: 'Injuries recorded at examination',
    text: 'The complainant sustained injuries limited to the left forearm and shoulder.',
    type: 'Medical finding',
    source: {
      documentId: 'DOC-009',
      page: 2,
      paragraph: 1,
      quote: 'a 4 cm laceration was noted over the left forearm with bruising over the left shoulder; no injury to the head was recorded',
    },
    status: 'reviewed',
    signals: { directness: 88, quality: 90, sources: 66, consistency: 80, conflict: 44, uncertainty: 20 },
  },
  {
    claimId: 'C-12',
    title: 'Defence position: accused at Location B',
    text: 'The defence submits that the accused was near Location B at the relevant time.',
    type: 'Submission claim',
    source: { ...locationOfStatement('S-011') },
    status: 'unresolved',
    signals: { directness: 62, quality: 66, sources: 58, consistency: 66, conflict: 30, uncertainty: 46 },
  },
];

export const claims: Claim[] = claimSeeds.map((c) => ({ ...c, hearingStatementIds: stmtIdsFor(c.claimId) }));

const s7 = locationOfStatement('S-007');

export const evidence: Evidence[] = [
  {
    evidenceId: 'E-001',
    type: 'Witness Statement',
    description: 'PW-3 states he saw Arun Kumar near Location A at about 10:45 PM.',
    source: { documentId: 'DOC-005', page: 4, paragraph: 2, quote: 'At about 10:45 PM I was walking home when I saw Arun Kumar near Location A' },
    date: '2026-08-12',
  },
  {
    evidenceId: 'E-002',
    type: 'CCTV',
    description: 'CAM-2 frame at 22:35:10 showing a figure in a grey jacket near the junction; facial detail not resolvable.',
    source: { documentId: 'DOC-006', page: 2, paragraph: 1, quote: 'CAM-2 at 22:35:10 shows a figure in a grey jacket standing near the junction' },
    date: '2026-08-13',
  },
  {
    evidenceId: 'E-003',
    type: 'Phone Metadata',
    description: 'Cell registration at 22:43:05 on a sector serving Temple Street Market (Location B).',
    source: { documentId: 'DOC-007', page: 3, paragraph: 1, quote: 'At 22:43:05 the handset registered on a cell sector serving the Temple Street Market area (Location B)' },
    date: '2026-08-14',
  },
  {
    evidenceId: 'E-004',
    type: 'Witness Statement',
    description: 'PW-1 states he closed the shop and left at about 10:15 PM.',
    source: { documentId: 'DOC-003', page: 2, paragraph: 3, quote: 'I closed the shop and left at about 10:15 PM' },
    date: '2026-08-12',
  },
  {
    evidenceId: 'E-005',
    type: 'CCTV',
    description: 'CAM-1 frame at 22:38:40 showing the complainant at the shop frontage pulling down the shutter.',
    source: { documentId: 'DOC-006', page: 3, paragraph: 1, quote: 'CAM-1 at 22:38:40 shows Ravi Menon inside the shop frontage, pulling down the shutter' },
    date: '2026-08-13',
  },
  {
    evidenceId: 'E-006',
    type: 'Witness Statement',
    description: 'PW-2 states he heard raised voices near Location A after 10:50 PM.',
    source: { documentId: 'DOC-004', page: 2, paragraph: 2, quote: 'I heard raised voices near Location A after 10:50 PM' },
    date: '2026-08-12',
  },
  {
    evidenceId: 'E-007',
    type: 'Phone Metadata',
    description: 'Subscriber record: handset registered to Arun Kumar; possession on the night is not established.',
    source: { documentId: 'DOC-007', page: 2, paragraph: 2, quote: 'registered to a subscriber named Arun Kumar' },
    date: '2026-08-14',
  },
  {
    evidenceId: 'E-008',
    type: 'Forensic Report',
    description: 'Grey synthetic fibre from the complainant’s shirt compared with fibres from the seized jacket.',
    source: { documentId: 'DOC-008', page: 5, paragraph: 1, quote: 'consistent in colour and composition with fibres from the grey jacket seized under memo 08' },
    date: '2026-08-15',
  },
  {
    evidenceId: 'E-009',
    type: 'Forensic Report',
    description: 'Partial footwear impression at the junction recorded as too degraded for comparison.',
    source: { documentId: 'DOC-008', page: 6, paragraph: 2, quote: 'too degraded for comparison' },
    date: '2026-08-15',
  },
  {
    evidenceId: 'E-010',
    type: 'Medical Record',
    description: 'Medico-legal note: 4 cm laceration to left forearm, bruising to left shoulder, no head injury recorded.',
    source: { documentId: 'DOC-009', page: 2, paragraph: 1, quote: 'a 4 cm laceration was noted over the left forearm with bruising over the left shoulder; no injury to the head was recorded' },
    date: '2026-08-12',
  },
  {
    evidenceId: 'E-011',
    type: 'Photograph',
    description: 'Annexure C, photograph 3: junction street light visible but unlit.',
    source: { documentId: 'DOC-002', page: 4, paragraph: 1, quote: 'the street light nearest the junction is visible but unlit in photograph 3' },
    date: '2026-08-12',
  },
  {
    evidenceId: 'E-012',
    type: 'Digital Record',
    description: 'Control room log 22:58: emergency call reporting a disturbance at the junction.',
    source: { documentId: 'DOC-001', page: 2, paragraph: 1, quote: 'records an emergency call from a passer-by reporting a disturbance' },
    date: '2026-08-11',
  },
  {
    evidenceId: 'E-013',
    type: 'Document',
    description: 'FIR registration record: registered on 12 August 2026 at 09:30 hours.',
    source: { documentId: 'DOC-001', page: 1, paragraph: 1, quote: 'registered at Riverside Police Station (synthetic) on 12 August 2026 at 09:30 hours' },
    date: '2026-08-12',
  },
  {
    evidenceId: 'E-014',
    type: 'Document',
    description: 'FIR narrative: complainant alleges being struck on the head and arms.',
    source: { documentId: 'DOC-001', page: 2, paragraph: 2, quote: 'struck several times on the head and arms' },
    date: '2026-08-12',
  },
  {
    evidenceId: 'E-015',
    type: 'Document',
    description: 'Charge sheet note: identification rests on CCTV and PW-3; no test identification parade.',
    source: { documentId: 'DOC-002', page: 3, paragraph: 2, quote: 'No test identification parade was conducted' },
    date: '2026-08-13',
  },
  {
    evidenceId: 'E-016',
    type: 'Document',
    description: 'Seizure memo 07: handset seized from the accused; user on the night not recorded.',
    source: { documentId: 'DOC-002', page: 5, paragraph: 1, quote: 'does not record who used the handset on the night of 11 August' },
    date: '2026-08-12',
  },
  {
    evidenceId: 'E-017',
    type: 'Hearing Statement',
    description: 'PW-3 at 10:09:12: cannot remember the exact time of the sighting.',
    source: { ...s7 },
    date: '2026-08-14',
  },
];

export const relationships: Relationship[] = [
  {
    relationshipId: 'R-001', claimId: 'C-01', evidenceId: 'E-001', type: 'SUPPORTS',
    reason: 'PW-3 directly states he saw Arun Kumar near Location A at about 10:45 PM.',
    assessment: 'Direct witness account; recognition in poor lighting still needs human evaluation.',
  },
  {
    relationshipId: 'R-002', claimId: 'C-01', evidenceId: 'E-002', type: 'SUPPORTS',
    reason: 'A figure in a grey jacket appears near the junction at 10:35 PM, roughly ten minutes before the stated sighting.',
    assessment: 'Consistent with presence in the area; identity is not resolvable from the footage and the times differ.',
  },
  {
    relationshipId: 'R-003', claimId: 'C-01', evidenceId: 'E-003', type: 'CONFLICTS',
    reason: 'Phone metadata places the handset on a Location B sector at 10:43 PM, two minutes before PW-3 places Arun Kumar near Location A.',
    assessment: 'Potential conflict. Sector coverage is approximate and possession of the handset is not established, so human verification is required.',
  },
  {
    relationshipId: 'R-004', claimId: 'C-02', evidenceId: 'E-002', type: 'SUPPORTS',
    reason: 'The CCTV analysis directly describes a figure in a grey jacket near the junction at 22:35:10.',
    assessment: 'Direct description of the footage; limited to what is visible on camera.',
  },
  {
    relationshipId: 'R-005', claimId: 'C-02', evidenceId: 'E-011', type: 'CONTEXTUALIZES',
    reason: 'Photograph 3 shows the street light near the junction unlit, which bears on visibility in the frame.',
    assessment: 'Context on lighting conditions; does not confirm or contradict the footage description.',
  },
  {
    relationshipId: 'R-006', claimId: 'C-03', evidenceId: 'E-002', type: 'UNCERTAIN',
    reason: 'The analysis states facial detail is not resolvable, which limits identification of the figure.',
    assessment: 'Uncertain: the footage shows a figure but does not resolve identity.',
  },
  {
    relationshipId: 'R-007', claimId: 'C-03', evidenceId: 'E-015', type: 'CONTEXTUALIZES',
    reason: 'The charge sheet records that identification rests on CCTV and PW-3, and that no test identification parade was held.',
    assessment: 'Context on how identification was approached in the investigation.',
  },
  {
    relationshipId: 'R-008', claimId: 'C-04', evidenceId: 'E-008', type: 'SUPPORTS',
    reason: 'The forensic report describes the recovered fibre as consistent in colour and composition with the seized jacket.',
    assessment: 'Direct expert finding; the examiner notes the fibre type is common.',
  },
  {
    relationshipId: 'R-009', claimId: 'C-04', evidenceId: 'E-009', type: 'CONTEXTUALIZES',
    reason: 'The same report records that the footwear impression was too degraded for comparison.',
    assessment: 'Context: one trace category yielded no comparison result.',
  },
  {
    relationshipId: 'R-010', claimId: 'C-05', evidenceId: 'E-004', type: 'SUPPORTS',
    reason: 'PW-1 states in his own statement that he left the shop at about 10:15 PM.',
    assessment: 'Direct first-person statement.',
  },
  {
    relationshipId: 'R-011', claimId: 'C-05', evidenceId: 'E-005', type: 'CONFLICTS',
    reason: 'CAM-1 shows the complainant at the shop frontage at 22:38:40, about twenty minutes after the stated departure.',
    assessment: 'Potential timeline inconsistency; camera clock drift is under 30 seconds.',
  },
  {
    relationshipId: 'R-012', claimId: 'C-06', evidenceId: 'E-006', type: 'SUPPORTS',
    reason: 'PW-2 states he heard raised voices near Location A after 10:50 PM.',
    assessment: 'Direct witness account of sound, not of persons.',
  },
  {
    relationshipId: 'R-013', claimId: 'C-06', evidenceId: 'E-012', type: 'SUPPORTS',
    reason: 'The control room log at 22:58 records a call reporting a disturbance at the junction.',
    assessment: 'Independent record that is compatible with PW-2’s timing.',
  },
  {
    relationshipId: 'R-014', claimId: 'C-07', evidenceId: 'E-013', type: 'CONTEXTUALIZES',
    reason: 'The FIR was registered at 09:30 on 12 August 2026, the morning after the stated incident.',
    assessment: 'Factual context for the proposition; the legal effect of any delay needs human legal verification.',
  },
  {
    relationshipId: 'R-015', claimId: 'C-08', evidenceId: 'E-003', type: 'SUPPORTS',
    reason: 'The cell-registration record directly lists the 22:43:05 registration on a Location B sector.',
    assessment: 'Direct technical record.',
  },
  {
    relationshipId: 'R-016', claimId: 'C-08', evidenceId: 'E-007', type: 'UNCERTAIN',
    reason: 'The subscriber record ties the handset to Arun Kumar but does not establish who carried it that night.',
    assessment: 'Uncertain: registration is not the same as possession.',
  },
  {
    relationshipId: 'R-017', claimId: 'C-08', evidenceId: 'E-016', type: 'CONTEXTUALIZES',
    reason: 'Seizure memo 07 records the handset seizure but not who used it on the night of 11 August.',
    assessment: 'Context on the limits of attribution.',
  },
  {
    relationshipId: 'R-018', claimId: 'C-10', evidenceId: 'E-017', type: 'SUPPORTS',
    reason: 'At 10:09:12 PW-3 states in the hearing that he cannot remember the exact time.',
    assessment: 'Direct hearing statement.',
  },
  {
    relationshipId: 'R-019', claimId: 'C-11', evidenceId: 'E-010', type: 'SUPPORTS',
    reason: 'The medical note records a forearm laceration and shoulder bruising, and records no head injury.',
    assessment: 'Direct clinical record.',
  },
  {
    relationshipId: 'R-020', claimId: 'C-11', evidenceId: 'E-014', type: 'CONFLICTS',
    reason: 'The FIR narrative describes strikes to the head and arms, while the medical note records no head injury.',
    assessment: 'Potential description mismatch; reviewer accepted the flag for the hearing bundle.',
  },
  {
    relationshipId: 'R-021', claimId: 'C-12', evidenceId: 'E-003', type: 'SUPPORTS',
    reason: 'The Location B registration at 22:43:05 is the record the defence relies on for its position.',
    assessment: 'Supports what the defence submits about the handset, not who held it.',
  },
];

export const timeline: TimelineEvent[] = [
  {
    eventId: 'T-01', time: '10:15 PM', label: 'Complainant states he left the shop',
    detail: 'PW-1 says he closed the shop and left at about 10:15 PM.', kind: 'witness',
    source: { documentId: 'DOC-003', page: 2, paragraph: 3, quote: 'I closed the shop and left at about 10:15 PM' },
    claimIds: ['C-05'], conflict: true,
  },
  {
    eventId: 'T-02', time: '10:20 PM', label: 'Handset observation window begins',
    detail: 'The operator record covers 22:20 onward, with no Riverside Road sector registration.', kind: 'phone',
    source: { documentId: 'DOC-007', page: 3, paragraph: 1, quote: 'No registration on any sector serving Riverside Road is recorded between 22:20 and 23:10.' },
    claimIds: ['C-08'],
  },
  {
    eventId: 'T-03', time: '10:35 PM', label: 'CAM-2: figure in a grey jacket',
    detail: 'Figure near the junction for about forty seconds; facial detail not resolvable.', kind: 'cctv',
    source: { documentId: 'DOC-006', page: 2, paragraph: 1, quote: 'CAM-2 at 22:35:10 shows a figure in a grey jacket standing near the junction' },
    claimIds: ['C-02', 'C-03'],
  },
  {
    eventId: 'T-04', time: '10:38 PM', label: 'CAM-1: complainant at shop frontage',
    detail: 'Complainant seen pulling down the shutter, later than the stated 10:15 PM departure.', kind: 'cctv',
    source: { documentId: 'DOC-006', page: 3, paragraph: 1, quote: 'CAM-1 at 22:38:40 shows Ravi Menon inside the shop frontage, pulling down the shutter' },
    claimIds: ['C-05'], conflict: true,
  },
  {
    eventId: 'T-05', time: '10:43 PM', label: 'Handset registers near Location B',
    detail: 'Cell sector serving the Temple Street Market area.', kind: 'phone',
    source: { documentId: 'DOC-007', page: 3, paragraph: 1, quote: 'At 22:43:05 the handset registered on a cell sector serving the Temple Street Market area (Location B)' },
    claimIds: ['C-08', 'C-01', 'C-12'], conflict: true,
  },
  {
    eventId: 'T-06', time: '10:45 PM', label: 'PW-3 places Arun Kumar near Location A',
    detail: 'Sighting by the shuttered pharmacy; recognition of walk and jacket.', kind: 'witness',
    source: { documentId: 'DOC-005', page: 4, paragraph: 2, quote: 'At about 10:45 PM I was walking home when I saw Arun Kumar near Location A' },
    claimIds: ['C-01'], conflict: true,
  },
  {
    eventId: 'T-07', time: '10:50 PM', label: 'PW-2 hears raised voices',
    detail: 'Heard after 10:50 PM near Location A; did not see who was shouting.', kind: 'witness',
    source: { documentId: 'DOC-004', page: 2, paragraph: 2, quote: 'I heard raised voices near Location A after 10:50 PM' },
    claimIds: ['C-06'],
  },
  {
    eventId: 'T-08', time: '10:58 PM', label: 'Control room call logged',
    detail: 'Passer-by reports a disturbance at the junction.', kind: 'record',
    source: { documentId: 'DOC-001', page: 2, paragraph: 1, quote: 'records an emergency call from a passer-by reporting a disturbance' },
    claimIds: ['C-06'],
  },
  {
    eventId: 'T-09', time: '11:00 PM', label: 'Alleged incident (approximate)',
    detail: 'Complainant states he was assaulted near the junction at approximately 11:00 PM.', kind: 'incident',
    source: { documentId: 'DOC-001', page: 1, paragraph: 2, quote: 'at approximately 11:00 PM' },
    claimIds: [],
  },
  {
    eventId: 'T-10', time: '11:40 PM', label: 'Medical examination',
    detail: 'Laceration to left forearm; bruising to left shoulder; no head injury recorded.', kind: 'record',
    source: { documentId: 'DOC-009', page: 2, paragraph: 1, quote: 'a 4 cm laceration was noted over the left forearm with bruising over the left shoulder; no injury to the head was recorded' },
    claimIds: ['C-11'],
  },
  {
    eventId: 'T-11', time: '12 Aug · 9:30 AM', label: 'FIR registered',
    detail: 'Registered the morning after the stated incident.', kind: 'record',
    source: { documentId: 'DOC-001', page: 1, paragraph: 1, quote: 'registered at Riverside Police Station (synthetic) on 12 August 2026 at 09:30 hours' },
    claimIds: ['C-07'],
  },
];
