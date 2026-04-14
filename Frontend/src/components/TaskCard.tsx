import type { Task, User, Tag } from "./types";
import { PriorityBadge, Avatar } from "./Atoms";
import { useData } from "../context/DataContext";

export default function TaskCard({ task, onAssign }: { task: Task; onAssign: (t: Task) => void }) {
  const { getProjectById, getUserById, getTagById } = useData();

  const project  = getProjectById(task.project_id);
  const assignee = task.assignee_id ? getUserById(task.assignee_id) : undefined;
  const extras   = (task._extra_assignees || []).map(getUserById).filter((u): u is User => u !== undefined);
  const tags     = (task.tags || []).map(getTagById).filter((t): t is Tag => t !== undefined);
  const isCompleted = task._ui_column === "completed";
  const isPending   = task._ui_column === "pending";
  const isNew       = isPending && !task.assignee_id && task.priority !== "urgent";

  let daysLeft: number | null = null;
  if (task.due_date && !isCompleted) {
    daysLeft = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / 86400000);
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
    // Añadimos una clase temporal al body o directamente manejamos estilos
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.classList.add("dragging");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) e.target.classList.remove("dragging");
  };

  return (
    <div 
      className={`task-card ${isCompleted ? 'completed' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="card-top">
        {isCompleted
          ? <span className="card-completed-badge"><span className="check">✓</span> COMPLETADO</span>
          : <PriorityBadge priority={task.priority} isNew={isNew} />
        }
        <button className="card-dots">···</button>
      </div>

      <p className="card-title">{task.title}</p>
      {task.description && (
        <p className="card-description">{task.description}</p>
      )}

      <div className={`card-project ${tags.length ? 'mb-8' : 'mb-12'}`}>
        <div className="proj-icon">■</div>
        <span className="proj-name">{project?.name?.toUpperCase()}</span>
      </div>

      {tags.length > 0 && (
        <div className="card-tags">
          {tags.map((tag: Tag) => (
            <span key={tag.id} className="tag" style={{ background: `${tag.color}22`, color: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="card-avatars">
          {assignee && <Avatar user={assignee} size={26} />}
          {extras.map((u: User) => <div key={u.id} className="avatar-stack"><Avatar user={u} size={26} /></div>)}
          {!assignee && !isPending && <div className="avatar-placeholder">?</div>}
        </div>

        {isCompleted && task._archived_label && (
          <div className="card-meta"><span>◻</span> ARCHIVADO · {task._archived_label}</div>
        )}
        {!isCompleted && daysLeft !== null && (
          <span className={`days-left ${daysLeft < 7 ? 'urgent' : ''}`}>VENCE EN {daysLeft}D</span>
        )}
        {isPending && (
          <button className="assign-btn" onClick={() => onAssign(task)}>
            <span>◎</span> ASIGNAR AHORA
          </button>
        )}
      </div>
    </div>
  );
}
