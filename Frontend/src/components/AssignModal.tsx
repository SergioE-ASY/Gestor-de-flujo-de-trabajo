import { useState } from "react";
import type { Task } from "./types";
import { PriorityBadge, Avatar } from "./Atoms";
import { useData } from "./DataContext";
import { WORKLOAD_CFG } from "./constants";

export default function AssignModal({ task, onClose, onConfirm }: { task: Task; onClose:()=>void; onConfirm:(payload:any)=>void }) {
  const { users, currentUser, getProjectById } = useData();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [hours, setHours] = useState(16);
  const [dueDate, setDueDate] = useState("2024-11-24");
  const project = getProjectById(task.project_id);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Confirmar Asignación</h2>
            <p className="modal-subtitle">Configurando parámetros finales</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-task">
            <div className="modal-task-icon">◻</div>
            <div className="modal-task-info">
              <div className="modal-grid2" style={{marginBottom:8}}>
                <div>
                  <p className="meta-label">TAREA</p>
                  <p className="meta-value">{task.title}</p>
                </div>
                <div>
                  <p className="meta-label">CLIENTE</p>
                  <p className="meta-value muted">{project?.name}</p>
                </div>
              </div>
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          <div>
            <div className="modal-row" style={{marginBottom:8}}>
              <p className="section-title">Asignar Profesional</p>
            </div>
            <div className="modal-grid2">
              {users.filter(u => u.id !== currentUser?.id).map(user => {
                const wl = WORKLOAD_CFG[user.workload];
                const sel = selectedUserId === user.id;
                return (
                  <button key={user.id} className={`user-select-btn ${sel?'active':''}`} onClick={() => setSelectedUserId(user.id)}>
                    <Avatar user={user} size={30} />
                    <div style={{minWidth:0, textAlign:"left"}}>
                      <p className="user-name">{user.name}</p>
                      <p className="user-workload" style={{color: wl.color}}>{wl.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="modal-grid2" style={{gap:14}}>
            <div>
              <div className="modal-row mb-2">
                <p className="section-title">Horas</p>
                <span className="badge-primary">{hours}h</span>
              </div>
              <input type="range" min={1} max={40} value={hours} onChange={e=>setHours(Number(e.target.value))} style={{width:"100%"}} />
            </div>
            <div>
              <p className="section-title mb-2">Fecha Límite</p>
              <input type="date" className="form-date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="modal-actions">
             <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
             <button className={`btn-primary flex-2 ${!selectedUserId?'disabled':''}`} onClick={()=>selectedUserId && onConfirm({taskId:task.id, assignee_id:selectedUserId, estimated_min:hours*60, due_date:dueDate})} disabled={!selectedUserId}>Confirmar Asignación</button>
          </div>
        </div>
      </div>
    </div>
  );
}
