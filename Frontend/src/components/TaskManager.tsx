import { useState } from "react";

/* ============================================================
   TYPES
   ============================================================ */

type UserRole     = "executive" | "manager" | "member";
type Workload     = "available" | "critical" | "busy";
type Priority     = "low" | "medium" | "high" | "urgent";
type TaskStatus   = "todo" | "in_progress" | "review" | "done" | "archived";
type TaskType     = "task" | "subtask" | "bug" | "feature";
type UIColumn     = "assigned" | "completed" | "pending";
type PageId       = "dashboard" | "tasks" | "crm" | "analytics" | "team" | "config" | "new-task";

interface Organization {
  id: string;
  name: string;
  tier: string;
}

interface User {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  avatar_color: string;
  workload: Workload;
}

interface Project {
  id: string;
  name: string;
  key: string;
  priority: Priority;
}

interface Tag {
  id: string;
  project_id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  project_id: string;
  sprint_id: string | null;
  assignee_id: string | null;
  parent_task_id: string | null;
  project_sequence: number;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  position: number;
  estimated_min: number | null;
  due_date: string | null;
  completed_at: string | null;
  _ui_column: UIColumn;
  _extra_assignees: string[];
  tags: string[];
  _archived_label?: string;
}

interface PriorityCfgEntry {
  label: string;
  bg: string;
  text: string;
  dot: boolean;
}

interface WorkloadCfgEntry {
  label: string;
  color: string;
}

/* ============================================================
   MOCK DATA — mirroring DB schema exactly
   Replace these with API calls when backend is ready
   ============================================================ */

const MOCK_ORGANIZATION: Organization = {
  id: "org-001",
  name: "COMMAND",
  tier: "TIER EJECUTIVO",
};

const MOCK_CURRENT_USER: User = {
  id: "usr-001",
  name: "Alexander Thorne",
  role: "executive",
  initials: "AT",
  avatar_color: "#334155",
  workload: "available",
};

const MOCK_USERS: User[] = [
  { id: "usr-001", name: "Alexander Thorne", initials: "AT",  role: "executive", avatar_color: "#1e40af", workload: "available" },
  { id: "usr-002", name: "Marcos Silva",      initials: "MS",  role: "manager",   avatar_color: "#7c3aed", workload: "critical"  },
  { id: "usr-003", name: "Elena Rojas",       initials: "ER",  role: "member",    avatar_color: "#0d9488", workload: "available" },
  { id: "usr-004", name: "Luis Pérez",        initials: "LP",  role: "member",    avatar_color: "#2563eb", workload: "available" },
  { id: "usr-005", name: "Ana Torres",        initials: "AT2", role: "member",    avatar_color: "#b45309", workload: "busy"      },
];

const MOCK_PROJECTS: Project[] = [
  { id: "prj-001", name: "Global Logistics Corp",      key: "GLG", priority: "high"   },
  { id: "prj-002", name: "Fintech Solutions Ltd",      key: "FIN", priority: "medium" },
  { id: "prj-003", name: "Azure Health Group",         key: "AZH", priority: "low"    },
  { id: "prj-004", name: "Operaciones Internas",       key: "OPS", priority: "low"    },
  { id: "prj-005", name: "Unidad de Infraestructura",  key: "INF", priority: "urgent" },
  { id: "prj-006", name: "Law & Partners PLC",         key: "LAW", priority: "high"   },
];

const MOCK_TAGS: Tag[] = [
  { id: "tag-001", project_id: "prj-001", name: "Finanzas",  color: "#3b82f6" },
  { id: "tag-002", project_id: "prj-001", name: "Q4",        color: "#8b5cf6" },
  { id: "tag-003", project_id: "prj-002", name: "API",       color: "#10b981" },
  { id: "tag-004", project_id: "prj-005", name: "Seguridad", color: "#ef4444" },
];

