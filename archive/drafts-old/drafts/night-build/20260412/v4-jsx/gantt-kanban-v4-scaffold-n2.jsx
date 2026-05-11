// =====================================================================
// AEGIS Intelligence — Gantt Kanban Governance Dashboard v4.0 — N2
// =====================================================================
// Source PRS : 20260410T1400_SPEC_GANTT-KANBAN-V4-PRS.md
// Auteur scaffold : Claude Code (ACDC) — Night Builder N1 (T0000) + N2 (T2225)
// Date scaffold : 20260411T2230 CET
// Statut : DRAFT NOCTURNE N2 — pre-review Opus Chat matinal 12/04
// Workflow : Claude Code ECRIT / Opus Chat AUDIT V&V / JP+Opus Chat CO-EXEC
// Convention : ASCII strict pour le code, accents toleres en strings UI
// IDs definitifs sources : D334 / L235 / R112 (LIFECYCLE v2.9.0 du 06/04)
// N1 base : gantt-kanban-v4-scaffold.jsx (742 lignes, P0 14/15 valide)
// N2 ajouts : GanttView SVG + donnees S11.3-S11.7 + ItemDetail FR-04
// =====================================================================

import { useReducer, useMemo, useCallback, useEffect } from "react";

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

// =====================================================================
// SECTION 2 — TYPES ET INTERFACES TYPESCRIPT
// Source : SPEC v4 PRS S8 Data Model
// Note N2 : SwimlaneId et Swimlane places en tete pour permettre
// le typage explicite de la constante SWIMLANES (cosmetic fix audit T0825 #1)
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
// SECTION 3 — SWIMLANES, COLUMNS, TODAY
// Source : SPEC v4 PRS S11.1 + S6 FR-01
// N2 cosmetic fixes : SWIMLANES typed as Swimlane[], TODAY dynamic
// =====================================================================

