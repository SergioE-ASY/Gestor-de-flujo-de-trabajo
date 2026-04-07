import { useState } from "react";
import type { Task, Priority } from "./types";
import { useData } from "./DataContext";

export default function NewTaskForm({ onCancel, onCreate }: { onCancel:()=>void; onCreate:(t:Task)=>void }) {
  const { projects, tags } = useData();
  const [form, setForm] = useState({
    title: "", description: "", project_id: projects[0]?.id || "", due_date: "", priority: "high" as Priority, tags: [] as string[],
  });

  const priorities: Priority[] = ["low", "medium", "high", "urgent"];
  const pLabels: Record<Priority, string> = { low: "BAJA", medium: "MEDIA", high: "ALTA", urgent: "URGENTE" };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onCreate({
      id: `tsk-${Date.now()}`, ...form, sprint_id: null, assignee_id: null, parent_task_id: null,
      project_sequence: 99, position: 99, estimated_min: null, status: "todo", completed_at: null,
      type: "task", _ui_column: "pending", _extra_assignees: [],
    });
  };

  return (
    <div className="newtask-shell">
      <div className="newtask-main">
        <div className="newtask-header">
          <p className="breadcrumb">PANEL DE CONTROL / TAREAS / <strong>NUEVA</strong></p>
          <h1 className="page-title">Nueva Tarea</h1>
          <p className="page-desc">Define los parámetros estratégicos para la ejecución ejecutiva.</p>
        </div>

        <div className="newtask-body">
          <div style={{ maxWidth: 580 }}>
            <div className="form-group">
              <label className="form-label">TÍTULO DE LA TAREA</label>
              <input className="form-input" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Ej: Auditoría Trimestral de Activos" />
            </div>

            <div className="form-group">
              <label className="form-label">DESCRIPCIÓN</label>
              <div className="editor-toolbar">
                {["B","I","≡","⇗","⊕"].map(t => <button key={t} className="editor-btn">{t}</button>)}
              </div>
              <textarea className="form-textarea" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Detalle los objetivos..." rows={4} />
            </div>

            <div className="newtask-grid2">
              <div className="form-group">
                <label className="form-label">CLIENTE / CUENTA CRM</label>
                <select className="form-select" value={form.project_id} onChange={e=>setForm({...form, project_id:e.target.value})}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">FECHA DE VENCIMIENTO</label>
                <input type="date" className="form-date" value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})} />
              </div>
            </div>

            <div className="newtask-grid2">
              <div className="form-group">
                <label className="form-label">PRIORIDAD</label>
                <div className="chip-list">
                  {priorities.map(p => {
                    const sel = form.priority === p;
                    return (
                      <button key={p} onClick={()=>setForm({...form, priority: p})} className={`form-chip ${sel?'active':''}`}>
                        {pLabels[p]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ETIQUETAS</label>
                <div className="chip-list">
                  {tags.map(tag => {
                    const sel = form.tags.includes(tag.id);
                    return (
                      <button key={tag.id} onClick={()=>setForm({...form, tags: sel?form.tags.filter(t=>t!==tag.id):[...form.tags, tag.id]})} className={`tag-chip ${sel?'active':''}`} style={{'--tag-color': tag.color} as any}>
                        {tag.name} {sel && <span>✕</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="newtask-footer">
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className={`btn-primary ${!form.title?'disabled':''}`} onClick={handleSubmit} disabled={!form.title}>Crear Tarea</button>
        </div>
      </div>

      <div className="newtask-rightpanel">
        <div className="side-card">
          <p className="side-label">RESUMEN EJECUTIVO</p>
          <div className="side-row"><span>Impacto</span><span className="txt-green">Alto</span></div>
          <div className="side-row"><span>Tiempo</span><span className="txt-white">4-6 Horas</span></div>
        </div>
        <div className="side-card">
          <div className="ai-header">
            <div className="ai-icon">◈</div>
            <span>ASISTENTE OBSIDIAN</span>
          </div>
          <p className="ai-text">{form.title ? "Asignar a Marcos V. como revisor." : "Completa el título para sugerencias."}</p>
        </div>
      </div>
    </div>
  );
}
