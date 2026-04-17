export type UserRole = "executive" | "manager" | "member";
export type Workload = "available" | "critical" | "busy";
export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "archived";
export type TaskType = "task" | "subtask" | "bug" | "feature";
export type UIColumn = "assigned" | "completed" | "pending";
export type PageId = "dashboard" | "tasks" | "crm" | "analytics" | "team" | "config" | "new-task";

export interface Organization { id: string; name: string; tier: string; }
export interface User { id: string; name: string; username?: string; password?: string; initials: string; role: UserRole; avatar_color: string; workload: Workload; email: string; status: string; hasAvatar?: boolean; avatar_updated_at?: number; }
export interface Project { id: string; name: string; key: string; priority: Priority; }
export interface Tag { id: string; project_id: string; name: string; color: string; }
export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  User?: Pick<User, "id" | "name" | "email">;
}

export interface Task {
  id: string; project_id: string; sprint_id: string | null; assignee_id: string | null;
  parent_task_id: string | null; project_sequence: number; type: TaskType;
  title: string; description: string; status: TaskStatus; priority: Priority;
  position: number; estimated_min: number | null; due_date: string | null;
  completed_at: string | null; _ui_column: UIColumn; _extra_assignees: string[];
  tags: string[]; _archived_label?: string;
}

export interface PriorityCfgEntry { label: string; rootClass: string; dot: boolean; }
export interface WorkloadCfgEntry { label: string; color: string; }