const MOCK_TASKS: Task[] = [
  {
    id: "tsk-001", project_id: "prj-001", sprint_id: null, assignee_id: "usr-002",
    parent_task_id: null, project_sequence: 1, type: "task",
    title: "Auditoría Financiera Estratégica Q4 y Revisión de Cumplimiento",
    description: "", status: "in_progress", priority: "high",
    position: 0, estimated_min: 2400, due_date: "2024-01-20", completed_at: null,
    _ui_column: "assigned", _extra_assignees: ["usr-003"], tags: ["tag-001","tag-002"],
  },
  {
    id: "tsk-002", project_id: "prj-002", sprint_id: null, assignee_id: "usr-004",
    parent_task_id: null, project_sequence: 2, type: "feature",
    title: "Integración de CRM y Optimización de Sincronización API",
    description: "", status: "in_progress", priority: "medium",
    position: 1, estimated_min: 3000, due_date: "2024-02-18", completed_at: null,
    _ui_column: "assigned", _extra_assignees: [], tags: ["tag-003"],
  },
  {
    id: "tsk-003", project_id: "prj-003", sprint_id: null, assignee_id: null,
    parent_task_id: null, project_sequence: 3, type: "task",
    title: "Reporte Trimestral de Proyección de Ingresos",
    description: "", status: "done", priority: "medium",
    position: 0, estimated_min: null, due_date: null,
    completed_at: "2023-10-15T00:00:00Z", _ui_column: "completed",
    _extra_assignees: [], tags: [], _archived_label: "15 OCT",
  },
  {
    id: "tsk-004", project_id: "prj-004", sprint_id: null, assignee_id: null,
    parent_task_id: null, project_sequence: 4, type: "task",
    title: "Presentación de Junta: Resumen Ejecutivo Q3",
    description: "", status: "done", priority: "low",
    position: 1, estimated_min: null, due_date: null,
    completed_at: "2023-10-04T00:00:00Z", _ui_column: "completed",
    _extra_assignees: [], tags: [], _archived_label: "04 OCT",
  },
  {
    id: "tsk-005", project_id: "prj-005", sprint_id: null, assignee_id: null,
    parent_task_id: null, project_sequence: 5, type: "bug",
    title: "Implementación de Parche de Seguridad: Puente de Datos",
    description: "", status: "todo", priority: "urgent",
    position: 0, estimated_min: null, due_date: null, completed_at: null,
    _ui_column: "pending", _extra_assignees: [], tags: ["tag-004"],
  },
  {
    id: "tsk-006", project_id: "prj-006", sprint_id: null, assignee_id: null,
    parent_task_id: null, project_sequence: 6, type: "task",
    title: "Revisión Legal de Acuerdos de Proveedores 2024",
    description: "", status: "todo", priority: "high",
    position: 1, estimated_min: null, due_date: null, completed_at: null,
    _ui_column: "pending", _extra_assignees: [], tags: [],
  },
];

/* ============================================================
   HELPERS
   ============================================================ */
const getUserById    = (id: string): User | undefined     => MOCK_USERS.find((u) => u.id === id);
const getProjectById = (id: string): Project | undefined  => MOCK_PROJECTS.find((p) => p.id === id);
const getTagById     = (id: string): Tag | undefined      => MOCK_TAGS.find((t) => t.id === id);

const PRIORITY_CFG: Record<string, PriorityCfgEntry> = {
  urgent: { label: "URGENTE",        bg: "rgba(239,68,68,0.12)",  text: "#f87171", dot: true  },
  high:   { label: "ALTA PRIORIDAD", bg: "rgba(245,158,11,0.1)",  text: "#fbbf24", dot: false },
  medium: { label: "MEDIA",          bg: "rgba(100,116,139,0.18)",text: "#94a3b8", dot: false },
  low:    { label: "BAJA",           bg: "rgba(71,85,105,0.18)",  text: "#64748b", dot: false },
  done:   { label: "COMPLETADO",     bg: "transparent",           text: "#34d399", dot: false },
  new:    { label: "NUEVA SOLICITUD",bg: "rgba(100,116,139,0.12)",text: "#94a3b8", dot: false },
};

const WORKLOAD_CFG: Record<Workload, WorkloadCfgEntry> = {
  available: { label: "DISPONIBLE",    color: "#34d399" },
  critical:  { label: "CARGA CRÍTICA", color: "#f87171" },
  busy:      { label: "EN REUNIÓN",    color: "#fbbf24" },
};

/* ============================================================
   ATOMS
   ============================================================ */
interface AvatarProps {
  user: User;
  size?: number;
}

function Avatar({ user, size = 28 }: AvatarProps) {
  if (!user) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user.avatar_color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 700, color: "#fff",
      border: "2px solid #0b1525", flexShrink: 0,
      fontFamily: "'DM Mono',monospace", letterSpacing: "-0.5px",
    }}>
      {user.initials}
    </div>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  isNew?: boolean;
}

