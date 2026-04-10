import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import "../styles/TaskManager.css";
import type { Task } from "./types";
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
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import { fetchAllData, updateTask, createTask } from "../api";
import { DataProvider, useData } from "../context/DataContext";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useData();
  const { pathname } = useLocation();
  
  // Normalize pathname to remove trailing slashes for comparison
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 
    ? pathname.slice(0, -1) 
    : pathname;

  const publicPaths = ["/login", "/signup", "/forgot-password"];
  const isPublic = publicPaths.includes(normalizedPath);

  console.log(`[AuthGuard] User: ${currentUser?.username || 'None'} | Path: ${normalizedPath} | Public: ${isPublic}`);

  // 1. If not logged in and trying to access private area -> Redirect to Login
  if (!currentUser && !isPublic) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in and trying to access Auth pages -> Redirect to Dashboard
  if (currentUser && isPublic) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Otherwise, allow access
  return <>{children}</>;
}

function MainApp({ dbData }: { dbData: any }) {
  const [tasks, setTasks] = useState<Task[]>(dbData.tasks);
  const [assignTarget, setAssign] = useState<Task | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleAssignConfirm = async ({ taskId, assignee_id, estimated_min, due_date }: any) => {
    try {
      const payload = { assignee_id, estimated_min, due_date, _ui_column: "assigned" as any, status: "in_progress" as any };
      await updateTask(taskId, payload);
      // Merge instead of replace to avoid losing fields the API doesn't return
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...payload } : t));
      setAssign(null);
    } catch (err) {
      console.error(err);
      alert("Error updating task");
    }
  };

  const handleTaskMove = async (taskId: string, targetCol: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task._ui_column === targetCol) return;

    if (targetCol === "assigned" && !task.assignee_id) {
      setAssign(task);
      return;
    }

    const statusMap: Record<string, string> = {
      assigned: "in_progress",
      completed: "done",
      pending: "todo",
    };

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, _ui_column: targetCol } : t));

    try {
      const patch = { _ui_column: targetCol, status: statusMap[targetCol] as any };
      await updateTask(taskId, patch);
      // Merge instead of replace — the PATCH response may omit fields like tags/_extra_assignees
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...patch } : t));
    } catch (err) {
      console.error(err);
      setTasks(prev => prev.map(t => t.id === taskId ? task : t));
      alert("Error al mover la tarea");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopNav onMenuToggle={() => setSidebarOpen(true)} />

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage tasks={tasks} />} />
            <Route path="/tasks" element={<KanbanBoard tasks={tasks} onAssign={setAssign} onTaskMove={handleTaskMove} />} />
            <Route path="/tasks/new" element={<NewTaskForm onCreate={async (t: Task) => { 
                try {
                  const saved = await createTask(t);
                  setTasks([...tasks, saved]); 
                  navigate("/tasks"); 
                } catch(e) {
                  console.error(e);
                  alert("Failed to create task");
                }
            }} />} />
            <Route path="/crm" element={<CrmPage tasks={tasks} />} />
            <Route path="/analytics" element={<AnalyticsPage tasks={tasks} />} />
            <Route path="/team" element={<TeamPage tasks={tasks} />} />
            <Route path="/config" element={<ConfigPage />} />
          </Routes>
        </div>
      </div>

      {assignTarget && <AssignModal task={assignTarget} onClose={() => setAssign(null)} onConfirm={handleAssignConfirm} />}
    </div>
  );
}

function SessionValidator({ users }: { users: any[] }) {
  const { currentUser, logout } = useData();
  
  useEffect(() => {
    if (currentUser) {
      const userExists = users.find((u: any) => u.id === currentUser.id);
      if (!userExists) {
        console.warn("Sesión antigua detectada (no existe en DB). Limpiando...");
        logout();
      }
    }
  }, [currentUser, logout, users]);

  return null;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dbData, setDbData] = useState<any>(null);

  useEffect(() => {
    fetchAllData()
      .then((data) => {
        setDbData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading data from Backend. Ensure Node app is running on :3000.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="app-shell" style={{justifyContent:"center", alignItems:"center", color:"var(--text-dim)"}}>Cargando obsidian...</div>;
  if (error) return <div className="app-shell" style={{justifyContent:"center", alignItems:"center", color:"var(--color-error)"}}>{error}</div>;

  return (
    <DataProvider users={dbData.users} projects={dbData.projects} tags={dbData.tags} organization={dbData.organization}>
      <SessionValidator users={dbData.users} />
      <Routes>
        <Route path="/login" element={<AuthGuard><LoginPage /></AuthGuard>} />
        <Route path="/signup" element={<AuthGuard><SignupPage /></AuthGuard>} />
        <Route path="/forgot-password" element={<AuthGuard><ForgotPasswordPage /></AuthGuard>} />
        <Route path="*" element={<AuthGuard><MainApp dbData={dbData} /></AuthGuard>} />
      </Routes>
    </DataProvider>
  );
}
