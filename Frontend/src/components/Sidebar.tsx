import { NavLink, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: ()=>void }) {
  const { organization } = useData();
  const navigate = useNavigate();

  const nav = [
    { path: "/dashboard", icon: "⊞", label: "ESCRITORIO" },
    { path: "/tasks",     icon: "☰", label: "TAREAS" },
    { path: "/crm",       icon: "◈", label: "PIPELINE CRM" },
    { path: "/analytics", icon: "∿", label: "ANALÍTICAS" },
    { path: "/team",      icon: "◎", label: "EQUIPO" },
    { path: "/config",    icon: "⚙", label: "CONFIGURACIÓN" },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen?'open':''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen?'open':''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">⌘</div>
          <div className="sidebar-logo-text">
            <div>{organization?.name || "COMMAND"}</div>
            <div className="tier">{organization?.tier || "TIER"}</div>
          </div>
        </div>

        <div style={{ padding: "0 12px 16px" }}>
          <button className="sidebar-cta" onClick={() => { navigate("/tasks/new"); onClose(); }}>
            <span className="sidebar-cta-icon">+</span>
            <span className="sidebar-cta-text">NUEVA SOLICITUD</span>
          </button>
        </div>

        <nav style={{ flex: 1, padding: "0 8px" }}>
          {nav.map(item => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {[["?", "Ayuda"], ["→", "Cerrar Sesión"]].map(([icon, label]) => (
            <button key={label} className="bottom-btn">
              <span>{icon}</span> <span className="sidebar-bottom-label">{label}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
