import {
  AlertTriangle, Camera, Check, CheckCircle2, Database, Eye, FileText, FlaskConical, HelpCircle,
  Link2, Loader2, Mic, Quote, Scale, Smartphone, Stethoscope, Users, Video, XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  CitationResult, ClaimStatus, EvidenceType, FindingStatus, MarkerKind, RelationshipType,
} from '../types';

export type Tone = 'primary' | 'success' | 'warning' | 'conflict' | 'neutral';

/** Badge surface classes per semantic tone. Colour is always paired with an icon + label. */
export const TONE_BADGE: Record<Tone, string> = {
  primary: 'border-primary/30 bg-primary/10 text-primary-ink',
  success: 'border-success/30 bg-success/10 text-success-ink',
  warning: 'border-warning/35 bg-warning/10 text-warning-ink',
  conflict: 'border-conflict/35 bg-conflict/10 text-conflict-ink',
  neutral: 'border-line bg-s2 text-muted',
};
export const TONE_TEXT: Record<Tone, string> = {
  primary: 'text-primary-ink',
  success: 'text-success-ink',
  warning: 'text-warning-ink',
  conflict: 'text-conflict-ink',
  neutral: 'text-muted',
};
export const TONE_BG: Record<Tone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  conflict: 'bg-conflict',
  neutral: 'bg-subtle',
};
export const TONE_CSS_VAR: Record<Tone, string> = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  conflict: 'var(--conflict)',
  neutral: 'var(--subtle)',
};

export interface Meta {
  label: string;
  tone: Tone;
  Icon: LucideIcon;
}

export const REL_META: Record<RelationshipType, Meta & { edge: string; legend: string }> = {
  SUPPORTS: { label: 'Supports', edge: 'SUPPORTS', legend: 'Support', tone: 'success', Icon: Check },
  CONFLICTS: { label: 'Potential conflict', edge: 'CONFLICTS', legend: 'Conflict', tone: 'conflict', Icon: AlertTriangle },
  CONTEXTUALIZES: { label: 'Context', edge: 'CONTEXT', legend: 'Context', tone: 'primary', Icon: Link2 },
  UNCERTAIN: { label: 'Uncertain', edge: 'UNCERTAIN', legend: 'Uncertain', tone: 'warning', Icon: HelpCircle },
};

export const CLAIM_STATUS_META: Record<ClaimStatus, Meta> = {
  reviewed: { label: 'Reviewed', tone: 'success', Icon: CheckCircle2 },
  needs_review: { label: 'Needs Review', tone: 'warning', Icon: AlertTriangle },
  unresolved: { label: 'Unresolved', tone: 'neutral', Icon: HelpCircle },
  processing: { label: 'Processing', tone: 'primary', Icon: Loader2 },
};

export const FINDING_STATUS_META: Record<FindingStatus, Meta> = {
  open: { label: 'Review required', tone: 'warning', Icon: AlertTriangle },
  accepted: { label: 'Accepted', tone: 'success', Icon: CheckCircle2 },
  rejected: { label: 'Rejected', tone: 'neutral', Icon: XCircle },
  needs_verification: { label: 'Needs verification', tone: 'warning', Icon: Eye },
};

export const CITATION_RESULT_META: Record<CitationResult, Meta> = {
  potentially_relevant: { label: 'Potentially relevant', tone: 'success', Icon: Check },
  weak_relevance: { label: 'Weak relevance', tone: 'warning', Icon: AlertTriangle },
  no_authority: { label: 'No authority identified', tone: 'warning', Icon: AlertTriangle },
  unable_to_map: { label: 'Unable to map', tone: 'neutral', Icon: HelpCircle },
};

export const MARKER_META: Record<MarkerKind, Meta> = {
  claim: { label: 'Claim', tone: 'primary', Icon: Quote },
  evidence: { label: 'Evidence reference', tone: 'success', Icon: FileText },
  question: { label: 'Question', tone: 'neutral', Icon: HelpCircle },
  uncertainty: { label: 'Uncertainty', tone: 'warning', Icon: HelpCircle },
  conflict: { label: 'Potential conflict', tone: 'conflict', Icon: AlertTriangle },
  legal_argument: { label: 'Legal argument', tone: 'neutral', Icon: Scale },
};

export const EVIDENCE_ICON: Record<EvidenceType, LucideIcon> = {
  'Witness Statement': Users,
  CCTV: Video,
  'Phone Metadata': Smartphone,
  'Forensic Report': FlaskConical,
  'Medical Record': Stethoscope,
  Photograph: Camera,
  'Digital Record': Database,
  Document: FileText,
  'Hearing Statement': Mic,
};

export const PRIORITY_META: Record<'high' | 'medium' | 'low', { label: string; tone: Tone }> = {
  high: { label: 'High attention', tone: 'conflict' },
  medium: { label: 'Medium', tone: 'warning' },
  low: { label: 'Low', tone: 'neutral' },
};
