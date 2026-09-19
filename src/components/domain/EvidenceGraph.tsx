import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, BackgroundVariant, Controls, Handle, MiniMap, Position, ReactFlowProvider, useReactFlow } from 'reactflow';
import type { Edge, Node, NodeProps } from 'reactflow';
import 'reactflow/dist/style.css';
import { AlertTriangle, FileText, Landmark, Quote, RotateCcw, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Authority, CaseDocument, Claim, Evidence, EvidenceType, Relationship, RelationshipType } from '../../types';
import { useCaseStore } from '../../store/caseStore';
import { EVIDENCE_ICON, REL_META, TONE_BG, TONE_CSS_VAR } from '../../utils/meta';
import type { Tone } from '../../utils/meta';
import { truncate } from '../../utils/text';
import { cx } from '../../utils/cx';
import { GraphInspector } from './GraphInspector';
import type { GraphSelection } from './GraphInspector';

type Kind = 'claim' | 'evidence' | 'document' | 'authority';
const NODE_W = 232;

interface GNodeData {
  kind: Kind;
  ref: string;
  title: string;
  subtitle: string;
  dim: boolean;
  selected: boolean;
  dir: 'LR' | 'TB';
  flag: boolean;
  evidenceType?: EvidenceType;
}

const nodeKey = (kind: Kind, ref: string): string => `${kind}:${ref}`;

