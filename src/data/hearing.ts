import type { DocPage, Hearing, HearingStatement, MarkerKind, SourceLocation, Speaker, SpeakerId } from '../types';

// ─── SYNTHETIC DEMONSTRATION DATA ─────────────────────────────────────────────
// Every person, place and record in this file is fictional.

export const HEARING_DOC_ID = 'DOC-011';
const PARAS_PER_PAGE = 6;

export const speakers: Speaker[] = [
  { id: 'judge', name: 'Judge', role: 'Presiding officer' },
  { id: 'counsel', name: 'Counsel', role: 'Prosecution and defence counsel' },
  { id: 'pw1', name: 'PW-1', role: 'Complainant' },
  { id: 'pw2', name: 'PW-2', role: 'Tea stall owner' },
  { id: 'pw3', name: 'PW-3', role: 'Neighbourhood witness' },
];

const speakerName = (id: SpeakerId): string => speakers.find((s) => s.id === id)?.name ?? id;

interface RawStatement {
  id: string;
  time: string;
  speaker: SpeakerId;
  text: string;
  marker?: { kind: MarkerKind; label: string };
  claimIds?: string[];
  evidenceIds?: string[];
  findingIds?: string[];
}

const raw: RawStatement[] = [
  { id: 'S-001', time: '10:02:14', speaker: 'judge', text: 'Proceed with the witnesses.' },
  {
    id: 'S-002',
    time: '10:04:02',
    speaker: 'pw1',
    text: 'I closed the shop and left at about quarter past ten.',
    marker: { kind: 'claim', label: 'C-05' },
    claimIds: ['C-05'],
  },
  {
    id: 'S-003',
    time: '10:05:31',
    speaker: 'counsel',
    text: 'Did you see the accused that night, and if so, where?',
    marker: { kind: 'question', label: 'Question' },
  },
  {
    id: 'S-004',
    time: '10:06:18',
    speaker: 'pw3',
    text: 'I saw Arun near the location.',
    marker: { kind: 'claim', label: 'C-01' },
    claimIds: ['C-01'],
  },
  {
    id: 'S-005',
    time: '10:07:40',
    speaker: 'pw2',
    text: 'I heard raised voices after ten-fifty, near the junction.',
    marker: { kind: 'claim', label: 'C-06' },
    claimIds: ['C-06'],
  },
  {
    id: 'S-006',
    time: '10:08:44',
    speaker: 'counsel',
    text: 'Do you remember the exact time?',
    marker: { kind: 'question', label: 'Question' },
  },
  {
    id: 'S-007',
    time: '10:09:12',
    speaker: 'pw3',
    text: 'I cannot remember the exact time.',
    marker: { kind: 'uncertainty', label: 'UNCERTAINTY' },
    claimIds: ['C-10'],
    evidenceIds: ['E-017'],
  },
  {
    id: 'S-008',
    time: '10:12:05',
    speaker: 'counsel',
    text: 'Camera two shows a figure in a grey jacket near the junction at ten thirty-five.',
    marker: { kind: 'evidence', label: 'E-002' },
    claimIds: ['C-02'],
    evidenceIds: ['E-002'],
  },
  {
    id: 'S-009',
    time: '10:15:30',
    speaker: 'judge',
    text: 'Is the figure identifiable on the footage?',
    marker: { kind: 'question', label: 'Question' },
  },
  {
    id: 'S-010',
    time: '10:17:10',
    speaker: 'counsel',
    text: 'The prosecution relies on the footage and on PW-3 for identity.',
    marker: { kind: 'legal_argument', label: 'C-03' },
    claimIds: ['C-03'],
  },
  {
    id: 'S-011',
    time: '10:21:47',
    speaker: 'counsel',
    text: "The defence submits that the accused's phone was near Location B at ten forty-three.",
    marker: { kind: 'conflict', label: 'F-001' },
    claimIds: ['C-12'],
    evidenceIds: ['E-003'],
    findingIds: ['F-001'],
  },
  { id: 'S-012', time: '10:25:09', speaker: 'judge', text: 'The submission on the device records is noted.' },
  {
    id: 'S-013',
    time: '10:43:22',
    speaker: 'counsel',
    text: 'The phone location records should be verified with the network operator.',
    marker: { kind: 'evidence', label: 'E-003' },
    claimIds: ['C-08'],
    evidenceIds: ['E-003'],
  },
];

const locationFor = (index: number, quote: string): SourceLocation => ({
  documentId: HEARING_DOC_ID,
  page: Math.floor(index / PARAS_PER_PAGE) + 1,
  paragraph: (index % PARAS_PER_PAGE) + 1,
  quote,
});

export const hearingStatements: HearingStatement[] = raw.map((r, i) => ({
  statementId: r.id,
  time: r.time,
  speaker: r.speaker,
  text: r.text,
  location: locationFor(i, r.text),
  marker: r.marker,
  claimIds: r.claimIds ?? [],
  evidenceIds: r.evidenceIds ?? [],
  findingIds: r.findingIds ?? [],
}));

export const hearing: Hearing = {
  hearingId: 'H-2026-08-14',
  date: '2026-08-14',
  court: 'Metropolitan Magistrate Court, Synthetic District (demonstration)',
  documentId: HEARING_DOC_ID,
  speakers,
  statements: hearingStatements,
};

/** Transcript document body, derived from the statements so page/paragraph refs always match. */
export function buildHearingContent(): DocPage[] {
  const pages: DocPage[] = [];
  hearingStatements.forEach((s) => {
    let page = pages.find((p) => p.page === s.location.page);
    if (!page) {
      page = { page: s.location.page, paragraphs: [] };
      pages.push(page);
    }
    page.paragraphs.push({ n: s.location.paragraph, text: `[${s.time}] ${speakerName(s.speaker)}: ${s.text}` });
  });
  return pages;
}

export const locationOfStatement = (statementId: string): SourceLocation => {
  const s = hearingStatements.find((h) => h.statementId === statementId);
  if (!s) throw new Error(`Unknown statement ${statementId}`);
  return s.location;
};
