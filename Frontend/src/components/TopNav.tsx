import { Avatar } from "./Atoms";
import { useData } from "../context/DataContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TopNav({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { currentUser, logout } = useData();
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    console.log("handleLogout called in TopNav");
    logout();
    navigate("/login");
  };

  const roleLabels: Record<string, string> = {
    executive: "Chief Executive",
    manager: "Project Manager",
    member: "Team Specialist"
  };

  return (
    <div className="topnav">
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button className="hamburger-btn" onClick={onMenuToggle}>☰</button>
        <div className="brand">
          <span className="brand-primary">OBSIDIAN</span>
          <span className="brand-secondary">EXECUTIVE</span>
        </div>
      </div>

      <div className="topnav-search">
        <span style={{ fontSize: 12, color: "var(--text-body)" }}>⌕</span>
        <span style={{ fontSize: 11, color: "var(--text-body)" }}>BUSCAR ACTIVOS...</span>
      </div>

      <div className="topnav-links">
        {["MIS TAREAS", "REPORTES", "FEED DE CLIENTES"].map((l, i) => (
          <button key={l} className={`tab-btn ${i === 1 ? 'active' : ''}`}>{l}</button>
        ))}
      </div>

      <div className="topnav-right">
        <button className="icon-btn" onClick={toggleDarkMode} title="Modo Oscuro/Claro">
          {isDark ? "☀️" : "🌙"}
        </button>
        <button className="icon-btn" style={{position:"relative"}}>
          🔔
          <span className="notif-dot" />
        </button>
        <button 
          className="icon-btn" 
          onClick={handleLogout} 
          data-tooltip="Cerrar Sesión"
          style={{ fontSize: '18px', padding: '4px' }}
        >
          🚪
        </button>
        <div className="topnav-user">
          {currentUser && <Avatar user={currentUser} size={30} />}
          <div className="topnav-user-name">
            <p className="user-title">{currentUser?.name}</p>
            <p className="user-subtitle">{currentUser ? roleLabels[currentUser.role] : "Guest"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
