// =====================================================================
// AEGIS Intelligence — Gantt Kanban Governance Dashboard v4.0 — SCAFFOLD
// =====================================================================
// Source PRS : 20260410T1400_SPEC_GANTT-KANBAN-V4-PRS.md
// Auteur scaffold : Claude Code (ACDC) — Night Builder N1
// Date scaffold : 20260411T0000 CET
// Statut : DRAFT NOCTURNE — pre-review Opus Chat matinal
// Workflow : Claude Code ECRIT / Opus Chat AUDIT V&V / JP+Opus Chat CO-EXEC
// Convention : ASCII strict pour le code, accents toleres en strings UI
// IDs definitifs sources : D334 / L235 / R112 (LIFECYCLE v2.9.0 du 06/04)
// =====================================================================

import { useReducer, useMemo, useCallback } from "react";

// =====================================================================
// SECTION 1 — CONSTANTES PALETTE ET LAYOUT
// Source : SPEC v4 PRS S12 Visual Design System
// =====================================================================

const P = {
  bg:        "#0c0f14",
  surface:   "#11151c",
  card:      "#161b24",
  cardHover: "#1c2230",
  text:      "#e5e7eb",
  muted:     "#94a3b8",
  border:    "rgba(255,255,255,0.08)",
  accent:    "#3b82f6",  // couloir Code
  emerald:   "#10b981",  // couloir Sessions Opus
  gold:      "#eab308",  // couloir Commercial
  rose:      "#f43f5e",  // couloir Reglementaire
  copper:    "#ea580c",  // couloir Maintenance ops
  violet:    "#a855f7",  // couloir MYTHOS
  cyan:      "#06b6d4",  // conditionnel
};

// Source : SPEC v4 PRS S11.1 — 6 swimlanes
const SWIMLANES = [
  { id: "code",            name: "Code",            color: P.accent,  softColor: "rgba(59,130,246,0.12)",  order: 1, description: "Sprints de developpement jeanpierrecharles.com (v3.x, v4.0)" },
  { id: "mythos",          name: "MYTHOS",          color: P.violet,  softColor: "rgba(168,85,247,0.12)",  order: 2, description: "Initiatives strategiques LinkedIn, LLMO, BenchmarkCalculator, taxonomie angles morts" },
  { id: "commercial",      name: "Commercial",      color: P.gold,    softColor: "rgba(234,179,8,0.12)",   order: 3, description: "Jalons commerciaux, pricing tiers, livrables TERRAIN, funnel, MRR" },
  { id: "reglementaire",   name: "Reglementaire",   color: P.rose,    softColor: "rgba(244,63,94,0.12)",   order: 4, description: "Deadlines EU : CRA, Machinery Reg, AI Act, ENISA SRP" },
  { id: "sessions-opus",   name: "Sessions Opus",   color: P.emerald, softColor: "rgba(16,185,129,0.12)",  order: 5, description: "Consolidation LIFECYCLE, integration IDs, CAUSAL_GRAPH, PRINCIPE FONDATEUR" },
  { id: "maintenance-ops", name: "Maintenance ops", color: P.copper,  softColor: "rgba(234,88,12,0.12)",   order: 6, description: "Scripts PS1, Claude Desktop versionning, smoke tests, monitoring" },
];

// Source : SPEC v4 PRS S6 Groupe A FR-01 — 7 colonnes Kanban dans l'ordre strict
const COLUMNS = [
  { id: "backlog",  label: "Backlog",  order: 1 },
  { id: "specifie", label: "Specifie", order: 2 },
  { id: "en-cours", label: "En cours", order: 3 },
  { id: "bloque",   label: "Bloque",   order: 4 },
  { id: "vv",       label: "V&V",      order: 5 },
  { id: "done",     label: "Done",     order: 6 },
  { id: "reporte",  label: "Reporte",  order: 7 },
];

const TODAY = "2026-04-11";  // a regenerer dynamiquement en N2

// =====================================================================
// SECTION 2 — TYPES ET INTERFACES TYPESCRIPT
// Source : SPEC v4 PRS S8 Data Model
// =====================================================================

// === TYPES DE BASE ===

type SwimlaneId = "code" | "mythos" | "commercial" | "reglementaire" | "sessions-opus" | "maintenance-ops";

type KanbanColumn = "backlog" | "specifie" | "en-cours" | "bloque" | "vv" | "done" | "reporte";

type ItemType = "D" | "L" | "R" | "Task";

