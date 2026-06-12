import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Бренд */}
        <div className="footer-brand">
          <div className="footer-logo">
            <em>Maison</em> Boutique
          </div>
          <p>Преміум косметика та аксесуари для тих, хто цінує якість. Обираємо з любов'ю — саме для вас.</p>
          <div style={{ display: "flex", gap: ".75rem", marginTop: "1.25rem" }}>
            {[
              { href: "#", label: "Instagram", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
              { href: "#", label: "Facebook",  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
              { href: "#", label: "TikTok",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg> },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,.7)",
                  transition: "border-color .2s, color .2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Навігація */}
        <div>
          <p className="footer-heading">Навігація</p>
          <nav className="footer-links">
            <NavLink to="/">Головна</NavLink>
            <NavLink to="/catalog">Каталог</NavLink>
            <NavLink to="/about">Про нас</NavLink>
            <NavLink to="/contacts">Контакти</NavLink>
            <NavLink to="/profile">Мій профіль</NavLink>
          </nav>
        </div>

        {/* Інформація */}
        <div>
          <p className="footer-heading">Інформація</p>
          <nav className="footer-links">
            <a href="#">Умови доставки</a>
            <a href="#">Оплата</a>
            <a href="#">Повернення товару</a>
            <a href="#">Публічна оферта</a>
            <a href="#">Політика конфіденційності</a>
          </nav>
        </div>

        {/* Розсилка */}
        <div className="footer-newsletter">
          <p className="footer-heading">Підпишіться</p>
          <p>Отримуйте ексклюзивні пропозиції та новини першими</p>
          <div className="newsletter-form" style={{ marginTop: "1rem" }}>
            <input type="email" placeholder="Ваш email" />
            <button type="button">→</button>
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
            {[
              { icon: "📞", text: "+38 (050) 123-45-67" },
              { icon: "✉️", text: "hello@maison-boutique.ua" },
              { icon: "📍", text: "вул. Незалежності, 12, Тернопіль" },
            ].map((c) => (
              <p key={c.text} style={{ fontSize: ".82rem", display: "flex", gap: ".5rem", alignItems: "flex-start" }}>
                <span>{c.icon}</span>
                <span style={{ color: "rgba(255,255,255,.65)" }}>{c.text}</span>
              </p>
            ))}
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p style={{ fontSize: ".8rem" }}>© {new Date().getFullYear()} Maison Boutique. Всі права захищено.</p>
        <p style={{ fontSize: ".8rem", color: "rgba(255,255,255,.4)" }}>
          Тільки оригінальна продукція · Безпечна оплата
        </p>
      </div>
    </footer>
  );
}
