import type { Task } from "./types";
import { useData } from "./DataContext";

const PRIORITY_COLOR: Record<string, string> = { low: "#64748b", medium: "#94a3b8", high: "#fbbf24", urgent: "#f87171" };
const PRIORITY_LABEL: Record<string, string> = { low: "BAJA", medium: "MEDIA", high: "ALTA", urgent: "URGENTE" };

// Stages del pipeline CRM
const STAGES = [
  { id: "prospecto",  label: "PROSPECTO",   icon: "◌" },
  { id: "negociando", label: "NEGOCIANDO",  icon: "⟳" },
  { id: "activo",     label: "ACTIVO",      icon: "◈" },
  { id: "cerrado",    label: "CERRADO",     icon: "✓" },
];

// Mapeo estático de proyectos a etapa (se conectará al backend real más adelante)
const PROJECT_STAGE: Record<string, string> = {
  "prj-001": "activo",
  "prj-002": "negociando",
  "prj-003": "cerrado",
  "prj-004": "activo",
  "prj-005": "negociando",
  "prj-006": "prospecto",
};

export default function CrmPage({ tasks }: { tasks: Task[] }) {
  const { projects, users, getProjectById } = useData();

  const stageProjects = STAGES.map(stage => ({
    ...stage,
    projects: projects.filter(p => PROJECT_STAGE[p.id] === stage.id),
  }));

  const getProjectManager = (projectId: string) => {
    const t = tasks.find(t => t.project_id === projectId && t.assignee_id);
    return t ? users.find(u => u.id === t.assignee_id) : undefined;
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="breadcrumb">OBSIDIAN EXECUTIVE / <strong style={{ color: "var(--accent-secondary)" }}>PIPELINE CRM</strong></p>
          <h1 className="page-title">PIPELINE DE CLIENTES</h1>
          <p className="page-desc">{projects.length} cuentas activas en {STAGES.length} etapas del pipeline.</p>
        </div>
        <div className="page-header-actions">
          <button className="filter-btn">⊟  FILTRAR</button>
          <button className="btn-primary" style={{ fontSize: 10, padding: "7px 16px" }}>+ NUEVO CLIENTE</button>
        </div>
      </div>

      <div className="page-body">
        <div className="crm-pipeline">
          {stageProjects.map(stage => (
            <div key={stage.id} className="crm-stage">
              <div className="crm-stage-hd">
                <span className="crm-stage-icon">{stage.icon}</span>
                <span className="crm-stage-label">{stage.label}</span>
                <span className="crm-stage-count">{stage.projects.length}</span>
              </div>

              <div className="crm-cards">
                {stage.projects.map(proj => {
                  const projTasks = tasks.filter(t => t.project_id === proj.id);
                  const done = projTasks.filter(t => t._ui_column === "completed").length;
                  const pct = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0;
                  const manager = getProjectManager(proj.id);

                  return (
                    <div key={proj.id} className="crm-card">
                      <div className="crm-card-top">
                        <div className="crm-key" style={{ color: PRIORITY_COLOR[proj.priority] }}>{proj.key}</div>
                        <span className="badge" style={{ background: `${PRIORITY_COLOR[proj.priority]}18`, color: PRIORITY_COLOR[proj.priority], fontSize: 9 }}>
                          {PRIORITY_LABEL[proj.priority]}
                        </span>
                      </div>

                      <div className="crm-card-name">{proj.name}</div>

                      <div className="crm-card-stats">
                        <div className="crm-stat">
                          <span className="crm-stat-val">{projTasks.length}</span>
                          <span className="crm-stat-lbl">TAREAS</span>
                        </div>
                        <div className="crm-stat">
                          <span className="crm-stat-val">{done}</span>
                          <span className="crm-stat-lbl">COMPLETADAS</span>
                        </div>
                        <div className="crm-stat">
                          <span className="crm-stat-val" style={{ color: pct >= 80 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#f87171" }}>{pct}%</span>
                          <span className="crm-stat-lbl">PROGRESO</span>
                        </div>
                      </div>

                      <div className="proj-bar-track" style={{ marginBottom: 10 }}>
                        <div className="proj-bar-fill" style={{ width: `${pct}%`, background: PRIORITY_COLOR[proj.priority] }} />
                      </div>

                      <div className="crm-card-footer">
                        {manager ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div className="avatar" style={{ background: manager.avatar_color, width: 20, height: 20, fontSize: 8 }}>{manager.initials}</div>
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{manager.name.split(" ")[0]}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>Sin gestor</span>
                        )}
                        <button className="crm-detail-btn">VER →</button>
                      </div>
                    </div>
                  );
                })}

                {stage.projects.length === 0 && (
                  <div className="crm-empty">Sin clientes en esta etapa</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