type Priority = "P0" | "P1" | "P2";

type Criticality = "ROUGE" | "AMBRE" | "VERT";

type DependencyType = "blocks" | "depends" | "informs";

type SprintStatus = "clos" | "production" | "en-cours" | "planned" | "blocked";

type TempIdStatus = "pending" | "integrated" | "rejected";

type ViewId = "kanban" | "gantt" | "ids" | "metriques" | "export";

// === INTERFACES PRINCIPALES ===

interface Swimlane {
  id: SwimlaneId;
  name: string;
  color: string;
  softColor: string;
  order: number;
  description: string;
}

interface Sprint {
  id: string;
  version: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  swimlane: SwimlaneId;
  description: string;
  relatedIds: string[];
  commits: string[];
}

interface KanbanItem {
  id: string;
  type: ItemType;
  title: string;
  priority: Priority;
  status: KanbanColumn;
  swimlane: SwimlaneId;
  sprint: string;
  tags: string[];
  detail: string;
  sessionTimestamp: string;
  dependencies: string[];
  assignee: string;
  deadline: string | null;
}

interface GanttBar {
  id: string;
  itemRef: string;
  startDate: string;
  endDate: string;
  swimlane: SwimlaneId;
  progress: number;
  blocker: boolean;
  dependsOn: string[];
  label: string;
}

interface Milestone {
  id: string;
  label: string;
  date: string;
  criticality: Criticality;
  type: string;
  description: string;
  linkedFR: string;
  done: boolean;
}

interface Dependency {
  id: string;
  fromId: string;
  toId: string;
  type: DependencyType;
  comment: string;
}

interface IdEntry {
  id: string;
  type: ItemType;
  title: string;
  date: string;
  linkedBridge: string;
  status: "definitive" | "temporary";
}

interface TempIdEntry {
  tempId: string;
  sessionTimestamp: string;
  proposedDefinitiveRange: string;
  status: TempIdStatus;
  sessionLabel: string;
}

interface IdRegistry {
  lastD: number;
  lastL: number;
  lastR: number;
  definitiveIds: Record<string, IdEntry>;
  temporaryIds: TempIdEntry[];
}

interface Filter {
  swimlane: SwimlaneId | null;
  sprint: string | null;
  priority: Priority | null;
  criticality: Criticality | null;
  blocker: boolean | null;
  search: string;
}

interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  target: number | null;
}

interface AppState {
  swimlanes: Swimlane[];
  sprints: Sprint[];
  items: KanbanItem[];
  ganttBars: GanttBar[];
  milestones: Milestone[];
  dependencies: Dependency[];
  idRegistry: IdRegistry;
  filters: Filter;
  metrics: Metric[];
  currentView: ViewId;
  selectedItemId: string | null;
  sessionStart: string;
}

// === ACTIONS REDUCER ===

type AppAction =
  | { type: "MOVE_ITEM"; payload: { itemId: string; toColumn: KanbanColumn } }
  | { type: "SELECT_ITEM"; payload: { itemId: string | null } }
  | { type: "SET_VIEW"; payload: { view: ViewId } }
  | { type: "SET_FILTER"; payload: Partial<Filter> }
  | { type: "CLEAR_FILTERS" }
  | { type: "TOGGLE_SWIMLANE"; payload: { swimlane: SwimlaneId } };

// =====================================================================
// SECTION 3 — DONNEES EMBARQUEES — SPRINTS
// Source : SPEC v4 PRS S11.2 — 10 sprints connus
// =====================================================================

