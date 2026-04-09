import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function LoginPage() {
  const { login } = useData();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    const success = login(username, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      
      <header className="login-header">
        <div className="login-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
        </div>
        <div className="login-logo-text">COMMAND</div>
      </header>

      <button className="theme-toggle-login" onClick={toggleDarkMode}>
        <span>{isDark ? "☼" : "☾"}</span>
      </button>

      <main className="login-card">
        <div className="login-card-header">
          <h1 className="login-card-title">Bienvenido al Sistema</h1>
          <p className="login-card-subtitle">Ingresa tus credenciales para acceder a la arquitectura.</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label className="login-label">USUARIO</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">👤</span>
              <input 
                type="text" 
                className="login-input" 
                placeholder="nombre.apellido" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-label">CONTRASEÑA</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input 
                type="password" 
                className="login-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar Sesión"} 
            {!loading && <span style={{fontSize: 18}}>→</span>}
          </button>
        </form>

        <div className="login-footer-links">
          <a href="#" className="login-link">¿Olvidaste tu contraseña?</a>
          <p className="login-link muted">¿No tienes una cuenta? <a href="#" className="login-link"><span>Crear una cuenta</span></a></p>
        </div>
      </main>

      <footer className="login-page-footer">
        <nav className="login-footer-nav">
          <a href="#" className="login-footer-nav-link">Privacy Policy</a>
          <a href="#" className="login-footer-nav-link">Terms of Service</a>
          <a href="#" className="login-footer-nav-link">Security Architecture</a>
        </nav>
        <p className="login-copyright">© 2024 THE KINETIC COMMAND. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
