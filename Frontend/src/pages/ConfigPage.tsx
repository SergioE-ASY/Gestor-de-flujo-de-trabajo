import { useData } from "../context/DataContext";

const ROLE_LABEL: Record<string, string>     = { executive: "Ejecutivo", manager: "Gerente", member: "Miembro" };
const WORKLOAD_COLOR: Record<string, string> = { available: "#34d399", busy: "#fbbf24", critical: "#f87171" };

export default function ConfigPage() {
  const { organization, users, currentUser } = useData();

  const sections = [
    { id: "org",   label: "⊞  ORGANIZACIÓN" },
    { id: "users", label: "◎  USUARIOS" },
    { id: "notif", label: "⊡  NOTIFICACIONES" },
    { id: "sec",   label: "◈  SEGURIDAD" },
    { id: "api",   label: "⟳  INTEGRACIONES API" },
  ];

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="breadcrumb">OBSIDIAN EXECUTIVE / <strong style={{ color: "var(--accent-secondary)" }}>CONFIGURACIÓN</strong></p>
          <h1 className="page-title">CONFIGURACIÓN</h1>
          <p className="page-desc">Gestión de la organización, usuarios y preferencias del sistema.</p>
        </div>
      </div>

      <div className="page-body">
        <div className="config-layout">
          {/* Menú lateral */}
          <div className="config-nav">
            {sections.map(s => (
              <button key={s.id} className={`config-nav-btn ${s.id === "org" ? "active" : ""}`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Contenido */}
          <div className="config-content">
            {/* Sección Organización */}
            <div className="config-section">
              <div className="config-section-title">Información de la Organización</div>
              <div className="config-field-grid">
                <div className="config-field">
                  <label className="form-label">NOMBRE</label>
                  <div className="config-input-wrap">
                    <input className="form-input" defaultValue={organization?.name || "COMMAND"} readOnly />
                  </div>
                </div>
                <div className="config-field">
                  <label className="form-label">NIVEL</label>
                  <div className="config-input-wrap">
                    <input className="form-input" defaultValue={organization?.tier || "TIER EJECUTIVO"} readOnly />
                  </div>
                </div>
                <div className="config-field">
                  <label className="form-label">ID DE ORGANIZACIÓN</label>
                  <div className="config-input-wrap">
                    <input className="form-input" defaultValue={organization?.id || "org-001"} readOnly style={{ fontFamily: "'DM Mono',monospace", fontSize: 12 }} />
                  </div>
                </div>
                <div className="config-field">
                  <label className="form-label">ESTADO</label>
                  <div className="form-input" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
                    <span style={{ fontSize: 12, color: "#34d399", fontFamily: "'DM Mono',monospace" }}>ACTIVO</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="config-divider" />

            {/* Usuarios */}
            <div className="config-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="config-section-title" style={{ marginBottom: 0 }}>Usuarios del Sistema</div>
                <button className="btn-primary" style={{ fontSize: 10, padding: "6px 14px" }}>+ AÑADIR</button>
              </div>
              <div className="config-user-list">
                {users.map(user => (
                  <div key={user.id} className={`config-user-row ${user.id === currentUser?.id ? "current" : ""}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="avatar" style={{ background: user.avatar_color, width: 34, height: 34, fontSize: 12 }}>{user.initials}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-heading)" }}>
                          {user.name}
                          {user.id === currentUser?.id && <span className="badge-primary" style={{ marginLeft: 8 }}>TÚ</span>}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>
                          {ROLE_LABEL[user.role]} · {user.id}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 9, color: WORKLOAD_COLOR[user.workload ?? "available"] ?? "#34d399", fontFamily: "'DM Mono',monospace" }}>
                        ● {(user.workload ?? "available").toUpperCase()}
                      </span>
                      <button className="crm-detail-btn">EDITAR</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="config-divider" />

            {/* Preferencias */}
            <div className="config-section">
              <div className="config-section-title">Preferencias del Sistema</div>
              <div className="config-toggle-list">
                {[
                  { label: "Notificaciones de vencimientos", sub: "Alerta 24h antes del plazo", on: true },
                  { label: "Asignación automática sugerida", sub: "IA propone el mejor candidato", on: false },
                  { label: "Modo de auditoría", sub: "Registra todos los cambios", on: true },
                  { label: "Actualizaciones en tiempo real", sub: "Sincronización con WebSocket", on: false },
                ].map(pref => (
                  <div key={pref.label} className="config-toggle-row">
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-body)", marginBottom: 2 }}>{pref.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono',monospace" }}>{pref.sub}</div>
                    </div>
                    <div className={`config-toggle ${pref.on ? "on" : ""}`}>
                      <div className="config-toggle-thumb" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
