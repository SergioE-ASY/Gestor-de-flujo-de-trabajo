import { useState } from "react";
import type { Task, User, Tag, Comment } from "./types";
import { PriorityBadge, Avatar } from "./Atoms";
import { useData } from "../context/DataContext";
import { fetchTaskComments, createTaskComment } from "../api";

export default function TaskCard({ task, onAssign }: { task: Task; onAssign: (t: Task) => void }) {
  const { getProjectById, getUserById, getTagById, currentUser } = useData();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [savingComment, setSavingComment] = useState(false);

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

  const handleToggleComments = async () => {
    const nextVisible = !showComments;
    setShowComments(nextVisible);

    if (!nextVisible || commentsLoaded || loadingComments) return;

    setLoadingComments(true);
    setCommentsError("");
    try {
      const loadedComments = await fetchTaskComments(task.id);
      setComments(loadedComments);
      setCommentsLoaded(true);
    } catch (error) {
      console.error(error);
      setCommentsError("No se pudieron cargar los comentarios");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    const content = newComment.trim();
    if (!content || !currentUser?.id || savingComment) return;

    setSavingComment(true);
    setCommentsError("");
    try {
      const created = await createTaskComment({
        task_id: task.id,
        user_id: currentUser.id,
        content,
      });
      setComments(prev => [...prev, { ...created, User: { id: currentUser.id, name: currentUser.name, email: currentUser.email } }]);
      setNewComment("");
      setCommentsLoaded(true);
      setShowComments(true);
    } catch (error) {
      console.error(error);
      setCommentsError("No se pudo crear el comentario");
    } finally {
      setSavingComment(false);
    }
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

      <div className="card-comments" onClick={(e) => e.stopPropagation()}>
        <button
          className="comments-toggle-btn"
          type="button"
          onClick={handleToggleComments}
        >
          {showComments ? "Ocultar comentarios" : "Ver comentarios"}
          <span className="comments-count">{comments.length}</span>
        </button>

        {showComments && (
          <div className="comments-panel">
            {loadingComments && <p className="comments-info">Cargando comentarios...</p>}
            {!loadingComments && comments.length === 0 && !commentsError && (
              <p className="comments-info">Sin comentarios todavía.</p>
            )}
            {commentsError && <p className="comments-error">{commentsError}</p>}

            {comments.length > 0 && (
              <div className="comments-list">
                {comments.map((comment) => {
                  const author = comment.User?.name || getUserById(comment.user_id)?.name || "Usuario";
                  return (
                    <div key={comment.id} className="comment-item">
                      <p className="comment-author">{author}</p>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="comments-form">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={currentUser ? "Escribe un comentario..." : "Inicia sesión para comentar"}
                className="comment-input"
                disabled={!currentUser || savingComment}
              />
              <button
                type="button"
                className="comment-send-btn"
                onClick={handleAddComment}
                disabled={!currentUser || savingComment || !newComment.trim()}
              >
                {savingComment ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
