import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ─── Hero slides ───────────────────────────────────── */
const heroImages = [
  "/slides/slide1.jpg",
  "/slides/slide3.jpg",
  "/slides/slide4.jpg",
];

/* ─── Categories ────────────────────────────────────── */
const categories = [
  { img: "/images/tomato.jpg", label: "Fresh Vegetables", sub: "Farm-picked daily", link: "/register" },
  { img: "/images/apple.jpg", label: "Seasonal Fruits", sub: "In-season harvest", link: "/register" },
  { img: "/images/potato.jpg", label: "Root & Tubers", sub: "Direct from soil", link: "/register" },
  { img: "/images/onion.jpg", label: "Everyday Essentials", sub: "Kitchen staples", link: "/register" },
];

/* ─── Stats ─────────────────────────────────────────── */
const stats = [
  { value: "2,500+", label: "Verified Farmers" },
  { value: "15,000+", label: "Products Listed" },
  { value: "50+", label: "Cities Served" },
  { value: "98%", label: "Satisfaction Rate" },
];

/* ─── Features ──────────────────────────────────────── */
const features = [
  {
    num: "01",
    title: "Fresh from Farm",
    desc: "Harvested and delivered within 24 hours. No cold storage, no middlemen — just honest food.",
  },
  {
    num: "02",
    title: "Smart Insights",
    desc: "AI crop recommendations and real-time mandi prices to help farmers maximise every yield.",
  },
  {
    num: "03",
    title: "Verified & Secure",
    desc: "Every farmer is verified. Transparent pricing, secure payments — no hidden costs, ever.",
  },
];

/* ─── Reveal hook ───────────────────────────────────── */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("lp-visible"); obs.unobserve(el); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

