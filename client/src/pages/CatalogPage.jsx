import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";

// ── Константи ───────────────────────────────────────────────────────────────
const PRODUCTS_PER_PAGE = 20;
const DEMO_PRODUCTS = [
  { _id: "1", name: "Крем для обличчя",        price: 450, discountPercent: 0,  stockQuantity: 10, imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80&auto=format&fit=crop" },
  { _id: "2", name: "Сироватка з гіалуронкою", price: 680, discountPercent: 15, stockQuantity: 5,  imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&q=80&auto=format&fit=crop" },
  { _id: "3", name: "Масло для тіла",          price: 320, discountPercent: 0,  stockQuantity: 8,  imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80&auto=format&fit=crop" },
  { _id: "4", name: "Тональний крем",          price: 590, discountPercent: 20, stockQuantity: 0,  imageUrl: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80&auto=format&fit=crop" },
  { _id: "5", name: "Палетка тіней",           price: 750, discountPercent: 0,  stockQuantity: 3,  imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80&auto=format&fit=crop" },
  { _id: "6", name: "Помада матова",           price: 280, discountPercent: 10, stockQuantity: 12, imageUrl: "https://images.unsplash.com/photo-1586495777744-4e6232bf7026?w=400&q=80&auto=format&fit=crop" },
  { _id: "7", name: "Шампунь відновлюючий",    price: 380, discountPercent: 0,  stockQuantity: 7,  imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80&auto=format&fit=crop" },
  { _id: "8", name: "Міцелярна вода",          price: 210, discountPercent: 0,  stockQuantity: 15, imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80&auto=format&fit=crop" },
];

const DEMO_CATEGORIES = [
  { _id: "1", name: "Косметика" },
  { _id: "2", name: "Догляд за волоссям" },
  { _id: "3", name: "Засоби для тіла" },
  { _id: "4", name: "Парфуми" },
];

const SORT_OPTIONS = [
  { value: "",             label: "Новинки" },
  { value: "price_asc",   label: "Ціна ↑" },
  { value: "price_desc",  label: "Ціна ↓" },
  { value: "name_asc",    label: "Назва А-Я" },
  { value: "discount_desc", label: "Знижки" },
];

// ── Допоміжні ───────────────────────────────────────────────────────────────
function effectivePrice(prod) {
  return prod.discountPercent > 0
    ? Math.round(prod.price * (1 - prod.discountPercent / 100))
    : prod.price;
}

// ── Підкомпоненти ────────────────────────────────────────────────────────────

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="stars-wrap">
      {Array.from({ length: 5 }, (_, i) => {
        let cls = "star-empty";
        if (i < full) cls = "star-full";
        else if (i === full && half) cls = "star-half";
        return <span key={i} className={`star ${cls}`}>★</span>;
      })}
    </span>
  );
}


// ── Модалка редагування товару (тільки для адміна) ───────────────────────────
function AdminEditModal({ prod, categories, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({
    name:            prod.name || "",
    price:           String(prod.price || ""),
    stockQuantity:   String(prod.stockQuantity ?? ""),
    discountPercent: String(prod.discountPercent || "0"),
    imageUrl:        prod.imageUrl || "",
    description:     prod.description || "",
    category:        prod.category?._id || prod.category || "",
  });
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");

  // Закрити на Escape
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // Блокувати скрол
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function f(key) { return (e) => setForm((p) => ({ ...p, [key]: e.target.value })); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.stockQuantity) {
      setError("Заповніть обов\'язкові поля: назва, ціна, кількість"); return;
    }
    setSaving(true); setError("");
    try {
      const body = {
        name:            form.name.trim(),
        price:           Number(form.price),
        stockQuantity:   Number(form.stockQuantity),
        discountPercent: Number(form.discountPercent) || 0,
        imageUrl:        form.imageUrl.trim(),
        description:     form.description.trim(),
        category:        form.category || undefined,
      };
      const res  = await fetch(`/api/products/${prod._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success && !json._id) { setError(json.message || "Помилка збереження"); return; }
      onSaved({ ...prod, ...body, _id: prod._id });
    } catch { setError("Помилка з\'єднання з сервером"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Видалити товар «${prod.name}»? Дію не можна скасувати.`)) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/products/${prod._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) { setError(json.message || "Помилка видалення"); setDeleting(false); return; }
      onDeleted(prod._id);
    } catch { setError("Помилка з\'єднання"); setDeleting(false); }
  }

  const inputStyle = {
    width: "100%", padding: ".55rem .85rem",
    border: "1px solid var(--sand)", borderRadius: 6,
    fontSize: ".88rem", fontFamily: "inherit",
    background: "#fff", boxSizing: "border-box",
    outline: "none",
  };
  const labelStyle = {
    fontSize: ".72rem", fontWeight: 600,
    letterSpacing: ".08em", textTransform: "uppercase",
    color: "var(--ink-muted)", display: "block", marginBottom: ".3rem",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(15,14,12,.55)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--cream)", borderRadius: 14,
        width: "min(600px, 100%)", maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.25)",
        padding: "2rem",
      }}>
        {/* Шапка */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ fontSize: ".7rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: ".3rem" }}>
              РЕДАГУВАННЯ ТОВАРУ
            </p>
            <h2 style={{ fontFamily: "\'Cormorant Garamond\', serif", fontSize: "1.6rem", fontWeight: 400, margin: 0 }}>
              {prod.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", fontSize: "1.3rem", lineHeight: 1, padding: ".2rem" }}
          >✕</button>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: ".6rem .9rem", fontSize: ".82rem", color: "#dc2626", marginBottom: "1rem" }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Назва */}
          <div style={{ marginBottom: ".9rem" }}>
            <label style={labelStyle}>Назва *</label>
            <input style={inputStyle} value={form.name} onChange={f("name")} placeholder="Назва товару" required />
          </div>

          {/* Ціна / знижка / кількість */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".75rem", marginBottom: ".9rem" }}>
            <div>
              <label style={labelStyle}>Ціна (грн) *</label>
              <input style={inputStyle} type="number" min="0" value={form.price} onChange={f("price")} placeholder="0" required />
            </div>
            <div>
              <label style={labelStyle}>Знижка %</label>
              <input style={inputStyle} type="number" min="0" max="100" value={form.discountPercent} onChange={f("discountPercent")} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Кількість *</label>
              <input style={inputStyle} type="number" min="0" value={form.stockQuantity} onChange={f("stockQuantity")} placeholder="0" required />
            </div>
          </div>

          {/* Категорія */}
          <div style={{ marginBottom: ".9rem" }}>
            <label style={labelStyle}>Категорія</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.category} onChange={f("category")}>
              <option value="">— Без категорії —</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* URL фото */}
          <div style={{ marginBottom: ".9rem" }}>
            <label style={labelStyle}>URL фото</label>
            <input style={inputStyle} value={form.imageUrl} onChange={f("imageUrl")} placeholder="https://..." />
            {form.imageUrl && (
              <div style={{ marginTop: ".5rem", width: 80, height: 80, borderRadius: 6, overflow: "hidden", border: "1px solid var(--sand)" }}>
                <img src={form.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.style.opacity = ".3"; }} />
              </div>
            )}
          </div>

          {/* Опис */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={labelStyle}>Опис</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              value={form.description}
              onChange={f("description")}
              placeholder="Опис товару..."
              rows={3}
            />
          </div>

          {/* Кнопки */}
          <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1, padding: ".65rem", background: "var(--ink)", color: "#fff",
                border: "none", borderRadius: 7, fontSize: ".88rem", fontWeight: 600,
                cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
                opacity: saving ? .7 : 1, transition: "opacity .2s",
              }}
            >
              {saving ? "Збереження..." : "💾 Зберегти зміни"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: ".65rem 1.1rem", background: "none",
                border: "1px solid var(--sand)", borderRadius: 7,
                fontSize: ".88rem", cursor: "pointer", fontFamily: "inherit", color: "var(--ink)",
              }}
            >
              Скасувати
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              title="Видалити товар"
              style={{
                padding: ".65rem .8rem", background: "none",
                border: "1px solid #fecaca", borderRadius: 7,
                color: "#dc2626", cursor: deleting ? "wait" : "pointer",
                display: "flex", alignItems: "center", gap: ".35rem",
                fontSize: ".82rem", fontFamily: "inherit",
                opacity: deleting ? .6 : 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              {deleting ? "..." : "Видалити"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductCard({ prod, onShowProduct, onAddToCart, onToggleWishlist, isWishlisted, user, onOpenAuth, onAdminEdit }) {
  const hasDiscount = prod.discountPercent > 0;
  const price = effectivePrice(prod);
  const wishlisted = isWishlisted ? isWishlisted(prod._id) : false;

  return (
    <div className="product-card" onClick={() => onShowProduct(prod._id)}>
      <div className="product-card-img">
        {prod.imageUrl ? (
          <img src={prod.imageUrl} alt={prod.name} loading="lazy" />
        ) : (
          <div className="product-card-img-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        {hasDiscount && (
          <span className="product-badge">-{prod.discountPercent}%</span>
        )}
        {onToggleWishlist && (
          <button
            className="wishlist-btn"
            title={wishlisted ? "Видалити з бажаного" : "Додати в бажане"}
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                onOpenAuth("login");
              } else {
                onToggleWishlist(prod);
              }
            }}
            style={{
              position: "absolute", top: 8, right: 8,
              width: 32, height: 32, borderRadius: "50%",
              background: wishlisted ? "var(--accent)" : "rgba(255,255,255,.85)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, transition: "background .2s",
            }}
          >
            {wishlisted ? "♥" : "♡"}
          </button>
        )}

        {/* Кнопка редагування для адміна */}
        {user?.role === "admin" && onAdminEdit && (
          <button
            title="Редагувати товар"
            onClick={(e) => { e.stopPropagation(); onAdminEdit(prod); }}
            style={{
              position: "absolute", bottom: 8, left: 8,
              width: 30, height: 30, borderRadius: 6,
              background: "rgba(15,14,12,.75)", color: "#fff",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(15,14,12,.75)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
      </div>
      <div className="product-card-body">
        <p className="product-card-name">{prod.name}</p>
        {prod._avgRating ? (
          <div className="product-card-stars">
            <Stars rating={prod._avgRating} />
            <span className="product-card-rating-count">({prod._reviewCount})</span>
          </div>
        ) : null}
        <p className="product-card-price">
          {price} грн
          {hasDiscount && <span className="old-price"> {prod.price} грн</span>}
        </p>
        <button
          className="product-card-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(prod._id, prod.name, price, prod.imageUrl || "");
          }}
        >
          До кошика
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="skeleton-card" />;
}

// ── Пагінація ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Генеруємо масив сторінок з "..." де треба
  function getPages() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      gap: ".35rem", padding: "2.5rem 0 1rem",
    }}>
      {/* Кнопка «Назад» */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          width: 36, height: 36, borderRadius: 8,
          border: "1px solid var(--sand)", background: "none",
          cursor: currentPage === 1 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: currentPage === 1 ? "var(--ink-muted)" : "var(--ink)",
          opacity: currentPage === 1 ? 0.4 : 1, transition: "all .15s",
        }}
        title="Попередня сторінка"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      {/* Номери сторінок */}
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} style={{ color: "var(--ink-muted)", padding: "0 .25rem", userSelect: "none" }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: p === currentPage ? "none" : "1px solid var(--sand)",
              background: p === currentPage ? "var(--ink)" : "none",
              color: p === currentPage ? "#fff" : "var(--ink)",
              fontWeight: p === currentPage ? 600 : 400,
              cursor: p === currentPage ? "default" : "pointer",
              fontSize: ".88rem", fontFamily: "inherit",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => { if (p !== currentPage) e.currentTarget.style.background = "var(--sand)"; }}
            onMouseLeave={(e) => { if (p !== currentPage) e.currentTarget.style.background = "none"; }}
          >
            {p}
          </button>
        )
      )}

      {/* Кнопка «Вперед» */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          width: 36, height: 36, borderRadius: 8,
          border: "1px solid var(--sand)", background: "none",
          cursor: currentPage === totalPages ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: currentPage === totalPages ? "var(--ink-muted)" : "var(--ink)",
          opacity: currentPage === totalPages ? 0.4 : 1, transition: "all .15s",
        }}
        title="Наступна сторінка"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  );
}

