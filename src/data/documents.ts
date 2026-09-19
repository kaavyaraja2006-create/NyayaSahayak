import type { CaseDocument, DocPage } from '../types';
import { HEARING_DOC_ID, buildHearingContent } from './hearing';

// ─── SYNTHETIC DEMONSTRATION DATA ─────────────────────────────────────────────
// All names, places, identifiers and records below are fictional. Only the pages
// needed for the demonstration are included ("excerpt"); page counts reflect the
// notional size of the full document.

const pg = (page: number, ...texts: string[]): DocPage => ({
  page,
  paragraphs: texts.map((text, i) => ({ n: i + 1, text })),
});

const UPLOADED = '2026-09-19T09:21:00';

export const documents: CaseDocument[] = [
  {
    documentId: 'DOC-001',
    name: 'First Information Report (FIR)',
    type: 'FIR',
    category: 'Reports',
    date: '2026-08-12',
    pages: 3,
    status: 'indexed',
    source: 'Riverside Police Station (synthetic)',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'Ravi Menon', kind: 'person' },
      { label: 'Location A', kind: 'location' },
      { label: '11 Aug 2026', kind: 'date' },
      { label: 'FIR 0412/2026', kind: 'reference' },
    ],
    content: [
      pg(
        1,
        'First Information Report No. 0412/2026 registered at Riverside Police Station (synthetic) on 12 August 2026 at 09:30 hours, on the complaint of Ravi Menon, aged 41, proprietor of Menon Provision Store, Riverside Road.',
        'The complainant states that on the night of 11 August 2026 he was assaulted near the Riverside Road junction (Location A) at approximately 11:00 PM by an unidentified person wearing a grey jacket.',
        'The complainant reported the incident to the station the following morning after receiving first aid the previous night.',
      ),
      pg(
        2,
        'Control room log entry 22:58 records an emergency call from a passer-by reporting a disturbance at the Riverside Road junction.',
        'The complainant alleges that he was struck several times on the head and arms before the assailant left the area on foot.',
        'The complainant states he could not see the face of the assailant clearly.',
      ),
      pg(
        3,
        'Signed by the complainant and the Station House Officer. Read over and admitted correct.',
        'This record is part of a synthetic demonstration case and does not describe real persons or events.',
      ),
    ],
  },
  {
    documentId: 'DOC-002',
    name: 'Charge Sheet',
    type: 'Charge sheet',
    category: 'Reports',
    date: '2026-08-13',
    pages: 9,
    status: 'indexed',
    source: 'Investigating Officer, Riverside Police Station (synthetic)',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'Arun Kumar', kind: 'person' },
      { label: 'PW-3', kind: 'person' },
      { label: 'Seizure memo 07', kind: 'reference' },
      { label: 'Annexure C', kind: 'reference' },
    ],
    content: [
      pg(
        1,
        'Charge sheet filed in the matter of State vs Arun Kumar, Case ID NS-2026-001 (synthetic demonstration).',
        'The accused is Arun Kumar, resident of the Temple Street locality. Three prosecution witnesses (PW-1, PW-2, PW-3) are listed.',
      ),
      pg(
        3,
        'Summary of evidence: statements of PW-1 to PW-3, CCTV analysis of two cameras, mobile network records, a forensic fibre report and a medical report.',
        'Identification of the accused rests on the CCTV footage from camera two and the statement of PW-3. No test identification parade was conducted.',
      ),
      pg(
        4,
        'Annexure C contains four scene photographs taken on 12 August 2026 showing the Riverside Road junction; the street light nearest the junction is visible but unlit in photograph 3.',
        'Annexure D contains the sketch map of the junction and the location of camera two.',
      ),
      pg(
        5,
        'Seizure memo 07 records the seizure of a mobile handset from the accused on 12 August 2026; the memo does not record who used the handset on the night of 11 August.',
        'Seizure memo 08 records the seizure of a grey jacket from the residence of the accused.',
      ),
    ],
  },
  {
    documentId: 'DOC-003',
    name: 'PW-1 Statement',
    type: 'Witness statement',
    category: 'Statements',
    date: '2026-08-12',
    pages: 4,
    status: 'indexed',
    source: 'Recorded by Investigating Officer',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'PW-1 (Ravi Menon)', kind: 'person' },
      { label: 'Menon Provision Store', kind: 'location' },
      { label: 'Location A', kind: 'location' },
      { label: '10:15 PM', kind: 'date' },
    ],
    content: [
      pg(
        1,
        'I am Ravi Menon and I run Menon Provision Store on Riverside Road. I have run the shop for eleven years.',
        'On 11 August 2026 the shop was busy until late because of a festival delivery.',
      ),
      pg(
        2,
        'That evening I tallied the day\'s sales and checked the stock register.',
        'A delivery driver left the store at around nine forty-five.',
        'I closed the shop and left at about 10:15 PM, and walked towards the Riverside Road junction.',
      ),
      pg(
        3,
        'Near the junction a man in a grey jacket struck me. I did not see his face clearly because the street light was not working.',
        'I fell and a passer-by helped me up. I went home and my neighbour gave me first aid.',
      ),
    ],
  },
  {
    documentId: 'DOC-004',
    name: 'PW-2 Statement',
    type: 'Witness statement',
    category: 'Statements',
    date: '2026-08-12',
    pages: 3,
    status: 'indexed',
    source: 'Recorded by Investigating Officer',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'PW-2', kind: 'person' },
      { label: 'Tea stall', kind: 'location' },
      { label: 'Location A', kind: 'location' },
      { label: '10:50 PM', kind: 'date' },
    ],
    content: [
      pg(
        1,
        'I run a tea stall about sixty metres from the Riverside Road junction and I know most of the shopkeepers on the road.',
      ),
      pg(
        2,
        'On the night of 11 August I was late closing because a few customers stayed on.',
        'I was closing my tea stall when I heard raised voices near Location A after 10:50 PM.',
        'I did not go towards the junction and I did not see who was shouting.',
      ),
    ],
  },
  {
    documentId: 'DOC-005',
    name: 'PW-3 Statement',
    type: 'Witness statement',
    category: 'Statements',
    date: '2026-08-12',
    pages: 7,
    status: 'indexed',
    source: 'Recorded by Investigating Officer',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'PW-3', kind: 'person' },
      { label: 'Arun Kumar', kind: 'person' },
      { label: 'Location A', kind: 'location' },
      { label: '10:45 PM', kind: 'date' },
    ],
    content: [
      pg(
        3,
        'I live in a rented room in the lane behind the Riverside Road pharmacy and work as a delivery packer.',
        'On 11 August I finished work at about ten and bought food before walking home.',
      ),
      pg(
        4,
        'I have known Arun Kumar for about six years because he sometimes buys tea at the stall near Temple Street.',
        'At about 10:45 PM I was walking home when I saw Arun Kumar near Location A, standing by the shuttered pharmacy. The street was poorly lit but I recognised his walk and his grey jacket.',
        'I did not speak to him and I cannot say whether he was carrying anything.',
      ),
      pg(
        5,
        'I told the police about this the next morning when I heard about the incident from my neighbours.',
        'I have not discussed my statement with any other witness.',
      ),
    ],
  },
  {
    documentId: 'DOC-006',
    name: 'CCTV Analysis',
    type: 'CCTV analysis',
    category: 'Evidence',
    date: '2026-08-13',
    pages: 4,
    status: 'indexed',
    source: 'Technical examiner (synthetic)',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'CAM-1', kind: 'reference' },
      { label: 'CAM-2', kind: 'reference' },
      { label: 'Ravi Menon', kind: 'person' },
      { label: 'Location A', kind: 'location' },
    ],
    content: [
      pg(
        1,
        'This analysis covers footage from two cameras: CAM-1 (Menon Provision Store frontage) and CAM-2 (pharmacy shutter, Riverside Road junction).',
        'Camera clocks were checked against network time with a recorded drift of under 30 seconds.',
      ),
      pg(
        2,
        'CAM-2 at 22:35:10 shows a figure in a grey jacket standing near the junction. Facial detail is not resolvable at the recorded resolution and lighting.',
        'The figure remains in frame for approximately forty seconds and then moves out of the field of view to the left.',
      ),
      pg(
        3,
        'CAM-1 at 22:38:40 shows Ravi Menon inside the shop frontage, pulling down the shutter.',
        'No other person is visible in CAM-1 between 22:36 and 22:45.',
      ),
    ],
  },
  {
    documentId: 'DOC-007',
    name: 'Phone Metadata Report',
    type: 'Digital record',
    category: 'Evidence',
    date: '2026-08-14',
    pages: 3,
    status: 'indexed',
    source: 'Network operator records (synthetic)',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'Arun Kumar', kind: 'person' },
      { label: 'Temple Street Market (Location B)', kind: 'location' },
      { label: 'IMEI ending 4471', kind: 'reference' },
      { label: '22:43:05', kind: 'date' },
    ],
    content: [
      pg(
        1,
        'Call detail and cell-registration records for one handset were requested for the period 22:00 to 23:30 on 11 August 2026.',
      ),
      pg(
        2,
        'Records were supplied in a spreadsheet export and reviewed for completeness.',
        'The handset with IMEI ending 4471 is registered to a subscriber named Arun Kumar; the record does not establish who was carrying the handset on the night of 11 August 2026.',
      ),
      pg(
        3,
        'At 22:43:05 the handset registered on a cell sector serving the Temple Street Market area (Location B). No registration on any sector serving Riverside Road is recorded between 22:20 and 23:10.',
        'Cell sector coverage is approximate and can extend beyond one kilometre, so the record indicates a general area rather than a precise position.',
      ),
    ],
  },
  {
    documentId: 'DOC-008',
    name: 'Forensic Report',
    type: 'Forensic report',
    category: 'Reports',
    date: '2026-08-15',
    pages: 8,
    status: 'indexed',
    source: 'State Forensic Laboratory (synthetic)',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'Grey jacket (memo 08)', kind: 'reference' },
      { label: 'Ravi Menon', kind: 'person' },
      { label: 'Location A', kind: 'location' },
    ],
    content: [
      pg(
        5,
        'A grey synthetic fibre recovered from the complainant\'s shirt is consistent in colour and composition with fibres from the grey jacket seized under memo 08.',
        'The examiner notes that this fibre type is commonly used in mass-produced garments and that consistency does not identify a single source.',
      ),
      pg(
        6,
        'Sample handling followed the laboratory chain-of-custody protocol; all seals were intact on receipt.',
        'One partial footwear impression at the junction is too degraded for comparison.',
      ),
    ],
  },
  {
    documentId: 'DOC-009',
    name: 'Medical Report',
    type: 'Medical report',
    category: 'Reports',
    date: '2026-08-12',
    pages: 4,
    status: 'indexed',
    source: 'Government hospital (synthetic)',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'Ravi Menon', kind: 'person' },
      { label: '11 Aug 2026, 23:40', kind: 'date' },
    ],
    content: [
      pg(
        1,
        'Medico-legal examination of Ravi Menon, aged 41, brought by a neighbour to the casualty department.',
      ),
      pg(
        2,
        'On examination at 23:40 on 11 August 2026 a 4 cm laceration was noted over the left forearm with bruising over the left shoulder; no injury to the head was recorded.',
        'The wound was cleaned and dressed. The patient was advised follow-up in one week.',
      ),
    ],
  },
  {
    documentId: 'DOC-010',
    name: 'Written Submission (Prosecution)',
    type: 'Written submission',
    category: 'Submissions',
    date: '2026-08-13',
    pages: 12,
    status: 'indexed',
    source: 'Public Prosecutor (synthetic)',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'Arun Kumar', kind: 'person' },
      { label: 'Authority A', kind: 'reference' },
      { label: 'Authority B', kind: 'reference' },
      { label: 'Authority C', kind: 'reference' },
      { label: 'Authority D', kind: 'reference' },
    ],
    content: [
      pg(
        5,
        'PW-3 has known the accused for about six years and identified him on the night in question.',
        'Authority A (paragraph 27) is relied upon on the weight of a single eyewitness who knew the accused previously.',
      ),
      pg(
        6,
        'The CCTV footage from camera two was examined by a technical expert and produced with a certificate.',
        'The footage shows a figure in a grey jacket at the junction shortly before the incident.',
        'The prosecution submits that the figure in the CCTV footage is the accused, Arun Kumar, as corroborated by the identification of PW-3.',
        'Authority D (paragraph 14) is relied upon on the approach to identification without a test identification parade.',
      ),
      pg(
        7,
        'Authority B (paragraph 9) is relied upon on the treatment of expert opinion in the forensic report.',
      ),
      pg(
        8,
        'Authority C is cited on the description of vehicles seen after an incident.',
      ),
      pg(
        9,
        'The complaint was lodged the morning after the incident, once the complainant had received first aid.',
        'The delay of one day in lodging the FIR does not affect the reliability of the complaint.',
      ),
    ],
  },
  {
    documentId: HEARING_DOC_ID,
    name: 'Hearing Transcript — 14 Aug 2026',
    type: 'Hearing transcript',
    category: 'Hearings',
    date: '2026-08-14',
    pages: 24,
    status: 'indexed',
    source: 'Court reporter (synthetic)',
    uploadedAt: UPLOADED,
    confidentiality: 'Synthetic — public demo',
    entities: [
      { label: 'PW-1', kind: 'person' },
      { label: 'PW-2', kind: 'person' },
      { label: 'PW-3', kind: 'person' },
      { label: 'Location A', kind: 'location' },
      { label: 'Location B', kind: 'location' },
    ],
    content: buildHearingContent(),
  },
];
