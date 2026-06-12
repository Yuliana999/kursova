import { useEffect } from "react";

const CONTACT_CARDS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
      </svg>
    ),
    label: "Телефон",
    value: "+38 (050) 123-45-67",
    sub: "Пн–Пт, 9:00–18:00",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: "Email",
    value: "hello@maison-boutique.ua",
    sub: "Відповідаємо до 24 год",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: "Адреса",
    value: "вул. Незалежності, 12",
    sub: "Тернопіль, 46000",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 2H3v16h5l4 4 4-4h5V2z"/>
      </svg>
    ),
    label: "Соцмережі",
    social: true,
  },
];

export default function ContactsPage() {
  function openSupportChat() {
    const btn = document.getElementById("supportChatToggleBtn");
    if (btn) btn.click();
  }

  return (
    <section id="page-contacts" className="page active">

      <div className="contacts-header">
        <p className="section-eyebrow">КОНТАКТИ</p>
        <h1>{"Зв'яжіться"} <em>{"з нами"}</em></h1>
        <p>{"Ми відповідаємо протягом кількох годин. Завжди раді допомогти."}</p>
      </div>

      <div className="contacts-body">

        <div className="contacts-info">
          {CONTACT_CARDS.map((card) => (
            <div className="contact-card" key={card.label}>
              <div className="contact-icon">{card.icon}</div>
              <div>
                <p className="contact-label">{card.label}</p>
                {card.social ? (
                  <div className="social-links">
                    <a href="#" className="social-link">Instagram</a>
                    <a href="#" className="social-link">Telegram</a>
                    <a href="#" className="social-link">TikTok</a>
                  </div>
                ) : (
                  <>
                    <p className="contact-value">{card.value}</p>
                    <p className="contact-sub">{card.sub}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="contact-chat-hint">
          <div className="contact-chat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2>{"Онлайн-чат підтримки"}</h2>
          <p>{"Скористайтеся нашим чатом підтримки — натисніть на іконку повідомлення в правому нижньому куті сторінки. Ми відповідаємо миттєво!"}</p>
          <button className="btn-primary" onClick={openSupportChat}>{"Відкрити чат →"}</button>
        </div>

      </div>
    </section>
  );
}
