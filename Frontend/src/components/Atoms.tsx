import type { User, Priority } from "./types";
import { PRIORITY_CFG } from "./constants";

export function Avatar({ user, size = 28 }: { user: User; size?: number }) {
  if (!user) return null;
  
  // URL de la imagen en el backend (puerto 3000) con cache-buster
  const avatarUrl = `http://localhost:3000/api/users/${user.id}/avatar?v=${user.avatar_updated_at || 'initial'}`;

  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.34, background: user.avatar_color, overflow: 'hidden' }}>
      {user.hasAvatar ? (
        <img 
          src={avatarUrl} 
          alt={user.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            // Fallback si la imagen no carga por alguna razón
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        user.initials
      )}
    </div>
  );
}

export function PriorityBadge({ priority, isNew }: { priority: Priority; isNew?: boolean }) {
  const cfg = isNew ? PRIORITY_CFG.new : (PRIORITY_CFG[priority] || PRIORITY_CFG.medium);
  return (
    <span className={`badge ${cfg.rootClass}`}>
      {cfg.dot && <span className="badge-dot">●</span>}
      {cfg.label}
    </span>
  );
}