const SPRINTS: Sprint[] = [
  {
    id: "sp-311",
    version: "v3.1.1",
    startDate: "2026-03-12",
    endDate: "2026-03-18",
    status: "production",
    swimlane: "code",
    description: "Blog + OG tags",
    relatedIds: [],
    commits: ["b8d4cb6"],
  },
  {
    id: "sp-32",
    version: "v3.2",
    startDate: "2026-03-24",
    endDate: "2026-04-06",
    status: "clos",
    swimlane: "code",
    description: "BUG-01/02 + Hero + campagne S13",
    relatedIds: [],
    commits: [],
  },
  {
    id: "sp-33",
    version: "v3.3",
    startDate: "2026-04-01",
    endDate: "2026-04-02",
    status: "clos",
    swimlane: "code",
    description: "Brain Claude API + Mollie 250 EUR + UX",
    relatedIds: [],
    commits: ["59b28f1"],
  },
  {
    id: "sp-33x",
    version: "v3.3.x",
    startDate: "2026-04-03",
    endDate: "2026-04-03",
    status: "clos",
    swimlane: "code",
    description: "System prompt + facture PDF + i18n",
    relatedIds: [],
    commits: ["022cd52", "b4c119a"],
  },
  {
    id: "sp-340",
    version: "v3.4.0",
    startDate: "2026-04-06",
    endDate: "2026-04-06",
    status: "clos",
    swimlane: "code",
    description: "Migration Gemini Brain+PULSE + PDF marketing",
    relatedIds: [],
    commits: ["be66564"],
  },
  {
    id: "sp-341",
    version: "v3.4.1",
    startDate: "2026-04-06",
    endDate: "2026-04-06",
    status: "clos",
    swimlane: "code",
    description: "Hotfix template literal + rotation cle Gemini",
    relatedIds: [],
    commits: ["83e4855"],
  },
  {
    id: "sp-342",
    version: "v3.4.2",
    startDate: "2026-04-06",
    endDate: "2026-04-09",
    status: "production",
    swimlane: "code",
    description: "Dual-key Mollie + prompts TXT + health + i18n",
    relatedIds: [],
    commits: ["839256b"],
  },
  {
    id: "sp-343",
    version: "v3.4.3",
    startDate: "2026-04-16",
    endDate: "2026-04-23",
    status: "planned",
    swimlane: "mythos",
    description: "Preuve ROI + BenchmarkCalculator + monitoring",
    relatedIds: [],
    commits: [],
  },
  {
    id: "sp-344",
    version: "v3.4.4",
    startDate: "2026-04-24",
    endDate: "2026-04-30",
    status: "planned",
    swimlane: "mythos",
    description: "Taxonomie 7 angles morts + BlindSpotsMatrix",
    relatedIds: [],
    commits: [],
  },
  {
    id: "sp-35",
    version: "v3.5",
    startDate: "2026-05-01",
    endDate: "2026-05-18",
    status: "planned",
    swimlane: "commercial",
    description: "TIER TERRAIN 5 fiches-produits + page + hotfix anti-cannibalisation",
    relatedIds: [],
    commits: [],
  },
];

// =====================================================================
// SECTION 4 — DONNEES EMBARQUEES — ITEMS KANBAN MOCK N1
// 5 cartes statiques, 1 par couloir Code/MYTHOS/Commercial/Reglementaire/Maintenance ops
// A enrichir en N2/N3 avec donnees completes
// =====================================================================

const MOCK_ITEMS_N1: KanbanItem[] = [
  {
    id: "mock-code-01",
    type: "Task",
    title: "v3.4.2 PRODUCTION end-to-end",
    priority: "P0",
    status: "done",
    swimlane: "code",
    sprint: "sp-342",
    tags: ["D334"],
    detail: "Smoke test PS1 GO 5/5 PASS T2110",
    sessionTimestamp: "20260409T2110",
    dependencies: [],
    assignee: "JP",
    deadline: null,
  },
  {
    id: "mock-mythos-01",
    type: "Task",
    title: "Sprint v3.4.3 Preuve ROI",
    priority: "P1",
    status: "specifie",
    swimlane: "mythos",
    sprint: "sp-343",
    tags: [],
    detail: "BenchmarkCalculator + Post #7 LinkedIn TELUS/Rakuten",
    sessionTimestamp: "20260409T1000",
    dependencies: ["mock-code-01"],
    assignee: "ACDC",
    deadline: "2026-04-23",
  },
  {
    id: "mock-commercial-01",
    type: "Task",
    title: "DIAGNOSTIC 250 EUR — premier client J0",
    priority: "P0",
    status: "en-cours",
    swimlane: "commercial",
    sprint: "sp-342",
    tags: ["L_T2110_01"],
    detail: "Cible cardinale 15/04/2026",
    sessionTimestamp: "20260410T2200",
    dependencies: [],
    assignee: "JP",
    deadline: "2026-04-15",
  },
  {
    id: "mock-reglementaire-01",
    type: "Task",
    title: "CRA Signalement 24h",
    priority: "P0",
    status: "backlog",
    swimlane: "reglementaire",
    sprint: "sp-35",
    tags: [],
    detail: "Premiere deadline 11/09/2026",
    sessionTimestamp: "20260410T1400",
    dependencies: [],
    assignee: "JP",
    deadline: "2026-09-11",
  },
  {
    id: "mock-maintenance-01",
    type: "R",
    title: "Patch v3 aegis-desktop-vv.ps1",
    priority: "P1",
    status: "vv",
    swimlane: "maintenance-ops",
    sprint: "sp-342",
    tags: ["L_T1100_01"],
    detail: "Detection format de version Anthropic 1.BUILD.0",
    sessionTimestamp: "20260410T1340",
    dependencies: [],
    assignee: "JP+Opus Chat",
    deadline: null,
  },
];

