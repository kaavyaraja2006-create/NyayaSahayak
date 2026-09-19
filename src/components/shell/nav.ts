import {
  AlertTriangle, ClipboardCheck, Clock, FileText, Folder, Gavel, GitCompare, HelpCircle, History, Landmark,
  Layers, LayoutDashboard, ListChecks, Network, Quote, Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { paths } from '../../utils/routes';

export interface NavItem {
  key: string;
  label: string;
  Icon: LucideIcon;
  to: (caseId: string) => string;
  end?: boolean;
  badge?: 'review';
}
export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    label: 'Case',
    items: [
      { key: 'overview', label: 'Overview', Icon: LayoutDashboard, to: paths.overview, end: true },
      { key: 'documents', label: 'Documents', Icon: Folder, to: paths.documents },
      { key: 'hearing', label: 'Hearings', Icon: Gavel, to: (c) => paths.hearing(c) },
      { key: 'claims', label: 'Claims', Icon: ListChecks, to: paths.claims },
      { key: 'evidence', label: 'Evidence', Icon: Layers, to: (c) => paths.evidence(c) },
      { key: 'authorities', label: 'Authorities', Icon: Landmark, to: (c) => paths.authorities(c) },
      { key: 'timeline', label: 'Timeline', Icon: Clock, to: paths.timeline },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { key: 'graph', label: 'Evidence Graph', Icon: Network, to: (c) => paths.graph(c) },
      { key: 'conflicts', label: 'Conflict Review', Icon: GitCompare, to: (c) => paths.conflicts(c) },
      { key: 'citations', label: 'Citation Audit', Icon: Quote, to: (c) => paths.citations(c) },
    ],
  },
  {
    label: 'Review',
    items: [
      { key: 'review', label: 'Review Queue', Icon: ClipboardCheck, to: (c) => paths.review(c), badge: 'review' },
      { key: 'audit', label: 'Audit Trail', Icon: History, to: paths.audit },
    ],
  },
  {
    label: 'Output',
    items: [{ key: 'report', label: 'Reports', Icon: FileText, to: paths.report }],
  },
  {
    label: 'System',
    items: [
      { key: 'settings', label: 'Settings', Icon: Settings, to: () => '/settings' },
      { key: 'help', label: 'Help', Icon: HelpCircle, to: () => '/help' },
    ],
  },
];

export const SECTION_LABELS: Record<string, string> = {
  documents: 'Documents',
  hearing: 'Hearings',
  claims: 'Claims',
  evidence: 'Evidence',
  timeline: 'Timeline',
  graph: 'Evidence Graph',
  authorities: 'Authorities',
  conflicts: 'Conflict Review',
  citations: 'Citation Audit',
  review: 'Review Queue',
  audit: 'Audit Trail',
  report: 'Reports',
};

export const ALERT_ICON = AlertTriangle;
