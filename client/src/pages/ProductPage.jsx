import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// ── Допоміжні ─────────────────────────────────────────────────────────────────
function effectivePrice(prod) {
  return prod.discountPercent > 0
    ? Math.round(prod.price * (1 - prod.discountPercent / 100))
    : prod.price;
}

function pluralReviews(n) {
  if (n === 1) return "відгук";
  if (n >= 2 && n <= 4) return "відгуки";
  return "відгуків";
}

// ── Зірки ─────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 16 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="stars-wrap">
      {Array.from({ length: 5 }, (_, i) => {
        let cls = "star-empty";
        if (i < full) cls = "star-full";
        else if (i === full && half) cls = "star-half";
        return (
          <span key={i} className={`star ${cls}`} style={{ fontSize: size }}>★</span>
        );
      })}
    </span>
  );
}

// ── Інтерактивний вибір зірок ─────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="review-stars-input" style={{ display: "flex", gap: 4, cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            fontSize: 28,
            color: i <= (hover || value) ? "#c9a96e" : "var(--sand)",
            transition: "color .15s",
          }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ── Секція відгуків ───────────────────────────────────────────────────────────
function ReviewsSection({ productId, user, onOpenAuth }) {
  const [data,    setData]    = useState(null); // { count, avgRating, data: [] }
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [toast,   setToast]   = useState("");

  function showMsg(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function load() {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const d   = await res.json();
      setData(d);
    } catch {
      setData({ count: 0, avgRating: 0, data: [] });
    }
  }

  useEffect(() => { if (productId) load(); }, [productId]);

  async function handleSubmit() {
    if (!user) { onOpenAuth("login"); return; }
    if (!rating) { showMsg("Оберіть оцінку від 1 до 5 зірок"); return; }
    setSending(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:   user._id,
          userName: user.name,
          rating,
          comment,
        }),
      });
      const d = await res.json();
      if (!d.success) { showMsg(d.message || "Помилка"); return; }
      showMsg("Дякуємо за відгук!");
      setRating(0);
      setComment("");
      load();
    } catch {
      showMsg("Помилка збереження відгуку");
    } finally {
      setSending(false);
    }
  }

  const canReview = !!user;

  return (
    <div className="reviews-section" style={{ marginTop: "3rem" }}>
      {/* Заголовок */}
      <div className="reviews-header">
        <h2 className="reviews-title">Відгуки</h2>
        {data && data.count > 0 && (
          <div className="reviews-avg">
            <Stars rating={data.avgRating} size={18} />
            <span className="reviews-avg-score">{data.avgRating}</span>
            <span className="reviews-avg-count">
              {data.count} {pluralReviews(data.count)}
            </span>
          </div>
        )}
      </div>

      {/* Форма відгуку */}
      {canReview ? (
        <div className="review-form" id="reviewForm">
          <p className="review-form-label">Ваша оцінка</p>
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            className="review-textarea"
            placeholder="Напишіть відгук (необов'язково)..."
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ marginTop: ".75rem" }}
          />
          <button
            className="btn-primary small"
            onClick={handleSubmit}
            disabled={sending}
            style={{ marginTop: ".5rem" }}
          >
            {sending ? "Публікується..." : "Опублікувати відгук"}
          </button>
          {toast && (
            <p style={{ fontSize: ".82rem", color: "var(--ink-muted)", marginTop: ".5rem" }}>
              {toast}
            </p>
          )}
        </div>
      ) : !user ? (
        <p className="review-login-note">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onOpenAuth("login"); }}
          >
            Увійдіть
          </a>
          , щоб залишити відгук.
        </p>
      ) : null}

      {/* Список відгуків */}
      <div className="reviews-list" id="reviewsList">
        {!data ? (
          <p style={{ color: "var(--ink-muted)" }}>Завантаження...</p>
        ) : data.count === 0 ? (
          <p className="reviews-empty">Відгуків ще немає. Будьте першим!</p>
        ) : (
          data.data.map((r, i) => (
            <div className="review-item" key={i}>
              <div className="review-item-header">
                <span className="review-item-name">{r.userName}</span>
                <span className="review-item-stars">
                  <Stars rating={r.rating} size={14} />
                </span>
                <span className="review-item-date">
                  {new Date(r.createdAt).toLocaleDateString("uk-UA")}
                </span>
              </div>
              {r.comment && (
                <p className="review-item-comment">{r.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="product-detail-v2" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
      <div style={{ height: 18, width: 240, background: "var(--sand)", borderRadius: 4, marginBottom: "2rem" }} />
      <div className="product-detail-v2-inner">
        <div style={{ background: "var(--sand)", borderRadius: 12, aspectRatio: "1/1", minHeight: 400 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[200, 120, 300, 80, 80, 160].map((w, i) => (
            <div key={i} style={{ height: i === 0 ? 36 : 20, width: w, background: "var(--sand)", borderRadius: 4 }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}


// ── Схожі товари ──────────────────────────────────────────────────────────────
function RelatedProducts({ categoryId, currentId, onAddToCart, user, navigate }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!categoryId) return;
    fetch(`/api/products?category=${categoryId}`)
      .then((r) => r.json())
      .then((d) => {
        const list = (d.data || [])
          .filter((p) => p._id !== currentId)
          .slice(0, 4);
        setProducts(list);
      })
      .catch(() => setProducts([]));
  }, [categoryId, currentId]);

  if (!products.length) return null;

  return (
    <div style={{
      marginTop: "3.5rem",
      paddingTop: "2.5rem",
      borderTop: "1px solid var(--sand)",
    }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{
          fontSize: ".72rem",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          fontWeight: 500,
          marginBottom: ".4rem",
        }}>ВАМ ТАКОЖ МОЖЕ СПОДОБАТИСЬ</p>
        <h2 style={{
          fontFamily: "\'Cormorant Garamond\', serif",
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          fontWeight: 300,
          margin: 0,
        }}>Схожі товари</h2>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "1.25rem",
      }}>
        {products.map((p) => {
          const hasDiscount = p.discountPercent > 0;
          const price = effectivePrice(p);
          const inStock = p.stockQuantity > 0;
          return (
            <div
              key={p._id}
              onClick={() => navigate(`/product/${p._id}`)}
              style={{
                border: "1px solid var(--sand)",
                borderRadius: 10,
                overflow: "hidden",
                cursor: "pointer",
                background: "#fff",
                transition: "box-shadow .2s, transform .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.1)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", background: "var(--sand)" }}>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)" }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                      </svg>
                    </div>
                }
                {hasDiscount && (
                  <span style={{
                    position: "absolute", top: 8, left: 8,
                    background: "var(--ink)", color: "#fff",
                    fontSize: ".68rem", fontWeight: 600,
                    padding: ".2rem .5rem", borderRadius: 4,
                    letterSpacing: ".04em",
                  }}>-{p.discountPercent}%</span>
                )}
              </div>

              <div style={{ padding: ".9rem 1rem 1rem" }}>
                <p style={{
                  fontSize: ".88rem", fontWeight: 500,
                  marginBottom: ".35rem", lineHeight: 1.35,
                  color: "var(--ink)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>{p.name}</p>

                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".65rem" }}>
                  <span style={{ fontSize: ".95rem", fontWeight: 600, color: "var(--ink)" }}>{price} грн</span>
                  {hasDiscount && (
                    <span style={{ fontSize: ".78rem", color: "var(--ink-muted)", textDecoration: "line-through" }}>{p.price} грн</span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!inStock) return;
                    onAddToCart(p._id, p.name, price, p.imageUrl || "");
                  }}
                  disabled={!inStock}
                  style={{
                    width: "100%",
                    padding: ".5rem",
                    border: inStock ? "1px solid var(--ink)" : "1px solid var(--sand)",
                    borderRadius: 6,
                    background: inStock ? "var(--ink)" : "transparent",
                    color: inStock ? "#fff" : "var(--ink-muted)",
                    fontSize: ".8rem",
                    fontWeight: 500,
                    cursor: inStock ? "pointer" : "default",
                    fontFamily: "inherit",
                    letterSpacing: ".04em",
                    transition: "background .2s, color .2s",
                  }}
                >
                  {inStock ? "До кошика" : "Немає в наявності"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Головний компонент ────────────────────────────────────────────────────────
export default function ProductPage({ user, onAddToCart, onOpenAuth }) {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [prod, setProd]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [wished, setWished]   = useState(false);
  const [addedMsg, setAddedMsg] = useState(false);

  // Wishlist helpers (localStorage)
  function getWishlist() {
    try { return JSON.parse(localStorage.getItem("maison_wishlist") || "[]"); }
    catch { return []; }
  }
  function saveWishlist(list) {
    localStorage.setItem("maison_wishlist", JSON.stringify(list));
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProd(d.data || null);
        // Перевіряємо чи в бажаному
        const wl = getWishlist();
        setWished(wl.some((w) => w._id === (d.data?._id)));
      })
      .catch(() => setProd(null))
      .finally(() => setLoading(false));

    // Скрол вгору при відкритті товару
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  function handleAddToCart() {
    if (!prod) return;
    const price = effectivePrice(prod);
    onAddToCart(prod._id, prod.name, price, prod.imageUrl || "");
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  }

  function handleWishlist() {
    if (!user) { onOpenAuth("login"); return; }
    if (!prod) return;
    const wl = getWishlist();
    if (wished) {
      saveWishlist(wl.filter((w) => w._id !== prod._id));
      setWished(false);
    } else {
      saveWishlist([...wl, prod]);
      setWished(true);
    }
  }

  if (loading) return <section className="page active"><ProductSkeleton /></section>;

  if (!prod) {
    return (
      <section className="page active">
        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ color: "var(--ink-muted)", marginBottom: "1.5rem" }}>
            Товар не знайдено
          </p>
          <button className="btn-primary" onClick={() => navigate("/catalog")}>
            ← Назад до каталогу
          </button>
        </div>
      </section>
    );
  }

  const hasDiscount = prod.discountPercent > 0;
  const price       = effectivePrice(prod);
  const inStock     = prod.stockQuantity > 0;

  return (
    <section id="page-product" className="page active">
      <div className="product-detail-v2">

        {/* Хлібні крихти */}
        <p className="product-breadcrumb">
          <Link to="/">Головна</Link>
          {" / "}
          <Link to="/catalog">Каталог</Link>
          {" / "}
          <span>{prod.name}</span>
        </p>

        <div className="product-detail-v2-inner">

          {/* Галерея */}
          <div className="product-detail-v2-gallery">
            <div className="product-detail-v2-main-img">
              {prod.imageUrl ? (
                <img src={prod.imageUrl} alt={prod.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{
                  width: "100%", height: "100%", minHeight: 420,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--ink-muted)",
                }}>
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Інформація */}
          <div>
            {hasDiscount && (
              <span className="product-detail-v2-badge">
                -{prod.discountPercent}% знижка
              </span>
            )}

            <h1 className="product-detail-v2-name">{prod.name}</h1>

            {/* Ціна */}
            <div className="product-detail-v2-price-row">
              <span className="product-detail-v2-price">{price} грн</span>
              {hasDiscount && (
                <span className="product-detail-v2-old-price">{prod.price} грн</span>
              )}
            </div>

            {/* Опис */}
            <p className="product-detail-v2-desc">
              {prod.description || "Детальний опис товару відсутній."}
            </p>

            {/* Мета */}
            <div className="product-detail-v2-meta">
              <div className="product-detail-v2-meta-item">
                <p>В наявності</p>
                <p style={{ color: inStock ? "var(--ink)" : "#ef4444", fontWeight: 500 }}>
                  {inStock ? `${prod.stockQuantity} шт.` : "Немає в наявності"}
                </p>
              </div>
              {prod.category && (
                <div className="product-detail-v2-meta-item">
                  <p>Категорія</p>
                  <p>{prod.category?.name || "—"}</p>
                </div>
              )}
              {hasDiscount && (
                <div className="product-detail-v2-meta-item">
                  <p>Ви економите</p>
                  <p style={{ color: "#16a34a", fontWeight: 500 }}>{prod.price - price} грн</p>
                </div>
              )}
            </div>

            {/* Кнопки дій */}
            <div className="product-detail-v2-actions">
              <button
                className="btn-primary"
                style={{ flex: 1, position: "relative" }}
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ marginRight: ".4rem", verticalAlign: "middle" }}>
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {addedMsg ? "✓ Додано!" : inStock ? "Додати в кошик" : "Немає в наявності"}
              </button>

              <button
                className={`product-detail-v2-wish${wished ? " active" : ""}`}
                id="detailWishBtn"
                onClick={handleWishlist}
                title={wished ? "Прибрати з бажаного" : "Додати до бажаного"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24"
                  fill={wished ? "currentColor" : "none"}
                  stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            <button
              className="btn-ghost"
              style={{ marginTop: ".8rem", width: "100%" }}
              onClick={() => navigate("/catalog")}
            >
              ← Назад до каталогу
            </button>
          </div>
        </div>

        {/* Відгуки */}
        <ReviewsSection
          productId={prod._id}
          user={user}
          onOpenAuth={onOpenAuth}
        />

        {/* Схожі товари */}
        <RelatedProducts
          categoryId={prod.category?._id || prod.category}
          currentId={prod._id}
          onAddToCart={onAddToCart}
          user={user}
          navigate={navigate}
        />
      </div>
    </section>
  );
}
