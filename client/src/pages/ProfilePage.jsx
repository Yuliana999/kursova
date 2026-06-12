import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

// ── Статуси замовлень ─────────────────────────────────────────────────────────
const STATUS_COLORS = {
  "нове":        "#6b7280",
  "в обробці":   "#d97706",
  "відправлено": "#2563eb",
  "виконано":    "#16a34a",
  "скасовано":   "#dc2626",
};

function getOrders() {
  try { return JSON.parse(localStorage.getItem("maison_myorders") || "[]"); }
  catch { return []; }
}

// ── ProfileAlert ──────────────────────────────────────────────────────────────
function ProfileAlert({ type, text, onClear }) {
  if (!text) return null;
  const isError = type === "error";
  return (
    <div style={{
      padding: ".55rem 1rem", borderRadius: 6, marginBottom: ".75rem", fontSize: ".82rem",
      background: isError ? "#fef2f2" : "#f0fdf4",
      color:      isError ? "#dc2626" : "#16a34a",
      border:     `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`,
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span>{isError ? "❌ " : "✅ "}{text}</span>
      <button onClick={onClear} style={{ background:"none", border:"none", cursor:"pointer", color:"inherit", fontSize:"1rem" }}>×</button>
    </div>
  );
}

// ── Замовлення ────────────────────────────────────────────────────────────────
function TabOrders({ user }) {
  const [orders,  setOrders]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?userId=${user._id}`)
      .then((r) => r.json())
      .then((json) => setOrders(json.success ? json.data : []))
      .catch(() => setOrders(getOrders()))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p style={{ color:"var(--ink-muted)", fontSize:".9rem", padding:"2rem 0" }}>Завантаження...</p>;

  if (!orders || orders.length === 0) return (
    <div style={{ textAlign:"center", padding:"3rem 0", color:"var(--ink-muted)" }}>
      <div style={{ fontSize:"3rem", marginBottom:".75rem" }}>📦</div>
      <p style={{ marginBottom:".5rem" }}>Замовлень ще немає</p>
      <Link to="/catalog" style={{ color:"var(--ink)", fontSize:".85rem" }}>Перейти до каталогу →</Link>
    </div>
  );

  return (
    <div style={{ display:"grid", gap:".75rem" }}>
      {orders.map((o) => {
        const date  = new Date(o.createdAt).toLocaleDateString("uk-UA");
        const color = STATUS_COLORS[o.status] || "#6b7280";
        const items = o.items?.map((i) => `${i.name} × ${i.qty}`).join(", ") || "";
        return (
          <div key={o._id} style={{ border:"1px solid var(--sand)", borderRadius:8, padding:".9rem 1rem" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:".4rem" }}>
              <div>
                <span style={{ fontSize:".8rem", color:"var(--ink-muted)" }}>
                  № {o._id.slice(-6).toUpperCase()} · {date}
                </span>
                <div style={{ fontSize:".95rem", fontWeight:600, marginTop:".15rem" }}>{o.total} грн</div>
              </div>
              <span style={{
                padding:".25rem .7rem", borderRadius:20, fontSize:".78rem", fontWeight:600,
                background:`${color}18`, color, border:`1px solid ${color}40`,
              }}>{o.status}</span>
            </div>
            {items && (
              <div style={{ fontSize:".82rem", color:"var(--ink-muted)", marginTop:".4rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {items}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Бажане ────────────────────────────────────────────────────────────────────
function TabWishlist({ wishlist }) {
  if (wishlist.length === 0) return (
    <div style={{ textAlign:"center", padding:"3rem 0", color:"var(--ink-muted)" }}>
      <div style={{ fontSize:"3rem", marginBottom:".75rem" }}>♡</div>
      <p style={{ marginBottom:".5rem" }}>Список бажань порожній</p>
      <Link to="/catalog" style={{ color:"var(--ink)", fontSize:".85rem" }}>Перейти до каталогу →</Link>
    </div>
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:"1rem" }}>
      {wishlist.map((prod) => {
        const price = prod.discountPercent > 0
          ? Math.round(prod.price * (1 - prod.discountPercent / 100))
          : prod.price;
        return (
          <Link key={prod._id} to={`/product/${prod._id}`} style={{ textDecoration:"none", color:"inherit" }}>
            <div style={{ border:"1px solid var(--sand)", borderRadius:8, overflow:"hidden", transition:"box-shadow .2s" }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.1)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow="none"}
            >
              {prod.imageUrl
                ? <img src={prod.imageUrl} alt={prod.name} style={{ width:"100%", height:140, objectFit:"cover", display:"block" }} />
                : <div style={{ width:"100%", height:140, background:"var(--sand)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>🌸</div>
              }
              <div style={{ padding:".75rem" }}>
                <p style={{ fontSize:".84rem", fontWeight:500, marginBottom:".3rem", lineHeight:1.3 }}>{prod.name}</p>
                <p style={{ fontSize:".9rem", color:"var(--accent)" }}>{price} грн</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ── Головний компонент ────────────────────────────────────────────────────────
export default function ProfilePage({ user, wishlist = [], onUpdateUser, onLogout }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Активна вкладка з URL (?tab=orders / ?tab=wishlist / за замовч — profile)
  const activeTab = searchParams.get("tab") || "profile";
  function setTab(t) { setSearchParams(t === "profile" ? {} : { tab: t }); }

  useEffect(() => { if (!user) navigate("/"); }, [user]);

  // ── Стан форм ─────────────────────────────────────────────────────────────
  const [personalData, setPersonalData] = useState({ name: user?.name||"", email: user?.email||"", phone: user?.phone||"" });
  const [delivery,     setDelivery]     = useState({ deliveryCity: user?.deliveryCity||"", deliveryNP: user?.deliveryNP||"", deliveryAddr: user?.deliveryAddr||"" });
  const [pwd,          setPwd]          = useState({ newPwd:"", confPwd:"", show:false });
  const [msgPersonal,  setMsgPersonal]  = useState(null);
  const [msgDelivery,  setMsgDelivery]  = useState(null);
  const [msgPassword,  setMsgPassword]  = useState(null);
  const [avatar, setAvatar] = useState(user?.avatar || (user?._id ? localStorage.getItem("maison_avatar_"+user._id) : null));
  const fileRef = useRef(null);

  if (!user) return null;

  const orderCount = getOrders().length;

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatar(dataUrl);
      const updated = { ...user, avatar: dataUrl };
      if (user._id) localStorage.setItem("maison_avatar_"+user._id, dataUrl);
      localStorage.setItem("maison_user", JSON.stringify(updated));
      onUpdateUser(updated);
    };
    reader.readAsDataURL(file);
  }

  function handleSavePersonal(e) {
    e.preventDefault();
    if (!personalData.name || !personalData.email) { setMsgPersonal({ type:"error", text:"Ім'я та email обов'язкові" }); return; }
    const updated = { ...user, ...personalData };
    localStorage.setItem("maison_user", JSON.stringify(updated));
    onUpdateUser(updated);
    setMsgPersonal({ type:"success", text:"Дані збережено" });
  }

  function handleSaveDelivery(e) {
    e.preventDefault();
    const updated = { ...user, ...delivery };
    localStorage.setItem("maison_user", JSON.stringify(updated));
    onUpdateUser(updated);
    setMsgDelivery({ type:"success", text:"Адресу збережено" });
  }

  function handleChangePassword(e) {
    e.preventDefault();
    if (pwd.newPwd.length < 6) { setMsgPassword({ type:"error", text:"Мінімум 6 символів" }); return; }
    if (pwd.newPwd !== pwd.confPwd) { setMsgPassword({ type:"error", text:"Паролі не збігаються" }); return; }
    setMsgPassword({ type:"success", text:"Пароль змінено" });
    setPwd({ newPwd:"", confPwd:"", show:false });
  }

  // ── Вкладки ───────────────────────────────────────────────────────────────
  const TABS = [
    { id:"profile",  label:"Мій профіль", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
    { id:"orders",   label:"Замовлення",  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, count: orderCount },
    { id:"wishlist", label:"Бажане",      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, count: wishlist.length },
    ...(user.role === "admin" ? [{ id:"admin", label:"Адмін-панель", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg> }] : []),
  ];

  return (
    <section id="page-profile" className="page active">
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2.5rem 1.5rem" }}>

        {/* ── Шапка профілю ── */}
        <div style={{ display:"flex", alignItems:"center", gap:"1.5rem", marginBottom:"2rem", flexWrap:"wrap" }}>
          {/* Аватар */}
          <div
            onClick={() => fileRef.current?.click()}
            title="Змінити фото"
            style={{
              width:72, height:72, borderRadius:"50%", overflow:"hidden", flexShrink:0,
              background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", position:"relative", fontSize:"1.6rem", fontWeight:600, color:"#fff",
              fontFamily:"'Cormorant Garamond', serif",
            }}
          >
            {avatar
              ? <img src={avatar} alt={user.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              : <span>{user.name[0].toUpperCase()}</span>
            }
            <div style={{
              position:"absolute", inset:0, background:"rgba(0,0,0,.35)",
              display:"flex", alignItems:"center", justifyContent:"center",
              opacity:0, transition:"opacity .2s", color:"#fff", fontSize:".65rem", letterSpacing:".05em",
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity=1}
              onMouseLeave={(e) => e.currentTarget.style.opacity=0}
            >ЗМІНИТИ</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange} />

          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", fontWeight:400, margin:0 }}>{user.name}</h1>
            <p style={{ color:"var(--ink-muted)", fontSize:".9rem", marginTop:".2rem" }}>{user.email}</p>
          </div>

          <button
            onClick={onLogout}
            style={{
              marginLeft:"auto", display:"flex", alignItems:"center", gap:".4rem",
              background:"none", border:"1px solid #fecaca", borderRadius:6,
              color:"#dc2626", fontSize:".85rem", padding:".45rem .9rem", cursor:"pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Вийти
          </button>
        </div>

        {/* ── Вкладки ── */}
        <div style={{ display:"flex", borderBottom:"1px solid var(--sand)", marginBottom:"1.75rem", gap:".25rem", flexWrap:"wrap" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => t.id === "admin" ? navigate("/admin") : setTab(t.id)}
              style={{
                display:"flex", alignItems:"center", gap:".45rem",
                padding:".65rem 1.1rem", border:"none", borderBottom: activeTab===t.id ? "2px solid var(--ink)" : "2px solid transparent",
                background:"none", cursor:"pointer", fontSize:".88rem",
                color: activeTab===t.id ? "var(--ink)" : "var(--ink-muted)",
                fontWeight: activeTab===t.id ? 600 : 400,
                transition:"color .15s",
                marginBottom:"-1px",
              }}
            >
              {t.icon}
              {t.label}
              {t.count > 0 && (
                <span style={{
                  background: activeTab===t.id ? "var(--ink)" : "var(--sand)",
                  color: activeTab===t.id ? "#fff" : "var(--ink-muted)",
                  fontSize:".7rem", fontWeight:700, borderRadius:10,
                  padding:"1px 6px", lineHeight:1.4,
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Контент вкладок ── */}

        {/* Профіль */}
        {activeTab === "profile" && (
          <div className="profile-grid">
            <div className="profile-card">
              <p className="profile-card-title">Особисті дані</p>
              <ProfileAlert {...(msgPersonal||{})} onClear={() => setMsgPersonal(null)} />
              <div className="profile-form">
                {[
                  { label:"Ім'я та прізвище", key:"name",  type:"text" },
                  { label:"Email",            key:"email", type:"email" },
                  { label:"Телефон",          key:"phone", type:"tel" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="profile-label">{label}</label>
                    <input className="auth-input" type={type} value={personalData[key]}
                      onChange={(e) => setPersonalData((p) => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <button className="btn-primary small" style={{ marginTop:".3rem" }} onClick={handleSavePersonal}>
                  Зберегти зміни
                </button>
              </div>
            </div>

            <div className="profile-card">
              <p className="profile-card-title">Адреса доставки</p>
              <ProfileAlert {...(msgDelivery||{})} onClear={() => setMsgDelivery(null)} />
              <div className="profile-form">
                {[
                  { label:"Місто",                  key:"deliveryCity", placeholder:"" },
                  { label:"Відділення Нової Пошти",  key:"deliveryNP",   placeholder:"№ відділення або адреса" },
                  { label:"Повна адреса",            key:"deliveryAddr", placeholder:"вул., буд., кв." },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="profile-label">{label}</label>
                    <input className="auth-input" type="text" placeholder={placeholder}
                      value={delivery[key]} onChange={(e) => setDelivery((p) => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <button className="btn-primary small" style={{ marginTop:".3rem" }} onClick={handleSaveDelivery}>
                  Зберегти адресу
                </button>
              </div>
            </div>

            <div className="profile-card" style={{ gridColumn:"1/-1", maxWidth:400 }}>
              <p className="profile-card-title">Зміна пароля</p>
              <ProfileAlert {...(msgPassword||{})} onClear={() => setMsgPassword(null)} />
              <div className="profile-form">
                <div>
                  <label className="profile-label">Новий пароль</label>
                  <div style={{ position:"relative" }}>
                    <input className="auth-input" type={pwd.show?"text":"password"} placeholder="Мінімум 6 символів"
                      value={pwd.newPwd} onChange={(e) => setPwd((p) => ({ ...p, newPwd:e.target.value }))}
                      style={{ paddingRight:"2.8rem" }} />
                    <button type="button" onClick={() => setPwd((p) => ({ ...p, show:!p.show }))}
                      style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--ink-muted)" }}>
                      {pwd.show ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="profile-label">Повторіть пароль</label>
                  <input className="auth-input" type={pwd.show?"text":"password"}
                    value={pwd.confPwd} onChange={(e) => setPwd((p) => ({ ...p, confPwd:e.target.value }))} />
                </div>
                <button className="btn-primary small" style={{ marginTop:".3rem" }} onClick={handleChangePassword}>
                  Змінити пароль
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Замовлення */}
        {activeTab === "orders" && (
          <div className="profile-card" style={{ maxWidth:700 }}>
            <p className="profile-card-title">Мої замовлення</p>
            <TabOrders user={user} />
          </div>
        )}

        {/* Бажане */}
        {activeTab === "wishlist" && (
          <div className="profile-card">
            <p className="profile-card-title">Список бажань</p>
            <TabWishlist wishlist={wishlist} />
          </div>
        )}

      </div>
    </section>
  );
}
