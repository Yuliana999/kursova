import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

// ── Scroll to top при кожній навігації ───────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

import Header       from "./components/Header";
import AuthModal    from "./components/AuthModal";
import Footer       from "./components/Footer";
import SupportChat  from "./components/SupportChat";
import HomePage     from "./pages/HomePage";
import CatalogPage  from "./pages/CatalogPage";
import ProductPage  from "./pages/ProductPage";
import ProfilePage  from "./pages/ProfilePage";
import AboutPage    from "./pages/AboutPage";
import ContactsPage from "./pages/ContactsPage";
import AdminPage    from "./pages/AdminPage";

function NotFound() {
  return (
    <section className="page active">
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2>404 — Сторінку не знайдено</h2>
      </div>
    </section>
  );
}

// ── Утиліти для localStorage ─────────────────────────────────────────────────
function loadUser() {
  try {
    const saved = localStorage.getItem("maison_user");
    if (!saved) return null;
    const user = JSON.parse(saved);
    const avatar = localStorage.getItem("maison_avatar_" + user._id);
    if (avatar && !user.avatar) user.avatar = avatar;
    return user;
  } catch { return null; }
}

function loadCart() {
  try {
    const saved = localStorage.getItem("maison_cart");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem("maison_cart", JSON.stringify(cart));
}

function loadWishlist() {
  try {
    const saved = localStorage.getItem("maison_wishlist");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveWishlist(list) {
  localStorage.setItem("maison_wishlist", JSON.stringify(list));
}

// ── OrderModal ────────────────────────────────────────────────────────────────
function OrderModal({ cart, cartTotal, user, onClose, onSuccess }) {
  // Збираємо збережену адресу доставки з профілю користувача
  function buildSavedAddress(u) {
    if (!u) return "";
    const parts = [u.deliveryCity, u.deliveryNP, u.deliveryAddr].filter(Boolean);
    return parts.join(", ");
  }

  const [form, setForm] = useState({
    name:    user?.name  || "",
    phone:   user?.phone || "",
    email:   user?.email || "",
    address: buildSavedAddress(user),
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // закрити на Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // заблокувати скрол
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      setError("Заповніть обов'язкові поля: ім'я, телефон, адреса");
      return;
    }
    setLoading(true);
    setError("");

    const orderData = {
      userId:    user?._id || null,
      userName:  form.name,
      userEmail: form.email,
      phone:     form.phone,
      address:   form.address,
      comment:   form.comment,
      items: cart.map((i) => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price })),
      total: cartTotal,
    };

    try {
      const res  = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Помилка сервера");
      onSuccess();
    } catch (err) {
      // якщо сервер недоступний — зберігаємо локально
      const orders = JSON.parse(localStorage.getItem("maison_myorders") || "[]");
      orders.push({ ...orderData, _id: Date.now().toString(), status: "нове", createdAt: new Date().toISOString() });
      localStorage.setItem("maison_myorders", JSON.stringify(orders));
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 400, marginBottom: "1.5rem" }}>
          Оформлення замовлення
        </h2>

        {/* Список товарів */}
        <div style={{ borderTop: "1px solid var(--sand)", borderBottom: "1px solid var(--sand)", padding: ".75rem 0", marginBottom: "1.25rem", maxHeight: 160, overflowY: "auto" }}>
          {cart.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", padding: ".2rem 0" }}>
              <span>{item.name} × {item.qty}</span>
              <span>{item.price * item.qty} грн</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, marginTop: ".5rem", fontSize: ".9rem" }}>
            <span>Разом:</span><span>{cartTotal} грн</span>
          </div>
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: ".85rem", marginBottom: ".75rem" }}>{error}</p>}

        <div style={{ display: "grid", gap: ".75rem" }}>
          {[
            { name: "name",    label: "Ім'я*",     type: "text",  placeholder: "Ваше ім'я" },
            { name: "phone",   label: "Телефон*",   type: "tel",   placeholder: "+38 050 123 45 67" },
            { name: "email",   label: "Email",      type: "email", placeholder: "email@example.com" },
            { name: "address", label: "Адреса*",    type: "text",  placeholder: "Місто, відділення Нової пошти" },
          ].map((f) => (
            <div key={f.name}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: ".3rem" }}>
                <label style={{ fontSize: ".75rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>{f.label}</label>
                {f.name === "address" && buildSavedAddress(user) && (
                  <span style={{ fontSize: ".7rem", color: "#6b7280" }}>з профілю</span>
                )}
              </div>
              <input
                type={f.type}
                name={f.name}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                style={{ width: "100%", padding: ".6rem .9rem", border: "1px solid var(--sand)", borderRadius: 4, fontSize: ".9rem", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: ".75rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", display: "block", marginBottom: ".3rem" }}>Коментар</label>
            <textarea
              name="comment"
              placeholder="Побажання до замовлення"
              value={form.comment}
              onChange={handleChange}
              rows={2}
              style={{ width: "100%", padding: ".6rem .9rem", border: "1px solid var(--sand)", borderRadius: 4, fontSize: ".9rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", marginTop: "1.25rem", opacity: loading ? .7 : 1 }}
        >
          {loading ? "Оформлення..." : "Підтвердити замовлення"}
        </button>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,       setUser]       = useState(loadUser);
  const [cart,       setCart]       = useState(loadCart);
  const [cartOpen,   setCartOpen]   = useState(false);
  const [toast,      setToast]      = useState("");
  const [authModal,  setAuthModal]  = useState(null);  // "login" | "register" | null
  const [orderModal, setOrderModal] = useState(false);
  const [wishlist,   setWishlist]   = useState(loadWishlist);

  const location = useLocation();
  const navigate  = useNavigate();

  useEffect(() => { saveCart(cart); }, [cart]);
  useEffect(() => { saveWishlist(wishlist); }, [wishlist]);

  useEffect(() => {
    if (location.pathname === "/catalog") setCartOpen(false);
  }, [location.pathname]);

  // ── Toast ────────────────────────────────────────────────────────────────
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  function handleLogin(userData) {
    setUser(userData);
    localStorage.setItem("maison_user", JSON.stringify(userData));
    setAuthModal(null);
    showToast(`Ласкаво просимо, ${userData.name}! 👋`);
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("maison_user");
    showToast("Ви вийшли з акаунту");
  }

  // ── Кошик ────────────────────────────────────────────────────────────────
  function addToCart(id, name, price, imageUrl) {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === id);
      if (ex) return prev.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id, name, price: Number(price), qty: 1, imageUrl: imageUrl || "" }];
    });
    showToast(`«${name}» додано в кошик`);
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id, delta) {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  }

  // ── Вішлист ───────────────────────────────────────────────────────────────
  function toggleWishlist(prod) {
    setWishlist((prev) => {
      const exists = prev.find((i) => i._id === prod._id);
      if (exists) {
        showToast(`«${prod.name}» видалено з бажаного`);
        return prev.filter((i) => i._id !== prod._id);
      }
      showToast(`«${prod.name}» додано в бажане ♡`);
      return [...prev, prod];
    });
  }

  function isWishlisted(id) {
    return wishlist.some((i) => i._id === id);
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // ── Навігація по категорії з головної ────────────────────────────────────
  function navigateToCatalog(categoryId) {
    if (categoryId) {
      navigate(`/catalog?category=${categoryId}`);
    } else {
      navigate("/catalog");
    }
  }

  return (
    <>
      <ScrollToTop />
      <Header
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenAuth={(tab) => setAuthModal(tab)}
        onToggleCart={() => setCartOpen((prev) => !prev)}
        onLogout={handleLogout}
      />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                user={user}
                onShowCatalog={navigateToCatalog}
                onShowProduct={(id) => navigate(`/product/${id}`)}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted}
                onOpenAuth={(tab) => setAuthModal(tab)}
              />
            }
          />
          <Route
            path="/catalog"
            element={
              <CatalogPage
                user={user}
                onShowProduct={(id) => navigate(`/product/${id}`)}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted}
                onOpenAuth={(tab) => setAuthModal(tab)}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductPage
                user={user}
                onAddToCart={addToCart}
                onOpenAuth={(tab) => setAuthModal(tab)}
                onToggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfilePage
                user={user}
                wishlist={wishlist}
                onUpdateUser={(updated) => {
                  setUser(updated);
                  localStorage.setItem("maison_user", JSON.stringify(updated));
                }}
                onLogout={handleLogout}
              />
            }
          />
          <Route path="/about"    element={<AboutPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/admin"    element={<AdminPage user={user} />} />
          <Route path="*"         element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      {/* ── Кошик sidebar ── */}
      {cartOpen && (
        <div
          className="cart-overlay active"
          id="cartOverlay"
          onClick={() => setCartOpen(false)}
        />
      )}
      <div className={`cart-sidebar${cartOpen ? " active" : ""}`} id="cartSidebar">
        <div className="cart-header">
          <h3 className="cart-title">Кошик</h3>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items" id="cartItems">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p>Кошик порожній</p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.id}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                )}
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">{item.price * item.qty} грн</p>
                  <div className="cart-item-qty-controls" style={{ display: "flex", alignItems: "center", gap: ".4rem", marginTop: ".3rem" }}>
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      style={{ width: 24, height: 24, border: "1px solid var(--sand)", background: "none", cursor: "pointer", borderRadius: 3, fontSize: "1rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >−</button>
                    <span style={{ minWidth: 20, textAlign: "center", fontSize: ".9rem", fontWeight: 500 }}>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      style={{ width: 24, height: 24, border: "1px solid var(--sand)", background: "none", cursor: "pointer", borderRadius: 3, fontSize: "1rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >+</button>
                  </div>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.id)}
                >✕</button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer" id="cartFooter">
            <div className="cart-total">
              <span>Разом:</span>
              <span>{cartTotal} грн</span>
            </div>
            <button
              className="btn-primary"
              style={{ width: "100%" }}
              onClick={() => { setCartOpen(false); setOrderModal(true); }}
            >
              Оформити замовлення
            </button>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      <div className={`toast${toast ? " show" : ""}`} id="toast">{toast}</div>

      {/* ── AuthModal ── */}
      {authModal && (
        <AuthModal
          initialTab={authModal}
          onClose={() => setAuthModal(null)}
          onLogin={handleLogin}
        />
      )}

      {/* ── OrderModal ── */}
      {orderModal && (
        <OrderModal
          cart={cart}
          cartTotal={cartTotal}
          user={user}
          onClose={() => setOrderModal(false)}
          onSuccess={() => {
            setCart([]);
            setOrderModal(false);
            showToast("✅ Замовлення успішно оформлено!");
          }}
        />
      )}

      {/* ── Чат підтримки ── */}
      <SupportChat user={user} />
    </>
  );
}
