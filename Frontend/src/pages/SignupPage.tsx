import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

export default function SignupPage() {
  const { signup } = useData();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
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

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    const result = await signup({
      name: formData.name,
      username: formData.username,
      password: formData.password
    });

    if (result) {
      navigate("/dashboard");
    } else {
      setError("Hubo un problema al crear la cuenta. Inténtelo de nuevo.");
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
          <h1 className="login-card-title">Crear Cuenta</h1>
          <p className="login-card-subtitle">Únete a la arquitectura de gestión más avanzada.</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-grid">
            <div className="login-input-group">
              <label className="login-label">NOMBRE COMPLETO</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">📝</span>
                <input 
                  type="text" 
                  className="login-input" 
                  placeholder="Juan Pérez" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="login-label">USUARIO</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">👤</span>
                <input 
                  type="text" 
                  className="login-input" 
                  placeholder="juan.perez" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="login-label">CONFIRMAR CONTRASEÑA</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🛡️</span>
                <input 
                  type="password" 
                  className="login-input" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? "Creando Arquitectura..." : "Crear Mi Cuenta"} 
            {!loading && <span style={{fontSize: 18}}>→</span>}
          </button>

          <div className="login-footer-links">
            <p className="login-link muted">¿Ya tienes cuenta? <Link to="/login" className="login-link"><span>Iniciar Sesión</span></Link></p>
            <Link to="/login" className="login-link" style={{marginTop: 8, opacity: 0.8, fontSize: '11px'}}>← Volver al inicio</Link>
          </div>
        </form>

        
      </main>

      <footer className="login-page-footer">
        <p className="login-copyright">© 2024 THE KINETIC COMMAND. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
