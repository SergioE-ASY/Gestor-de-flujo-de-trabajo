import type { Task } from "../components/types";
import { useData } from "../context/DataContext";

const PRIORITY_COLOR: Record<string, string> = { low: "#64748b", medium: "#94a3b8", high: "#fbbf24", urgent: "#f87171" };
const PRIORITY_LABEL: Record<string, string> = { low: "BAJA", medium: "MEDIA", high: "ALTA", urgent: "URGENTE" };
const STATUS_COLOR: Record<string, string> = { pending: "#94a3b8", assigned: "#a78bfa", completed: "#34d399" };
const STATUS_LABEL: Record<string, string> = { pending: "PENDIENTES", assigned: "EN PROGRESO", completed: "COMPLETADAS" };

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
    </div>
  );
}

export default function AnalyticsPage({ tasks }: { tasks: Task[] }) {
  const { projects, users } = useData();

  const total = tasks.length || 1;
  const byStatus = ["pending", "assigned", "completed"].map(s => ({
    key: s, label: STATUS_LABEL[s], color: STATUS_COLOR[s],
    count: tasks.filter(t => t._ui_column === s).length,
  }));

  const byPriority = ["urgent", "high", "medium", "low"].map(p => ({
    key: p, label: PRIORITY_LABEL[p], color: PRIORITY_COLOR[p],
    count: tasks.filter(t => t.priority === p).length,
  }));

  const byProject = projects.map(p => ({
    ...p,
    count: tasks.filter(t => t.project_id === p.id).length,
    done:  tasks.filter(t => t.project_id === p.id && t._ui_column === "completed").length,
  })).filter(p => p.count > 0).sort((a, b) => b.count - a.count);

  const maxByProject = Math.max(...byProject.map(p => p.count), 1);

  const byMember = users.map(u => ({
    ...u,
    total: tasks.filter(t => t.assignee_id === u.id).length,
    done:  tasks.filter(t => t.assignee_id === u.id && t._ui_column === "completed").length,
  })).sort((a, b) => b.total - a.total);

  const maxByMember = Math.max(...byMember.map(m => m.total), 1);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="breadcrumb">OBSIDIAN EXECUTIVE / <strong style={{ color: "var(--accent-secondary)" }}>ANALÍTICAS</strong></p>
          <h1 className="page-title">PANEL DE ANALÍTICAS</h1>
          <p className="page-desc">Métricas operacionales de {tasks.length} mandatos activos.</p>
        </div>
      </div>

      <div className="page-body">
        <div className="analytics-grid3">
          {/* Por estado */}
          <div className="dash-panel">
            <div className="dash-panel-hd"><span className="dash-panel-title">DISTRIBUCIÓN POR ESTADO</span></div>
            {byStatus.map(s => (
              <div key={s.key} className="analytics-row">
                <div className="analytics-row-left">
                  <div className="analytics-dot" style={{ background: s.color }} />
                  <span className="analytics-label">{s.label}</span>
                </div>
                <div className="analytics-row-right">
                  <Bar pct={(s.count / total) * 100} color={s.color} />
                  <span className="analytics-val">{s.count}</span>
                  <span className="analytics-pct">{Math.round((s.count / total) * 100)}%</span>
                </div>
              </div>
            ))}

            {/* Donut simplificado con CSS */}
            <div className="donut-wrap">
              {byStatus.map(s => (
                <div key={s.key} className="donut-seg-row">
                  <div className="donut-seg-bar" style={{ width: `${(s.count / total) * 100}%`, background: s.color }} />
                </div>
              ))}
            </div>
          </div>

          {/* Por prioridad */}
          <div className="dash-panel">
            <div className="dash-panel-hd"><span className="dash-panel-title">DISTRIBUCIÓN POR PRIORIDAD</span></div>
            {byPriority.map(p => (
              <div key={p.key} className="analytics-row">
                <div className="analytics-row-left">
                  <div className="analytics-dot" style={{ background: p.color }} />
                  <span className="analytics-label">{p.label}</span>
                </div>
                <div className="analytics-row-right">
                  <Bar pct={total > 1 ? (p.count / total) * 100 : 0} color={p.color} />
                  <span className="analytics-val">{p.count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tasa completados */}
          <div className="dash-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div className="dash-panel-hd" style={{ width: "100%" }}><span className="dash-panel-title">TASA DE ÉXITO</span></div>
            <div className="big-number" style={{ color: "#34d399" }}>
              {Math.round((tasks.filter(t => t._ui_column === "completed").length / total) * 100)}%
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>
              TAREAS COMPLETADAS
            </div>
            <div className="donut-wrap" style={{ width: "100%", marginTop: 8 }}>
              <div className="donut-seg-bar" style={{ width: `${(tasks.filter(t => t._ui_column === "completed").length / total) * 100}%`, background: "#34d399" }} />
              <div className="donut-seg-bar" style={{ width: `${(tasks.filter(t => t._ui_column !== "completed").length / total) * 100}%`, background: "rgba(255,255,255,0.05)" }} />
            </div>
          </div>
        </div>

        <div className="dash-grid2" style={{ marginTop: 0 }}>
          {/* Por proyecto */}
          <div className="dash-panel">
            <div className="dash-panel-hd"><span className="dash-panel-title">TAREAS POR PROYECTO</span></div>
            {byProject.map(p => (
              <div key={p.id} className="analytics-row">
                <div className="analytics-row-left">
                  <span className="analytics-key" style={{ color: PRIORITY_COLOR[p.priority] }}>{p.key}</span>
                  <span className="analytics-label">{p.name}</span>
                </div>
                <div className="analytics-row-right">
                  <Bar pct={(p.count / maxByProject) * 100} color={PRIORITY_COLOR[p.priority]} />
                  <span className="analytics-val">{p.count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Rendimiento equipo */}
          <div className="dash-panel">
            <div className="dash-panel-hd"><span className="dash-panel-title">RENDIMIENTO DEL EQUIPO</span></div>
            {byMember.map(u => (
              <div key={u.id} className="analytics-row">
                <div className="analytics-row-left">
                  <div className="avatar" style={{ background: u.avatar_color, width: 20, height: 20, fontSize: 8, flexShrink: 0 }}>{u.initials}</div>
                  <span className="analytics-label">{u.name.split(" ")[0]}</span>
                </div>
                <div className="analytics-row-right">
                  <Bar pct={(u.total / maxByMember) * 100} color={u.avatar_color} />
                  <span className="analytics-val">{u.done}/{u.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
