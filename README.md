# NyayaSahayak: Human-in-the-Loop Hearing Evidence Auditor (frontend)

A React + Vite + TypeScript frontend for a legal evidence-audit workspace. It turns case material into a traceable chain of
**claim → evidence → source → authority → conflict → human review → audit trail**.

> **Synthetic demonstration.** The case "State vs Arun Kumar" (`NS-2026-001`), every person, place, document, phone record and
> authority is fictional. Nothing here is legal advice, and the interface never presents an AI output as a legal determination.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm run build        # production build to dist/
npm run build:strict # typecheck, then build
```

Requires Node 18+.

### Verification status (please read)

This project was written in a sandbox **without access to the npm registry**, so `npm install`, `npm run build` and `npm run dev`
could not be executed there. What was verified instead:

- The whole `src/` tree passes `tsc --strict` against hand-written ambient declarations for React, React Router, Framer Motion,
  Recharts, React Flow, Zustand and Lucide. That confirms the app's own code is internally type-consistent (props, stores, data
  model, selectors, routes).
- It was **not** compiled against the real `@types/react`, React Flow, Recharts or Framer Motion type packages, and it was never
  bundled by Vite or rendered in a browser. Expect the first `npm run typecheck` on your machine to possibly surface a few small
  type differences against the real libraries, and treat the first `npm run dev` as the true visual test.

## What is inside

| Area | Routes |
| --- | --- |
| Entry | `/` landing, `/cases` |
| Case | overview, documents (+ 3-column reader), hearing, claims (+ detail), evidence, authorities, timeline |
| Analysis | evidence graph (React Flow), conflict review with source comparison, citation audit |
| Review | review queue (accept / reject / needs verification + comment), audit trail |
| Output | report preview with PDF (print), JSON and CSV export |
| System | settings, help, 404 |

Notable behaviours:

- **Traceability loop.** Every claim, evidence item and finding has a *View Source* control that opens the document at the exact
  page and paragraph and highlights the quoted passage (`?page=&para=&ref=`).
- **Three themes.** Light, Dark and Night (warm, low contrast), plus an optional automatic Night schedule
  (default 22:00 to 06:00, precedence: schedule, then chosen theme, then system). Chosen before first paint to avoid a flash.
- **Focus Mode** on the document reader and hearing pages, **Ctrl/Cmd+K** command palette, reduced-motion support, keyboard and
  screen-reader labelling throughout.
- **Live audit trail.** Reviewer decisions are appended to the audit log and update queue counts and the overview immediately.

## Legal UX language

Copy is deliberately conservative: *AI-assisted finding*, *potential conflict*, *potentially relevant authority*, *needs human
verification*, *source-grounded*, *prototype assessment signal*. Scores are shown as Support Strength, Conflict Strength and
Uncertainty out of 100 with their weighted factors, never as "truth" or "guilt" probabilities.

## Architecture

```
src/
  types/        domain model
  data/         synthetic seed bundle (documents, hearing, claims, evidence, authorities, findings)
  services/     api.ts (contract) + mockApi.ts (in-memory implementation)
  store/        uiStore (persisted preferences), caseStore (case bundle + actions)
  utils/        selectors, meta registry (icons/tones/labels), search, redaction, export, theme
  hooks/        theme resolution, preferences, focus/motion helpers
  components/   ui/ primitives, domain/ case components, shell/ navigation and layout
  pages/        one file per route, lazy loaded
```

### Replacing the mock with FastAPI

All data access goes through the `Api` interface in `src/services/api.ts`; pages never import seed data directly. Swap the last
lines of that file:

```ts
export const api: Api = mockApi;        // change to your HTTP implementation
```

Suggested mapping:

| Method | Endpoint |
| --- | --- |
| `getCases()`, `getCase(id)` | `GET /cases`, `GET /cases/{id}` |
| `getCaseBundle(id)` | `GET /cases/{id}/bundle` (or the individual resources below) |
| `getDocuments`, `getDocument`, `getClaims`, `getClaim`, `getEvidence`, `getRelationships`, `getAuthorities`, `getCitations`, `getFindings`, `getTimeline` | `GET /cases/{id}/<resource>` |
| `getHearing(id)` | `GET /cases/{id}/hearing` |
| `getReviews`, `getAuditLogs` | `GET /cases/{id}/reviews`, `/audit-logs` |
| `updateReview(findingId, input)` | `POST /findings/{fid}/reviews` |
| `appendAuditLog(entry)` | `POST /audit-logs` |
| `runAnalysis(caseId, { onProgress, signal })` | `POST /cases/{id}/analysis` (poll or stream progress) |
| `linkAuthority(authorityId, claimId)` | `POST /authorities/{aid}/links` |
| `generateReport(caseId)` | `POST /cases/{id}/reports` |

`caseStore` already handles loading, error and retry states, so a real backend mostly needs the client implementation and auth.

## Known limits of the prototype

- Data is in memory. Reviewer actions reset on reload.
- Conflict sensitivity and authority depth are stored preferences. Findings are precomputed, so they do not re-run detection.
- Redaction is pattern based and will miss identifiers. It is a demonstration, not a privacy control.
- PDF export uses the browser print dialog against an always-light report layout.