function GraphNode({ data }: NodeProps<GNodeData>) {
  const Icon: LucideIcon =
    data.kind === 'claim' ? Quote : data.kind === 'document' ? FileText : data.kind === 'authority' ? Landmark : data.evidenceType ? EVIDENCE_ICON[data.evidenceType] : FileText;
  const vertical = data.dir === 'TB';
  return (
    <div
      className={cx(
        'rounded-lg border bg-surface px-3 py-2 shadow-card transition-opacity duration-200',
        data.dim && 'opacity-25',
        data.selected ? 'border-primary ring-2 ring-primary/30' : 'border-line',
        data.kind === 'claim' && 'border-l-[3px] border-l-primary',
      )}
      style={{ width: NODE_W }}
    >
      <Handle type="target" position={vertical ? Position.Top : Position.Left} isConnectable={false} />
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-subtle">
        <Icon className="h-3 w-3" aria-hidden />
        <span className="font-mono">{data.ref}</span>
        {data.flag && (
          <span className="ml-auto inline-flex items-center gap-0.5 text-conflict-ink" title="Potential conflict linked to this claim">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            <span className="sr-only">Potential conflict</span>
          </span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 text-[12.5px] font-medium leading-snug">{data.title}</p>
      <p className="mt-0.5 truncate text-[11px] text-subtle">{data.subtitle}</p>
      <Handle type="source" position={vertical ? Position.Bottom : Position.Right} isConnectable={false} />
    </div>
  );
}

const nodeTypes = { g: GraphNode };

/* ── Layout ──────────────────────────────────────────────────────────────── */

interface BaseNode {
  id: string;
  kind: Kind;
  ref: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  flag: boolean;
  evidenceType?: EvidenceType;
}
interface BaseEdge {
  id: string;
  kind: 'rel' | 'source' | 'authority';
  source: string;
  target: string;
  relationshipId?: string;
  relType?: RelationshipType;
}

interface BuildInput {
  claims: Claim[];
  evidence: Evidence[];
  relationships: Relationship[];
  documents: CaseDocument[];
  authorities: Authority[];
  rels: Set<RelationshipType>;
  showSources: boolean;
  showAuthorities: boolean;
  focusClaim: string | null;
}

const COLX = { authority: 0, claim: 330, evidence: 680, document: 1030 } as const;
const ROW = 104;
const GAP = 96;

function spread(items: { id: string; y: number }[], gap: number): Map<string, number> {
  const out = new Map<string, number>();
  let last = -Infinity;
  [...items]
    .sort((a, b) => a.y - b.y)
    .forEach((it) => {
      const y = Math.max(it.y, last + gap);
      out.set(it.id, y);
      last = y;
    });
  return out;
}

const avg = (ns: number[]): number => (ns.length === 0 ? 0 : ns.reduce((a, b) => a + b, 0) / ns.length);

function buildGraph(i: BuildInput): { nodes: BaseNode[]; edges: BaseEdge[] } {
  const claimsShown = i.focusClaim ? i.claims.filter((c) => c.claimId === i.focusClaim) : i.claims;
  const claimIds = new Set(claimsShown.map((c) => c.claimId));
  const relsShown = i.relationships.filter((r) => i.rels.has(r.type) && claimIds.has(r.claimId));
  const evIds = new Set(relsShown.map((r) => r.evidenceId));
  const evShown = i.evidence.filter((e) => evIds.has(e.evidenceId));
  const conflictClaims = new Set(i.relationships.filter((r) => r.type === 'CONFLICTS').map((r) => r.claimId));

  const claimY = new Map<string, number>();
  claimsShown.forEach((c, idx) => claimY.set(c.claimId, idx * ROW));

  const evDesired = evShown.map((e) => ({
    id: e.evidenceId,
    y: avg(relsShown.filter((r) => r.evidenceId === e.evidenceId).map((r) => claimY.get(r.claimId) ?? 0)),
  }));
  const evY = spread(evDesired, GAP);

  const nodes: BaseNode[] = [];
  const edges: BaseEdge[] = [];

  claimsShown.forEach((c) =>
    nodes.push({
      id: nodeKey('claim', c.claimId), kind: 'claim', ref: c.claimId, title: c.title, subtitle: c.type,
      x: COLX.claim, y: claimY.get(c.claimId) ?? 0, flag: conflictClaims.has(c.claimId),
    }),
  );
  evShown.forEach((e) =>
    nodes.push({
      id: nodeKey('evidence', e.evidenceId), kind: 'evidence', ref: e.evidenceId, title: truncate(e.description, 84), subtitle: e.type,
      x: COLX.evidence, y: evY.get(e.evidenceId) ?? 0, flag: false, evidenceType: e.type,
    }),
  );
  relsShown.forEach((r) =>
    edges.push({
      id: `rel:${r.relationshipId}`, kind: 'rel', source: nodeKey('claim', r.claimId), target: nodeKey('evidence', r.evidenceId),
      relationshipId: r.relationshipId, relType: r.type,
    }),
  );

  if (i.showSources) {
    const docIds = new Set(evShown.map((e) => e.source.documentId));
    const docs = i.documents.filter((d) => docIds.has(d.documentId));
    const desired = docs.map((d) => ({
      id: d.documentId,
      y: avg(evShown.filter((e) => e.source.documentId === d.documentId).map((e) => evY.get(e.evidenceId) ?? 0)),
    }));
    const dy = spread(desired, GAP);
    docs.forEach((d) =>
      nodes.push({
        id: nodeKey('document', d.documentId), kind: 'document', ref: d.documentId, title: d.name, subtitle: d.category,
        x: COLX.document, y: dy.get(d.documentId) ?? 0, flag: false,
      }),
    );
    evShown.forEach((e) =>
      edges.push({ id: `src:${e.evidenceId}`, kind: 'source', source: nodeKey('evidence', e.evidenceId), target: nodeKey('document', e.source.documentId) }),
    );
  }

  if (i.showAuthorities) {
    const auths = i.authorities.filter((a) => a.claimIds.some((id) => claimIds.has(id)));
    const desired = auths.map((a) => ({ id: a.authorityId, y: avg(a.claimIds.filter((id) => claimIds.has(id)).map((id) => claimY.get(id) ?? 0)) }));
    const ay = spread(desired, GAP + 20);
    auths.forEach((a) => {
      nodes.push({
        id: nodeKey('authority', a.authorityId), kind: 'authority', ref: a.authorityId, title: a.caseName, subtitle: `${a.label}, ${a.year}`,
        x: COLX.authority, y: ay.get(a.authorityId) ?? 0, flag: false,
      });
      a.claimIds.filter((id) => claimIds.has(id)).forEach((id) =>
        edges.push({ id: `auth:${a.authorityId}:${id}`, kind: 'authority', source: nodeKey('authority', a.authorityId), target: nodeKey('claim', id) }),
      );
    });
  }
  return { nodes, edges };
}

/* ── Decoration (selection / search dimming) ─────────────────────────────── */

function selectionNodeId(sel: GraphSelection | null): string | null {
  if (!sel || sel.type === 'relationship') return null;
  return nodeKey(sel.type, sel.id);
}

function decorate(
  built: { nodes: BaseNode[]; edges: BaseEdge[] },
  sel: GraphSelection | null,
  query: string,
  dir: 'LR' | 'TB',
): { nodes: Node<GNodeData>[]; edges: Edge[] } {
  let activeNodes: Set<string> | null = null;
  let activeEdges: Set<string> | null = null;
  const selNode = selectionNodeId(sel);

  if (sel?.type === 'relationship') {
    const e = built.edges.find((x) => x.relationshipId === sel.id);
    if (e) {
      activeNodes = new Set([e.source, e.target]);
      activeEdges = new Set([e.id]);
    }
  } else if (selNode) {
    const set = new Set<string>([selNode]);
    built.edges.forEach((e) => {
      if (e.source === selNode || e.target === selNode) {
        set.add(e.source);
        set.add(e.target);
      }
    });
    if (sel?.type === 'claim') {
      built.edges.forEach((e) => {
        if (e.kind === 'source' && set.has(e.source)) set.add(e.target);
      });
    }
    activeNodes = set;
    activeEdges = new Set(built.edges.filter((e) => set.has(e.source) && set.has(e.target)).map((e) => e.id));
  } else if (query.trim()) {
    const q = query.trim().toLowerCase();
    const set = new Set(built.nodes.filter((n) => `${n.ref} ${n.title} ${n.subtitle}`.toLowerCase().includes(q)).map((n) => n.id));
    activeNodes = set;
    activeEdges = new Set(built.edges.filter((e) => set.has(e.source) && set.has(e.target)).map((e) => e.id));
  }

  const nodes: Node<GNodeData>[] = built.nodes.map((n) => ({
    id: n.id,
    type: 'g',
    position: { x: n.x, y: n.y },
    draggable: true,
    data: {
      kind: n.kind, ref: n.ref, title: n.title, subtitle: n.subtitle, flag: n.flag, evidenceType: n.evidenceType, dir,
      dim: activeNodes !== null && !activeNodes.has(n.id),
      selected: selNode === n.id,
    },
  }));

  const edges: Edge[] = built.edges.map((e) => {
    const on = activeEdges === null || activeEdges.has(e.id);
    const tone: Tone = e.kind === 'rel' && e.relType ? REL_META[e.relType].tone : e.kind === 'authority' ? 'primary' : 'neutral';
    const selectedEdge = sel?.type === 'relationship' && e.relationshipId === sel.id;
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'default',
      label: e.kind === 'rel' && e.relType && on ? REL_META[e.relType].edge : undefined,
      labelBgPadding: [5, 3] as [number, number],
      labelBgBorderRadius: 3,
      animated: on && activeEdges !== null && e.kind === 'rel',
      zIndex: on ? 2 : 0,
      data: { relationshipId: e.relationshipId },
      style: {
        stroke: `rgb(${TONE_CSS_VAR[tone]})`,
        strokeWidth: selectedEdge ? 2.8 : e.kind === 'rel' ? 1.7 : 1.1,
        opacity: on ? 1 : 0.12,
        strokeDasharray: e.kind === 'rel' && e.relType === 'UNCERTAIN' ? '6 4' : e.kind === 'rel' ? undefined : '2 5',
      },
    };
  });
  return { nodes, edges };
}

/* ── Full workspace ──────────────────────────────────────────────────────── */

const REL_TYPES: RelationshipType[] = ['SUPPORTS', 'CONFLICTS', 'CONTEXTUALIZES', 'UNCERTAIN'];

function initialSelection(focus: string | undefined): GraphSelection | null {
  if (!focus) return null;
  if (focus.startsWith('C-')) return { type: 'claim', id: focus };
  if (focus.startsWith('E-')) return { type: 'evidence', id: focus };
  if (focus.startsWith('DOC-')) return { type: 'document', id: focus };
  if (focus.startsWith('AUTH')) return { type: 'authority', id: focus };
  if (focus.startsWith('R-')) return { type: 'relationship', id: focus };
  return null;
}

function GraphInner({ focus }: { focus?: string }) {
  const claims = useCaseStore((s) => s.claims);
  const evidence = useCaseStore((s) => s.evidence);
  const relationships = useCaseStore((s) => s.relationships);
  const documents = useCaseStore((s) => s.documents);
  const authorities = useCaseStore((s) => s.authorities);
  const logEvent = useCaseStore((s) => s.logEvent);
  const { fitView } = useReactFlow();

  const [rels, setRels] = useState<Set<RelationshipType>>(new Set(REL_TYPES));
  const [showSources, setShowSources] = useState(true);
  const [showAuthorities, setShowAuthorities] = useState(true);
  const [focusClaim, setFocusClaim] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<GraphSelection | null>(() => initialSelection(focus));

  useEffect(() => {
    logEvent({ action: 'Evidence graph viewed', objectType: 'graph', objectId: 'evidence-graph' }, true);
  }, [logEvent]);

  useEffect(() => {
    if (focus) setSelection(initialSelection(focus));
  }, [focus]);

  const built = useMemo(
    () => buildGraph({ claims, evidence, relationships, documents, authorities, rels, showSources, showAuthorities, focusClaim }),
    [claims, evidence, relationships, documents, authorities, rels, showSources, showAuthorities, focusClaim],
  );
  const { nodes, edges } = useMemo(() => decorate(built, selection, query, 'LR'), [built, selection, query]);

  const layoutKey = `${built.nodes.length}-${built.edges.length}-${focusClaim ?? 'all'}`;
  useEffect(() => {
    const t = window.setTimeout(() => fitView({ padding: 0.14, duration: 350 }), 60);
    return () => window.clearTimeout(t);
  }, [layoutKey, fitView]);

  const toggleRel = (t: RelationshipType): void => {
    setRels((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };
  const counts = useMemo(() => {
    const m = new Map<RelationshipType, number>();
    relationships.forEach((r) => m.set(r.type, (m.get(r.type) ?? 0) + 1));
    return m;
  }, [relationships]);

  const reset = (): void => {
    setRels(new Set(REL_TYPES));
    setShowSources(true);
    setShowAuthorities(true);
    setFocusClaim(null);
    setQuery('');
    setSelection(null);
    window.setTimeout(() => fitView({ padding: 0.14, duration: 350 }), 60);
  };

  const onNodeClick = useCallback((_e: unknown, node: Node<GNodeData>) => {
    setSelection({ type: node.data.kind, id: node.data.ref });
  }, []);
  const onEdgeClick = useCallback((_e: unknown, edge: Edge) => {
    const id = (edge.data as { relationshipId?: string } | undefined)?.relationshipId;
    if (id) setSelection({ type: 'relationship', id });
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="card flex flex-wrap items-center gap-2 p-2.5">
        <div role="group" aria-label="Relationship filters" className="flex flex-wrap items-center gap-1.5">
          {REL_TYPES.map((t) => {
            const m = REL_META[t];
            const on = rels.has(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => toggleRel(t)}
                className={cx(
                  'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-medium transition-colors',
                  on ? 'border-line bg-surface text-fg' : 'border-dashed border-line text-subtle line-through',
                )}
              >
                <span className={cx('h-2 w-2 rounded-full', TONE_BG[m.tone])} aria-hidden />
                <m.Icon className="h-3 w-3" aria-hidden />
                {m.legend}
                <span className="font-mono text-[10.5px] text-subtle">{counts.get(t) ?? 0}</span>
              </button>
            );
          })}
        </div>
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden />
        <label className="inline-flex items-center gap-1.5 text-xs text-muted">
          <input type="checkbox" checked={showSources} onChange={(e) => setShowSources(e.target.checked)} className="accent-[rgb(var(--primary))]" />
          Sources
        </label>
        <label className="inline-flex items-center gap-1.5 text-xs text-muted">
          <input type="checkbox" checked={showAuthorities} onChange={(e) => setShowAuthorities(e.target.checked)} className="accent-[rgb(var(--primary))]" />
          Authorities
        </label>
        <select
          aria-label="Focus on a claim"
          className="input h-7 w-auto max-w-[200px] py-0 text-xs"
          value={focusClaim ?? ''}
          onChange={(e) => setFocusClaim(e.target.value || null)}
        >
          <option value="">All claims</option>
          {claims.map((c) => (
            <option key={c.claimId} value={c.claimId}>
              {c.claimId}: {truncate(c.title, 28)}
            </option>
          ))}
        </select>
        <div className="relative ml-auto min-w-[150px] flex-1 sm:max-w-[220px] sm:flex-none">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" aria-hidden />
          <input className="input h-7 pl-7 text-xs" placeholder="Highlight nodes…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Highlight nodes matching text" />
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <div className="card relative min-h-[420px] flex-1 overflow-hidden">
          <ReactFlow
            className="rf-theme"
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={() => setSelection(null)}
            nodesConnectable={false}
            minZoom={0.12}
            maxZoom={1.6}
            fitView
            fitViewOptions={{ padding: 0.14 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable className="hidden md:block" />
          </ReactFlow>
          {built.nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted">No nodes match the current filters.</div>
          )}
          <p className="pointer-events-none absolute bottom-2 left-3 rounded bg-surface/80 px-1.5 py-0.5 text-[10.5px] text-subtle">
            Relationships are AI-assisted and require human verification.
          </p>
        </div>
        <div className="max-h-[60vh] w-full shrink-0 lg:max-h-none lg:w-[340px]">
          <GraphInspector selection={selection} onFocusClaim={(id) => setFocusClaim(id)} onClear={() => setSelection(null)} />
        </div>
      </div>
    </div>
  );
}

export function EvidenceGraph({ focus }: { focus?: string }) {
  return (
    <ReactFlowProvider>
      <GraphInner focus={focus} />
    </ReactFlowProvider>
  );
}

/* ── Compact per-claim graph (Claim Detail) ──────────────────────────────── */

function ClaimGraphInner({ claimId, onSelectEvidence }: { claimId: string; onSelectEvidence?: (evidenceId: string) => void }) {
  const claims = useCaseStore((s) => s.claims);
  const evidence = useCaseStore((s) => s.evidence);
  const relationships = useCaseStore((s) => s.relationships);
  const [selected, setSelected] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const claim = claims.find((c) => c.claimId === claimId);
    const rels = relationships.filter((r) => r.claimId === claimId);
    const gap = NODE_W + 28;
    const centre = ((rels.length - 1) * gap) / 2;
    const ns: Node<GNodeData>[] = [];
    if (claim) {
      ns.push({
        id: nodeKey('claim', claim.claimId), type: 'g', position: { x: Math.max(centre, 0), y: 0 }, draggable: false,
        data: { kind: 'claim', ref: claim.claimId, title: claim.title, subtitle: claim.type, dim: false, selected: false, dir: 'TB', flag: rels.some((r) => r.type === 'CONFLICTS') },
      });
    }
    const es: Edge[] = [];
    rels.forEach((r, idx) => {
      const ev = evidence.find((e) => e.evidenceId === r.evidenceId);
      if (!ev) return;
      const tone = REL_META[r.type].tone;
      ns.push({
        id: nodeKey('evidence', ev.evidenceId), type: 'g', position: { x: idx * gap, y: 190 }, draggable: false,
        data: { kind: 'evidence', ref: ev.evidenceId, title: truncate(ev.description, 84), subtitle: ev.type, dim: false, selected: selected === ev.evidenceId, dir: 'TB', flag: false, evidenceType: ev.type },
      });
      es.push({
        id: `rel:${r.relationshipId}`, source: nodeKey('claim', claimId), target: nodeKey('evidence', ev.evidenceId), type: 'default',
        label: REL_META[r.type].edge, labelBgPadding: [5, 3] as [number, number], labelBgBorderRadius: 3,
        style: { stroke: `rgb(${TONE_CSS_VAR[tone]})`, strokeWidth: 1.8, strokeDasharray: r.type === 'UNCERTAIN' ? '6 4' : undefined },
      });
    });
    return { nodes: ns, edges: es };
  }, [claims, evidence, relationships, claimId, selected]);

  return (
    <div className="h-[340px] overflow-hidden rounded-lg border border-line bg-s2/30">
      <ReactFlow
        className="rf-theme"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        zoomOnScroll={false}
        preventScrolling={false}
        minZoom={0.3}
        maxZoom={1.4}
        fitView
        fitViewOptions={{ padding: 0.18, maxZoom: 1 }}
        onNodeClick={(_e: unknown, node: Node<GNodeData>) => {
          if (node.data.kind === 'evidence') {
            setSelected(node.data.ref);
            onSelectEvidence?.(node.data.ref);
          }
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function ClaimGraph(props: { claimId: string; onSelectEvidence?: (evidenceId: string) => void }) {
  return (
    <ReactFlowProvider>
      <ClaimGraphInner {...props} />
    </ReactFlowProvider>
  );
}