// Source : SPEC v4 PRS S11.1 — 6 swimlanes
// N2 cosmetic fix #1 : typed directly as Swimlane[] (audit T0825 S2.4 point 1)
const SWIMLANES: Swimlane[] = [
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

// N2 cosmetic fix #2 : dynamic TODAY (audit T0825 S2.4 point 2)
const TODAY = new Date().toISOString().slice(0, 10);

// =====================================================================
// SECTION 4 — DONNEES EMBARQUEES — SPRINTS
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
// SECTION 5 — DONNEES EMBARQUEES — ITEMS KANBAN
// N1 : 5 cartes statiques MOCK, 1 par couloir couvert
// N2 : ajoute TERRAIN_ITEMS (5 livrables S11.4)
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
// SECTION 6 — DONNEES EMBARQUEES — TERRAIN ITEMS
// Source : SPEC v4 PRS S11.4 — 5 livrables TERRAIN nommes
// =====================================================================

const TERRAIN_ITEMS: KanbanItem[] = [
  {
    id: "terrain-acc",
    type: "Task",
    title: "ACC — Audit Contribution Cognitive",
    priority: "P1",
    status: "backlog",
    swimlane: "commercial",
    sprint: "sp-35",
    tags: [],
    detail: "Cadre GCI Pearl + Polanyi — 14 h — 4 900 EUR HT",
    sessionTimestamp: "20260410T1400",
    dependencies: [],
    assignee: "JP",
    deadline: null,
  },
  {
    id: "terrain-ccpd",
    type: "Task",
    title: "CCPD — Cartographie Causale Pre-Deploiement",
    priority: "P1",
    status: "backlog",
    swimlane: "commercial",
    sprint: "sp-35",
    tags: [],
    detail: "Cadre GCI Pearl do-calculus — 7 h — 2 450 EUR HT",
    sessionTimestamp: "20260410T1400",
    dependencies: [],
    assignee: "JP",
    deadline: null,
  },
  {
    id: "terrain-aign",
    type: "Task",
    title: "AIGN — Audit Interfaces Galvaniques Numeriques",
    priority: "P1",
    status: "backlog",
    swimlane: "commercial",
    sprint: "sp-35",
    tags: [],
    detail: "Cadre GCI Simon + Morin — 21 h — 7 350 EUR HT",
    sessionTimestamp: "20260410T1400",
    dependencies: [],
    assignee: "JP",
    deadline: null,
  },
  {
    id: "terrain-rds",
    type: "Task",
    title: "RDS — Radar Declenchement Sectoriel",
    priority: "P1",
    status: "backlog",
    swimlane: "commercial",
    sprint: "sp-35",
    tags: [],
    detail: "Cadre GCI Damasio + Simon — 10 h — 3 500 EUR HT",
    sessionTimestamp: "20260410T1400",
    dependencies: [],
    assignee: "JP",
    deadline: null,
  },
  {
    id: "terrain-airs",
    type: "Task",
    title: "AIRS — Analyse d'Impact Recursif Systemique",
    priority: "P1",
    status: "backlog",
    swimlane: "commercial",
    sprint: "sp-35",
    tags: [],
    detail: "Cadre GCI Morin + Pearl contrefactuel — 16 h — 5 600 EUR HT",
    sessionTimestamp: "20260410T1400",
    dependencies: [],
    assignee: "JP",
    deadline: null,
  },
];

// =====================================================================
// SECTION 7 — DONNEES EMBARQUEES — MILESTONES
// Source : SPEC v4 PRS S11.3 — 15 jalons critiques
// Dates converties DD/MM/YYYY -> YYYY-MM-DD pour Date parsing JS
// =====================================================================

const MILESTONES: Milestone[] = [
  {
    id: "ms-01",
    label: "v3.1 PRODUCTION",
    date: "2026-03-10",
    criticality: "VERT",
    type: "release",
    description: "",
    linkedFR: "",
    done: true,
  },
  {
    id: "ms-02",
    label: "v3.1.1 PRODUCTION",
    date: "2026-03-17",
    criticality: "VERT",
    type: "release",
    description: "",
    linkedFR: "",
    done: true,
  },
  {
    id: "ms-03",
    label: "LIFECYCLE v2.5.1",
    date: "2026-03-23",
    criticality: "VERT",
    type: "consolidation",
    description: "",
    linkedFR: "",
    done: true,
  },
  {
    id: "ms-04",
    label: "API 1P Phase 0 SUCCES",
    date: "2026-03-29",
    criticality: "VERT",
    type: "technique",
    description: "",
    linkedFR: "",
    done: true,
  },
  {
    id: "ms-05",
    label: "LIFECYCLE v2.8.0",
    date: "2026-03-31",
    criticality: "VERT",
    type: "consolidation",
    description: "",
    linkedFR: "",
    done: true,
  },
  {
    id: "ms-06",
    label: "v3.4.0 migration Gemini",
    date: "2026-04-06",
    criticality: "VERT",
    type: "release",
    description: "",
    linkedFR: "",
    done: true,
  },
  {
    id: "ms-07",
    label: "v3.4.1 PRODUCTION stable",
    date: "2026-04-06",
    criticality: "VERT",
    type: "release",
    description: "",
    linkedFR: "",
    done: true,
  },
  {
    id: "ms-08",
    label: "v3.4.2 PRODUCTION end-to-end",
    date: "2026-04-09",
    criticality: "VERT",
    type: "release",
    description: "",
    linkedFR: "",
    done: true,
  },
  {
    id: "ms-09",
    label: "J0 DIAGNOSTIC 250 EUR",
    date: "2026-04-15",
    criticality: "ROUGE",
    type: "commercial-gate",
    description: "",
    linkedFR: "",
    done: false,
  },
  {
    id: "ms-10",
    label: "v3.4.3 Preuve ROI",
    date: "2026-04-23",
    criticality: "AMBRE",
    type: "release",
    description: "",
    linkedFR: "",
    done: false,
  },
  {
    id: "ms-11",
    label: "Gate v3.4.x vers v3.5.0",
    date: "2026-04-30",
    criticality: "ROUGE",
    type: "gate",
    description: "",
    linkedFR: "",
    done: false,
  },
  {
    id: "ms-12",
    label: "Gemini deprecie",
    date: "2026-06-01",
    criticality: "VERT",
    type: "deadline",
    description: "Migration faite v3.4.0 (06/04)",
    linkedFR: "",
    done: true,
  },
  {
    id: "ms-13",
    label: "CRA Signalement 24h",
    date: "2026-09-11",
    criticality: "ROUGE",
    type: "reglementaire",
    description: "",
    linkedFR: "",
    done: false,
  },
  {
    id: "ms-14",
    label: "Machinery Reg 2023/1230",
    date: "2027-01-20",
    criticality: "ROUGE",
    type: "reglementaire",
    description: "",
    linkedFR: "",
    done: false,
  },
  {
    id: "ms-15",
    label: "AI Act Annexe III (si Omnibus)",
    date: "2027-12-02",
    criticality: "AMBRE",
    type: "reglementaire-conditionnel",
    description: "",
    linkedFR: "",
    done: false,
  },
];

// =====================================================================
// SECTION 8 — DONNEES EMBARQUEES — IDs DEFINITIFS
// Source : SPEC v4 PRS S11.5 — ~80 IDs les plus actifs (30 embarques)
// Format compact : 1 entree par ligne
// =====================================================================

const ID_REGISTRY: IdEntry[] = [
  // Decisions recentes D310-D334 — Source : SPEC v4 S11.5
  { id: "D310", type: "D", title: "Paradoxe Suleyman messaging commercial", date: "2026-03-30", linkedBridge: "", status: "definitive" },
  { id: "D313", type: "D", title: "TOM composant offre v3.3+", date: "2026-03-30", linkedBridge: "", status: "definitive" },
  { id: "D315", type: "D", title: "CAUSAL_GRAPH.md cree et maintenu", date: "2026-03-30", linkedBridge: "", status: "definitive" },
  { id: "D316", type: "D", title: "BRIDGE_STATE.md cree et maintenu", date: "2026-03-30", linkedBridge: "", status: "definitive" },
  { id: "D318", type: "D", title: "Protocole CLOSE_SESSION 4 etapes", date: "2026-03-30", linkedBridge: "", status: "definitive" },
  { id: "D320", type: "D", title: "BUG-01 react-markdown PASS", date: "2026-03-31", linkedBridge: "", status: "definitive" },
  { id: "D322", type: "D", title: ".gitignore .md patterns", date: "2026-03-31", linkedBridge: "", status: "definitive" },
  { id: "D324", type: "D", title: "Navbar AEGIS Intelligence", date: "2026-03-31", linkedBridge: "", status: "definitive" },
  { id: "D325", type: "D", title: "DOMPurify ajoute MarkdownRenderer", date: "2026-03-31", linkedBridge: "", status: "definitive" },
  { id: "D328", type: "D", title: "Build 0 erreur TS, 82 modules", date: "2026-03-31", linkedBridge: "", status: "definitive" },
  { id: "D330", type: "D", title: "Crash signature serverless module load", date: "2026-04-06", linkedBridge: "", status: "definitive" },
  { id: "D331", type: "D", title: "Externalisation prompt TXT v3.4.2", date: "2026-04-06", linkedBridge: "", status: "definitive" },
  { id: "D332", type: "D", title: "PDF marketing valide production", date: "2026-04-06", linkedBridge: "", status: "definitive" },
  { id: "D333", type: "D", title: "Chemin commercial DIAGNOSTIC valide end-to-end", date: "2026-04-06", linkedBridge: "", status: "definitive" },
  { id: "D334", type: "D", title: "Priorite health + externalisation", date: "2026-04-06", linkedBridge: "", status: "definitive" },
  // Lecons recentes L226-L235 — Source : SPEC v4 S11.5
  { id: "L226", type: "L", title: "Template literal escaping backticks obligatoire", date: "", linkedBridge: "", status: "definitive" },
  { id: "L227", type: "L", title: "Vite ne teste pas api/*.ts — fetch runtime obligatoire", date: "", linkedBridge: "", status: "definitive" },
  { id: "L228", type: "L", title: "P_CR_01 fetch runtime avant claim GO", date: "", linkedBridge: "", status: "definitive" },
  { id: "L230", type: "L", title: "Gemini 2.5 thinking budget invisible dans maxOutputTokens", date: "", linkedBridge: "", status: "definitive" },
  { id: "L232", type: "L", title: "Restrictions API key GCP inutilisables Vercel serverless", date: "", linkedBridge: "", status: "definitive" },
  { id: "L233", type: "L", title: "Enchainer tous checks V&V sans s'arreter", date: "", linkedBridge: "", status: "definitive" },
  { id: "L234", type: "L", title: "Verifier filesystem reel vs descriptifs bridges", date: "", linkedBridge: "", status: "definitive" },
  { id: "L235", type: "L", title: "Intercepts fetch + anchor avant clic Mollie", date: "", linkedBridge: "", status: "definitive" },
  // Risques recents R105-R112 — Source : SPEC v4 S11.5
  { id: "R105", type: "R", title: "Regression silencieuse claude-proxy — Proba MOY — Impact ELEVE", date: "", linkedBridge: "", status: "definitive" },
  { id: "R106", type: "R", title: "Recurrence template literal — Proba MOY — Impact ELEVE", date: "", linkedBridge: "", status: "definitive" },
  { id: "R107", type: "R", title: "Expiration silencieuse cles API — Proba ELEVE — Impact ELEVE", date: "", linkedBridge: "", status: "definitive" },
  { id: "R109", type: "R", title: "Mode artisanal 5 premiers clients — Proba MOY — Impact MOYEN", date: "", linkedBridge: "", status: "definitive" },
  { id: "R110", type: "R", title: "Thinking budget Gemini truncation — Proba MOY — Impact MOYEN", date: "", linkedBridge: "", status: "definitive" },
  { id: "R111", type: "R", title: "Rotation 90j cles API — Proba MOY — Impact ELEVE", date: "", linkedBridge: "", status: "definitive" },
  { id: "R112", type: "R", title: "Prefill DIAGNOSTIC partiel — Proba FAIBLE — Impact MOYEN", date: "", linkedBridge: "", status: "definitive" },
];

// Build Record map for initialState idRegistry.definitiveIds
const ID_REGISTRY_MAP = ID_REGISTRY.reduce<Record<string, IdEntry>>((acc, e) => {
  acc[e.id] = e;
  return acc;
}, {});

// =====================================================================
// SECTION 9 — DONNEES EMBARQUEES — IDs TEMPORAIRES
// Source : SPEC v4 PRS S11.6 — ~51 IDs en attente integration v2.10.0
// Helper makeTempIds pour concision (I6)
// =====================================================================

function makeTempIds(
  ids: string[],
  ts: string,
  range: string,
  label: string,
  status: TempIdStatus = "pending"
): TempIdEntry[] {
  return ids.map((tempId): TempIdEntry => ({
    tempId,
    sessionTimestamp: ts,
    proposedDefinitiveRange: range,
    status,
    sessionLabel: label,
  }));
}

const TEMP_ID_REGISTRY: TempIdEntry[] = [
  // Session T1810 (Vers Marins TERRAIN) — 9 IDs — 08/04
  ...makeTempIds([
    "D_T1810_01", "D_T1810_02", "D_T1810_03", "D_T1810_04",
    "L_T1810_01", "L_T1810_02", "L_T1810_03",
    "R_T1810_01", "R_T1810_02",
  ], "20260408T1810", "D335-D338", "Vers Marins TERRAIN"),

  // Session T1000 (MYTHOS Sprints) — 16 IDs — 09/04
  ...makeTempIds([
    "D_T1000_01", "D_T1000_02", "D_T1000_03", "D_T1000_04", "D_T1000_05",
    "D_T1000_06", "D_T1000_07", "D_T1000_08", "D_T1000_09", "D_T1000_10", "D_T1000_11",
    "R_T1000_01", "R_T1000_02", "R_T1000_03", "R_T1000_04", "R_T1000_05",
  ], "20260409T1000", "D335-D345", "MYTHOS Sprints"),

  // Session T0840 (Watchdog D206) — 8 IDs post-annulation — 09/04
  // Note : R_T0840_01/02/03 annules par corrective T1410, non inclus
  ...makeTempIds([
    "D_T0840_01", "D_T0840_02", "D_T0840_03",
    "L_T0840_01", "L_T0840_02", "L_T0840_03",
    "R_T0840_04", "R_T0840_05",
  ], "20260409T0840", "", "Watchdog D206"),

  // Session T1410 (Corrective) — 1 ID — 09/04
  ...makeTempIds(["L_T1410_01"], "20260409T1410", "", "Corrective"),

  // Session T1535-T2110 (Contre-expertise + prod) — 20 IDs — 09/04
  ...makeTempIds([
    "D_T1535_01", "D_T1715_01", "D_T2050_01", "D_T2110_01",
    "L_T1535_01", "L_T1535_02", "L_T1655_01", "L_T1655_02", "L_T1655_03",
    "L_T1715_01", "L_T1715_02", "L_T2050_01", "L_T2110_01",
    "R_T1535_01", "R_T1655_01", "R_T1655_02", "R_T1715_01", "R_T1715_02",
    "R_T2050_01", "R_T2110_01",
  ], "20260409T1535", "", "Contre-expertise + prod"),
];
// Total : 54 entries (9+16+8+1+20). SPEC dit ~51 (approximation post-annulations).

// =====================================================================
// SECTION 10 — DONNEES EMBARQUEES — DEPENDANCES
// Source : SPEC v4 PRS S11.7 — 6 dependances bloquantes connues
// =====================================================================

const DEPENDENCIES: Dependency[] = [
  {
    id: "dep-01",
    fromId: "RC Pro S15",
    toId: "Premier contrat TERRAIN",
    type: "blocks",
    comment: "RC Pro obligatoire avant tout engagement contractuel TERRAIN",
  },
  {
    id: "dep-02",
    fromId: "Gate v3.4.x",
    toId: "v3.5.0",
    type: "blocks",
    comment: "4 criteres: 1 DIAG vendu, 3 VEILLE activees, LLMO top 5, conversion 3 %",
  },
  {
    id: "dep-03",
    fromId: "J0 15/04",
    toId: "Demarrage commercial VEILLE",
    type: "blocks",
    comment: "Pas de VEILLE proposee avant le premier DIAGNOSTIC paye",
  },
  {
    id: "dep-04",
    fromId: "LIFECYCLE v2.10.0",
    toId: "Gantt v4 donnees completes",
    type: "informs",
    comment: "v2.10.0 integrera les ~51 IDs temp, mais la v4 fonctionne avec les donnees embarquees",
  },
  {
    id: "dep-05",
    fromId: "v3.4.2 production",
    toId: "v3.4.3 sprint",
    type: "depends",
    comment: "v3.4.3 demarre POST-15/04 uniquement si v3.4.2 stable",
  },
  {
    id: "dep-06",
    fromId: "Gemini deprecie 01/06",
    toId: "Brain migration",
    type: "blocks",
    comment: "RESOLU: migration faite v3.4.0 (06/04), Gemini 2.5 Flash actif en production",
  },
];

// Mapping dependency descriptive IDs to approximate renderable positions
// Source : manual mapping from SPEC S11.7 labels to dates/swimlanes
const DEP_POSITIONS: Record<string, { date: string; swimlane: SwimlaneId }> = {
  "RC Pro S15":                   { date: "2026-04-13", swimlane: "reglementaire" },
  "Premier contrat TERRAIN":      { date: "2026-05-01", swimlane: "commercial" },
  "Gate v3.4.x":                  { date: "2026-04-30", swimlane: "code" },
  "v3.5.0":                       { date: "2026-05-01", swimlane: "commercial" },
  "J0 15/04":                     { date: "2026-04-15", swimlane: "commercial" },
  "Demarrage commercial VEILLE":  { date: "2026-05-01", swimlane: "commercial" },
  "LIFECYCLE v2.10.0":            { date: "2026-05-01", swimlane: "sessions-opus" },
  "Gantt v4 donnees completes":   { date: "2026-04-15", swimlane: "sessions-opus" },
  "v3.4.2 production":            { date: "2026-04-09", swimlane: "code" },
  "v3.4.3 sprint":                { date: "2026-04-16", swimlane: "mythos" },
  "Gemini deprecie 01/06":        { date: "2026-06-01", swimlane: "code" },
  "Brain migration":              { date: "2026-04-06", swimlane: "code" },
};

// =====================================================================
// SECTION 11 — UTILS — POSITIONNEMENT TEMPOREL GANTT
// Source : SPEC v4 PRS S9.4 Gantt layout — axe X dual-resolution
// =====================================================================

// Constantes temporelles
const GANTT_START = new Date("2026-03-31"); // Lundi S14
const GANTT_PIVOT = new Date("2026-06-29"); // Lundi S27 — bascule daily/weekly
const GANTT_END   = new Date("2026-12-28"); // Lundi S52
const PX_PER_DAY  = 12;   // resolution journaliere S14-S26
const PX_PER_WEEK = 28;   // resolution hebdomadaire S27-S52
const SWIMLANE_HEIGHT = 80;
const GANTT_PADDING_TOP = 60;
const BAR_HEIGHT = 16;

// Projection date -> coordonnee X (en pixels)
function dateToX(date: Date): number {
  if (date < GANTT_START) return 0;
  if (date < GANTT_PIVOT) {
    const days = Math.floor((date.getTime() - GANTT_START.getTime()) / 86400000);
    return days * PX_PER_DAY;
  }
  const dailyPart = Math.floor((GANTT_PIVOT.getTime() - GANTT_START.getTime()) / 86400000) * PX_PER_DAY;
  const weeks = Math.floor((date.getTime() - GANTT_PIVOT.getTime()) / (7 * 86400000));
  return dailyPart + weeks * PX_PER_WEEK;
}

// Hauteur Y d'une swimlane (index 0 a 5)
function swimlaneToY(swimlaneIndex: number): number {
  return GANTT_PADDING_TOP + swimlaneIndex * SWIMLANE_HEIGHT;
}

// Index swimlane par id
function swimlaneIdx(id: SwimlaneId): number {
  const idx = SWIMLANES.findIndex(s => s.id === id);
  return idx >= 0 ? idx : 0;
}

// Date de debut d'une semaine ISO (S14 = 2026-03-30)
function weekStartDate(weekNum: number): Date {
  const s14 = new Date("2026-03-30");
  return new Date(s14.getTime() + (weekNum - 14) * 7 * 86400000);
}

// Progression derivee du statut sprint
function sprintProgress(status: SprintStatus): number {
  switch (status) {
    case "clos": return 1.0;
    case "production": return 1.0;
    case "en-cours": return 0.5;
    case "planned": return 0.0;
    case "blocked": return 0.3;
    default: return 0.0;
  }
}

// Couleur criticite milestone
function criticalityColor(crit: Criticality): string {
  switch (crit) {
    case "ROUGE": return P.rose;
    case "AMBRE": return P.gold;
    case "VERT": return P.emerald;
  }
}

// Largeur et hauteur totales du Gantt
const GANTT_WIDTH = dateToX(GANTT_END) + 40;
const GANTT_HEIGHT = GANTT_PADDING_TOP + 6 * SWIMLANE_HEIGHT + 40;

// =====================================================================
// SECTION 12 — REDUCER CENTRAL
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
      // PLACEHOLDER N3 — non implemente en N2 par decision perimetre
      return state;

    default:
      return state;
  }
}

