import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Header({ user, cartCount, onOpenAuth, onToggleCart, onLogout }) {
  const [profileOpen,      setProfileOpen]      = useState(false);
  const [mobileOpen,       setMobileOpen]       = useState(false);
  const [scrolled,         setScrolled]         = useState(false);
  const [searchVal,        setSearchVal]        = useState("");
  const [mobileSearchVal,  setMobileSearchVal]  = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const profileRef  = useRef(null);
  const searchTimer = useRef(null);
  const navigate    = useNavigate();

  // Тінь при скролі — як в оригіналі
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Закрити dropdown при кліку поза ним
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Закрити мобільне меню при переході
  function handleNavClick() {
    setMobileOpen(false);
    setProfileOpen(false);
  }

  // Пошук з debounce — переходить на /catalog?search=...
  function handleSearchInput(e) {
    const val = e.target.value;
    setSearchVal(val);
    clearTimeout(searchTimer.current);
    if (val.trim()) {
      searchTimer.current = setTimeout(() => {
        navigate(`/catalog?search=${encodeURIComponent(val.trim())}`);
      }, 400);
    }
  }

  function handleSearchEnter(e) {
    if (e.key === "Enter" && searchVal.trim()) {
      clearTimeout(searchTimer.current);
      navigate(`/catalog?search=${encodeURIComponent(searchVal.trim())}`);
    }
  }

  function handleMobileSearchInput(e) {
    const val = e.target.value;
    setMobileSearchVal(val);
    clearTimeout(searchTimer.current);
    if (val.trim()) {
      searchTimer.current = setTimeout(() => {
        navigate(`/catalog?search=${encodeURIComponent(val.trim())}`);
      }, 400);
    }
  }

  function handleMobileSearchEnter(e) {
    if (e.key === "Enter" && mobileSearchVal.trim()) {
      clearTimeout(searchTimer.current);
      navigate(`/catalog?search=${encodeURIComponent(mobileSearchVal.trim())}`);
      setMobileSearchOpen(false);
    }
  }

  function handleProfileClick() {
    if (!user) {
      onOpenAuth("login");
    } else {
      setProfileOpen((prev) => !prev);
    }
  }

  return (
    <header className={`header${scrolled ? " scrolled" : ""}`} id="header">
      <div className="header-inner">

        {/* Логотип */}
        <NavLink to="/" className="logo" onClick={handleNavClick}>
          <div className="logo-mark">M</div>
          <div className="logo-text">
            <span className="logo-main">MAISON</span>
            <span className="logo-sub">BOUTIQUE</span>
          </div>
        </NavLink>

        {/* Навігація */}
        <nav className={`nav${mobileOpen ? " mobile-open" : ""}`} id="nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            data-page="home"
            onClick={handleNavClick}
          >
            Головна
          </NavLink>
          <NavLink
            to="/catalog"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            data-page="catalog"
            onClick={handleNavClick}
          >
            Каталог
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            data-page="about"
            onClick={handleNavClick}
          >
            Про нас
          </NavLink>
          <NavLink
            to="/contacts"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            data-page="contacts"
            onClick={handleNavClick}
          >
            Контакти
          </NavLink>
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              data-page="admin"
              onClick={handleNavClick}
            >
              ⚙ Адмін
            </NavLink>
          )}
        </nav>

        {/* Пошук */}
        <div className="header-search-wrap" id="headerSearchWrap">
          <svg className="header-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Пошук товарів..."
            className="header-search-input"
            value={searchVal}
            onChange={handleSearchInput}
            onKeyDown={handleSearchEnter}
          />
        </div>

        {/* Дії */}
        <div className="header-actions">

          {/* Профіль + dropdown */}
          <div className="profile-dropdown-wrap" ref={profileRef} id="profileDropdownWrap">
            <button
              className="icon-btn"
              id="authBtn"
              onClick={handleProfileClick}
              title="Акаунт"
            >
              {user ? (
                <span style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--ink)", color: "#fff",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: ".8rem", fontWeight: 500,
                }}>
                  {user.name[0].toUpperCase()}
                </span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </button>

            {user && (
              <div className={`profile-dropdown${profileOpen ? " open" : ""}`} id="profileDropdown">
                <div className="profile-dropdown-header">
                  <p className="profile-dropdown-name">{user.name}</p>
                  <p className="profile-dropdown-email">{user.email}</p>
                </div>
                <div className="profile-dropdown-menu">
                  <NavLink to="/profile" className="profile-dropdown-item" onClick={() => { setProfileOpen(false); handleNavClick(); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Мій профіль
                  </NavLink>

                  {user.role === "admin" && (
                    <NavLink to="/admin" className="profile-dropdown-item" onClick={() => { setProfileOpen(false); handleNavClick(); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      Адмін-панель
                    </NavLink>
                  )}
                  <hr style={{ margin: ".3rem 0", borderColor: "var(--sand)" }} />
                  <button
                    className="profile-dropdown-item danger"
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Вийти
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Кошик */}
          <button className="icon-btn cart-btn" onClick={onToggleCart} title="Кошик">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span className="cart-badge" id="cartCount">{cartCount}</span>
          </button>

          {/* Кнопка мобільного пошуку */}
          <button
            className="icon-btn mobile-search-btn"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            title="Пошук"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {/* Мобільне меню */}
          <button
            className="mobile-menu-btn"
            id="mobileMenuBtn"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span/><span/><span/>
          </button>
        </div>
      </div>

      {/* Мобільний пошук */}
      <div className={`mobile-search${mobileSearchOpen ? " visible" : ""}`} id="mobileSearch">
        <input
          type="text"
          placeholder="Пошук товарів..."
          id="mobileSearchInput"
          value={mobileSearchVal}
          onChange={handleMobileSearchInput}
          onKeyDown={handleMobileSearchEnter}
          autoFocus={mobileSearchOpen}
        />
      </div>
    </header>
  );
}
