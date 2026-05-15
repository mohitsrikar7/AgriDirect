import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const categoryCards = [
  {
    title: "Morning Harvest",
    subtitle: "Tomatoes, greens, and same-day freshness",
    image: "/images/tomato.jpg",
    accent: "#e76f51",
  },
  {
    title: "Seasonal Sweetness",
    subtitle: "Fruit selected around local growing cycles",
    image: "/images/apple.jpg",
    accent: "#f4a261",
  },
  {
    title: "Kitchen Staples",
    subtitle: "Potatoes, onions, and everyday essentials",
    image: "/images/potato.jpg",
    accent: "#d4a373",
  },
];

const journeySteps = [
  {
    id: "01",
    title: "Farmers list what is actually ready",
    description:
      "Inventory reflects active harvests instead of warehouse stock, so customers see produce with a real source.",
  },
  {
    id: "02",
    title: "Customers shop closer to the source",
    description:
      "Transparent pricing and direct discovery reduce unnecessary layers between growers and households.",
  },
  {
    id: "03",
    title: "Both sides grow with better signals",
    description:
      "Mandi insights, demand visibility, and trusted fulfillment help the platform work beyond a one-time order.",
  },
];

const impactStats = [
  { value: "500+", label: "verified farmers" },
  { value: "24h", label: "freshness window" },
  { value: "10+", label: "active cities" },
  { value: "98%", label: "satisfaction" },
];

const audienceCards = [
  {
    eyebrow: "For farmers",
    title: "Sell with more control and better margins.",
    description:
      "Show available produce, watch market cues, and connect with buyers without depending entirely on middlemen.",
    cta: "Start selling",
    tone: "farmer",
  },
  {
    eyebrow: "For customers",
    title: "Buy produce that feels traceable and alive.",
    description:
      "Explore fruits and vegetables with a clearer origin story, fresher timing, and pricing that feels fairer.",
    cta: "Start shopping",
    tone: "customer",
  },
];

const sectionNotes = [
  "Fresh supply that reflects the field, not only the shelf.",
  "Fairer digital trade for farmers and households alike.",
  "A platform built for trust, speed, and practical value.",
];

const useReveal = () => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("landing-visible");
          observer.unobserve(node);
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return ref;
};