// =====================================================================
// SECTION 5 — REDUCER CENTRAL
// Source : SPEC v4 PRS S10 Patterns — useReducer central
// =====================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.payload.view };

    case "SELECT_ITEM":
      return { ...state, selectedItemId: action.payload.itemId };

    case "MOVE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, status: action.payload.toColumn }
            : item
        ),
      };

    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: {
          swimlane: null,
          sprint: null,
          priority: null,
          criticality: null,
          blocker: null,
          search: "",
        },
      };

    case "TOGGLE_SWIMLANE":
      // N1 stub — implementation complete N3
      return state;

    default:
      return state;
  }
}

// =====================================================================
// SECTION 6 — COMPOSANT HEADER
// Source : SPEC v4 PRS S9.2 Navigation + FR-35/FR-47/FR-48
// =====================================================================

interface HeaderProps {
  currentView: ViewId;
  onViewChange: (view: ViewId) => void;
}

function Header({ currentView, onViewChange }: HeaderProps) {
  const tabs: Array<{ id: ViewId; label: string; shortcut: string }> = [
    { id: "kanban",    label: "Kanban",    shortcut: "K" },
    { id: "gantt",     label: "Gantt",     shortcut: "G" },
    { id: "ids",       label: "IDs",       shortcut: "I" },
    { id: "metriques", label: "Metriques", shortcut: "M" },
    { id: "export",    label: "Export",    shortcut: "E" },
  ];

  return (
    <header style={{ padding: "16px 24px", borderBottom: `1px solid ${P.border}`, backgroundColor: P.surface }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: P.text }}>
            AEGIS Intelligence — Gantt Kanban v4.0
          </div>
          <div style={{ fontSize: 11, color: P.muted, marginTop: 2, fontFamily: "monospace" }}>
            IDs : D334 / L235 / R112 — LIFECYCLE v2.9.0 — ~51 temp IDs pending v2.10.0
          </div>
        </div>
        <div style={{ fontSize: 10, color: P.muted, fontFamily: "monospace" }}>
          Donnees : {TODAY}
        </div>
      </div>
      <nav style={{ display: "flex", gap: 8 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: `1px solid ${currentView === tab.id ? P.accent : P.border}`,
              backgroundColor: currentView === tab.id ? "rgba(59,130,246,0.12)" : "transparent",
              color: currentView === tab.id ? P.accent : P.muted,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {tab.label} <span style={{ opacity: 0.5, marginLeft: 4 }}>[{tab.shortcut}]</span>
          </button>
        ))}
      </nav>
    </header>
  );
}

// =====================================================================
// SECTION 7 — COMPOSANT KANBANVIEW
// Source : SPEC v4 PRS S9.3 Kanban layout + FR-01 a FR-06
// N1 : 7 colonnes statiques, drag-drop HTML5 natif, panneau detail simple
// =====================================================================

interface KanbanViewProps {
  items: KanbanItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  onMoveItem: (itemId: string, toColumn: KanbanColumn) => void;
}