const Reveal = ({ children, className = "", delay = 0, style = {} }) => {
  const ref = useReveal();
  return (
    <div ref={ref} className={`lp-reveal ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
};

/* ─── Injected styles ───────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800;900&display=swap');

  .lp-font { font-family: 'Outfit', system-ui, sans-serif; }

  .lp-reveal  { opacity:0; transform:translateY(30px); transition: opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94); will-change: opacity, transform; }
  .lp-visible { opacity:1; transform:translateY(0); }

  @keyframes lp-up { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  .lp-u0 { animation: lp-up 0.9s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
  .lp-u1 { animation: lp-up 0.9s 0.15s cubic-bezier(0.25,0.46,0.45,0.94) forwards; opacity:0; }
  .lp-u2 { animation: lp-up 0.9s 0.3s cubic-bezier(0.25,0.46,0.45,0.94) forwards; opacity:0; }
  .lp-u3 { animation: lp-up 0.9s 0.45s cubic-bezier(0.25,0.46,0.45,0.94) forwards; opacity:0; }

  @keyframes lp-blink { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
  .lp-blink { animation: lp-blink 2.4s ease-in-out infinite; }

  /* Category card hovers */
  .lp-cat-img { transition: transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94); }
  .lp-cat:hover .lp-cat-img { transform: scale(1.06); }
  .lp-cat-overlay { transition: opacity 0.4s ease; }
  .lp-cat:hover .lp-cat-overlay { opacity: 0.85 !important; }
  .lp-cat-cta { opacity:0; transform:translateY(6px); transition: opacity 0.35s ease, transform 0.35s ease; }
  .lp-cat:hover .lp-cat-cta { opacity:1; transform:translateY(0); }

  /* Feature bar hovers */
  .lp-feat-bar { transform:scaleX(0); transform-origin:left; transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94); }
  .lp-feat:hover .lp-feat-bar { transform:scaleX(1); }
  .lp-feat-num { transition: color 0.35s ease, transform 0.35s ease; }
  .lp-feat:hover .lp-feat-num { color: #52b788; transform: translateX(4px); }

  /* Row image zoom */
  .lp-row-img { transition: transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94); }
  .lp-row:hover .lp-row-img { transform: scale(1.04); }

  /* Pill buttons */
  .lp-pill {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 0.5rem; border-radius: 9999px;
    font-size: 0.8125rem; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase;
    text-decoration: none; transition: all 0.3s ease;
    cursor: pointer; padding: 0.85rem 2rem;
  }
  .lp-pill-white { background: #fff; color: #111; border: 1.5px solid #fff; }
  .lp-pill-white:hover { background: #f0ede6; border-color: #f0ede6; }
  .lp-pill-ghost { background: transparent; color: rgba(255,255,255,0.7); border: 1.5px solid rgba(255,255,255,0.25); }
  .lp-pill-ghost:hover { border-color: rgba(255,255,255,0.6); color: #fff; background: rgba(255,255,255,0.06); }
  .lp-pill-dark { background: #111; color: #fff; border: 1.5px solid #111; }
  .lp-pill-dark:hover { background: #333; border-color: #333; }

  /* Slide dots */
  .lp-dot { border:none; cursor:pointer; padding:0; border-radius: 9999px; transition: all 0.4s ease; }

  @media (max-width: 768px) {
    .lp-split-grid { grid-template-columns: 1fr !important; }
    .lp-hero-title { font-size: clamp(3rem, 14vw, 5rem) !important; }
    .lp-section-title { font-size: clamp(2.5rem, 8vw, 4rem) !important; }
    .lp-cat-grid { grid-template-columns: 1fr 1fr !important; }
  }

  @media (max-width: 480px) {
    .lp-cat-grid { grid-template-columns: 1fr !important; }
  }
`;

/* ═══════════════════════════════════════════════════
   LANDING
   ═══════════════════════════════════════════════════ */
export default function Landing() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent(p => (p + 1) % heroImages.length), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div className="lp-font" style={{ background: "#faf8f4", color: "#111" }}>

        {/* ══════════════════════════════════════════
            §1  HERO — Full-bleed with massive typography
            ══════════════════════════════════════════ */}
        <section style={{ position: "relative", height: "100svh", minHeight: 600, overflow: "hidden" }}>

          {/* Slideshow */}
          {heroImages.map((src, i) => (
            <div key={i} style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: i === current ? 1 : 0,
              transition: "opacity 1.6s ease-in-out",
            }} />
          ))}

          {/* Gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.08) 100%)",
          }} />

          {/* Hero content */}
          <div style={{
            position: "relative", zIndex: 10, height: "100%",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "clamp(2rem, 5vw, 5rem)",
            paddingBottom: "clamp(5rem, 8vw, 7rem)",
          }}>

            <h1 className="lp-u1 lp-hero-title" style={{
              fontSize: "clamp(4.5rem, 11vw, 10rem)",
              fontWeight: 800, lineHeight: 0.88,
              letterSpacing: "-0.04em",
              color: "#f0e68c",
              textTransform: "lowercase",
              marginBottom: "1.5rem",
              maxWidth: "80%",
            }}>
              fresh from farm
            </h1>

            <p className="lp-u2" style={{
              fontSize: "clamp(0.9375rem, 1.4vw, 1.125rem)",
              color: "rgba(255,255,255,0.55)", fontWeight: 300,
              maxWidth: 400, lineHeight: 1.7, marginBottom: "2.5rem",
            }}>
              Connecting farmers directly with your table.
              <br />No middlemen. No markups. Just honest food.
            </p>

            <div className="lp-u3" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link to="/register" className="lp-pill lp-pill-white">
                Get Started
              </Link>
              <a href="#explore" className="lp-pill lp-pill-ghost">
                Explore
              </a>
            </div>
          </div>

          {/* Slide dots */}
          <div style={{
            position: "absolute", bottom: "clamp(2rem, 3vw, 3rem)",
            right: "clamp(2rem, 5vw, 5rem)",
            display: "flex", gap: 8, alignItems: "center",
          }}>
            {heroImages.map((_, i) => (
              <button key={i} className="lp-dot" onClick={() => setCurrent(i)} style={{
                width: i === current ? 32 : 8, height: 8,
                background: i === current ? "#fff" : "rgba(255,255,255,0.25)",
              }} />
            ))}
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: "absolute", right: "clamp(2rem, 5vw, 5rem)", top: "50%",
            transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            <span style={{
              fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)", writingMode: "vertical-rl",
            }}>Scroll</span>
            <div className="lp-blink" style={{
              width: 1, height: 56,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.45), transparent)",
            }} />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §2  FARMER / CUSTOMER SPLIT
            ══════════════════════════════════════════ */}
        <section id="explore">

          {/* ── Farmer Row ── */}
          <div className="lp-row lp-split-grid" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "85vh",
          }}>
            {/* Image */}
            <div style={{ position: "relative", overflow: "hidden", minHeight: "55vh" }}>
              <div className="lp-row-img" style={{
                position: "absolute", inset: 0,
                backgroundImage: "url(/images/farmer-hero.jpg)",
                backgroundSize: "cover", backgroundPosition: "center top",
              }} />
            </div>

            {/* Text */}
            <Reveal>
              <div style={{
                height: "100%", minHeight: "55vh",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "clamp(3rem, 6vw, 7rem)",
                background: "#faf8f4",
              }}>
                <span style={{
                  fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
                  color: "#999", display: "block", marginBottom: "1.25rem", fontWeight: 500,
                }}>
                  I am a
                </span>
                <h2 className="lp-section-title" style={{
                  fontSize: "clamp(4rem, 8vw, 8rem)", fontWeight: 800,
                  color: "#111", lineHeight: 0.9, letterSpacing: "-0.04em",
                  marginBottom: "1.75rem", textTransform: "lowercase",
                }}>
                  farmer
                </h2>
                <div style={{ width: 48, height: 2, background: "#2d5a3d", marginBottom: "1.75rem", borderRadius: 1 }} />
                <p style={{
                  fontSize: "0.9375rem", color: "#666",
                  fontWeight: 300, lineHeight: 1.75, maxWidth: 320, marginBottom: "2.5rem",
                }}>
                  List your produce, get fair prices, and reach customers directly across India. No middlemen, no hassle.
                </p>
                <Link to="/register" className="lp-pill lp-pill-dark" style={{ alignSelf: "flex-start" }}>
                  Start Selling
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* ── Customer Row ── */}
          <div className="lp-row lp-split-grid" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "75vh",
          }}>
            {/* Text */}
            <Reveal>
              <div style={{
                height: "100%", minHeight: "55vh",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "clamp(3rem, 6vw, 7rem)",
                background: "#f0ede6",
              }}>
                <span style={{
                  fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
                  color: "#999", display: "block", marginBottom: "1.25rem", fontWeight: 500,
                }}>
                  I am a
                </span>
                <h2 className="lp-section-title" style={{
                  fontSize: "clamp(4rem, 8vw, 8rem)", fontWeight: 800,
                  color: "#111", lineHeight: 0.9, letterSpacing: "-0.04em",
                  marginBottom: "1.75rem", textTransform: "lowercase",
                }}>
                  customer
                </h2>
                <div style={{ width: 48, height: 2, background: "#2d5a3d", marginBottom: "1.75rem", borderRadius: 1 }} />
                <p style={{
                  fontSize: "0.9375rem", color: "#666",
                  fontWeight: 300, lineHeight: 1.75, maxWidth: 340, marginBottom: "2.5rem",
                }}>
                  Buy fresh produce directly from verified farmers near you — harvested and delivered within 24 hours.
                </p>
                <Link to="/register" className="lp-pill lp-pill-dark" style={{ alignSelf: "flex-start" }}>
                  Start Shopping
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </Reveal>

            {/* Image */}
            <div style={{ position: "relative", overflow: "hidden", minHeight: "55vh" }}>
              <div className="lp-row-img" style={{
                position: "absolute", inset: 0,
                backgroundImage: "url(/images/customer-hero.jpg)",
                backgroundSize: "cover", backgroundPosition: "center",
              }} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §3  FEATURES + STATS — Dark section
            ══════════════════════════════════════════ */}
        <section style={{ background: "#111", padding: "clamp(5rem, 9vw, 8rem) clamp(2rem, 7vw, 7rem)" }}>
          <Reveal>
            <div style={{
              marginBottom: "5rem", display: "flex", flexWrap: "wrap",
              alignItems: "flex-end", justifyContent: "space-between", gap: "1.5rem",
            }}>
              <div>
                <span style={{
                  fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)", display: "block", marginBottom: "1.25rem", fontWeight: 500,
                }}>Why AgriDirect</span>
                <h2 className="lp-section-title" style={{
                  fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 800,
                  lineHeight: 1.05, letterSpacing: "-0.03em", color: "#fff",
                }}>
                  Farm fresh,{" "}
                  <span style={{ color: "#52b788" }}>fairly priced.</span>
                </h2>
              </div>
              <Link to="/register" className="lp-pill lp-pill-ghost" style={{ fontSize: "0.75rem" }}>
                Join Now
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </Reveal>

          {/* Feature rows */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0 2.5rem" }}>
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="lp-feat" style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  padding: "2.5rem 0", position: "relative", cursor: "default",
                }}>
                  <div className="lp-feat-bar" style={{
                    position: "absolute", top: -1, left: 0, right: 0, height: 2, background: "#52b788", borderRadius: 1,
                  }} />
                  <span className="lp-feat-num" style={{
                    fontSize: "clamp(2rem, 4vw, 3rem)", color: "rgba(255,255,255,0.08)",
                    display: "block", marginBottom: "1.5rem", lineHeight: 1, fontWeight: 800,
                  }}>{f.num}</span>
                  <h3 style={{
                    fontSize: "1rem", fontWeight: 700, color: "#fff",
                    marginBottom: "0.65rem", letterSpacing: "-0.01em",
                  }}>{f.title}</h3>
                  <p style={{
                    fontSize: "0.875rem", color: "rgba(255,255,255,0.35)",
                    lineHeight: 1.72, fontWeight: 300,
                  }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "5rem 0" }} />

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "3rem 1.5rem" }}>
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 90}>
                <div>
                  <div style={{
                    fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800,
                    color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "0.5rem",
                  }}>{s.value}</div>
                  <div style={{
                    fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.25)", fontWeight: 500,
                  }}>{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §4  SHOP BY CATEGORY — No-gutter grid
            ══════════════════════════════════════════ */}
        <section style={{ background: "#faf8f4", padding: "clamp(5rem, 8vw, 7rem) clamp(2rem, 6vw, 6rem)" }}>
          <Reveal>
            <div style={{
              marginBottom: "3.5rem", display: "flex", alignItems: "flex-end",
              justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
            }}>
              <div>
                <span style={{
                  fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
                  color: "#999", display: "block", marginBottom: "1rem", fontWeight: 500,
                }}>Browse</span>
                <h2 className="lp-section-title" style={{
                  fontSize: "clamp(2.25rem, 5vw, 4rem)", fontWeight: 800,
                  letterSpacing: "-0.03em", lineHeight: 1, color: "#111",
                  textTransform: "lowercase",
                }}>
                  shop by category.
                </h2>
              </div>
              <Link to="/register" className="lp-pill lp-pill-dark" style={{ fontSize: "0.75rem" }}>
                View All
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </Reveal>

          {/* Card grid — no gutters */}
          <div className="lp-cat-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "3px",
          }}>
            {categories.map((cat, i) => (
              <Reveal key={i} delay={i * 80}>
                <Link to={cat.link} className="lp-cat" style={{
                  position: "relative", display: "block", aspectRatio: "3/4",
                  overflow: "hidden", textDecoration: "none",
                }}>
                  <div className="lp-cat-img" style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url(${cat.img})`,
                    backgroundSize: "cover", backgroundPosition: "center",
                  }} />
                  <div className="lp-cat-overlay" style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                    opacity: 0.75,
                  }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.75rem" }}>
                    <p style={{
                      fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.4)", marginBottom: "0.4rem", fontWeight: 500,
                    }}>{cat.sub}</p>
                    <h3 style={{
                      fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em",
                    }}>{cat.label}</h3>
                    <span className="lp-cat-cta" style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      marginTop: "0.75rem", fontSize: 10, fontWeight: 600,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.65)",
                    }}>
                      Shop Now
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §5  FINAL CTA
            ══════════════════════════════════════════ */}
        <section style={{
          background: "#111", padding: "clamp(6rem, 10vw, 10rem) clamp(2rem, 6vw, 6rem)",
          textAlign: "center",
        }}>
          <Reveal>
            <span style={{
              fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.18)", display: "block", marginBottom: "1.5rem", fontWeight: 500,
            }}>
              Stay Connected
            </span>
            <h2 className="lp-section-title" style={{
              fontSize: "clamp(3.5rem, 9vw, 8rem)", fontWeight: 800,
              letterSpacing: "-0.04em", lineHeight: 0.9, color: "#fff",
              marginBottom: "1.5rem", textTransform: "lowercase",
            }}>
              grow with us.
            </h2>
            <p style={{
              fontSize: "0.9375rem", color: "rgba(255,255,255,0.3)", fontWeight: 300,
              maxWidth: 420, margin: "0 auto 3rem", lineHeight: 1.72,
            }}>
              Join thousands of farmers and customers building a more direct, fair, and sustainable food chain.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" className="lp-pill lp-pill-white">
                Create Free Account
              </Link>
              <Link to="/login" className="lp-pill lp-pill-ghost">
                Sign In
              </Link>
            </div>
          </Reveal>
        </section>

        {/* ══════════════════════════════════════════
            §6  FOOTER with giant wordmark
            ══════════════════════════════════════════ */}
        <footer style={{ background: "#0a0a0a" }}>
          {/* Top bar */}
          <div style={{
            padding: "2.5rem clamp(2rem, 6vw, 6rem)",
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: "1.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{
              fontSize: "1rem", color: "#fff",
              letterSpacing: "-0.02em", fontWeight: 700,
            }}>AgriDirect</span>

            <div style={{ display: "flex", gap: "2rem" }}>
              {[["Join", "/register"], ["Login", "/login"], ["Explore", "#explore"]].map(([label, href]) =>
                href.startsWith("/")
                  ? <Link key={label} to={href} className="lp-pill" style={{
                    fontSize: 10, letterSpacing: "0.35em",
                    color: "rgba(255,255,255,0.3)", textDecoration: "none",
                    padding: "0.5rem 1rem", border: "1px solid rgba(255,255,255,0.1)",
                  }}>{label}</Link>
                  : <a key={label} href={href} className="lp-pill" style={{
                    fontSize: 10, letterSpacing: "0.35em",
                    color: "rgba(255,255,255,0.3)", textDecoration: "none",
                    padding: "0.5rem 1rem", border: "1px solid rgba(255,255,255,0.1)",
                  }}>{label}</a>
              )}
            </div>

            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>
              © {new Date().getFullYear()} AgriDirect. All rights reserved.
            </span>
          </div>

          {/* Giant wordmark */}
          <div style={{ overflow: "hidden", width: "100%" }}>
            <span style={{
              display: "block", width: "100%", textAlign: "center",
              fontSize: "clamp(6rem, 17vw, 19rem)",
              lineHeight: 1.15, letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.04)",
              fontWeight: 900, textTransform: "lowercase",
              paddingBottom: "0.1em",
              userSelect: "none", pointerEvents: "none",
            }}>
              agridirect
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}