const Reveal = ({ children, className = "", delay = 0 }) => {
  const ref = useReveal();

  return (
    <div
      ref={ref}
      className={`landing-reveal ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const pageStyles = `
  .landing-page {
    --landing-bg: #f4efe5;
    --landing-surface: rgba(255, 250, 243, 0.72);
    --landing-panel: rgba(20, 34, 24, 0.86);
    --landing-panel-soft: rgba(255, 255, 255, 0.64);
    --landing-border: rgba(39, 56, 42, 0.14);
    --landing-text: #162113;
    --landing-muted: rgba(22, 33, 19, 0.68);
    --landing-muted-strong: rgba(255, 255, 255, 0.74);
    --landing-accent: #3e6b43;
    --landing-accent-strong: #27452b;
    --landing-highlight: #eeb868;
    background:
      radial-gradient(circle at top left, rgba(238, 184, 104, 0.26), transparent 28%),
      radial-gradient(circle at 85% 12%, rgba(76, 132, 84, 0.2), transparent 22%),
      linear-gradient(180deg, #f6f1e8 0%, #f4efe5 48%, #efe7d9 100%);
    color: var(--landing-text);
    overflow: hidden;
  }

  .landing-shell {
    width: min(1180px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .landing-reveal {
    opacity: 0;
    transform: translateY(36px);
    transition:
      opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .landing-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .landing-kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.95rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 248, 238, 0.92);
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .landing-kicker::before {
    content: "";
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
    background: var(--landing-highlight);
    box-shadow: 0 0 0 6px rgba(238, 184, 104, 0.12);
  }

  .landing-button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem;
  }

  .landing-primary,
  .landing-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 3.2rem;
    padding: 0.9rem 1.4rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      background-color 180ms ease,
      border-color 180ms ease,
      color 180ms ease;
  }

  .landing-primary:hover,
  .landing-secondary:hover {
    transform: translateY(-1px);
  }

  .landing-primary {
    color: #fffaf3;
    background: var(--landing-accent-strong);
    border: 1px solid var(--landing-accent-strong);
    box-shadow: 0 14px 32px rgba(24, 42, 27, 0.18);
  }

  .landing-primary:hover {
    background: #315836;
    border-color: #315836;
  }

  .landing-secondary {
    color: rgba(255, 248, 238, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(14px);
  }

  .landing-secondary:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.34);
  }

  .landing-hero {
    position: relative;
    min-height: 100svh;
    padding: 6.75rem 0 3rem;
    display: flex;
    align-items: center;
  }

  .landing-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(14, 21, 16, 0.76) 0%, rgba(14, 21, 16, 0.54) 42%, rgba(14, 21, 16, 0.26) 100%),
      linear-gradient(180deg, rgba(14, 21, 16, 0.06) 0%, rgba(14, 21, 16, 0.46) 100%),
      url("/slides/slide4.jpg") center/cover no-repeat;
    z-index: 0;
  }

  .landing-hero::after {
    content: "";
    position: absolute;
    inset: auto 0 0;
    height: 10rem;
    background: linear-gradient(180deg, rgba(244, 239, 229, 0) 0%, rgba(244, 239, 229, 1) 96%);
    z-index: 1;
  }

  .landing-hero-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.85fr);
    gap: 2rem;
    align-items: end;
  }

  .landing-hero-copy {
    padding: 2rem 0;
  }

  .landing-title {
    margin: 1.2rem 0 1.35rem;
    max-width: 10ch;
    color: #fffaf1;
    font-size: clamp(3.8rem, 9vw, 7.8rem);
    line-height: 0.88;
    font-weight: 800;
    letter-spacing: -0.06em;
  }

  .landing-title span {
    color: var(--landing-highlight);
    display: block;
  }

  .landing-hero-copy p {
    max-width: 35rem;
    margin: 0 0 1.8rem;
    color: rgba(255, 248, 238, 0.78);
    font-size: clamp(1rem, 1.6vw, 1.15rem);
    line-height: 1.78;
  }

  .landing-hero-aside {
    display: grid;
    gap: 1rem;
    justify-self: end;
    width: min(100%, 390px);
  }

  .landing-panel {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(18, 30, 21, 0.52);
    backdrop-filter: blur(16px);
    border-radius: 1.75rem;
    box-shadow: 0 20px 50px rgba(9, 16, 11, 0.18);
  }

  .landing-signal-card {
    padding: 1.35rem;
    color: #fffaf2;
  }

  .landing-signal-card h2 {
    margin: 0.45rem 0 0.8rem;
    font-size: 1.35rem;
    line-height: 1.2;
    letter-spacing: -0.03em;
  }

  .landing-signal-card p {
    margin: 0;
    color: rgba(255, 248, 238, 0.68);
    line-height: 1.6;
    font-size: 0.95rem;
  }

  .landing-note-list {
    display: grid;
    gap: 0.75rem;
    padding: 0;
    margin: 1.25rem 0 0;
    list-style: none;
  }

  .landing-note-list li {
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
    color: rgba(255, 248, 238, 0.76);
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .landing-note-list li::before {
    content: "";
    width: 0.65rem;
    height: 0.65rem;
    margin-top: 0.4rem;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--landing-highlight), #f9d59f);
    flex: 0 0 auto;
  }

  .landing-glass-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
  }

  .landing-small-card {
    padding: 1rem;
    border-radius: 1.4rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #fffaf2;
  }

  .landing-small-card strong {
    display: block;
    font-size: 1.6rem;
    letter-spacing: -0.05em;
  }

  .landing-small-card span {
    display: block;
    margin-top: 0.3rem;
    color: rgba(255, 248, 238, 0.68);
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .landing-section {
    padding: 2.5rem 0 5rem;
  }

  .landing-section-head {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    align-items: end;
    margin-bottom: 2rem;
  }

  .landing-section-head h2 {
    margin: 0.55rem 0 0;
    font-size: clamp(2.3rem, 5vw, 4.4rem);
    line-height: 0.96;
    letter-spacing: -0.05em;
  }

  .landing-section-head p {
    max-width: 30rem;
    margin: 0;
    color: var(--landing-muted);
    line-height: 1.7;
  }

  .landing-overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 1.25rem;
  }

  .landing-story-card,
  .landing-dark-card,
  .landing-audience-card,
  .landing-category-card,
  .landing-cta-card {
    border-radius: 1.9rem;
    overflow: hidden;
  }

  .landing-story-card {
    padding: 1.5rem;
    background: rgba(255, 252, 247, 0.72);
    border: 1px solid rgba(39, 56, 42, 0.08);
    box-shadow: 0 16px 40px rgba(82, 60, 31, 0.07);
  }

  .landing-story-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1.35rem;
  }

  .landing-story-grid article {
    padding: 1.1rem;
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.76);
    border: 1px solid rgba(39, 56, 42, 0.08);
  }

  .landing-story-grid span {
    color: var(--landing-accent);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .landing-story-grid h3 {
    margin: 0.8rem 0 0.6rem;
    font-size: 1.1rem;
    line-height: 1.3;
    letter-spacing: -0.03em;
  }

  .landing-story-grid p {
    margin: 0;
    color: var(--landing-muted);
    line-height: 1.65;
    font-size: 0.92rem;
  }

  .landing-dark-card {
    position: relative;
    min-height: 100%;
    padding: 1.5rem;
    background:
      linear-gradient(180deg, rgba(20, 34, 24, 0.9) 0%, rgba(20, 34, 24, 0.98) 100%),
      url("/images/onion.jpg") center/cover no-repeat;
    color: #fffaf2;
  }

  .landing-dark-card p {
    max-width: 20rem;
    color: rgba(255, 248, 238, 0.68);
    line-height: 1.65;
  }

  .landing-stat-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
    margin-top: 1.8rem;
  }

  .landing-stat-grid article {
    padding: 1rem;
    border-radius: 1.35rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.09);
  }

  .landing-stat-grid strong {
    display: block;
    font-size: clamp(1.7rem, 4vw, 2.5rem);
    line-height: 1;
    letter-spacing: -0.05em;
  }

  .landing-stat-grid span {
    display: block;
    margin-top: 0.35rem;
    color: rgba(255, 248, 238, 0.58);
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .landing-audience-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .landing-audience-card {
    position: relative;
    padding: 1.6rem;
    border: 1px solid rgba(39, 56, 42, 0.08);
    background: rgba(255, 252, 247, 0.82);
    box-shadow: 0 14px 34px rgba(82, 60, 31, 0.06);
  }

  .landing-audience-card::after {
    content: "";
    position: absolute;
    inset: auto auto 0 0;
    width: 100%;
    height: 0.35rem;
    background: linear-gradient(90deg, #3e6b43, #eeb868);
    opacity: 0.85;
  }

  .landing-audience-card[data-tone="customer"]::after {
    background: linear-gradient(90deg, #2f4858, #eeb868);
  }

  .landing-audience-card span {
    color: var(--landing-accent);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .landing-audience-card h3 {
    margin: 1rem 0 0.75rem;
    font-size: clamp(1.6rem, 3vw, 2.3rem);
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .landing-audience-card p {
    margin: 0 0 1.35rem;
    color: var(--landing-muted);
    line-height: 1.72;
  }

  .landing-inline-link {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    color: var(--landing-text);
    font-size: 0.84rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
  }

  .landing-inline-link::after {
    content: "↗";
    font-size: 1rem;
    line-height: 1;
  }

  .landing-category-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.1rem;
  }

  .landing-category-card {
    position: relative;
    min-height: 26rem;
    display: flex;
    align-items: end;
    text-decoration: none;
    color: #fffaf2;
    box-shadow: 0 18px 38px rgba(57, 44, 25, 0.11);
  }

  .landing-category-media,
  .landing-category-overlay {
    position: absolute;
    inset: 0;
  }

  .landing-category-media {
    background-size: cover;
    background-position: center;
    transform: scale(1.01);
    transition: transform 500ms ease;
  }

  .landing-category-card:hover .landing-category-media {
    transform: scale(1.06);
  }

  .landing-category-overlay {
    background:
      linear-gradient(180deg, rgba(17, 24, 18, 0.08) 0%, rgba(17, 24, 18, 0.84) 90%),
      linear-gradient(135deg, transparent 20%, rgba(0, 0, 0, 0.2) 100%);
  }

  .landing-category-content {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 1.5rem;
  }

  .landing-category-content span {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.7rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
    color: #fffaf2;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .landing-category-content h3 {
    margin: 1rem 0 0.6rem;
    font-size: clamp(1.5rem, 3vw, 2.2rem);
    line-height: 0.98;
    letter-spacing: -0.04em;
  }

  .landing-category-content p {
    margin: 0;
    max-width: 18rem;
    color: rgba(255, 248, 238, 0.76);
    line-height: 1.65;
  }

  .landing-cta {
    padding: 0 0 5rem;
  }

  .landing-cta-card {
    position: relative;
    padding: 2rem;
    background:
      radial-gradient(circle at top right, rgba(238, 184, 104, 0.28), transparent 28%),
      linear-gradient(135deg, rgba(24, 42, 27, 0.98) 0%, rgba(31, 55, 36, 0.95) 100%);
    color: #fffaf2;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 24px 60px rgba(22, 37, 25, 0.18);
  }

  .landing-cta-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
    gap: 1.5rem;
    align-items: center;
  }

  .landing-cta-card h2 {
    margin: 0.75rem 0 1rem;
    font-size: clamp(2.4rem, 5vw, 4.6rem);
    line-height: 0.96;
    letter-spacing: -0.05em;
  }

  .landing-cta-card p {
    max-width: 34rem;
    margin: 0;
    color: rgba(255, 248, 238, 0.72);
    line-height: 1.75;
  }

  .landing-cta-summary {
    display: grid;
    gap: 0.9rem;
  }

  .landing-cta-summary article {
    padding: 1rem 1.05rem;
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.09);
  }

  .landing-cta-summary strong {
    display: block;
    font-size: 0.82rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 248, 238, 0.56);
  }

  .landing-cta-summary span {
    display: block;
    margin-top: 0.35rem;
    line-height: 1.6;
    color: rgba(255, 248, 238, 0.84);
  }

  @media (max-width: 960px) {
    .landing-hero-grid,
    .landing-overview-grid,
    .landing-cta-grid,
    .landing-audience-grid,
    .landing-category-grid {
      grid-template-columns: 1fr;
    }

    .landing-story-grid {
      grid-template-columns: 1fr;
    }

    .landing-hero-aside {
      justify-self: stretch;
      width: 100%;
    }

    .landing-section-head {
      align-items: start;
      flex-direction: column;
    }

    .landing-category-card {
      min-height: 22rem;
    }
  }

  @media (max-width: 640px) {
    .landing-shell {
      width: min(100% - 1.2rem, 1180px);
    }

    .landing-hero {
      padding-top: 6.2rem;
    }

    .landing-title {
      font-size: clamp(3.2rem, 16vw, 5rem);
    }

    .landing-section {
      padding: 1.75rem 0 4rem;
    }

    .landing-story-card,
    .landing-dark-card,
    .landing-audience-card,
    .landing-category-card,
    .landing-cta-card {
      border-radius: 1.45rem;
    }

    .landing-stat-grid,
    .landing-glass-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 480px) {
    .landing-stat-grid,
    .landing-glass-grid {
      grid-template-columns: 1fr;
    }

    .landing-button-row {
      flex-direction: column;
      align-items: stretch;
    }

    .landing-primary,
    .landing-secondary {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .landing-reveal,
    .landing-category-media,
    .landing-primary,
    .landing-secondary {
      transition: none !important;
      animation: none !important;
      transform: none !important;
      opacity: 1 !important;
    }
  }
`;

export default function Landing() {
  return (
    <>
      <style>{pageStyles}</style>
      <div className="landing-page">
        <section className="landing-hero">
          <div className="landing-shell landing-hero-grid">
            <Reveal className="landing-hero-copy">
              <div className="landing-kicker">Direct farm commerce</div>
              <h1 className="landing-title">
                Better food starts <span>closer to the farm.</span>
              </h1>
              <p>
                FarmsConnect is designed to make fresh produce feel more honest,
                more traceable, and more rewarding for both the people who grow
                it and the people who bring it home.
              </p>
              <div className="landing-button-row">
                <Link to="/register" className="landing-primary">
                  Create account
                </Link>
                <a href="#discover" className="landing-secondary">
                  Explore the platform
                </a>
              </div>
            </Reveal>

            <Reveal className="landing-hero-aside" delay={120}>
              <div className="landing-panel landing-signal-card">
                <span className="landing-kicker">Why it matters</span>
                <h2>Freshness, fairness, and trust in one experience.</h2>
                <p>
                  The platform connects harvest-ready supply with customer
                  demand, while still giving farmers practical tools that help
                  them plan and sell with more confidence.
                </p>
                <ul className="landing-note-list">
                  {sectionNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>

              <div className="landing-panel" style={{ padding: "0.85rem" }}>
                <div className="landing-glass-grid">
                  <article className="landing-small-card">
                    <strong>AI</strong>
                    <span>crop support</span>
                  </article>
                  <article className="landing-small-card">
                    <strong>Live</strong>
                    <span>market cues</span>
                  </article>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="discover" className="landing-section">
          <div className="landing-shell">
            <Reveal className="landing-section-head">
              <div>
                <span className="landing-inline-link" style={{ pointerEvents: "none" }}>
                  Platform flow
                </span>
                <h2>A landing page that tells the story faster.</h2>
              </div>
              <p>
                The design now moves from promise to proof: a bold opening,
                product value, role-based entry points, and a clear final CTA.
              </p>
            </Reveal>

            <div className="landing-overview-grid">
              <Reveal className="landing-story-card" delay={80}>
                <span className="landing-inline-link" style={{ pointerEvents: "none" }}>
                  How it works
                </span>
                <div className="landing-story-grid">
                  {journeySteps.map((step, index) => (
                    <article key={step.id}>
                      <span>{step.id}</span>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </article>
                  ))}
                </div>
              </Reveal>

              <Reveal className="landing-dark-card" delay={160}>
                <span className="landing-kicker">Impact snapshot</span>
                <h2 style={{ margin: "1rem 0 0.9rem", fontSize: "2.1rem", lineHeight: 1 }}>
                  A marketplace shaped around fresher decisions.
                </h2>
                <p>
                  These numbers position the product as practical and growing,
                  not just aspirational. That helps the landing page feel more
                  credible to new visitors.
                </p>
                <div className="landing-stat-grid">
                  {impactStats.map((stat) => (
                    <article key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </article>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-shell">
            <Reveal className="landing-section-head">
              <div>
                <span className="landing-inline-link" style={{ pointerEvents: "none" }}>
                  Choose your path
                </span>
                <h2>Built for the two people who make the food chain work.</h2>
              </div>
              <p>
                Farmers and customers need different language and different
                motivation. These cards make the entry point feel clearer and
                more personal.
              </p>
            </Reveal>

            <div className="landing-audience-grid">
              {audienceCards.map((card, index) => (
                <Reveal key={card.eyebrow} delay={index * 120}>
                  <Link
                    to="/register"
                    className="landing-audience-card"
                    data-tone={card.tone}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    <span>{card.eyebrow}</span>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <div className="landing-inline-link">{card.cta}</div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-shell">
            <Reveal className="landing-section-head">
              <div>
                <span className="landing-inline-link" style={{ pointerEvents: "none" }}>
                  Explore produce
                </span>
                <h2>Category visuals now feel editorial instead of generic.</h2>
              </div>
              <p>
                The grid uses stronger overlays, tighter copy, and more room for
                imagery so the landing page feels premium without adding new
                assets.
              </p>
            </Reveal>

            <div className="landing-category-grid">
              {categoryCards.map((card, index) => (
                <Reveal key={card.title} delay={index * 100}>
                  <Link to="/register" className="landing-category-card">
                    <div
                      className="landing-category-media"
                      style={{
                        backgroundImage: `linear-gradient(180deg, transparent 0%, ${card.accent}22 100%), url(${card.image})`,
                      }}
                    />
                    <div className="landing-category-overlay" />
                    <div className="landing-category-content">
                      <span>{card.title}</span>
                      <h3>{card.title}</h3>
                      <p>{card.subtitle}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-shell">
            <Reveal className="landing-cta-card">
              <div className="landing-cta-grid">
                <div>
                  <span className="landing-kicker">Ready to join</span>
                  <h2>Design-wise, the page now closes with confidence.</h2>
                  <p>
                    Visitors get one final invitation after seeing the value,
                    who the platform serves, and what they can expect. That
                    keeps the journey focused and conversion-friendly.
                  </p>
                  <div className="landing-button-row" style={{ marginTop: "1.6rem" }}>
                    <Link to="/register" className="landing-primary">
                      Join FarmsConnect
                    </Link>
                    <Link to="/login" className="landing-secondary">
                      Sign in
                    </Link>
                  </div>
                </div>

                <div className="landing-cta-summary">
                  <article>
                    <strong>New hero</strong>
                    <span>Stronger first impression with better pacing and contrast.</span>
                  </article>
                  <article>
                    <strong>Clear sections</strong>
                    <span>Each block now supports a distinct message instead of blending together.</span>
                  </article>
                  <article>
                    <strong>Mobile ready</strong>
                    <span>The layout collapses cleanly without losing hierarchy or drama.</span>
                  </article>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
