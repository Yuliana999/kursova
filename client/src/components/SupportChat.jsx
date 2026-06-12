import { useState, useEffect, useRef } from "react";

const AUTO_REPLIES = [
  'Дякуємо за ваше повідомлення! Наш менеджер відповість вам найближчим часом 😊',
  'Розуміємо вас! Ми перевіримо цю інформацію і повернемось до вас.',
  'Чудове питання! Звичайно, ми допоможемо вам з цим.',
  'Дякуємо, що звернулися до нас! Ваш запит прийнятий.',
  'Ми цінуємо вашу увагу. Спробуємо допомогти якнайшвидше!',
];

export default function SupportChat({ user }) {
  const [open,        setOpen]        = useState(false);
  const [messages,    setMessages]    = useState([
    { id: 0, from: "agent", text: "Привіт! 👋 Ласкаво просимо до MAISON BOUTIQUE. Чим можемо допомогти?" }
  ]);
  const [inputVal,    setInputVal]    = useState("");
  const [badge,       setBadge]       = useState(false);
  const [guestStep,   setGuestStep]   = useState(false); // показати форму гостя
  const [guestName,   setGuestName]   = useState("");
  const [guestEmail,  setGuestEmail]  = useState("");
  const [guestDone,   setGuestDone]   = useState(false);
  const [autoIdx,     setAutoIdx]     = useState(0);
  const [pollingId,   setPollingId]   = useState(null);
  const [shownIds,    setShownIds]    = useState(new Set());

  const messagesRef = useRef(null);
  const inputRef    = useRef(null);

  // Scroll вниз при нових повідомленнях
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // При відкритті — фокус
  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      const needGuest = !user && !guestDone;
      if (!needGuest) inputRef.current?.focus();
    }, 300);
  }, [open]);

  // Polling відповідей від менеджера (кожні 8 сек)
  function startPolling(email) {
    if (pollingId) clearInterval(pollingId);
    const id = setInterval(async () => {
      try {
        const res  = await fetch(`/api/contacts/check-reply?email=${encodeURIComponent(email)}`);
        const json = await res.json();
        if (!json.success) return;
        json.data.forEach((contact) => {
          if (!shownIds.has(contact._id) && contact.adminReply) {
            setShownIds((prev) => new Set([...prev, contact._id]));
            addMessage("agent", contact.adminReply, true);
            if (!open) setBadge(true);
          }
        });
      } catch { /* ігнорувати */ }
    }, 8000);
    setPollingId(id);
  }

  function addMessage(from, text, fromPolling = false) {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), from, text }]);
    if (fromPolling && !open) setBadge(true);
  }

  function handleOpen() {
    setOpen(true);
    setBadge(false);
    // Показуємо форму гостя тільки якщо не авторизований і ще не заповнив
    if (!user && !guestDone) setGuestStep(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function confirmGuest() {
    if (!guestName.trim()) return;
    if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) return;
    setGuestStep(false);
    setGuestDone(true);
    addMessage("agent", `Дякуємо, ${guestName}! Напишіть ваше запитання і ми відповімо на ${guestEmail} 😊`);
    startPolling(guestEmail);
    setTimeout(() => inputRef.current?.focus(), 150);
  }

  async function sendMessage() {
    const text = inputVal.trim();
    if (!text) return;
    setInputVal("");
    addMessage("user", text);

    const userEmail = user?.email || guestEmail;
    const userName  = user?.name  || guestName || "Гість";

    if (userEmail) {
      try {
        const res  = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: userName, email: userEmail, message: text }),
        });
        const json = await res.json();
        if (json.success) {
          addMessage("agent", "Дякуємо! Ваше повідомлення отримано. Наш менеджер відповість вам найближчим часом 😊");
          startPolling(userEmail);
          return;
        }
      } catch { /* fallthrough */ }
    }

    // Авто-відповідь
    setTimeout(() => {
      addMessage("agent", AUTO_REPLIES[autoIdx % AUTO_REPLIES.length]);
      setAutoIdx((i) => i + 1);
    }, 800 + Math.random() * 600);
  }

  const needGuest = !user && !guestDone;

  return (
    <>
      {/* ── Кнопка ── */}
      <button
        id="supportChatToggleBtn"
        onClick={open ? handleClose : handleOpen}
        title="Підтримка 24/7"
        style={{
          position: "fixed", bottom: "2rem", right: "2rem", zIndex: 400,
          width: 58, height: 58, borderRadius: "50%",
          background: open ? "var(--accent)" : "var(--ink)",
          color: "#fff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 24px rgba(15,14,12,0.25)",
          transition: "background .2s, transform .2s",
          animation: open ? "none" : "chatPulse 3s infinite",
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = "var(--accent)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "var(--ink)"; }}
      >
        {/* Значок непрочитаного */}
        {badge && !open && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            width: 20, height: 20, borderRadius: "50%",
            background: "#e63946", color: "#fff",
            fontSize: ".65rem", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid var(--cream)",
          }}>1</span>
        )}
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* ── Вікно чату ── */}
      <div style={{
        position: "fixed", bottom: "6.5rem", right: "2rem", zIndex: 399,
        width: 360, maxWidth: "calc(100vw - 2rem)",
        background: "var(--cream)", borderRadius: 16,
        boxShadow: "0 8px 40px rgba(0,0,0,.18), 0 0 0 1px var(--sand)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        transformOrigin: "bottom right",
        transform: open ? "scale(1) translateY(0)" : "scale(0.85) translateY(20px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "all" : "none",
        transition: "transform .3s cubic-bezier(0.34,1.56,0.64,1), opacity .25s ease",
      }}>

        {/* Шапка */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1rem 1.2rem", background: "var(--ink)", color: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%", background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 600, flexShrink: 0,
            }}>М</div>
            <div>
              <p style={{ fontSize: ".88rem", fontWeight: 500, lineHeight: 1.2 }}>Maison Support</p>
              <p style={{ fontSize: ".72rem", color: "rgba(255,255,255,.65)", display: "flex", alignItems: "center", gap: ".35rem", marginTop: ".1rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "statusPulse 2s infinite" }} />
                Онлайн зараз
              </p>
            </div>
          </div>
          <button onClick={handleClose} style={{
            width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer",
            background: "transparent", color: "rgba(255,255,255,.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Повідомлення */}
        <div ref={messagesRef} style={{
          flex: 1, padding: "1rem 1.2rem", overflowY: "auto",
          maxHeight: 280, display: "flex", flexDirection: "column",
          gap: ".8rem", background: "var(--sand)",
        }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%", padding: ".65rem 1rem", fontSize: ".84rem", lineHeight: 1.55,
                borderRadius: msg.from === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                background: msg.from === "user" ? "var(--ink)" : "#fff",
                color: msg.from === "user" ? "#fff" : "var(--ink)",
                border: msg.from === "agent" ? "1px solid var(--sand)" : "none",
              }}>{msg.text}</div>
              <span style={{ fontSize: ".65rem", color: "var(--ink-muted)", marginTop: ".2rem", padding: "0 .2rem" }}>Щойно</span>
            </div>
          ))}
        </div>

        {/* Форма гостя */}
        {needGuest && (
          <div style={{
            padding: "10px 12px", borderTop: "1px solid var(--sand)",
            background: "#f8f8f8", display: "flex", flexDirection: "column", gap: 8,
          }}>
            <p style={{ fontSize: ".8rem", color: "var(--ink-muted)", margin: 0 }}>Щоб ми могли відповісти вам, вкажіть:</p>
            <input
              type="text" placeholder="Ваше ім'я *" value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmGuest(); }}
              style={{ border: "1px solid var(--sand)", borderRadius: 8, padding: "7px 11px", fontSize: ".85rem", fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" }}
            />
            <input
              type="email" placeholder="Ваш email *" value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmGuest(); }}
              style={{ border: "1px solid var(--sand)", borderRadius: 8, padding: "7px 11px", fontSize: ".85rem", fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" }}
            />
            <button
              onClick={confirmGuest}
              style={{ background: "var(--ink)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: ".88rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
            >Продовжити →</button>
          </div>
        )}

        {/* Інпут */}
        {!needGuest && (
          <div style={{
            display: "flex", alignItems: "center", gap: ".5rem",
            padding: ".8rem 1rem", borderTop: "1px solid var(--sand)", background: "#fff",
          }}>
            <input
              ref={inputRef}
              type="text" placeholder="Напишіть повідомлення..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
              style={{
                flex: 1, border: "1px solid var(--sand)", borderRadius: 20,
                padding: ".55rem 1rem", fontFamily: "inherit", fontSize: ".84rem",
                background: "var(--cream)", outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "var(--accent)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 4px 24px rgba(15,14,12,0.25), 0 0 0 0 rgba(184,150,110,0.4); }
          50% { box-shadow: 0 4px 24px rgba(15,14,12,0.25), 0 0 0 10px rgba(184,150,110,0); }
        }
        @keyframes statusPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </>
  );
}
