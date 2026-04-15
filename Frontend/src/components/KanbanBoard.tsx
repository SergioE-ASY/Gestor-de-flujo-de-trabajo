import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Task, UIColumn, Project } from "./types";
import TaskCard from "./TaskCard";
import { useData } from "../context/DataContext";
import { createProject } from "../api";

export default function KanbanBoard({ tasks, onAssign, onTaskMove }: { tasks: Task[]; onAssign:(t:Task)=>void; onTaskMove:(taskId:string, targetCol:UIColumn)=>void }) {
  const navigate = useNavigate();
  const { projects, currentUser, organization } = useData();
  const [projectOptions, setProjectOptions] = useState<Project[]>(projects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectKey, setNewProjectKey] = useState("");
  const [newProjectPriority, setNewProjectPriority] = useState<"low" | "medium" | "high" | "critical">("high");

  useEffect(() => {
    setProjectOptions((prev) => {
      const existing = new Map(prev.map((p) => [p.id, p]));
      projects.forEach((p) => existing.set(p.id, p));
      return Array.from(existing.values());
    });
  }, [projects]);

  const filteredTasks = useMemo(
    () => (selectedProjectId === "all" ? tasks : tasks.filter((t) => t.project_id === selectedProjectId)),
    [tasks, selectedProjectId]
  );

  const columns: { id: UIColumn; label: string; items: Task[] }[] = [
    { id: "assigned",  label: "TAREAS ASIGNADAS",     items: filteredTasks.filter(t => t._ui_column === "assigned") },
    { id: "completed", label: "TAREAS COMPLETADAS",    items: filteredTasks.filter(t => t._ui_column === "completed") },
    { id: "pending",   label: "PENDIENTES DE ASIGNAR", items: filteredTasks.filter(t => t._ui_column === "pending") },
  ];

  const buildProjectKey = (name: string): string => {
    const base = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 6) || "PRJ";
    return `${base}${String(Date.now()).slice(-3)}`.slice(0, 10);
  };

  const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const handleCreateProject = async () => {
    if (!currentUser?.id || !newProjectName.trim() || creatingProject) return;

    setCreatingProject(true);
    setProjectError("");
    try {
      const key = (newProjectKey.trim().toUpperCase() || buildProjectKey(newProjectName)).slice(0, 10);
      const payload: any = {
        name: newProjectName.trim(),
        key,
        owner_id: currentUser.id,
        priority: newProjectPriority,
      };

      if (organization?.id && isUuid(organization.id)) {
        payload.organization_id = organization.id;
      }

      const created = await createProject(payload);
      setProjectOptions((prev) => [...prev, created]);
      setSelectedProjectId(created.id);
      setShowCreateProjectForm(false);
      setNewProjectName("");
      setNewProjectKey("");
      setNewProjectPriority("high");
    } catch (error: any) {
      setProjectError(error?.message || "No se pudo crear el proyecto.");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
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
            <p className="page-desc">Gestionando {filteredTasks.length} mandatos activos en {columns.length} divisiones estratégicas.</p>
          </div>
          <div className="kanban-filters">
            <select
              className="filter-btn"
              value={selectedProjectId}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "__create_project__") {
                  setShowCreateProjectForm(true);
                  return;
                }
                setShowCreateProjectForm(false);
                setSelectedProjectId(value);
              }}
            >
              <option value="all">⊟ TODOS LOS PROYECTOS</option>
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>{project.name.toUpperCase()}</option>
              ))}
              <option value="__create_project__">+ CREAR NUEVO PROYECTO</option>
            </select>
            <button className="filter-btn">↑↓ PRIORIDAD</button>
          </div>
        </div>
        {showCreateProjectForm && (
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
            <div>
              <label className="form-label">NOMBRE DEL PROYECTO</label>
              <input
                className="form-input"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Ej: Plataforma de Ventas Q3"
              />
            </div>
            <div>
              <label className="form-label">KEY (OPCIONAL)</label>
              <input
                className="form-input"
                value={newProjectKey}
                onChange={(e) => setNewProjectKey(e.target.value)}
                placeholder="PRJ001"
                maxLength={10}
              />
            </div>
            <div>
              <label className="form-label">PRIORIDAD</label>
              <select className="form-select" value={newProjectPriority} onChange={(e) => setNewProjectPriority(e.target.value as any)}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <button
              className={`btn-primary ${!newProjectName.trim() || !currentUser || creatingProject ? "disabled" : ""}`}
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || !currentUser || creatingProject}
              style={{ height: 40 }}
            >
              {creatingProject ? "Creando..." : "Crear"}
            </button>
            {projectError && (
              <p style={{ gridColumn: "1 / -1", color: "var(--color-error)", fontSize: 11 }}>{projectError}</p>
            )}
          </div>
        )}
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
              {col.id === "pending" && (
                <button className="add-col-btn" onClick={() => navigate("/tasks/new")}>
                  + AÑADIR TAREA
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="fab" onClick={() => navigate("/tasks/new")}>+</button>
    </div>
  );
}
