import { useState, useEffect, useRef } from "react";

// ── AuthModal ─────────────────────────────────────────────────────────────────
// Props:
//   initialTab  — "login" | "register"
//   onClose     — () => void
//   onLogin     — (userData) => void
// ─────────────────────────────────────────────────────────────────────────────
export default function AuthModal({ initialTab = "login", onClose, onLogin }) {
  const [tab,      setTab]      = useState(initialTab);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  // Login fields
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd]   = useState(false);

  // Register fields
  const [regName,     setRegName]     = useState("");
  const [regEmail,    setRegEmail]    = useState("");
  const [regPhone,    setRegPhone]    = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm,  setRegConfirm]  = useState("");
  const [showRegPwd,  setShowRegPwd]  = useState(false);

  const overlayRef = useRef(null);

  // Sync tab if parent changes initialTab
  useEffect(() => { setTab(initialTab); setError(""); setSuccess(""); }, [initialTab]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function switchTab(t) {
    setTab(t);
    setError("");
    setSuccess("");
  }

  // ── Login ──────────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { setError("Заповніть всі поля"); return; }
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.message || "Невірний email або пароль"); return; }

      const user = json.data;
      // Відновлюємо аватар (як в оригіналі)
      const savedAvatar = localStorage.getItem("maison_avatar_" + user._id);
      if (savedAvatar && !user.avatar) user.avatar = savedAvatar;

      onLogin(user);
    } catch {
      setError("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  }

  // ── Register ───────────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setError("Заповніть всі обов'язкові поля"); return;
    }
    if (regPassword.length < 6) { setError("Пароль мінімум 6 символів"); return; }
    if (regPassword !== regConfirm) { setError("Паролі не збігаються"); return; }

    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     regName.trim(),
          email:    regEmail.trim(),
          phone:    regPhone.trim(),
          password: regPassword,
        }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.message || "Помилка реєстрації"); return; }

      setSuccess("Реєстрація успішна! Тепер увійдіть.");
      setLoginEmail(regEmail.trim());
      setRegName(""); setRegEmail(""); setRegPhone(""); setRegPassword(""); setRegConfirm("");
      setTimeout(() => { switchTab("login"); setSuccess(""); }, 1200);
    } catch {
      setError("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay active"
      id="authModal"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="modal-box" style={{ width: "min(480px, 95vw)", padding: "2.4rem 2.2rem 2rem" }}>
        {/* Закрити */}
        <button className="modal-close" onClick={onClose} aria-label="Закрити">✕</button>

        {/* Логотип всередині модалки */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "var(--ink)", color: "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem", fontWeight: 600, letterSpacing: 1,
            marginBottom: "0.4rem",
          }}>M</div>
          <p style={{ fontSize: ".7rem", letterSpacing: "0.15em", color: "var(--ink-muted)", fontWeight: 500 }}>
            MAISON BOUTIQUE
          </p>
        </div>

        {/* Таби */}
        <div className="auth-tabs" style={{ display: "flex", borderBottom: "1px solid var(--sand)", marginBottom: "1.5rem" }}>
          <button
            className={`auth-tab${tab === "login" ? " active" : ""}`}
            data-tab="login"
            onClick={() => switchTab("login")}
          >
            Увійти
          </button>
          <button
            className={`auth-tab${tab === "register" ? " active" : ""}`}
            data-tab="register"
            onClick={() => switchTab("register")}
          >
            Реєстрація
          </button>
        </div>

        {/* Повідомлення */}
        {error   && <AuthAlert type="error"   text={error}   />}
        {success && <AuthAlert type="success" text={success} />}

        {/* ── Форма входу ── */}
        {tab === "login" && (
          <form id="loginForm" onSubmit={handleLogin} style={{ display: "grid", gap: "1rem" }}>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                id="loginEmail"
                placeholder="your@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Пароль</label>
              <div style={{ position: "relative" }}>
                <input
                  className="auth-input"
                  type={showLoginPwd ? "text" : "password"}
                  id="loginPassword"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  style={{ paddingRight: "2.8rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPwd((p) => !p)}
                  style={eyeStyle}
                  tabIndex={-1}
                >
                  {showLoginPwd ? EyeOffIcon : EyeIcon}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", marginTop: ".25rem" }}
              disabled={loading}
            >
              {loading ? <Spinner /> : "Увійти"}
            </button>

            <p style={{ textAlign: "center", fontSize: ".82rem", color: "var(--ink-muted)", marginTop: ".25rem" }}>
              Немає акаунту?{" "}
              <button
                type="button"
                onClick={() => switchTab("register")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", textDecoration: "underline", fontSize: "inherit" }}
              >
                Зареєструватись
              </button>
            </p>
          </form>
        )}

        {/* ── Форма реєстрації ── */}
        {tab === "register" && (
          <form id="registerForm" onSubmit={handleRegister} style={{ display: "grid", gap: "1rem" }}>
            <div className="auth-field">
              <label className="auth-label">Ім'я *</label>
              <input
                className="auth-input"
                type="text"
                id="regName"
                placeholder="Ваше ім'я"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Email *</label>
              <input
                className="auth-input"
                type="email"
                id="regEmail"
                placeholder="your@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Телефон</label>
              <input
                className="auth-input"
                type="tel"
                id="regPhone"
                placeholder="+380 00 000 00 00"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                disabled={loading}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="auth-field">
                <label className="auth-label">Пароль *</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="auth-input"
                    type={showRegPwd ? "text" : "password"}
                    id="regPassword"
                    placeholder="Мін. 6 символів"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                    style={{ paddingRight: "2.8rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPwd((p) => !p)}
                    style={eyeStyle}
                    tabIndex={-1}
                  >
                    {showRegPwd ? EyeOffIcon : EyeIcon}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Підтвердити *</label>
                <input
                  className="auth-input"
                  type={showRegPwd ? "text" : "password"}
                  id="regConfirm"
                  placeholder="Повторіть пароль"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Індикатор сили пароля */}
            {regPassword && <PasswordStrength password={regPassword} />}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", marginTop: ".25rem" }}
              disabled={loading}
            >
              {loading ? <Spinner /> : "Створити акаунт"}
            </button>

            <p style={{ textAlign: "center", fontSize: ".82rem", color: "var(--ink-muted)", marginTop: ".25rem" }}>
              Вже є акаунт?{" "}
              <button
                type="button"
                onClick={() => switchTab("login")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", textDecoration: "underline", fontSize: "inherit" }}
              >
                Увійти
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Мікро-компоненти ──────────────────────────────────────────────────────────

function AuthAlert({ type, text }) {
  const isError = type === "error";
  return (
    <div style={{
      padding: ".65rem 1rem",
      borderRadius: 6,
      marginBottom: ".75rem",
      fontSize: ".83rem",
      background: isError ? "#fef2f2" : "#f0fdf4",
      color:      isError ? "#dc2626" : "#16a34a",
      border:     `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`,
    }}>
      {isError ? "❌ " : "✅ "}{text}
    </div>
  );
}

function PasswordStrength({ password }) {
  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["", "Дуже слабкий", "Слабкий", "Середній", "Надійний", "Відмінний"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

  return (
    <div style={{ marginTop: "-.25rem" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? colors[score] : "var(--sand)",
            transition: "background .3s",
          }} />
        ))}
      </div>
      <p style={{ fontSize: ".74rem", color: colors[score] || "var(--ink-muted)", marginTop: ".25rem" }}>
        {labels[score]}
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block",
      width: 16, height: 16,
      border: "2px solid rgba(255,255,255,.4)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      verticalAlign: "middle",
    }} />
  );
}

// ── Стилі / іконки ────────────────────────────────────────────────────────────

const eyeStyle = {
  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer", padding: 0,
  color: "var(--ink-muted)", lineHeight: 1,
};

const EyeIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
