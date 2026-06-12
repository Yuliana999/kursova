import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPage({ user }) {
  const navigate = useNavigate();
  const [tab,   setTab]   = useState("orders");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/");
  }, [user, navigate]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  if (!user || user.role !== "admin") return null;

  return (
    <section className="page active">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", marginBottom: "1.5rem" }}>
          Адмін-панель
        </h2>

        <div className="admin-tabs">
          {[
            { id: "orders",     label: "Замовлення" },
            { id: "contacts",   label: "Звернення" },
            { id: "products",   label: "Товари" },
            { id: "categories", label: "Категорії" },
          ].map((t) => (
            <button
              key={t.id}
              className={`admin-tab-btn${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="admin-tab-pane" style={{ display: tab === "orders"     ? "" : "none" }}><AdminOrders     showToast={showToast} /></div>
        <div className="admin-tab-pane" style={{ display: tab === "contacts"   ? "" : "none" }}><AdminContacts   showToast={showToast} /></div>
        <div className="admin-tab-pane" style={{ display: tab === "products"   ? "" : "none" }}><AdminProducts   showToast={showToast} /></div>
        <div className="admin-tab-pane" style={{ display: tab === "categories" ? "" : "none" }}><AdminCategories showToast={showToast} /></div>
      </div>

      {/* ── Один глобальний toast внизу екрану ── */}
      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </section>
  );
}

// ════════════════════════════════════════════════
// ЗАМОВЛЕННЯ
// ════════════════════════════════════════════════
const STATUSES = ["нове", "в обробці", "відправлено", "виконано", "скасовано"];

function AdminOrders({ showToast }) {
  const [orders,  setOrders]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((json) => setOrders(json.success ? json.data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
      showToast("Статус оновлено ✓");
    } catch { showToast("Помилка"); }
  }

  function showDetail(o) {
    alert(
      `Замовлення\nКлієнт: ${o.guestName || o.user?.name}\nEmail: ${o.guestEmail || ""}\nТел: ${o.guestPhone || ""}\nАдреса: ${o.address || "—"}\nКоментар: ${o.comment || "—"}\n\nТовари:\n${o.items.map((i) => `${i.name} × ${i.qty} = ${i.price * i.qty} грн`).join("\n")}\n\nРазом: ${o.total} грн`
    );
  }

  if (loading) return <p style={{ padding: "1rem", color: "var(--ink-muted)" }}>Завантаження…</p>;
  if (!orders?.length) return <p style={{ padding: "1rem" }}>Замовлень ще немає.</p>;

  return (
    <div style={{ padding: "1rem", overflowX: "auto" }}>
      <table className="admin-table">
        <thead>
          <tr><th>#</th><th>Клієнт</th><th>Товари</th><th>Сума</th><th>Статус</th><th>Дата</th><th></th></tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={o._id}>
              <td>{i + 1}</td>
              <td>
                {o.guestName || o.user?.name || "—"}
                <br /><small style={{ color: "var(--ink-muted)" }}>{o.guestPhone || ""}</small>
              </td>
              <td style={{ fontSize: ".82rem" }}>{o.items.map((it) => it.name).join(", ").substring(0, 60)}</td>
              <td><strong>{o.total} грн</strong></td>
              <td>
                <select className="admin-select" value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td>{new Date(o.createdAt).toLocaleDateString("uk-UA")}</td>
              <td><button className="admin-btn-sm" onClick={() => showDetail(o)}>Деталі</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ════════════════════════════════════════════════
// ЗВЕРНЕННЯ
// ════════════════════════════════════════════════
function AdminContacts({ showToast }) {
  const [contacts,   setContacts]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [replyPanel, setReplyPanel] = useState(null);
  const [replyText,  setReplyText]  = useState("");

  const load = useCallback(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((json) => setContacts(json.success ? json.data : []))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markRead(id) {
    try {
      await fetch(`/api/contacts/${id}/read`, { method: "PATCH" });
      setContacts((prev) => prev.map((c) => c._id === id ? { ...c, isRead: true } : c));
    } catch { showToast("Помилка"); }
  }

  async function deleteContact(id) {
    if (!confirm("Видалити це звернення?")) return;
    try {
      const json = await fetch(`/api/contacts/${id}`, { method: "DELETE" }).then((r) => r.json());
      if (json.success) { setContacts((prev) => prev.filter((c) => c._id !== id)); showToast("Звернення видалено"); }
      else showToast("Помилка: " + json.message);
    } catch { showToast("Помилка"); }
  }

  async function sendReply() {
    if (!replyText.trim() || !replyPanel) return;
    try {
      const json = await fetch(`/api/contacts/${replyPanel._id}/reply`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      }).then((r) => r.json());
      if (json.success) {
        showToast("Відповідь надіслано ✓");
        setReplyText("");
        setReplyPanel((prev) => ({ ...prev, adminReply: replyText, repliedAt: new Date().toISOString() }));
        load();
      } else showToast("Помилка: " + json.message);
    } catch { showToast("Помилка"); }
  }

  if (loading) return <p style={{ padding: "1rem", color: "var(--ink-muted)" }}>Завантаження…</p>;
  if (!contacts?.length) return <p style={{ padding: "1rem" }}>Звернень ще немає.</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Ім'я</th><th>Email</th><th>Повідомлення</th><th>Дата</th><th>Відповідь</th><th></th></tr>
          </thead>
          <tbody>
            {contacts.map((c, i) => (
              <tr key={c._id} style={{ fontWeight: c.isRead ? "" : 600 }}>
                <td>{i + 1}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td style={{ maxWidth: 220, whiteSpace: "normal", fontWeight: 400 }}>{c.message.substring(0, 90)}{c.message.length > 90 ? "…" : ""}</td>
                <td>{new Date(c.createdAt).toLocaleDateString("uk-UA")}</td>
                <td style={{ maxWidth: 160, whiteSpace: "normal", fontSize: ".8rem", color: "var(--ink-muted)" }}>
                  {c.adminReply ? "✅ " + c.adminReply.substring(0, 50) + (c.adminReply.length > 50 ? "…" : "") : "—"}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button className="admin-btn-sm" onClick={() => { setReplyPanel(c); setReplyText(""); }}>💬</button>
                  {!c.isRead && <button className="admin-btn-sm" style={{ marginLeft: 4 }} onClick={() => markRead(c._id)}>✓</button>}
                  <button className="admin-btn-sm" style={{ marginLeft: 4, color: "#e53935" }} onClick={() => deleteContact(c._id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reply Panel */}
      {replyPanel && (
        <div style={{ position: "fixed", bottom: 24, right: 24, width: 340, background: "var(--surface,#fff)", border: "1px solid var(--border,#e0e0e0)", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,.18)", display: "flex", flexDirection: "column", zIndex: 9999, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", background: "var(--accent,#222)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "16px 16px 0 0" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: ".95rem" }}>💬 Відповідь клієнту</div>
              <div style={{ fontSize: ".75rem", opacity: .8, marginTop: 2 }}>{replyPanel.name} · {replyPanel.email}</div>
            </div>
            <button onClick={() => setReplyPanel(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8, minHeight: 180, maxHeight: 280, background: "var(--bg,#f8f8f8)" }}>
            <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
              <div style={{ fontSize: ".7rem", color: "var(--ink-muted)", marginBottom: 3 }}>{replyPanel.name} · {new Date(replyPanel.createdAt).toLocaleDateString("uk-UA")}</div>
              <div style={{ background: "#fff", border: "1px solid var(--border,#e0e0e0)", borderRadius: "12px 12px 12px 2px", padding: "8px 12px", fontSize: ".88rem", lineHeight: 1.4 }}>{replyPanel.message}</div>
            </div>
            {replyPanel.adminReply && (
              <div style={{ alignSelf: "flex-end", maxWidth: "85%" }}>
                <div style={{ fontSize: ".7rem", color: "var(--ink-muted)", marginBottom: 3, textAlign: "right" }}>Адмін · {new Date(replyPanel.repliedAt).toLocaleDateString("uk-UA")}</div>
                <div style={{ background: "var(--accent,#222)", color: "#fff", borderRadius: "12px 12px 2px 12px", padding: "8px 12px", fontSize: ".88rem", lineHeight: 1.4 }}>{replyPanel.adminReply}</div>
              </div>
            )}
          </div>
          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border,#e0e0e0)", display: "flex", gap: 8, background: "var(--surface,#fff)" }}>
            <input type="text" placeholder="Введіть відповідь…" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()}
              style={{ flex: 1, border: "1px solid var(--border,#e0e0e0)", borderRadius: 8, padding: "8px 12px", fontSize: ".88rem", fontFamily: "inherit", outline: "none" }} autoFocus />
            <button onClick={sendReply} style={{ background: "var(--accent,#222)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: ".88rem", cursor: "pointer", fontWeight: 600 }}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// ТОВАРИ
// ════════════════════════════════════════════════
function AdminProducts({ showToast }) {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [stockDeltas, setStockDeltas] = useState({});
  const [form, setForm] = useState({ name: "", price: "", stockQuantity: "", discountPercent: "0", imageUrl: "", description: "", category: "" });

  const load = useCallback(() => {
    Promise.all([fetch("/api/products"), fetch("/api/categories")])
      .then(async ([pr, cr]) => { setProducts((await pr.json()).data || []); setCategories((await cr.json()).data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addProduct(e) {
    e.preventDefault();
    const data = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity), discountPercent: Number(form.discountPercent) || 0 };
    try {
      const json = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json());
      if (json._id || json.success) { showToast("✅ Товар додано!"); setForm({ name: "", price: "", stockQuantity: "", discountPercent: "0", imageUrl: "", description: "", category: "" }); load(); }
      else showToast("❌ " + (json.message || "Помилка"));
    } catch { showToast("❌ Помилка з'єднання"); }
  }

  async function confirmStock(id) {
    const newQty = stockDeltas[id];
    if (newQty === undefined) return;
    try {
      const json = await fetch(`/api/products/${id}/stock`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockQuantity: newQty }) }).then((r) => r.json());
      if (json.success) { showToast("✅ Кількість збережено!"); setStockDeltas((prev) => { const n = { ...prev }; delete n[id]; return n; }); setProducts((prev) => prev.map((p) => p._id === id ? { ...p, stockQuantity: newQty } : p)); }
      else showToast("❌ " + (json.message || "Помилка"));
    } catch { showToast("❌ Помилка з'єднання"); }
  }

  if (loading) return <p style={{ padding: "1rem", color: "var(--ink-muted)" }}>Завантаження…</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", marginBottom: "1rem" }}>Додати товар</h3>
      <form onSubmit={addProduct} style={{ display: "grid", gap: ".6rem", maxWidth: 520, marginBottom: "1.5rem" }}>
        <input className="admin-input" placeholder="Назва" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input className="admin-input" placeholder="Ціна (грн)" type="number" min="0" required value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
        <input className="admin-input" placeholder="Кількість на складі" type="number" min="0" required value={form.stockQuantity} onChange={(e) => setForm((p) => ({ ...p, stockQuantity: e.target.value }))} />
        <input className="admin-input" placeholder="Знижка % (напр: 10)" type="number" min="0" max="100" value={form.discountPercent} onChange={(e) => setForm((p) => ({ ...p, discountPercent: e.target.value }))} />
        <input className="admin-input" placeholder="URL фото" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
        <textarea className="admin-input" placeholder="Опис" rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <select className="admin-input" required value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
          <option value="">— Категорія —</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <button type="submit" className="btn-primary small">Додати товар</button>
      </form>

      <hr style={{ margin: "1.5rem 0", borderColor: "var(--sand)" }} />
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", marginBottom: ".8rem" }}>Товари ({products.length})</h3>
      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead><tr><th>Назва</th><th>Ціна</th><th>Категорія</th><th>Кількість на складі</th></tr></thead>
          <tbody>
            {products.map((p) => {
              const qty = stockDeltas[p._id] !== undefined ? stockDeltas[p._id] : p.stockQuantity;
              return (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.price} грн</td>
                  <td>{p.category?.name || "—"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                      <button onClick={() => setStockDeltas((prev) => ({ ...prev, [p._id]: Math.max(0, qty - 1) }))} style={{ width: 26, height: 26, border: "1px solid var(--sand)", background: "none", cursor: "pointer", borderRadius: 4, fontSize: "1.1rem" }}>−</button>
                      <span style={{ minWidth: 32, textAlign: "center", fontWeight: 500 }}>{qty}</span>
                      <button onClick={() => setStockDeltas((prev) => ({ ...prev, [p._id]: qty + 1 }))} style={{ width: 26, height: 26, border: "1px solid var(--sand)", background: "none", cursor: "pointer", borderRadius: 4, fontSize: "1.1rem" }}>+</button>
                      {stockDeltas[p._id] !== undefined && (
                        <button onClick={() => confirmStock(p._id)} style={{ padding: "2px 10px", border: "none", background: "#b08d6a", color: "#fff", cursor: "pointer", borderRadius: 4, fontSize: ".8rem", fontWeight: 600 }}>Готово</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// КАТЕГОРІЇ
// ════════════════════════════════════════════════
function AdminCategories({ showToast }) {
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId,  setEditId]  = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", imageUrl: "" });

  const load = useCallback(() => {
    fetch("/api/categories").then((r) => r.json()).then((json) => setCats(json.data || [])).catch(() => setCats([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(cat) {
    setEditId(cat._id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", imageUrl: cat.imageUrl || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm({ name: "", slug: "", description: "", imageUrl: "" });
  }

  async function deleteCategory() {
    if (!editId) return;
    const catName = form.name;
    if (!confirm(`Видалити категорію «${catName}»? Це не видалить товари в ній.`)) return;
    try {
      const json = await fetch("/api/categories/" + editId, { method: "DELETE" }).then((r) => r.json());
      if (json.success) { showToast("🗑 Категорію видалено"); cancelEdit(); load(); }
      else showToast("❌ " + (json.message || "Помилка"));
    } catch { showToast("❌ Помилка з'єднання"); }
  }

  async function addCategory(e) {
    e.preventDefault();
    try {
      if (editId) {
        // Оновлення існуючої
        const json = await fetch("/api/categories/" + editId, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).then((r) => r.json());
        if (json.success || json._id) { showToast("✅ Категорію оновлено!"); cancelEdit(); load(); }
        else showToast("❌ " + (json.message || "Помилка"));
      } else {
        // Додавання нової
        const json = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).then((r) => r.json());
        if (json.success || json._id) { showToast("✅ Категорію додано!"); setForm({ name: "", slug: "", description: "", imageUrl: "" }); load(); }
        else showToast("❌ " + (json.message || "Помилка"));
      }
    } catch { showToast("❌ Помилка"); }
  }

  if (loading) return <p style={{ padding: "1rem", color: "var(--ink-muted)" }}>Завантаження…</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", marginBottom: "1rem" }}>
        {editId ? "Редагувати категорію" : "Додати категорію"}
      </h3>
      <form onSubmit={addCategory} style={{ display: "grid", gap: ".6rem", maxWidth: 460, marginBottom: "1.5rem" }}>
        <input className="admin-input" placeholder="Назва" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input className="admin-input" placeholder="Slug (напр: kosmetyka)" required value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
        <input className="admin-input" placeholder="Опис" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <div>
          <input className="admin-input" placeholder="URL фото категорії" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
          {form.imageUrl && (
            <div style={{ marginTop: ".5rem", borderRadius: 6, overflow: "hidden", width: "100%", maxWidth: 200, aspectRatio: "3/2" }}>
              <img src={form.imageUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { e.target.style.display = "none"; }} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
          <button type="submit" className="btn-primary small">{editId ? "Зберегти" : "Додати"}</button>
          {editId && (
            <>
              <button type="button" className="admin-btn-sm" onClick={cancelEdit} style={{ padding: ".4rem .9rem" }}>Скасувати</button>
              <button
                type="button"
                onClick={deleteCategory}
                style={{
                  marginLeft: "auto", padding: ".4rem .9rem",
                  background: "none", border: "1px solid #fecaca",
                  borderRadius: 6, color: "#dc2626",
                  fontSize: ".82rem", cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: ".35rem",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Видалити категорію
              </button>
            </>
          )}
        </div>
      </form>

      <hr style={{ margin: "1.5rem 0", borderColor: "var(--sand)" }} />
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", marginBottom: ".8rem" }}>Категорії ({cats.length})</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        {cats.map((c) => (
          <div key={c._id} style={{ border: "1px solid var(--sand)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ aspectRatio: "3/2", background: "var(--sand)", position: "relative" }}>
              {c.imageUrl
                ? <img src={c.imageUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🖼</div>
              }
            </div>
            <div style={{ padding: ".65rem .8rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".5rem" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: ".88rem", margin: 0 }}>{c.name}</p>
                <p style={{ fontSize: ".72rem", color: "var(--ink-muted)", margin: 0 }}>{c.slug}</p>
              </div>
              <button className="admin-btn-sm" onClick={() => startEdit(c)} title="Редагувати">✏️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
