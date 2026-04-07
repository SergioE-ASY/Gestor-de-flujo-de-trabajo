import type { Task, User, Project, Tag, Organization } from "./components/types";

const API_URL = "http://localhost:3001";

export async function fetchAllData() {
  const [usersRes, projectsRes, tagsRes, tasksRes, orgRes] = await Promise.all([
    fetch(`${API_URL}/users`),
    fetch(`${API_URL}/projects`),
    fetch(`${API_URL}/tags`),
    fetch(`${API_URL}/tasks`),
    fetch(`${API_URL}/organization`),
  ]);

  const users: User[] = await usersRes.json();
  const projects: Project[] = await projectsRes.json();
  const tags: Tag[] = await tagsRes.json();
  const tasks: Task[] = await tasksRes.json();
  const organization: Organization = await orgRes.json();

  return { users, projects, tags, tasks, organization };
}

export async function createTask(task: Task): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function updateTask(id: string, payload: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
