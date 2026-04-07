import type { PageId } from "./types";
import { useData } from "./DataContext";

export default function Sidebar({ activePage, setActivePage, isOpen, onClose }: { activePage: PageId, setActivePage: (p:PageId)=>void, isOpen: boolean, onClose: ()=>void }) {
  const { organization } = useData();

  const nav: { id: PageId; icon: string; label: string }[] = [
    { id: "dashboard", icon: "⊞", label: "ESCRITORIO" },
    { id: "tasks",     icon: "☰", label: "TAREAS" },
    { id: "crm",       icon: "◈", label: "PIPELINE CRM" },
    { id: "analytics", icon: "∿", label: "ANALÍTICAS" },
    { id: "team",      icon: "◎", label: "EQUIPO" },
    { id: "config",    icon: "⚙", label: "CONFIGURACIÓN" },
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
          <button className="sidebar-cta" onClick={() => { setActivePage("new-task"); onClose(); }}>
            <span className="sidebar-cta-icon">+</span>
            <span className="sidebar-cta-text">NUEVA SOLICITUD</span>
          </button>
        </div>

        <nav style={{ flex: 1, padding: "0 8px" }}>
          {nav.map(item => (
            <button key={item.id} className={`nav-btn ${activePage === item.id ? 'active' : ''}`} onClick={() => { setActivePage(item.id); onClose(); }}>
              <span className="nav-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
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
