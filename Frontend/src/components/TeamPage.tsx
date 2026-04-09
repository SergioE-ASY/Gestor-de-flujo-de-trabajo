import type { Task } from "./types";
import { useData } from "./DataContext";

const WORKLOAD_LABEL: Record<string, string> = { available: "DISPONIBLE", busy: "OCUPADO", critical: "CRÍTICO" };
const WORKLOAD_COLOR: Record<string, string> = { available: "#34d399", busy: "#fbbf24", critical: "#f87171" };
const ROLE_LABEL: Record<string, string>     = { executive: "EJECUTIVO", manager: "GERENTE", member: "MIEMBRO" };

export default function TeamPage({ tasks }: { tasks: Task[] }) {
  const { users } = useData();

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="breadcrumb">OBSIDIAN EXECUTIVE / <strong style={{ color: "var(--accent-secondary)" }}>EQUIPO</strong></p>
          <h1 className="page-title">GESTIÓN DE EQUIPO</h1>
          <p className="page-desc">{users.length} miembros operativos en la organización.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary" style={{ fontSize: 10, padding: "7px 16px" }}>+ AÑADIR MIEMBRO</button>
        </div>
      </div>

      <div className="page-body">
        <div className="team-cards-grid">
          {users.map(user => {
            const userTasks   = tasks.filter(t => t.assignee_id === user.id);
            const done        = userTasks.filter(t => t._ui_column === "completed").length;
            const inProgress  = userTasks.filter(t => t._ui_column === "assigned").length;
            const pending     = userTasks.filter(t => t._ui_column === "pending").length;
            const pct         = userTasks.length > 0 ? Math.round((done / userTasks.length) * 100) : 0;

            return (
              <div key={user.id} className="team-card">
                <div className="team-card-top">
                  <div className="avatar team-avatar" style={{ background: user.avatar_color }}>
                    {user.initials}
                  </div>
                  <span className="workload-pill" style={{ background: `${WORKLOAD_COLOR[user.workload]}18`, color: WORKLOAD_COLOR[user.workload] }}>
                    ● {WORKLOAD_LABEL[user.workload]}
                  </span>
                </div>

                <div className="team-card-name">{user.name}</div>
                <div className="team-card-role">{ROLE_LABEL[user.role]}</div>

                <div className="team-card-stats">
                  <div className="team-stat-item">
                    <div className="team-stat-val" style={{ color: "#a78bfa" }}>{inProgress}</div>
                    <div className="team-stat-lbl">EN CURSO</div>
                  </div>
                  <div className="team-stat-divider" />
                  <div className="team-stat-item">
                    <div className="team-stat-val" style={{ color: "#94a3b8" }}>{pending}</div>
                    <div className="team-stat-lbl">PENDIENTES</div>
                  </div>
                  <div className="team-stat-divider" />
                  <div className="team-stat-item">
                    <div className="team-stat-val" style={{ color: "#34d399" }}>{done}</div>
                    <div className="team-stat-lbl">COMPLETADAS</div>
                  </div>
                </div>

                <div className="team-card-progress">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "'DM Mono',monospace", letterSpacing: "0.06em" }}>RENDIMIENTO</span>
                    <span style={{ fontSize: 9, color: "#34d399", fontFamily: "'DM Mono',monospace" }}>{pct}%</span>
                  </div>
                  <div className="proj-bar-track">
                    <div className="proj-bar-fill" style={{ width: `${pct}%`, background: user.avatar_color }} />
                  </div>
                </div>

                <div className="team-card-recent">
                  {userTasks.slice(0, 2).map(t => (
                    <div key={t.id} className="team-recent-task">
                      <span className={`team-task-dot ${t._ui_column}`} />
                      <span className="team-task-title">{t.title}</span>
                    </div>
                  ))}
                  {userTasks.length === 0 && (
                    <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Mono',monospace" }}>Sin tareas asignadas</div>
                  )}
                </div>

                <button className="crm-detail-btn" style={{ marginTop: 10, width: "100%", textAlign: "center" }}>
                  VER PERFIL →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