// ── Головний компонент ───────────────────────────────────────────────────────
export default function CatalogPage({
  user,
  onShowProduct,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onOpenAuth,
}) {
  const [searchParams] = useSearchParams();
  const urlCategoryId = searchParams.get("category") || null;
  const urlSearch     = searchParams.get("search")   || "";

  // Дані
  const [categories, setCategories]   = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [displayed, setDisplayed]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Пагінація
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);

  // Адмін — модалка редагування
  const [editingProd, setEditingProd] = useState(null);

  // Фільтри — весь стан в одному об'єкті
  const [filters, setFilters] = useState({
    categoryId: urlCategoryId,
    search:     urlSearch,
    minPrice:   "",
    maxPrice:   "",
    inStock:    false,
    sort:       "",
    tags:       new Set(),
  });

  // Оновлюємо фільтри при зміні URL (пошук з хедера / перехід по категорії)
  useEffect(() => {
    setFilters((prev) => ({ ...prev, categoryId: urlCategoryId, search: urlSearch }));
  }, [urlCategoryId, urlSearch]);

  // Debounce ref для пошуку
  const searchTimer = useRef(null);

  // Назва активної категорії для breadcrumb/title
  const activeCatName = filters.categoryId
    ? categories.find((c) => c._id === filters.categoryId)?.name
    : null;

  // ── Завантаження категорій ─────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => setCategories(DEMO_CATEGORIES));
  }, []);

  // ── Завантаження товарів з API ─────────────────────────────────────────
  const fetchProducts = useCallback(async (f, page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.categoryId) params.set("category", f.categoryId);
      if (f.search)     params.set("search",   f.search);
      if (f.minPrice)   params.set("minPrice",  f.minPrice);
      if (f.maxPrice)   params.set("maxPrice",  f.maxPrice);
      if (f.inStock)    params.set("inStock",   "true");
      params.set("page",  String(page));
      params.set("limit", String(PRODUCTS_PER_PAGE));

      const res  = await fetch("/api/products?" + params.toString());
      const data = await res.json();
      const prods = data.data || [];

      // Зберігаємо пагінацію
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total ?? prods.length);
      setCurrentPage(data.page || page);

      // Завантажуємо рейтинги паралельно
      await Promise.all(
        prods.map(async (p) => {
          try {
            const r = await fetch(`/api/products/${p._id}/reviews`);
            const d = await r.json();
            p._avgRating   = d.avgRating;
            p._reviewCount = d.count;
          } catch { /* ignore */ }
        })
      );

      setAllProducts(prods.length ? prods : (page === 1 ? DEMO_PRODUCTS : []));
    } catch {
      setAllProducts(DEMO_PRODUCTS);
      setTotalPages(1);
      setTotalCount(DEMO_PRODUCTS.length);
    } finally {
      setLoading(false);
    }
  }, []);

  // Перезавантажуємо при зміні "важких" фільтрів — і скидаємо на 1 сторінку
  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(filters, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.categoryId, filters.minPrice, filters.maxPrice, filters.inStock, filters.search]);

  // При зміні сторінки — просто підвантажуємо нову сторінку з поточними фільтрами
  useEffect(() => {
    fetchProducts(filters, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ── Клієнтська фільтрація + сортування ────────────────────────────────
  useEffect(() => {
    let result = [...allProducts];

    // Пошук (клієнтська сторона для швидкого відгуку)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Фільтрація по тегах
    if (filters.tags.size > 0) {
      result = result.filter((p) => {
        if (filters.tags.has("Знижка")      && (p.discountPercent || 0) > 0) return true;
        if (filters.tags.has("Новинка")     && p.isNew)                       return true;
        if (filters.tags.has("Хіт продажів")&& p.isBestseller)               return true;
        if (filters.tags.has("Акція")       && p.isPromo)                     return true;
        // fallback: показуємо якщо назва/опис містить тег
        for (const tag of filters.tags) {
          if (p.name?.toLowerCase().includes(tag.toLowerCase())) return true;
          if (p.description?.toLowerCase().includes(tag.toLowerCase())) return true;
        }
        return false;
      });
    }

    // Сортування
    switch (filters.sort) {
      case "price_asc":     result.sort((a, b) => effectivePrice(a) - effectivePrice(b)); break;
      case "price_desc":    result.sort((a, b) => effectivePrice(b) - effectivePrice(a)); break;
      case "name_asc":      result.sort((a, b) => a.name.localeCompare(b.name, "uk"));    break;
      case "discount_desc": result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0)); break;
      default: break;
    }

    setDisplayed(result);
  }, [allProducts, filters.search, filters.sort, filters.tags]);

  // ── Handlers ───────────────────────────────────────────────────────────
  // ── Адмін: збереження / видалення товару ─────────────────────────────────
  function handlePageChange(page) {
    setCurrentPage(page);
    // Прокрутити вгору каталогу
    document.getElementById("page-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAdminSaved(updated) {
    setAllProducts((prev) => prev.map((p) => p._id === updated._id ? { ...p, ...updated } : p));
    setEditingProd(null);
  }

  function handleAdminDeleted(id) {
    setAllProducts((prev) => prev.filter((p) => p._id !== id));
    setEditingProd(null);
  }

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSearchInput(e) {
    const val = e.target.value;
    // Одразу оновлюємо значення (controlled input), фільтрація з debounce
    setFilter("search", val);
  }

  function handlePriceInput(key, val) {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setFilter(key, val), 400);
  }

  return (
    <section id="page-catalog" className="page active">
      {/* ── Шапка каталогу ── */}
      <div className="catalog-header">
        <div className="catalog-header-inner">
          <div className="catalog-title-block">
            <p className="breadcrumb">
              Головна / <span>{activeCatName || "Каталог"}</span>
            </p>
            <h1 className="catalog-title">
              {activeCatName || "Каталог товарів"}
            </h1>
            <p className="catalog-count">
              {!loading && `Знайдено: ${totalCount} товарів`}
            </p>
          </div>

          <div className="catalog-controls">
            {/* Пошук */}
            <div className="search-wrap">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Пошук..."
                className="search-input"
                value={filters.search}
                onChange={handleSearchInput}
              />
            </div>

            {/* Сортування */}
            <select
              className="sort-select"
              value={filters.sort}
              onChange={(e) => setFilter("sort", e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Тіло каталогу ── */}
      <div className="catalog-body">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Кнопка показу фільтрів (тільки мобільний) */}
          <button
            className="catalog-filters-toggle"
            onClick={() => setFiltersOpen((prev) => !prev)}
            style={{
              display: "none", // показується через CSS @media
              alignItems: "center", gap: ".5rem",
              width: "100%", padding: ".65rem 1rem",
              border: "1px solid var(--sand)", borderRadius: 8,
              background: "none", cursor: "pointer",
              fontSize: ".85rem", fontWeight: 600, letterSpacing: ".06em",
              textTransform: "uppercase", marginBottom: ".75rem",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            {filtersOpen ? "Сховати фільтри" : "Фільтри"}
            {(filters.categoryId || filters.minPrice || filters.maxPrice || filters.inStock) && (
              <span style={{ marginLeft: "auto", background: "var(--accent)", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: ".7rem", display: "flex", alignItems: "center", justifyContent: "center" }}>!</span>
            )}
          </button>

          <div className={`catalog-filters-body${filtersOpen ? "" : " hidden"}`}>
          {/* Категорії */}
          <div className="filter-block">
            <p className="filter-label">КАТЕГОРІЇ</p>
            <div className="category-list">
              <button
                className={`cat-btn${!filters.categoryId ? " active" : ""}`}
                onClick={() => setFilter("categoryId", null)}
              >
                Всі товари
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`cat-btn${filters.categoryId === cat._id ? " active" : ""}`}
                  onClick={() => setFilter("categoryId", cat._id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ціна */}
          <div className="filter-block">
            <p className="filter-label">ЦІНОВИЙ ДІАПАЗОН</p>
            <div className="price-range">
              <input
                type="number"
                placeholder="Від"
                className="price-input"
                defaultValue={filters.minPrice}
                onChange={(e) => handlePriceInput("minPrice", e.target.value)}
              />
              <span className="price-sep">—</span>
              <input
                type="number"
                placeholder="До"
                className="price-input"
                defaultValue={filters.maxPrice}
                onChange={(e) => handlePriceInput("maxPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Наявність */}
          <div className="filter-block">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => setFilter("inStock", e.target.checked)}
              />
              <span className="toggle-switch" />
              <span className="toggle-text">Тільки в наявності</span>
            </label>
          </div>

          {/* Теги */}
          <TagsFilter
            activeTags={filters.tags}
            onTagChange={(tag, isActive) => {
              setFilters((prev) => {
                const next = new Set(prev.tags);
                if (isActive) next.add(tag);
                else next.delete(tag);
                return { ...prev, tags: next };
              });
            }}
          />
          </div>{/* end catalog-filters-body */}
        </aside>

        {/* Сітка товарів */}
        <div className="products-area">
          <div className="products-grid" id="catalogProducts">
            {loading
              ? Array(6).fill(null).map((_, i) => <SkeletonCard key={i} />)
              : displayed.length === 0
              ? (
                <p style={{ gridColumn: "1/-1", color: "var(--ink-muted)", padding: "3rem 0", textAlign: "center" }}>
                  Нічого не знайдено. Спробуйте змінити фільтри.
                </p>
              )
              : displayed.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    prod={prod}
                    onShowProduct={onShowProduct}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={isWishlisted}
                    user={user}
                    onOpenAuth={onOpenAuth}
                    onAdminEdit={user?.role === "admin" ? setEditingProd : null}
                  />
                ))}
          </div>

          {/* Пагінація */}
          {!loading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      {/* Адмін: модалка редагування товару */}
      {editingProd && (
        <AdminEditModal
          prod={editingProd}
          categories={categories}
          onClose={() => setEditingProd(null)}
          onSaved={handleAdminSaved}
          onDeleted={handleAdminDeleted}
        />
      )}
    </section>
  );
}

// ── Теги (окремий компонент бо має власний стан) ────────────────────────────
function TagsFilter({ activeTags, onTagChange }) {
  const tags = ["Новинка", "Знижка", "Хіт продажів", "Акція"];

  return (
    <div className="filter-block">
      <p className="filter-label">ПОПУЛЯРНІ ТЕГИ</p>
      <div className="tags-list">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`tag${activeTags.has(tag) ? " active" : ""}`}
            onClick={() => onTagChange(tag, !activeTags.has(tag))}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
