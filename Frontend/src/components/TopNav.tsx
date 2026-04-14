import { Avatar } from "./Atoms";
import { useData } from "../context/DataContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

export default function TopNav({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { currentUser, logout, refreshCurrentUser } = useData();
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
    logout();
    navigate("/login");
  };

  const handleAvatarClick = () => {
    document.getElementById("avatar-upload")?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      await authService.uploadAvatar(currentUser.id, file);
      // Actualizamos el estado para que sepa que tiene avatar
      refreshCurrentUser({ hasAvatar: true });
    } catch (err) {
      alert("Error al subir el avatar");
      console.error(err);
    }
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
        <div className="topnav-user">
          <div className="topnav-user-name" style={{ textAlign: "right", marginRight: "12px" }}>
            <p className="user-title">{currentUser?.name}</p>
            <p className="user-subtitle">
              {currentUser ? (roleLabels[currentUser.role] || currentUser.role) : "Guest"}
            </p>
          </div>

          {currentUser && (
            <div 
              className="avatar-interactive-wrapper" 
              onClick={handleAvatarClick}
              title="Haz clic para actualizar tu avatar"
              style={{ cursor: "pointer", position: "relative" }}
            >
              <Avatar user={currentUser} size={34} />
              <div className="avatar-edit-overlay">✎</div>
              <input 
                type="file" 
                id="avatar-upload" 
                hidden 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
