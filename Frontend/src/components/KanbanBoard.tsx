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
          <div className="kanban-filters" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <button
              className="filter-btn"
              style={selectedProjectId === "all" && !showCreateProjectForm ? { backgroundColor: "var(--accent-primary)", color: "#000" } : {}}
              onClick={() => {
                setShowCreateProjectForm(false);
                setSelectedProjectId("all");
              }}
            >
              ⊟ TODOS LOS PROYECTOS
            </button>
            {projectOptions.map((project) => (
              <button
                key={project.id}
                className="filter-btn"
                style={selectedProjectId === project.id && !showCreateProjectForm ? { backgroundColor: "var(--accent-primary)", color: "#000" } : {}}
                onClick={() => {
                  setShowCreateProjectForm(false);
                  setSelectedProjectId(project.id);
                }}
              >
                {project.name.toUpperCase()}
              </button>
            ))}
            <button
              className="filter-btn"
              style={showCreateProjectForm ? { backgroundColor: "var(--accent-primary)", color: "#000" } : {}}
              onClick={() => setShowCreateProjectForm(true)}
            >
              + CREAR NUEVO PROYECTO
            </button>
            <button className="filter-btn" style={{ marginLeft: "auto" }}>↑↓ PRIORIDAD</button>
          </div>
        </div>
      </header>

      <div className="kanban-columns" style={showCreateProjectForm ? { display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 24 } : {}}>
        {showCreateProjectForm ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, backgroundColor: "var(--bg-secondary)", borderRadius: 8, padding: 24, width: "100%", maxWidth: 600 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8, color: "var(--text-primary)", fontWeight: 600 }}>Crear Nuevo Proyecto</h2>
            <div>
              <label className="form-label">NOMBRE DEL PROYECTO</label>
              <input
                className="form-input"
                style={{ border: "1px solid #3b82f6", outline: "none" }}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Ej: Plataforma de Ventas Q3"
              />
            </div>
            <div>
              <label className="form-label">KEY (OPCIONAL)</label>
              <input
                className="form-input"
                style={{ border: "1px solid #3b82f6", outline: "none" }}
                value={newProjectKey}
                onChange={(e) => setNewProjectKey(e.target.value)}
                placeholder="PRJ001"
                maxLength={10}
              />
            </div>
            <div>
              <label className="form-label">PRIORIDAD</label>
              <select className="form-select" value={newProjectPriority} onChange={(e) => setNewProjectPriority(e.target.value as any)} style={{ border: "1px solid #3b82f6", outline: "none" }}>
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
              style={{ height: 40, marginTop: 8 }}
            >
              {creatingProject ? "Creando..." : "Crear"}
            </button>
            {projectError && (
              <p style={{ color: "var(--color-error)", fontSize: 11 }}>{projectError}</p>
            )}
          </div>
        ) : (
          columns.map((col) => (
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
          ))
        )}
      </div>

      <button className="fab" onClick={() => navigate("/tasks/new")}>+</button>
    </div>
  );
}
