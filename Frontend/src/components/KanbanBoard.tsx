import type { Task, UIColumn } from "./types";
import TaskCard from "./TaskCard";

export default function KanbanBoard({ tasks, onNewTask, onAssign, onTaskMove }: { tasks: Task[]; onNewTask:()=>void; onAssign:(t:Task)=>void; onTaskMove:(taskId:string, targetCol:UIColumn)=>void }) {
  const columns: { id: UIColumn; label: string; items: Task[] }[] = [
    { id: "assigned",  label: "TAREAS ASIGNADAS",     items: tasks.filter(t => t._ui_column === "assigned") },
    { id: "completed", label: "TAREAS COMPLETADAS",    items: tasks.filter(t => t._ui_column === "completed") },
    { id: "pending",   label: "PENDIENTES DE ASIGNAR", items: tasks.filter(t => t._ui_column === "pending") },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necesario para permitir el soltado
    const target = e.currentTarget as HTMLElement;
    if (!target.classList.contains("drag-over")) {
      target.classList.add("drag-over");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e: React.DragEvent, colId: UIColumn) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onTaskMove(taskId, colId);
    }
  };

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
          <div 
            key={col.id} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
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
