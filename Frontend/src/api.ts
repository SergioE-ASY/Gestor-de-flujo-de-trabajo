import type { Task, User, Project, Tag, Organization, Comment } from "./components/types";

const API_URL = "http://localhost:3000/api";

export async function fetchAllData() {
  const [usersRes, projectsRes, tagsRes, tasksRes, orgRes] = await Promise.all([
    fetch(`${API_URL}/users`),
    fetch(`${API_URL}/projects`),
    fetch(`${API_URL}/tags`),
    fetch(`${API_URL}/tasks`),
    fetch(`${API_URL}/organizations`),
  ]);

  const users: User[] = await usersRes.json();
  const projects: Project[] = await projectsRes.json();
  const tags: Tag[] = await tagsRes.json();
  const rawTasks = await tasksRes.json();
  
  // Mapear _ui_column requerido por el Kanban a partir del status PostgreSQL
  const tasks: Task[] = rawTasks.map((t: any) => {
    const st = t.status || "todo";
    const uiCol = (st === "todo" || st === "backlog") ? "pending" : (st === "in_progress" ? "assigned" : "completed");
    return { ...t, _ui_column: uiCol };
  });

  // Como organization devuelve un array, extraeremos el primero o dejaremos un fallback.
  const orgArr = await orgRes.json();
  const organization: Organization = orgArr[0] || { 
    id: "org-fallback", 
    name: "Mi Organización", 
    plan: "pro" 
  };

  return { users, projects, tags, tasks, organization };
}

export async function createTask(task: Task): Promise<Task> {
  const payload: any = { ...task };
  // Limpiar campos exclusivos de vista o autogenerables antes de postgres
  delete payload.id;
  delete payload._ui_column;
  delete payload._extra_assignees;

  // Asegurar un fallback para variables NOT NULL si frontend las manda vacías
  if (!payload.project_sequence) payload.project_sequence = Math.floor(Math.random() * 1000);

  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  const created = await res.json();
  const st = created.status || "todo";
  created._ui_column = (st === "todo" || st === "backlog") ? "pending" : (st === "in_progress" ? "assigned" : "completed");
  return created;
}

export async function updateTask(id: string, payload: Partial<Task>): Promise<Task> {
  const dbPayload = { ...payload } as any;
  delete dbPayload._ui_column;
  delete dbPayload._extra_assignees;

  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT", // Reemplazamos PATCH por PUT dado que el backend Node lo espera así
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dbPayload),
  });
  const updated = await res.json();
  const st = updated.status || "todo";
  updated._ui_column = (st === "todo" || st === "backlog") ? "pending" : (st === "in_progress" ? "assigned" : "completed");
  return updated;
}

export async function signupUser(user: User): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
}

export async function fetchTaskComments(taskId: string): Promise<Comment[]> {
  const res = await fetch(`${API_URL}/comments?task_id=${taskId}`);
  if (!res.ok) {
    throw new Error("No se pudieron cargar los comentarios");
  }
  return res.json();
}

export async function createTaskComment(payload: Pick<Comment, "task_id" | "user_id" | "content">): Promise<Comment> {
  const res = await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("No se pudo crear el comentario");
  }

  return res.json();
}
