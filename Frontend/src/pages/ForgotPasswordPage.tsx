import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    identity: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError("");
    setSubmitted(true);
    // Simulation: in a real app, this would call an API
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
        {!submitted ? (
          <>
            <div className="login-card-header">
              <h1 className="login-card-title">Reiniciar Contraseña</h1>
              <p className="login-card-subtitle">Ingresa tus datos para establecer una nueva clave de acceso.</p>
            </div>

            {error && <div className="login-error">{error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-input-group">
                <label className="login-label">USUARIO O EMAIL</label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon">👤</span>
                  <input 
                    type="text" 
                    className="login-input" 
                    placeholder="alexander.thorne" 
                    value={userData.identity}
                    onChange={(e) => setUserData({...userData, identity: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="login-grid">
                <div className="login-input-group">
                  <label className="login-label">NUEVA CONTRASEÑA</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon">🔒</span>
                    <input 
                      type="password" 
                      className="login-input" 
                      placeholder="••••••••" 
                      value={userData.password}
                      onChange={(e) => setUserData({...userData, password: e.target.value})}
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
                      value={userData.confirmPassword}
                      onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="login-btn">
                Guardar Nueva Contraseña <span style={{fontSize: 18}}>→</span>
              </button>
            </form>
          </>
        ) : (
          <div className="login-card-header" style={{margin: 0}}>
            <div style={{fontSize: 48, marginBottom: 20}}>✅</div>
            <h1 className="login-card-title">Contraseña Actualizada</h1>
            <p className="login-card-subtitle">
              Se ha establecido la nueva contraseña para <strong>{userData.identity}</strong> correctamente.
            </p>
            <Link to="/login" className="login-btn" style={{marginTop: 32, textDecoration: 'none'}}>
              Volver al Inicio
            </Link>
          </div>
        )}

        <div className="login-footer-links" style={{marginTop: 32}}>
          <Link to="/login" className="login-link">← Volver al login</Link>
        </div>
      </main>

      <footer className="login-page-footer">
        <p className="login-copyright">© 2024 THE KINETIC COMMAND. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
