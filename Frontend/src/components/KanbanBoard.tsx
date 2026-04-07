import type { Task, UIColumn } from "./types";
import TaskCard from "./TaskCard";

export default function KanbanBoard({ tasks, onNewTask, onAssign }: { tasks: Task[]; onNewTask:()=>void; onAssign:(t:Task)=>void }) {
  const columns: { id: UIColumn; label: string; items: Task[] }[] = [
    { id: "assigned",  label: "TAREAS ASIGNADAS",     items: tasks.filter(t => t._ui_column === "assigned") },
    { id: "completed", label: "TAREAS COMPLETADAS",    items: tasks.filter(t => t._ui_column === "completed") },
    { id: "pending",   label: "PENDIENTES DE ASIGNAR", items: tasks.filter(t => t._ui_column === "pending") },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
      <header className="kanban-header">
        <div className="kanban-header-top">
          <div>
            <p className="breadcrumb">OBSIDIAN EXECUTIVE / MIS TAREAS / <strong style={{color:"var(--accent-secondary)"}}>REPORTES</strong></p>
            <h1 className="page-title">PANEL DE CONTROL DE TAREAS</h1>
            <p className="page-desc">Gestionando {tasks.length} mandatos activos en {columns.length} divisiones estratégicas.</p>
          </div>
          <div className="kanban-filters">
            {["⊟  FILTRAR", "↑↓  PRIORIDAD"].map(label => (
              <button key={label} className="filter-btn">{label}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="kanban-columns">
        {columns.map((col) => (
          <div key={col.id} className="kanban-column">
            <div className="col-header">
              <span className="col-label">{col.label}</span>
              <span className="col-count">/ {String(col.items.length).padStart(2, "0")}</span>
            </div>
            <div className="col-items">
              {col.items.map(task => <TaskCard key={task.id} task={task} onAssign={onAssign} />)}
              {col.id === "pending" && <button className="add-col-btn">+ AÑADIR TAREA</button>}
            </div>
          </div>
        ))}
      </div>

      <button className="fab" onClick={onNewTask}>+</button>
    </div>
  );
}