function PriorityBadge({ priority, isNew }: PriorityBadgeProps) {
  const cfg = isNew ? PRIORITY_CFG.new : (PRIORITY_CFG[priority] || PRIORITY_CFG.medium);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
      background: cfg.bg, color: cfg.text,
      fontFamily: "'DM Mono',monospace",
    }}>
      {cfg.dot && <span style={{ fontSize: 8 }}>●</span>}
      {cfg.label}
    </span>
  );
}

/* ============================================================
   SIDEBAR
   ============================================================ */
interface SidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
}

function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const nav: { id: PageId; icon: string; label: string }[] = [
    { id: "dashboard", icon: "⊞", label: "ESCRITORIO"   },
    { id: "tasks",     icon: "☰", label: "TAREAS"        },
    { id: "crm",       icon: "◈", label: "PIPELINE CRM"  },
    { id: "analytics", icon: "∿", label: "ANALÍTICAS"    },
    { id: "team",      icon: "◎", label: "EQUIPO"         },
    { id: "config",    icon: "⚙", label: "CONFIGURACIÓN" },
  ];
  return (
    <aside style={{
      width: 200, flexShrink: 0,
      background: "#080f1a",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 18px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg,#1e3a5f,#0f2540)",
            border: "1px solid rgba(96,165,250,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: "#7dd3fc",
          }}>⌘</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.1em", fontFamily: "'DM Mono',monospace" }}>
              {MOCK_ORGANIZATION.name}
            </div>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.12em", fontFamily: "'DM Mono',monospace", marginTop: 1 }}>
              {MOCK_ORGANIZATION.tier}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "0 12px 16px" }}>
        <button
          onClick={() => setActivePage("new-task")}
          style={{
            width: "100%", padding: "9px 0", borderRadius: 8,
            background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
            border: "1px solid rgba(96,165,250,0.2)",
            color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontFamily: "'DM Mono',monospace",
            boxShadow: "0 4px 16px rgba(29,78,216,0.35)",
          }}
        >
          <span style={{ fontSize: 15 }}>+</span> NUEVA SOLICITUD
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 8px" }}>
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 9,
              padding: "8px 12px", borderRadius: 7, marginBottom: 2,
              background: activePage === item.id ? "rgba(29,78,216,0.14)" : "transparent",
              border: `1px solid ${activePage === item.id ? "rgba(29,78,216,0.28)" : "transparent"}`,
              color: activePage === item.id ? "#93c5fd" : "#475569",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              cursor: "pointer", textAlign: "left",
              fontFamily: "'DM Mono',monospace", transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 13, opacity: 0.9 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        {(["?", "Ayuda"], ["→", "Cerrar Sesión"]) && (
          [["?", "Ayuda"], ["→", "Cerrar Sesión"]].map(([icon, label]) => (
            <button key={label} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "7px 12px", borderRadius: 6, background: "transparent", border: "none", color: "#334155", fontSize: 10, cursor: "pointer", fontFamily: "'DM Mono',monospace", letterSpacing: "0.07em" }}>
              <span>{icon}</span> {label}
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

/* ============================================================
   TOP NAV
   ============================================================ */
function TopNav() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", height: 50,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "#080f1a", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#60a5fa", fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>OBSIDIAN</span>
        <span style={{ fontSize: 10, color: "#334155", fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>EXECUTIVE</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "5px 14px", width: 200 }}>
        <span style={{ fontSize: 12, color: "#334155" }}>⌕</span>
        <span style={{ fontSize: 11, color: "#334155", fontFamily: "'DM Sans',sans-serif" }}>BUSCAR ACTIVOS...</span>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {["MIS TAREAS", "REPORTES", "FEED DE CLIENTES"].map((l, i) => (
          <button key={l} style={{
            background: "none", border: "none", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.08em", cursor: "pointer", fontFamily: "'DM Mono',monospace",
            color: i === 1 ? "#e2e8f0" : "#475569",
            borderBottom: i === 1 ? "2px solid #1d4ed8" : "2px solid transparent",
            paddingBottom: 2,
          }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ background: "none", border: "none", fontSize: 14, color: "#334155", cursor: "pointer", position: "relative" }}>
          🔔
          <span style={{ position: "absolute", top: 0, right: -1, width: 5, height: 5, borderRadius: "50%", background: "#ef4444", display: "block" }} />
        </button>
        <button style={{ background: "none", border: "none", fontSize: 14, color: "#334155", cursor: "pointer" }}>↺</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar user={MOCK_CURRENT_USER} size={30} />
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif" }}>{MOCK_CURRENT_USER.name}</p>
            <p style={{ margin: 0, fontSize: 9, color: "#475569", fontFamily: "'DM Mono',monospace", letterSpacing: "0.05em" }}>Chief Executive</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TASK CARD
   ============================================================ */
interface TaskCardProps {
  task: Task;
  onAssign: (task: Task) => void;
}

function TaskCard({ task, onAssign }: TaskCardProps) {
  const project  = getProjectById(task.project_id);
  const assignee = task.assignee_id ? getUserById(task.assignee_id) : undefined;
  const extras   = (task._extra_assignees || []).map(getUserById).filter((u): u is User => u !== undefined);
  const tags     = (task.tags || []).map(getTagById).filter((t): t is Tag => t !== undefined);
  const isCompleted = task._ui_column === "completed";
  const isPending   = task._ui_column === "pending";
  const isNew       = isPending && !task.assignee_id && task.priority !== "urgent";

  let daysLeft: number | null = null;
  if (task.due_date && !isCompleted) {
    daysLeft = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / 86400000);
  }

  return (
    <div
      style={{
        background: isCompleted ? "rgba(15,23,42,0.35)" : "#111d2e",
        border: `1px solid ${isCompleted ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 12, padding: "14px 14px",
        opacity: isCompleted ? 0.6 : 1,
        transition: "border-color 0.15s",
        cursor: "default",
      }}
      onMouseEnter={e => { if (!isCompleted) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(96,165,250,0.18)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = isCompleted ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)"; }}
    >
      {/* Badge row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        {isCompleted
          ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: "#34d399", fontFamily: "'DM Mono',monospace" }}>
              <span style={{ fontSize: 12 }}>✓</span> COMPLETADO
            </span>
          : <PriorityBadge priority={task.priority} isNew={isNew} />
        }
        <button style={{ background: "none", border: "none", color: "#334155", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: 0 }}>···</button>
      </div>

      {/* Title */}
      <p style={{
        margin: "0 0 10px", fontSize: 12.5, fontWeight: 600, lineHeight: 1.45,
        color: isCompleted ? "#475569" : "#cbd5e1",
        fontFamily: "'DM Sans',sans-serif",
      }}>{task.title}</p>

      {/* Project */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: tags.length ? 8 : 12 }}>
        <div style={{ width: 13, height: 13, borderRadius: 3, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#60a5fa" }}>■</div>
        <span style={{ fontSize: 9, color: "#475569", fontWeight: 700, letterSpacing: "0.07em", fontFamily: "'DM Mono',monospace" }}>
          {project?.name?.toUpperCase()}
        </span>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
          {tags.map(tag => (
            <span key={tag.id} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, fontWeight: 700, letterSpacing: "0.05em", background: `${tag.color}22`, color: tag.color, fontFamily: "'DM Mono',monospace" }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Avatars */}
        <div style={{ display: "flex" }}>
          {assignee && <Avatar user={assignee} size={26} />}
          {extras.map((u) => (
            <div key={u.id} style={{ marginLeft: -8 }}><Avatar user={u} size={26} /></div>
          ))}
          {!assignee && !isPending && (
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#334155" }}>?</div>
          )}
        </div>

        {/* Right meta */}
        {isCompleted && task._archived_label && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#334155", fontFamily: "'DM Mono',monospace" }}>
            <span>◻</span> ARCHIVADO · {task._archived_label}
          </div>
        )}
        {!isCompleted && daysLeft !== null && (
          <span style={{ fontSize: 9, fontWeight: 700, color: daysLeft < 7 ? "#f87171" : "#475569", fontFamily: "'DM Mono',monospace" }}>
            VENCE EN {daysLeft}D
          </span>
        )}
        {isPending && (
          <button
            onClick={() => onAssign(task)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
              color: "#60a5fa", background: "rgba(96,165,250,0.07)",
              border: "1px solid rgba(96,165,250,0.18)",
              borderRadius: 6, padding: "4px 9px", cursor: "pointer",
              fontFamily: "'DM Mono',monospace", transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(96,165,250,0.14)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(96,165,250,0.07)"; }}
          >
            <span style={{ fontSize: 10 }}>◎</span> ASIGNAR AHORA
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   KANBAN BOARD
   ============================================================ */
interface KanbanBoardProps {
  tasks: Task[];
  onNewTask: () => void;
  onAssign: (task: Task) => void;
}

function KanbanBoard({ tasks, onNewTask, onAssign }: KanbanBoardProps) {
  const assigned  = tasks.filter(t => t._ui_column === "assigned");
  const completed = tasks.filter(t => t._ui_column === "completed");
  const pending   = tasks.filter(t => t._ui_column === "pending");

  const columns: { id: UIColumn; label: string; items: Task[] }[] = [
    { id: "assigned",  label: "TAREAS ASIGNADAS",     items: assigned  },
    { id: "completed", label: "TAREAS COMPLETADAS",    items: completed },
    { id: "pending",   label: "PENDIENTES DE ASIGNAR", items: pending   },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Page header */}
      <header style={{ padding: "22px 32px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 9, color: "#475569", letterSpacing: "0.1em", fontFamily: "'DM Mono',monospace" }}>
              OBSIDIAN EXECUTIVE / MIS TAREAS / <strong style={{ color: "#60a5fa" }}>REPORTES</strong>
            </p>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.02em" }}>
              PANEL DE CONTROL DE TAREAS
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>
              Gestionando {tasks.length} mandatos activos de CRM en {columns.length} divisiones estratégicas.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["⊟  FILTRAR POR CLIENTE", "↑↓  PRIORIDAD"].map(label => (
              <button key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748b", fontSize: 10, cursor: "pointer", fontFamily: "'DM Mono',monospace", letterSpacing: "0.06em" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Columns */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, padding: "20px 32px 24px", overflowY: "auto" }}>
        {columns.map((col, ci) => (
          <div key={col.id} style={{ paddingRight: ci < 2 ? 18 : 0 }}>
            {/* Column header */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#334155", fontFamily: "'DM Mono',monospace" }}>
                {col.label}
              </span>
              <span style={{ fontSize: 9, color: "#253348", fontFamily: "'DM Mono',monospace" }}>
                / {String(col.items.length).padStart(2, "0")}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.items.map(task => (
                <TaskCard key={task.id} task={task} onAssign={onAssign} />
              ))}
              {col.id === "pending" && (
                <button style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px dashed rgba(255,255,255,0.05)", background: "transparent", color: "#253348", fontSize: 10, cursor: "pointer", fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>
                  + AÑADIR COLUMNA
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={onNewTask}
        style={{
          position: "fixed", bottom: 26, right: 26,
          width: 46, height: 46, borderRadius: "50%",
          background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
          border: "none", color: "#fff", fontSize: 22, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 24px rgba(29,78,216,0.5)", lineHeight: 1,
          transition: "transform 0.15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >+</button>
    </div>
  );
}

/* ============================================================
   NEW TASK FORM
   ============================================================ */
interface NewTaskFormProps {
  onCancel: () => void;
  onCreate: (task: Task) => void;
}

interface NewTaskFormState {
  title: string;
  description: string;
  project_id: string;
  due_date: string;
  priority: Priority;
  type: TaskType;
  tags: string[];
}

function NewTaskForm({ onCancel, onCreate }: NewTaskFormProps) {
  const [form, setForm] = useState<NewTaskFormState>({
    title: "", description: "",
    project_id: "prj-001", due_date: "",
    priority: "high", type: "task",
    tags: ["tag-001"],
  });

  const priorities: Priority[] = ["low", "medium", "high", "urgent"];
  const pLabels: Record<Priority, string> = { low: "BAJA", medium: "MEDIA", high: "ALTA", urgent: "URGENTE" };
  const impact   = ["urgent","high"].includes(form.priority) ? "Alto" : "Medio";
  const estHours = form.priority === "urgent" ? "2-4 Horas" : form.priority === "high" ? "4-6 Horas" : "6-12 Horas";

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onCreate({
      id: `tsk-${Date.now()}`,
      ...form,
      sprint_id: null, assignee_id: null, parent_task_id: null,
      project_sequence: 99, position: 99, estimated_min: null,
      status: "todo", completed_at: null,
      _ui_column: "pending", _extra_assignees: [],
    });
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "#0d1a28",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10, padding: "10px 13px",
    color: "#cbd5e1", fontSize: 13,
    fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "24px 36px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
          <p style={{ margin: "0 0 3px", fontSize: 9, color: "#475569", letterSpacing: "0.1em", fontFamily: "'DM Mono',monospace" }}>
            PANEL DE CONTROL / TAREAS / <strong style={{ color: "#60a5fa" }}>NUEVA</strong>
          </p>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.02em" }}>
            Nueva Tarea
          </h1>
          <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
            Define los parámetros estratégicos para la ejecución ejecutiva.
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 90px" }}>
          <div style={{ maxWidth: 580 }}>
            {/* Title */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#475569", marginBottom: 7, fontFamily: "'DM Mono',monospace" }}>TÍTULO DE LA TAREA</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Auditoría Trimestral de Activos"
                style={{ ...inp, color: form.title ? "#e2e8f0" : "#253348", fontSize: 14 }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#475569", marginBottom: 7, fontFamily: "'DM Mono',monospace" }}>DESCRIPCIÓN</label>
              <div style={{ background: "#0d1a28", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px 10px 0 0", padding: "7px 10px", display: "flex", gap: 5 }}>
                {["B","I","≡","⇗","⊕"].map(t => (
                  <button key={t} style={{ width: 26, height: 26, borderRadius: 4, border: "none", background: "rgba(255,255,255,0.04)", color: "#475569", fontSize: t==="B"?12:11, cursor: "pointer", fontWeight: t==="B"?900:400 }}>{t}</button>
                ))}
              </div>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Detalle los objetivos, alcance y resultados esperados..."
                rows={5}
                style={{ ...inp, borderRadius: "0 0 10px 10px", resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            {/* Client / Due date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#475569", marginBottom: 7, fontFamily: "'DM Mono',monospace" }}>CLIENTE / CUENTA CRM</label>
                <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} style={{ ...inp, appearance: "none", cursor: "pointer" }}>
                  {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#475569", marginBottom: 7, fontFamily: "'DM Mono',monospace" }}>FECHA DE VENCIMIENTO</label>
                <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} style={{ ...inp, colorScheme: "dark" } as React.CSSProperties} />
              </div>
            </div>

            {/* Priority / Tags */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#475569", marginBottom: 7, fontFamily: "'DM Mono',monospace" }}>PRIORIDAD</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {priorities.map(p => {
                    const sel = form.priority === p;
                    const bg = sel ? (p==="urgent" ? "#ef4444" : p==="high" ? "#1d4ed8" : "rgba(255,255,255,0.12)") : "rgba(255,255,255,0.03)";
                    return (
                      <button key={p} onClick={() => setForm({...form, priority: p})} style={{ padding: "5px 11px", borderRadius: 6, fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", cursor: "pointer", fontFamily: "'DM Mono',monospace", border: sel?"1px solid transparent":"1px solid rgba(255,255,255,0.07)", background: bg, color: sel?"#fff":"#475569", transition: "all 0.15s" }}>
                        {pLabels[p]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#475569", marginBottom: 7, fontFamily: "'DM Mono',monospace" }}>ETIQUETAS CORPORATIVAS</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                  {MOCK_TAGS.map(tag => {
                    const sel = form.tags.includes(tag.id);
                    return (
                      <button key={tag.id} onClick={() => setForm({...form, tags: sel ? form.tags.filter(t=>t!==tag.id) : [...form.tags, tag.id]})} style={{ padding: "3px 9px", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer", fontFamily: "'DM Mono',monospace", background: sel?`${tag.color}28`:"rgba(255,255,255,0.02)", border: `1px solid ${sel?tag.color+"44":"rgba(255,255,255,0.06)"}`, color: sel?tag.color:"#475569", display: "flex", alignItems: "center", gap: 4 }}>
                        {tag.name}{sel && <span style={{ fontSize: 9 }}>✕</span>}
                      </button>
                    );
                  })}
                  <button style={{ padding: "3px 9px", borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: "'DM Mono',monospace", background: "transparent", border: "1px dashed rgba(255,255,255,0.06)", color: "#334155", cursor: "pointer" }}>+ Añadir</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 36px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <button onClick={onCancel} style={{ padding: "9px 22px", borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#475569", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} style={{ padding: "9px 26px", borderRadius: 9, background: form.title ? "linear-gradient(135deg,#1d4ed8,#1e40af)" : "rgba(255,255,255,0.04)", border: "none", color: form.title?"#fff":"#334155", fontSize: 13, fontWeight: 700, cursor: form.title?"pointer":"default", fontFamily: "'DM Sans',sans-serif", boxShadow: form.title?"0 4px 16px rgba(29,78,216,0.35)":"none", transition: "all 0.2s" }}>
            Crear Tarea
          </button>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 230, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.05)", padding: "24px 18px", overflowY: "auto", background: "#090f1c" }}>
        {/* Executive summary */}
        <div style={{ background: "#0d1a28", borderRadius: 12, padding: "14px", marginBottom: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ margin: "0 0 11px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#334155", fontFamily: "'DM Mono',monospace" }}>RESUMEN EJECUTIVO</p>
          {([["Impacto Proyectado", impact, impact==="Alto"?"#34d399":"#94a3b8"], ["Tiempo Estimado", estHours, "#e2e8f0"], ["Complejidad", "···", "#475569"]] as [string, string, string][]).map(([label, val, color]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>{val}</span>
            </div>
          ))}
        </div>

        {/* AI assistant */}
        <div style={{ background: "#0d1a28", borderRadius: 12, padding: "14px", marginBottom: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>◈</div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.09em", color: "#64748b", fontFamily: "'DM Mono',monospace" }}>ASISTENTE OBSIDIAN</span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "#475569", lineHeight: 1.55, fontFamily: "'DM Sans',sans-serif", fontStyle: "italic" }}>
            {form.title
              ? `Basado en la tarea, sugiero asignar a Marcos V. como revisor y establecer el nivel de urgencia como Crítico para el 15 de diciembre.`
              : "Completa el título para recibir sugerencias de asignación y prioridad."}
          </p>
        </div>

        {/* Smart suggestions */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#253348", marginBottom: 7, fontFamily: "'DM Mono',monospace" }}>SUGERENCIAS INTELIGENTES</p>
          {(["Vincular con 'Reporte Anual'", "+"], ["Ajustar fecha (Sugerido 12/12)", "↺"]) && (
            [["Vincular con 'Reporte Anual'", "+"], ["Ajustar fecha (Sugerido 12/12)", "↺"]].map(([label, icon]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
                <button style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "none", color: "#475569", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</button>
              </div>
            ))
          )}
        </div>

        {/* Recent context */}
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#253348", marginBottom: 7, fontFamily: "'DM Mono',monospace" }}>CONTEXTO RECIENTE</p>
          {(["Cierre Fiscal Q3", "Completado ayer", "#34d399"], ["Review Global Logistics", "Próxima semana", "#60a5fa"]) && (
            [["Cierre Fiscal Q3", "Completado ayer", "#34d399"], ["Review Global Logistics", "Próxima semana", "#60a5fa"]].map(([label, sub, accent]) => (
              <div key={label} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ width: 3, borderRadius: 2, background: accent, flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>{label}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 10, color: "#334155", fontFamily: "'DM Sans',sans-serif" }}>{sub}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ASSIGN MODAL
   ============================================================ */
interface AssignModalProps {
  task: Task;
  onClose: () => void;
  onConfirm: (payload: { taskId: string; assignee_id: string; estimated_min: number; due_date: string }) => void;
}

function AssignModal({ task, onClose, onConfirm }: AssignModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [hours, setHours]     = useState<number>(16);
  const [dueDate, setDueDate] = useState<string>("2023-11-24");
  const project       = getProjectById(task.project_id);
  const availableCount = MOCK_USERS.filter(u => u.workload === "available").length;

  const handleConfirm = () => {
    if (!selectedUserId) return;
    onConfirm({ taskId: task.id, assignee_id: selectedUserId, estimated_min: hours * 60, due_date: dueDate });
    onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "100%", maxWidth: 470, margin: "0 16px", background: "#0f1c2e", borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 30px 90px rgba(0,0,0,0.7)", overflow: "hidden", animation: "slideUp 0.2s ease-out" }}>
        {/* Header */}
        <div style={{ background: "#0a1422", padding: "18px 22px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.01em" }}>Confirmar Asignación</h2>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>Configurando parámetros finales del flujo de trabajo</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2, marginTop: 2 }}>✕</button>
        </div>

        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Task card */}
          <div style={{ background: "#0a1422", borderRadius: 12, padding: "13px 14px", display: "flex", gap: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, color: "#60a5fa" }}>◻</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "#253348", fontFamily: "'DM Mono',monospace" }}>TAREA SELECCIONADA</p>
                  <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.35 }}>{task.title}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "#253348", fontFamily: "'DM Mono',monospace" }}>CLIENTE</p>
                  <p style={{ margin: 0, fontSize: 11.5, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>{project?.name}</p>
                </div>
              </div>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "#253348", fontFamily: "'DM Mono',monospace" }}>PRIORIDAD</p>
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
          </div>

          {/* Professionals */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif" }}>Asignar Profesional</p>
              <span style={{ fontSize: 9, color: "#334155", fontFamily: "'DM Mono',monospace" }}>{availableCount} disponibles actualmente</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {MOCK_USERS.filter(u => u.id !== "usr-001").map(user => {
                const wl  = WORKLOAD_CFG[user.workload] || WORKLOAD_CFG.available;
                const sel = selectedUserId === user.id;
                return (
                  <button key={user.id} onClick={() => setSelectedUserId(user.id)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 9, cursor: "pointer", textAlign: "left", background: sel?"rgba(29,78,216,0.1)":"rgba(255,255,255,0.02)", border: `1px solid ${sel?"rgba(96,165,250,0.35)":"rgba(255,255,255,0.06)"}`, transition: "all 0.15s" }}>
                    <Avatar user={user} size={30} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 8, fontWeight: 700, color: wl.color, fontFamily: "'DM Mono',monospace", letterSpacing: "0.06em" }}>{wl.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hours + Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif" }}>Horas Estimadas</p>
                <span style={{ fontSize: 9, background: "#1d4ed8", color: "#fff", padding: "2px 6px", borderRadius: 4, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{hours}h</span>
              </div>
              <input type="range" min={1} max={40} value={hours} onChange={e => setHours(Number(e.target.value))} style={{ width: "100%", accentColor: "#1d4ed8", cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 8, color: "#253348", fontFamily: "'DM Mono',monospace" }}>1 HORA</span>
                <span style={{ fontSize: 8, color: "#253348", fontFamily: "'DM Mono',monospace" }}>40 HORAS</span>
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 7px", fontSize: 12, fontWeight: 700, color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif" }}>Fecha Límite</p>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%", background: "#0a1422", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 11px", color: "#cbd5e1", fontSize: 12, fontFamily: "'DM Sans',sans-serif", outline: "none", colorScheme: "dark", boxSizing: "border-box" } as React.CSSProperties} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 9, marginTop: 2 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#475569", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Cancelar
            </button>
            <button onClick={handleConfirm} style={{ flex: 2, padding: 10, borderRadius: 9, border: "none", background: selectedUserId?"linear-gradient(135deg,#1d4ed8,#1e40af)":"rgba(255,255,255,0.04)", color: selectedUserId?"#fff":"#334155", fontSize: 13, fontWeight: 700, cursor: selectedUserId?"pointer":"default", fontFamily: "'DM Sans',sans-serif", boxShadow: selectedUserId?"0 4px 16px rgba(29,78,216,0.4)":"none", transition: "all 0.2s" }}>
              Confirmar Asignación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [page, setPage]           = useState<PageId>("tasks");
  const [tasks, setTasks]         = useState<Task[]>(MOCK_TASKS);
  const [assignTarget, setAssign] = useState<Task | null>(null);

  const handleAssignConfirm = ({ taskId, assignee_id, estimated_min, due_date }: { taskId: string; assignee_id: string; estimated_min: number; due_date: string }) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, assignee_id, estimated_min, due_date, _ui_column: "assigned" as UIColumn, status: "in_progress" as TaskStatus }
        : t
    ));
  };

  const handleCreateTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
    setPage("tasks");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background:#090f1c; color:#e2e8f0; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.07); border-radius:3px; }
        select option { background:#0d1a28; }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(18px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        input[type=range] { -webkit-appearance:none; background:transparent; }
        input[type=range]::-webkit-slider-runnable-track { background:rgba(255,255,255,0.07); height:3px; border-radius:2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:13px; height:13px; border-radius:50%; background:#1d4ed8; margin-top:-5px; cursor:pointer; box-shadow:0 0 0 3px rgba(29,78,216,0.22); }
      `}</style>

      <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#090f1c", fontFamily:"'DM Sans',sans-serif" }}>
        <Sidebar activePage={page} setActivePage={setPage} />

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <TopNav />
          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
            {page === "tasks" && (
              <KanbanBoard tasks={tasks} onNewTask={() => setPage("new-task")} onAssign={setAssign} />
            )}
            {page === "new-task" && (
              <NewTaskForm onCancel={() => setPage("tasks")} onCreate={handleCreateTask} />
            )}
            {page !== "tasks" && page !== "new-task" && (
              <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, color:"#253348" }}>
                <div style={{ fontSize:38, opacity:0.3 }}>◈</div>
                <p style={{ fontSize:10, fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em" }}>MÓDULO EN CONSTRUCCIÓN</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {assignTarget && (
        <AssignModal task={assignTarget} onClose={() => setAssign(null)} onConfirm={handleAssignConfirm} />
      )}
    </>
  );
}