// =====================================================================
// SECTION 13 — COMPOSANT HEADER
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
// SECTION 14 — COMPOSANT KANBANVIEW
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
// SECTION 15 — COMPOSANTS GANTT SVG
// Source : SPEC v4 PRS S9.4 Gantt layout + FR-07 a FR-12
// N2 : remplacement du placeholder N1 par implementation SVG complete
// =====================================================================

// --- 15a. GanttAxisX — labels mois et sprints sur l'axe horizontal ---

function GanttAxisX() {
  // Mois a afficher (Avr a Dec)
  const months: Array<{ label: string; date: string }> = [
    { label: "Avr", date: "2026-04-01" },
    { label: "Mai", date: "2026-05-01" },
    { label: "Jun", date: "2026-06-01" },
    { label: "Jul", date: "2026-07-01" },
    { label: "Aou", date: "2026-08-01" },
    { label: "Sep", date: "2026-09-01" },
    { label: "Oct", date: "2026-10-01" },
    { label: "Nov", date: "2026-11-01" },
    { label: "Dec", date: "2026-12-01" },
  ];

  // Labels semaine — toutes les 2 semaines en zone daily, toutes les 4 en zone weekly
  const weekLabels: Array<{ num: number; x: number }> = [];
  for (let w = 14; w <= 26; w += 2) {
    weekLabels.push({ num: w, x: dateToX(weekStartDate(w)) });
  }
  for (let w = 28; w <= 52; w += 4) {
    weekLabels.push({ num: w, x: dateToX(weekStartDate(w)) });
  }

  return (
    <g>
      {/* Labels mois */}
      {months.map((m) => (
        <text key={m.label} x={dateToX(new Date(m.date))} y={15} fill={P.muted} fontSize={11} fontWeight="600">
          {m.label}
        </text>
      ))}
      {/* Lignes verticales mois */}
      {months.map((m) => (
        <line
          key={`vl-${m.label}`}
          x1={dateToX(new Date(m.date))}
          y1={GANTT_PADDING_TOP}
          x2={dateToX(new Date(m.date))}
          y2={GANTT_HEIGHT - 40}
          stroke={P.border}
          strokeWidth={1}
        />
      ))}
      {/* Labels semaine */}
      {weekLabels.map((wl) => (
        <text key={`s${wl.num}`} x={wl.x} y={35} fill={P.muted} fontSize={8} fontFamily="monospace">
          S{wl.num}
        </text>
      ))}
      {/* Ligne separatrice pivot daily/weekly a S27 */}
      <line
        x1={dateToX(GANTT_PIVOT)}
        y1={GANTT_PADDING_TOP}
        x2={dateToX(GANTT_PIVOT)}
        y2={GANTT_HEIGHT - 40}
        stroke={P.accent}
        strokeWidth={1}
        strokeDasharray="2,4"
        opacity={0.4}
      />
      <text x={dateToX(GANTT_PIVOT) + 3} y={48} fill={P.accent} fontSize={7} opacity={0.6}>
        daily|weekly
      </text>
    </g>
  );
}

