import type { Task } from "./types";
import { useData } from "./DataContext";

const WORKLOAD_LABEL: Record<string, string> = { available: "DISPONIBLE", busy: "OCUPADO", critical: "CRÍTICO" };
const WORKLOAD_COLOR: Record<string, string> = { available: "#34d399", busy: "#fbbf24", critical: "#f87171" };
const PRIORITY_COLOR: Record<string, string> = { low: "#64748b", medium: "#94a3b8", high: "#fbbf24", urgent: "#f87171" };

export default function DashboardPage({ tasks }: { tasks: Task[] }) {
  const { users, projects, currentUser, getProjectById } = useData();

  const total     = tasks.length;
  const pending   = tasks.filter(t => t._ui_column === "pending").length;
  const assigned  = tasks.filter(t => t._ui_column === "assigned").length;
  const completed = tasks.filter(t => t._ui_column === "completed").length;

  const kpis = [
    { label: "TOTAL MANDATOS",  value: total,     icon: "◈", color: "var(--accent-light)" },
    { label: "EN PROGRESO",     value: assigned,  icon: "↻", color: "#fbbf24" },
    { label: "PENDIENTES",      value: pending,   icon: "⊡", color: "#94a3b8" },
    { label: "COMPLETADOS",     value: completed, icon: "✓", color: "#34d399" },
  ];

  const projectStats = projects.map(p => {
    const pt = tasks.filter(t => t.project_id === p.id);
    return { ...p, total: pt.length, done: pt.filter(t => t._ui_column === "completed").length };
  }).filter(p => p.total > 0);

  const urgent = tasks
    .filter(t => t._ui_column !== "completed" && t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 4);

  const teamStats = users.map(u => ({
    ...u,
    taskCount: tasks.filter(t => t.assignee_id === u.id).length,
  }));

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="breadcrumb">OBSIDIAN EXECUTIVE / <strong style={{ color: "var(--accent-secondary)" }}>ESCRITORIO</strong></p>
          <h1 className="page-title">Bienvenido, {currentUser?.name?.split(" ")[0] || "Ejecutivo"}</h1>
          <p className="page-desc">Resumen operacional de {projects.length} proyectos activos.</p>
        </div>
        <div className="page-date-badge">
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
        </div>
      </div>

      <div className="page-body">
        {/* KPIs */}
        <div className="kpi-grid">
          {kpis.map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-icon" style={{ color: k.color }}>{k.icon}</div>
              <div className="kpi-value" style={{ color: k.color }}>{k.value.toString().padStart(2, "0")}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="dash-grid2">
          {/* Proyectos */}
          <div className="dash-panel">
            <div className="dash-panel-hd">
              <span className="dash-panel-title">PROYECTOS ACTIVOS</span>
              <span className="dash-panel-count">{projectStats.length}</span>
            </div>
            {projectStats.map(p => {
              const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
              return (
                <div key={p.id} className="proj-row">
                  <div className="proj-row-left">
                    <div className="proj-key-badge" style={{ color: PRIORITY_COLOR[p.priority] }}>
                      {p.key}
                    </div>
                    <div>
                      <div className="proj-row-name">{p.name}</div>
                      <div className="proj-row-sub">{p.done}/{p.total} tareas · {pct}% completado</div>
                    </div>
                  </div>
                  <div className="proj-bar-wrap">
                    <div className="proj-bar-track">
                      <div className="proj-bar-fill" style={{ width: `${pct}%`, background: PRIORITY_COLOR[p.priority] }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vencimientos próximos */}
          <div className="dash-panel">
            <div className="dash-panel-hd">
              <span className="dash-panel-title">VENCIMIENTOS PRÓXIMOS</span>
            </div>
            {urgent.length === 0 && (
              <div className="empty-state-small">Sin vencimientos urgentes</div>
            )}
            {urgent.map(t => {
              const daysLeft = Math.ceil((new Date(t.due_date!).getTime() - Date.now()) / 86400000);
              const proj = getProjectById(t.project_id);
              return (
                <div key={t.id} className="due-row">
                  <div className="due-row-left">
                    <div className="due-dot" style={{ background: daysLeft < 3 ? "#f87171" : daysLeft < 7 ? "#fbbf24" : "#94a3b8" }} />
                    <div>
                      <div className="due-title">{t.title}</div>
                      <div className="due-proj">{proj?.key}</div>
                    </div>
                  </div>
                  <div className={`due-badge ${daysLeft < 7 ? "urgent" : ""}`}>
                    {daysLeft < 0 ? "VENCIDA" : daysLeft === 0 ? "HOY" : `${daysLeft}D`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipo */}
        <div className="dash-panel">
          <div className="dash-panel-hd">
            <span className="dash-panel-title">CARGA DEL EQUIPO</span>
          </div>
          <div className="team-row-grid">
            {teamStats.map(u => (
              <div key={u.id} className="team-mini-card">
                <div className="avatar" style={{ background: u.avatar_color, width: 36, height: 36, fontSize: 12 }}>{u.initials}</div>
                <div className="team-mini-info">
                  <div className="team-mini-name">{u.name}</div>
                  <div className="team-mini-role">{u.role.toUpperCase()}</div>
                </div>
                <div className="team-mini-right">
                  <span className="workload-dot" style={{ background: WORKLOAD_COLOR[u.workload] }} />
                  <span className="team-mini-wl" style={{ color: WORKLOAD_COLOR[u.workload] }}>{WORKLOAD_LABEL[u.workload]}</span>
                  <span className="team-mini-tasks">{u.taskCount}T</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
