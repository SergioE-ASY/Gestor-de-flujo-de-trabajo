import { useState, useEffect } from "react";
import "../styles/TaskManager.css";
import type { PageId, Task } from "./types";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import KanbanBoard from "./KanbanBoard";
import NewTaskForm from "./NewTaskForm";
import AssignModal from "./AssignModal";
import DashboardPage from "../pages/DashboardPage";
import CrmPage from "../pages/CrmPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import TeamPage from "../pages/TeamPage";
import ConfigPage from "../pages/ConfigPage";
import { fetchAllData, updateTask, createTask } from "../api";
import { DataProvider } from "../context/DataContext";

export default function App() {
  const [page, setPage] = useState<PageId>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignTarget, setAssign] = useState<Task | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dbData, setDbData] = useState<any>(null);

  useEffect(() => {
    fetchAllData()
      .then((data) => {
        setDbData(data);
        setTasks(data.tasks);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading data. json-server may not be running.");
        setLoading(false);
      });
  }, []);

  const handleAssignConfirm = async ({ taskId, assignee_id, estimated_min, due_date }: any) => {
    try {
      const payload = { assignee_id, estimated_min, due_date, _ui_column: "assigned" as any, status: "in_progress" as any };
      const updated = await updateTask(taskId, payload);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      setAssign(null);
    } catch (err) {
      console.error(err);
      alert("Error updating task");
    }
  };

  const handleTaskMove = async (taskId: string, targetCol: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task._ui_column === targetCol) return;

    // Si se mueve a "asignadas" y no tiene responsable, abrir el modal
    if (targetCol === "assigned" && !task.assignee_id) {
      setAssign(task);
      return;
    }

    // Determinar el nuevo status según la columna destino
    const statusMap: Record<string, string> = {
      assigned: "in_progress",
      completed: "done",
      pending: "todo",
    };

    // Actualización optimista del estado local
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, _ui_column: targetCol } : t));

    try {
      const updated = await updateTask(taskId, { _ui_column: targetCol, status: statusMap[targetCol] as any });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      console.error(err);
      // Revertir en caso de error
      setTasks(prev => prev.map(t => t.id === taskId ? task : t));
      alert("Error al mover la tarea");
    }
  };

  if (loading) return <div className="app-shell" style={{justifyContent:"center", alignItems:"center", color:"var(--text-dim)"}}>Cargando obsidian...</div>;
  if (error) return <div className="app-shell" style={{justifyContent:"center", alignItems:"center", color:"var(--color-error)"}}>{error}</div>;

  return (
    <DataProvider users={dbData.users} projects={dbData.projects} tags={dbData.tags} organization={dbData.organization}>
      <div className="app-shell">
        <Sidebar activePage={page} setActivePage={setPage} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <TopNav onMenuToggle={() => setSidebarOpen(true)} />

          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {page === "tasks" && <KanbanBoard tasks={tasks} onNewTask={() => setPage("new-task")} onAssign={setAssign} onTaskMove={handleTaskMove} />}
            {page === "new-task" && <NewTaskForm onCancel={() => setPage("tasks")} onCreate={async (t: Task) => { 
                try {
                  const saved = await createTask(t);
                  setTasks([...tasks, saved]); 
                  setPage("tasks"); 
                } catch(e) {
                  console.error(e);
                  alert("Failed to create task");
                }
            }} />}
            {page === "dashboard"  && <DashboardPage tasks={tasks} />}
            {page === "crm"        && <CrmPage tasks={tasks} />}
            {page === "analytics"  && <AnalyticsPage tasks={tasks} />}
            {page === "team"       && <TeamPage tasks={tasks} />}
            {page === "config"     && <ConfigPage />}
          </div>
        </div>

        {assignTarget && <AssignModal task={assignTarget} onClose={() => setAssign(null)} onConfirm={handleAssignConfirm} />}
      </div>
    </DataProvider>
  );
}
