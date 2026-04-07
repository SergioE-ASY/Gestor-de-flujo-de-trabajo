import type { User, Priority } from "./types";
import { PRIORITY_CFG } from "./constants";

export function Avatar({ user, size = 28 }: { user: User; size?: number }) {
  if (!user) return null;
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.34, background: user.avatar_color }}>
      {user.initials}
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
