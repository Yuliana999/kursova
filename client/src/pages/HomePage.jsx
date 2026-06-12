import { useState, useEffect } from "react";

// ── CSS variables (беруться з style.css, тут для зручності) ──────────────
// Залишаємо style.css без змін — імпортуй його в App.jsx як раніше

// ── Константи ──────────────────────────────────────────────────────────────
const CATEGORY_PHOTOS = [
  { sub: "КОСМЕТИК",         url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80&auto=format&fit=crop" },
  { sub: "ДОГЛЯД ЗА ВОЛОСС", url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80&auto=format&fit=crop" },
  { sub: "ЗАСОБИ ДЛЯ ТІЛ",  url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80&auto=format&fit=crop" },
  { sub: "ВОЛОСС",           url: "https://images.unsplash.com/photo-1527799820374-87391604816a?w=600&q=80&auto=format&fit=crop" },
  { sub: "ПАРФУМ",           url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80&auto=format&fit=crop" },
  { sub: "АКСЕСУАР",         url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&auto=format&fit=crop" },
];

const DEMO_PRODUCTS = [
  { _id: "1", name: "Крем для обличчя",      price: 450, discountPercent: 0,  imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80&auto=format&fit=crop" },
  { _id: "2", name: "Сироватка з гіалуронкою", price: 680, discountPercent: 15, imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&q=80&auto=format&fit=crop" },
  { _id: "3", name: "Масло для тіла",        price: 320, discountPercent: 0,  imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80&auto=format&fit=crop" },
  { _id: "4", name: "Тональний крем",        price: 590, discountPercent: 20, imageUrl: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80&auto=format&fit=crop" },
  { _id: "5", name: "Палетка тіней",         price: 750, discountPercent: 0,  imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80&auto=format&fit=crop" },
  { _id: "6", name: "Помада матова",         price: 280, discountPercent: 10, imageUrl: "https://images.unsplash.com/photo-1586495777744-4e6232bf7026?w=400&q=80&auto=format&fit=crop" },
];

const TICKER_ITEMS = [
  "НОВА КОЛЕКЦІЯ", "БЕЗКОШТОВНА ДОСТАВКА", "ПРЕМІУМ ЯКІСТЬ",
  "ЕКСКЛЮЗИВНИЙ ВИБІР", "ТІЛЬКИ ОРИГІНАЛИ", "ШВИДКА ДОСТАВКА",
];

// ── Допоміжні функції ───────────────────────────────────────────────────────
function getCategoryPhoto(name, index) {
  const upper = name.toUpperCase();
  const match = CATEGORY_PHOTOS.find((c) => upper.includes(c.sub));
  return match ? match.url : CATEGORY_PHOTOS[index % CATEGORY_PHOTOS.length].url;
}

function effectivePrice(prod) {
  return Math.round(prod.price * (1 - prod.discountPercent / 100));
}

// ── Підкомпоненти ───────────────────────────────────────────────────────────

function Hero({ onShowCatalog }) {
  return (
    <div className="hero">
      <div className="hero-photo-bg">
        <img src="/hero-bg.png" alt="Beauty hero" className="hero-bg-img" />
        <div className="hero-photo-overlay" />
      </div>

      <div className="hero-content hero-content-centered">
        <div className="hero-label">
          <span className="label-line" />
          <span>Нова колекція 2026</span>
        </div>
        <h1 className="hero-title">
          Краса —<br />
          це <em>мистецтво</em>
          <br />
          бути собою
        </h1>
        <p className="hero-desc">
          Преміум косметика та аксесуари для тих, хто цінує якість. Обрані з
          любов'ю — саме для вас.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary" onClick={onShowCatalog}>
            Переглянути каталог
          </button>
          <button className="btn-ghost-light" onClick={onShowCatalog}>
            Новинки →
          </button>
        </div>
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <span className="hero-stat-num">2 400+</span>
          <span className="hero-stat-label">задоволених клієнтів</span>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <span className="hero-stat-num">500+</span>
          <span className="hero-stat-label">товарів у каталозі</span>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <span className="hero-stat-num">5★</span>
          <span className="hero-stat-label">середній рейтинг</span>
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  // Дублюємо масив щоб анімація була безперервною
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker">
      <div className="ticker-inner">
        {items.map((text, i) => (
          <span key={i}>
            {text}
            <span className="ticker-dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ cat, index, onShowCatalog }) {
  const photo = cat.imageUrl && cat.imageUrl.trim()
    ? cat.imageUrl
    : getCategoryPhoto(cat.name, index);
  return (
    <div className="category-card" onClick={() => onShowCatalog(cat._id)}>
      <img
        className="category-card-photo"
        src={photo}
        alt={cat.name}
        loading="lazy"
      />
      <div className="category-card-overlay" />
      <span className="category-card-sub">ПЕРЕГЛЯНУТИ</span>
      <span className="category-card-name">{cat.name}</span>
    </div>
  );
}

function SkeletonCard({ tall }) {
  return <div className={`skeleton-card${tall ? " tall" : ""}`} />;
}

function ProductCard({ prod, onShowProduct, onAddToCart, onToggleWishlist, isWishlisted, user, onOpenAuth }) {
  const hasDiscount = prod.discountPercent > 0;
  const price = hasDiscount ? effectivePrice(prod) : prod.price;

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
            title={isWishlisted && isWishlisted(prod._id) ? "Видалити з бажаного" : "Додати в бажане"}
            onClick={(e) => {
              e.stopPropagation();
              if (!user) { onOpenAuth("login"); }
              else { onToggleWishlist(prod); }
            }}
            style={{
              position: "absolute", top: 8, right: 8,
              width: 32, height: 32, borderRadius: "50%",
              background: isWishlisted && isWishlisted(prod._id) ? "var(--accent)" : "rgba(255,255,255,.85)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke={isWishlisted && isWishlisted(prod._id) ? "#fff" : "var(--ink)"}
              strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        )}
      </div>
      <div className="product-card-body">
        <p className="product-card-name">{prod.name}</p>
        <p className="product-card-price">
          {price} грн
          {hasDiscount && (
            <span className="old-price"> {prod.price} грн</span>
          )}
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

function BrandStrip() {
  const words = ["ЯКІСТЬ", "СТИЛЬ", "КРАСА", "ЕЛЕГАНТНІСТЬ", "ЕКСКЛЮЗИВ"];
  const wordStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(0.85rem, 1.3vw, 1.4rem)",
    fontWeight: 300,
    letterSpacing: "0.15em",
    color: "var(--ink)",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };
  const dotStyle = { color: "var(--accent)", fontSize: "1rem", flexShrink: 0 };
  const items = [];
  words.forEach((w, i) => {
    items.push(<span key={w} style={wordStyle}>{w}</span>);
    if (i < words.length - 1) items.push(<span key={i + "dot"} style={dotStyle}>·</span>);
  });
  return (
    <div style={{ padding: "2.5rem 4rem", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 960, margin: "0 auto" }}>
        {items}
      </div>
    </div>
  );
}

function UspStrip() {
  const items = [
    {
      title: "Безкоштовна доставка",
      sub: "При замовленні від 1500 грн",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="15" height="13" />
          <path d="m16 8 2 0 4 4v3h-6V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      title: "Гарантія якості",
      sub: "30 днів на повернення",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      title: "Підтримка 24/7",
      sub: "Завжди готові допомогти",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: "Найкращі ціни",
      sub: "Регулярні акції та знижки",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="usp-strip">
      {items.map((item, i) => (
        <span key={item.title} style={{ display: "flex", alignItems: "center" }}>
          <div className="usp-item">
            <div className="usp-icon">{item.icon}</div>
            <div>
              <p className="usp-title">{item.title}</p>
              <p className="usp-sub">{item.sub}</p>
            </div>
          </div>
          {i < items.length - 1 && <div className="usp-divider" />}
        </span>
      ))}
    </div>
  );
}

// ── Головний компонент ──────────────────────────────────────────────────────
export default function HomePage({ onShowCatalog, onShowProduct, onAddToCart, onToggleWishlist, isWishlisted, user, onOpenAuth }) {
  const [categories, setCategories] = useState(null); // null = loading
  const [products, setProducts]     = useState(null);

  // Завантаження категорій
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data))
      .catch(() =>
        setCategories([
          { _id: "1", name: "Косметика" },
          { _id: "2", name: "Догляд за волоссям" },
          { _id: "3", name: "Засоби для тіла" },
          { _id: "4", name: "Парфуми" },
        ])
      );
  }, []);

  // Завантаження featured products
  useEffect(() => {
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((d) => {
        let prods = d.data || [];
        prods = prods.slice(0, 6);
        setProducts(prods.length ? prods : DEMO_PRODUCTS);
      })
      .catch(() => setProducts(DEMO_PRODUCTS));
  }, []);

  return (
    <section id="page-home" className="page active">
      <Hero onShowCatalog={onShowCatalog} />

      <Ticker />

      {/* CATEGORIES */}
      <div className="section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">01 — КАТЕГОРІЇ</p>
            <h2 className="section-title">Розділи магазину</h2>
          </div>
          <a href="#" className="see-all-link" onClick={(e) => { e.preventDefault(); onShowCatalog(); }}>
            Переглянути всі →
          </a>
        </div>
        <div className="categories-grid" id="homeCategories">
          {categories === null
            ? Array(4).fill(null).map((_, i) => <SkeletonCard key={i} tall />)
            : categories.map((cat, i) => (
                <CategoryCard
                  key={cat._id}
                  cat={cat}
                  index={i}
                  onShowCatalog={onShowCatalog}
                />
              ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div className="section-bg-sand">
        <div className="section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">02 — ДОБІРКА</p>
              <h2 className="section-title">Популярні товари</h2>
            </div>
            <a href="#" className="see-all-link" onClick={(e) => { e.preventDefault(); onShowCatalog(); }}>
              Всі товари →
            </a>
          </div>
          <div className="products-grid" id="featuredProducts">
            {products === null
              ? Array(4).fill(null).map((_, i) => <SkeletonCard key={i} />)
              : products.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    prod={prod}
                    onShowProduct={onShowProduct}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={isWishlisted}
                    user={user}
                    onOpenAuth={onOpenAuth}
                  />
                ))}
          </div>
        </div>
      </div>

      <BrandStrip />
      <UspStrip />
    </section>
  );
}
