import { useNavigate } from "react-router-dom";

const VALUES = [
  {
    num: "01",
    title: "Якість перш за все",
    text: "Тільки сертифіковані оригінальні товари. Жодних підробок — ніколи.",
  },
  {
    num: "02",
    title: "Турбота про клієнта",
    text: "Ми завжди на зв'язку. 30-денне повернення без зайвих питань.",
  },
  {
    num: "03",
    title: "Ексклюзивний підбір",
    text: "Куратори з досвідом 10+ років відбирають кожну позицію вручну.",
  },
  {
    num: "04",
    title: "Швидка доставка",
    text: "Відправляємо протягом 24 годин. Безкоштовно від 1500 грн.",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <section id="page-about" className="page active">

      {/* ── Hero ── */}
      <div className="about-hero">
        <img
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1800&q=80&auto=format&fit=crop"
          alt="Про нас"
          className="about-hero-img"
        />
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <p className="section-eyebrow" style={{ color: "var(--accent)" }}>ПРО НАС</p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
            fontWeight: 300,
            color: "#fff",
            marginTop: "0.5rem",
          }}>
            Наша <em style={{ fontStyle: "italic", color: "var(--accent)" }}>історія</em>
          </h1>
        </div>
      </div>

      <div className="about-body">

        {/* ── Інтро ── */}
        <div className="about-intro">
          <div className="about-intro-text">
            <p className="section-eyebrow">MAISON BOUTIQUE</p>
            <h2>Ми віримо, що краса — це не маска, а відображення вашої душі</h2>
            <p>
              З 2018 року ми ретельно відбираємо найкращі косметичні бренди та аксесуари зі
              всього світу. Кожен товар у нашому каталозі проходить власну перевірку якості —
              ми продаємо лише те, чим користуємося самі.
            </p>
            <p>
              Наша команда — це 12 ентузіастів краси, які щодня працюють, щоб ваш
              шопінг-досвід був бездоганним.
            </p>
          </div>
          <div className="about-intro-img">
            <img
              src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80&auto=format&fit=crop"
              alt="Команда"
            />
          </div>
        </div>

        {/* ── Цінності ── */}
        <div className="about-values">
          <div className="about-values-header">
            <p className="section-eyebrow">НАШІ ЦІННОСТІ</p>
            <h2>Що нас відрізняє</h2>
          </div>
          <div className="about-values-grid">
            {VALUES.map((v) => (
              <div className="about-value-card" key={v.num}>
                <div className="about-value-num">{v.num}</div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="about-cta-section">
          <h2>Готові познайомитись з нашим каталогом?</h2>
          <button className="btn-primary" onClick={() => navigate("/catalog")}>
            Переглянути товари →
          </button>
        </div>

      </div>
    </section>
  );
}