function KanbanView({ items, selectedItemId, onSelectItem, onMoveItem }: KanbanViewProps) {
  const itemsByColumn = useMemo(() => {
    const map: Record<string, KanbanItem[]> = {};
    COLUMNS.forEach((col) => {
      map[col.id] = items.filter((item) => item.status === col.id);
    });
    return map;
  }, [items]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toColumn: KanbanColumn) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (itemId) {
      onMoveItem(itemId, toColumn);
    }
  };

  return (
    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
      {COLUMNS.map((col) => {
        const colItems = itemsByColumn[col.id] || [];
        return (
          <div
            key={col.id}
            style={{ backgroundColor: P.surface, borderRadius: 10, border: `1px solid ${P.border}`, overflow: "hidden" }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id as KanbanColumn)}
          >
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${P.border}`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: P.text, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {col.label}
              </span>
              <span style={{ fontSize: 10, color: P.muted, fontFamily: "monospace" }}>
                {colItems.filter((i) => i.status !== "done").length}/{colItems.length}
              </span>
            </div>
            <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6, minHeight: 100 }}>
              {colItems.map((item) => {
                const swimlane = SWIMLANES.find((s) => s.id === item.swimlane);
                const isSelected = item.id === selectedItemId;
                const isDone = item.status === "done";
                const isBlocked = item.status === "bloque";
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => onSelectItem(isSelected ? null : item.id)}
                    style={{
                      backgroundColor: P.card,
                      borderRadius: 8,
                      padding: "10px 12px",
                      cursor: "pointer",
                      border: `1px solid ${isSelected ? P.accent : P.border}`,
                      borderLeft: `3px solid ${isBlocked ? P.rose : isDone ? P.emerald : (swimlane ? swimlane.color : P.border)}`,
                      opacity: isDone ? 0.5 : 1,
                      textDecoration: isDone ? "line-through" : "none",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: P.text, marginBottom: 4 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 9, color: P.muted, display: "flex", gap: 6 }}>
                      <span>{item.priority}</span>
                      <span>·</span>
                      <span>{item.swimlane}</span>
                      {item.deadline && (
                        <>
                          <span>·</span>
                          <span>{item.deadline}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =====================================================================
// SECTION 8 — PLACEHOLDERS VUES N2/N3
// =====================================================================

function GanttView() {
  return (
    <div style={{ padding: 32, color: P.muted, fontSize: 13, textAlign: "center" }}>
      Vue Gantt — a implementer en Night Builder N2 (11-12/04)
    </div>
  );
}

function IdsView() {
  return (
    <div style={{ padding: 32, color: P.muted, fontSize: 13, textAlign: "center" }}>
      Vue IDs — a implementer en Night Builder N3 (12-13/04)
    </div>
  );
}

function MetricsView() {
  return (
    <div style={{ padding: 32, color: P.muted, fontSize: 13, textAlign: "center" }}>
      Vue Metriques — a implementer en Night Builder N3 (12-13/04)
    </div>
  );
}

function ExportView() {
  return (
    <div style={{ padding: 32, color: P.muted, fontSize: 13, textAlign: "center" }}>
      Vue Export — a implementer en Night Builder N3 (12-13/04)
    </div>
  );
}

// =====================================================================
// SECTION 9 — COMPOSANT PRINCIPAL
// =====================================================================

const initialState: AppState = {
  swimlanes: SWIMLANES as Swimlane[],
  sprints: SPRINTS,
  items: MOCK_ITEMS_N1,
  ganttBars: [],
  milestones: [],
  dependencies: [],
  idRegistry: {
    lastD: 334,
    lastL: 235,
    lastR: 112,
    definitiveIds: {},
    temporaryIds: [],
  },
  filters: {
    swimlane: null,
    sprint: null,
    priority: null,
    criticality: null,
    blocker: null,
    search: "",
  },
  metrics: [],
  currentView: "kanban",
  selectedItemId: null,
  sessionStart: new Date().toISOString(),
};

export default function GanttKanbanV4() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const handleViewChange = useCallback((view: ViewId) => {
    dispatch({ type: "SET_VIEW", payload: { view } });
  }, []);

  const handleSelectItem = useCallback((itemId: string | null) => {
    dispatch({ type: "SELECT_ITEM", payload: { itemId } });
  }, []);

  const handleMoveItem = useCallback((itemId: string, toColumn: KanbanColumn) => {
    dispatch({ type: "MOVE_ITEM", payload: { itemId, toColumn } });
  }, []);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", backgroundColor: P.bg, color: P.text, minHeight: "100vh" }}>
      <Header currentView={state.currentView} onViewChange={handleViewChange} />
      <main>
        {state.currentView === "kanban" && (
          <KanbanView
            items={state.items}
            selectedItemId={state.selectedItemId}
            onSelectItem={handleSelectItem}
            onMoveItem={handleMoveItem}
          />
        )}
        {state.currentView === "gantt"     && <GanttView />}
        {state.currentView === "ids"       && <IdsView />}
        {state.currentView === "metriques" && <MetricsView />}
        {state.currentView === "export"    && <ExportView />}
      </main>
      <footer style={{ padding: "12px 24px", borderTop: `1px solid ${P.border}`, fontSize: 10, color: P.muted, fontFamily: "monospace" }}>
        v4.0 SCAFFOLD N1 — Regime D10r2 — Convention D48
      </footer>
    </div>
  );
}