// --- 15b. GanttAxisY — fond et labels swimlanes ---

function GanttAxisY() {
  return (
    <g>
      {SWIMLANES.map((sw, i) => {
        const y = swimlaneToY(i);
        return (
          <g key={sw.id}>
            {/* Fond colore swimlane */}
            <rect
              x={0}
              y={y}
              width={GANTT_WIDTH}
              height={SWIMLANE_HEIGHT}
              fill={sw.color}
              opacity={0.05}
            />
            {/* Ligne separatrice */}
            <line
              x1={0}
              y1={y + SWIMLANE_HEIGHT}
              x2={GANTT_WIDTH}
              y2={y + SWIMLANE_HEIGHT}
              stroke={P.border}
              strokeWidth={0.5}
            />
            {/* Label couloir */}
            <text
              x={4}
              y={y + SWIMLANE_HEIGHT / 2 + 4}
              fill={sw.color}
              fontSize={9}
              fontWeight="700"
              opacity={0.7}
            >
              {sw.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// --- 15c. GanttSprintBar — barre sprint coloree par couloir ---
// Renomme GanttSprintBar (vs GanttBar du brief) pour eviter collision avec interface GanttBar

function GanttSprintBar({ sprint, dispatch }: { sprint: Sprint; dispatch: React.Dispatch<AppAction> }) {
  const startX = dateToX(new Date(sprint.startDate));
  const endX = dateToX(new Date(sprint.endDate));
  const width = Math.max(endX - startX, 6); // minimum 6px pour visibilite
  const idx = swimlaneIdx(sprint.swimlane);
  const barY = swimlaneToY(idx) + (SWIMLANE_HEIGHT - BAR_HEIGHT) / 2;
  const color = SWIMLANES[idx].color;
  const progress = sprintProgress(sprint.status);

  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={() => dispatch({ type: "SELECT_ITEM", payload: { itemId: sprint.id } })}
    >
      {/* Barre fond */}
      <rect
        x={startX}
        y={barY}
        width={width}
        height={BAR_HEIGHT}
        rx={4}
        ry={4}
        fill={color}
        fillOpacity={0.25}
      />
      {/* Barre progression */}
      {progress > 0 && (
        <rect
          x={startX}
          y={barY}
          width={width * progress}
          height={BAR_HEIGHT}
          rx={4}
          ry={4}
          fill={color}
          fillOpacity={0.7}
        />
      )}
      {/* Label version */}
      {width > 30 && (
        <text
          x={startX + 4}
          y={barY + BAR_HEIGHT / 2 + 3}
          fill={P.text}
          fontSize={8}
          fontWeight="600"
        >
          {sprint.version}
        </text>
      )}
      <title>{`${sprint.version} — ${sprint.description}\n${sprint.startDate} -> ${sprint.endDate} — ${sprint.status}`}</title>
    </g>
  );
}

// --- 15d. GanttDependencyArrow — fleche Bezier quadratique ---

function GanttDependencyArrow({ dep }: { dep: Dependency }) {
  const from = DEP_POSITIONS[dep.fromId];
  const to = DEP_POSITIONS[dep.toId];
  if (!from || !to) return null;

  const sx = dateToX(new Date(from.date));
  const sy = swimlaneToY(swimlaneIdx(from.swimlane)) + SWIMLANE_HEIGHT / 2;
  const tx = dateToX(new Date(to.date));
  const ty = swimlaneToY(swimlaneIdx(to.swimlane)) + SWIMLANE_HEIGHT / 2;

  const isBlocks = dep.type === "blocks";
  const strokeColor = isBlocks ? P.rose : P.muted;
  const markerId = isBlocks ? "arrow-blocks" : "arrow-depends";
  const dashArray = dep.type === "informs" ? "4,4" : "none";

  const path = `M ${sx},${sy} Q ${(sx + tx) / 2},${sy} ${tx},${ty}`;

  return (
    <path
      d={path}
      stroke={strokeColor}
      strokeWidth={1.5}
      fill="none"
      strokeDasharray={dashArray}
      markerEnd={`url(#${markerId})`}
      opacity={0.7}
    >
      <title>{`${dep.fromId} ${dep.type} ${dep.toId}: ${dep.comment}`}</title>
    </path>
  );
}

// --- 15e. GanttMilestone — losange SVG colore par criticite ---

function GanttMilestone({ milestone, dispatch }: { milestone: Milestone; dispatch: React.Dispatch<AppAction> }) {
  const x = dateToX(new Date(milestone.date));
  const y = GANTT_PADDING_TOP - 15;
  const size = 6;
  const color = criticalityColor(milestone.criticality);

  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={() => dispatch({ type: "SELECT_ITEM", payload: { itemId: milestone.id } })}
    >
      {/* Losange = carre tourne 45 degres */}
      <rect
        x={x - size}
        y={y - size}
        width={size * 2}
        height={size * 2}
        fill={color}
        transform={`rotate(45 ${x} ${y})`}
        stroke={P.surface}
        strokeWidth={1}
        opacity={milestone.done ? 0.5 : 1}
      />
      {/* Tooltip SVG natif (FR-14 P1) */}
      <title>{`${milestone.label} — ${milestone.date} — ${milestone.criticality}${milestone.description ? " — " + milestone.description : ""}`}</title>
    </g>
  );
}

// --- 15f. GanttView — composant principal vue Gantt ---
// Source : SPEC v4 PRS FR-07 a FR-12

function GanttView({ state, dispatch }: { state: AppState; dispatch: React.Dispatch<AppAction> }) {
  const todayX = dateToX(new Date());

  // Filtrer sprints visibles dans le viewport (fin >= GANTT_START)
  const visibleSprints = SPRINTS.filter(
    (sp) => new Date(sp.endDate) >= GANTT_START
  );

  // Filtrer milestones dans le viewport (date <= GANTT_END)
  // ms-14 (jan 2027) et ms-15 (dec 2027) sont hors viewport, non rendus
  const visibleMilestones = MILESTONES.filter((ms) => {
    const d = new Date(ms.date);
    return d >= GANTT_START && d <= GANTT_END;
  });

  return (
    <div style={{ overflowX: "auto", backgroundColor: P.bg, padding: "16px" }}>
      <svg
        width={GANTT_WIDTH}
        height={GANTT_HEIGHT}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", backgroundColor: P.surface, borderRadius: "8px" }}
      >
        {/* defs : markers fleches pour dependances */}
        <defs>
          <marker id="arrow-blocks" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={P.rose} />
          </marker>
          <marker id="arrow-depends" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={P.muted} />
          </marker>
        </defs>

        {/* Couche 1 : axe X labels mois et sprints */}
        <GanttAxisX />

        {/* Couche 2 : axe Y swimlanes (rectangles de fond + labels) */}
        <GanttAxisY />

        {/* Couche 3 : barres sprint colorees par couloir */}
        {visibleSprints.map((sprint) => (
          <GanttSprintBar key={sprint.id} sprint={sprint} dispatch={dispatch} />
        ))}

        {/* Couche 4 : fleches de dependance */}
        {DEPENDENCIES.map((dep) => (
          <GanttDependencyArrow key={dep.id} dep={dep} />
        ))}

        {/* Couche 5 : jalons losanges */}
        {visibleMilestones.map((ms) => (
          <GanttMilestone key={ms.id} milestone={ms} dispatch={dispatch} />
        ))}

        {/* Couche 6 : marqueur TODAY */}
        <line
          x1={todayX} y1={GANTT_PADDING_TOP}
          x2={todayX} y2={GANTT_HEIGHT - 40}
          stroke={P.rose} strokeWidth={2} strokeDasharray="4,4"
        />
        <text x={todayX + 4} y={GANTT_PADDING_TOP - 4} fill={P.rose} fontSize="11" fontWeight="600">
          TODAY
        </text>
      </svg>
    </div>
  );
}

// =====================================================================
// SECTION 16 — COMPOSANT ITEMDETAIL — PANNEAU LATERAL FR-04
// Source : SPEC v4 PRS FR-04 — panneau detail partage Kanban+Gantt
// Position fixed droite, 320px, declenche par SELECT_ITEM
// =====================================================================

function ItemDetail({ state, dispatch }: { state: AppState; dispatch: React.Dispatch<AppAction> }) {
  if (!state.selectedItemId) return null;

  const itemId = state.selectedItemId;

  // Recherche dans items, milestones et sprints
  const kanbanItem = state.items.find((i) => i.id === itemId);
  const milestone = state.milestones.find((m) => m.id === itemId);
  const sprint = state.sprints.find((s) => s.id === itemId);

  const handleClose = () => dispatch({ type: "SELECT_ITEM", payload: { itemId: null } });

  // Variables d'affichage
  let title = "";
  let itemType = "";
  let detail = "";
  let swimlane = "";
  let dates = "";
  let criticality = "";

  if (kanbanItem) {
    title = kanbanItem.title;
    itemType = `Item ${kanbanItem.type} — ${kanbanItem.priority}`;
    detail = kanbanItem.detail;
    swimlane = kanbanItem.swimlane;
    dates = kanbanItem.deadline ? `Deadline: ${kanbanItem.deadline}` : "";
  } else if (milestone) {
    title = milestone.label;
    itemType = `Jalon ${milestone.type}`;
    detail = milestone.description;
    criticality = milestone.criticality;
    dates = `Date: ${milestone.date}`;
  } else if (sprint) {
    title = sprint.version;
    itemType = `Sprint — ${sprint.status}`;
    detail = sprint.description;
    swimlane = sprint.swimlane;
    dates = `${sprint.startDate} -> ${sprint.endDate}`;
  } else {
    return null;
  }

  // Dependances entrantes et sortantes
  const depsFrom = DEPENDENCIES.filter((d) => d.toId === itemId);
  const depsTo = DEPENDENCIES.filter((d) => d.fromId === itemId);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 320,
        height: "100vh",
        backgroundColor: P.surface,
        borderLeft: `1px solid ${P.border}`,
        padding: "20px 16px",
        overflowY: "auto",
        zIndex: 100,
        boxShadow: "-4px 0 16px rgba(0,0,0,0.3)",
      }}
    >
      {/* En-tete avec type et bouton fermer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 10, color: P.muted, fontFamily: "monospace", textTransform: "uppercase" }}>
          {itemType}
        </span>
        <button
          onClick={handleClose}
          style={{
            background: "none",
            border: `1px solid ${P.border}`,
            borderRadius: 4,
            color: P.muted,
            cursor: "pointer",
            fontSize: 14,
            padding: "2px 8px",
            fontFamily: "inherit",
          }}
        >
          X
        </button>
      </div>

      {/* Titre */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: P.text, marginTop: 0, marginBottom: 12 }}>
        {title}
      </h3>

      {/* Couloir */}
      {swimlane && (
        <div style={{ fontSize: 11, color: P.muted, marginBottom: 8 }}>
          Couloir : <span style={{ color: SWIMLANES.find((s) => s.id === swimlane)?.color || P.text }}>{swimlane}</span>
        </div>
      )}

      {/* Criticite (milestones) */}
      {criticality && (
        <div style={{ fontSize: 11, marginBottom: 8 }}>
          <span style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: criticalityColor(criticality as Criticality),
            marginRight: 6,
          }} />
          <span style={{ color: P.muted }}>Criticite : {criticality}</span>
        </div>
      )}

      {/* Dates */}
      {dates && (
        <div style={{ fontSize: 11, color: P.muted, marginBottom: 8, fontFamily: "monospace" }}>
          {dates}
        </div>
      )}

      {/* Detail */}
      {detail && (
        <div style={{ fontSize: 12, color: P.text, marginBottom: 16, lineHeight: 1.5 }}>
          {detail}
        </div>
      )}

      {/* Dependances */}
      {(depsFrom.length > 0 || depsTo.length > 0) && (
        <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 10, color: P.muted, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Dependances
          </div>
          {depsFrom.map((d) => (
            <div key={d.id} style={{ fontSize: 11, color: P.text, marginBottom: 4, paddingLeft: 8 }}>
              <span style={{ color: d.type === "blocks" ? P.rose : P.muted }}>{'<-'}</span> {d.fromId} <span style={{ color: P.muted }}>({d.type})</span>
            </div>
          ))}
          {depsTo.map((d) => (
            <div key={d.id} style={{ fontSize: 11, color: P.text, marginBottom: 4, paddingLeft: 8 }}>
              <span style={{ color: d.type === "blocks" ? P.rose : P.muted }}>{'->'}</span> {d.toId} <span style={{ color: P.muted }}>({d.type})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// SECTION 17 — PLACEHOLDERS VUES N3
// IdsView, MetricsView, ExportView — a implementer N3
// =====================================================================

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
// SECTION 18 — COMPOSANT PRINCIPAL + STATE INITIAL
// Source : SPEC v4 PRS S10 Architecture
// N2 : initialState enrichi avec donnees S11.3-S11.7 + ItemDetail + Escape key
// =====================================================================

const initialState: AppState = {
  swimlanes: SWIMLANES,
  sprints: SPRINTS,
  items: [...MOCK_ITEMS_N1, ...TERRAIN_ITEMS],
  ganttBars: [],
  milestones: MILESTONES,
  dependencies: DEPENDENCIES,
  idRegistry: {
    lastD: 334,
    lastL: 235,
    lastR: 112,
    definitiveIds: ID_REGISTRY_MAP,
    temporaryIds: TEMP_ID_REGISTRY,
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

  // Escape key ferme le panneau detail (FR-04)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.selectedItemId) {
        dispatch({ type: "SELECT_ITEM", payload: { itemId: null } });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.selectedItemId, dispatch]);

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
        {state.currentView === "gantt"     && <GanttView state={state} dispatch={dispatch} />}
        {state.currentView === "ids"       && <IdsView />}
        {state.currentView === "metriques" && <MetricsView />}
        {state.currentView === "export"    && <ExportView />}
      </main>
      {/* Panneau detail partage Kanban+Gantt (FR-04) */}
      <ItemDetail state={state} dispatch={dispatch} />
      <footer style={{ padding: "12px 24px", borderTop: `1px solid ${P.border}`, fontSize: 10, color: P.muted, fontFamily: "monospace" }}>
        v4.0 N2 — Regime D10r2 — Convention D48 — {TODAY}
      </footer>
    </div>
  );
}
