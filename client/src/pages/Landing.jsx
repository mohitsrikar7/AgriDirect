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
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

const Reveal = ({ children, className = "", delay = 0 }) => {
  const ref = useReveal();
  return (
    <div ref={ref} className={`lp-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* ─── Injected styles ───────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .lp-serif { font-family: 'Cormorant Garamond', 'Didot', Georgia, serif; }
  .lp-sans  { font-family: 'DM Sans', system-ui, sans-serif; }

  .lp-reveal  { opacity:0; transform:translateY(26px); transition: opacity 0.75s ease, transform 0.75s ease; will-change: opacity, transform; }
  .lp-visible { opacity:1; transform:translateY(0); }

  @keyframes lp-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .lp-u0 { animation: lp-up 0.9s ease forwards; }
  .lp-u1 { animation: lp-up 0.9s 0.18s ease forwards; opacity:0; }
  .lp-u2 { animation: lp-up 0.9s 0.34s ease forwards; opacity:0; }
  .lp-u3 { animation: lp-up 0.9s 0.5s  ease forwards; opacity:0; }

  @keyframes lp-blink { 0%,100%{opacity:0.35} 50%{opacity:0.8} }
  .lp-blink { animation: lp-blink 2.2s ease-in-out infinite; }

  .lp-split-img { transition: transform 1.1s cubic-bezier(0.25,0.46,0.45,0.94); }
  .lp-split:hover .lp-split-img { transform: scale(1.05); }
  .lp-split-cta { color: rgba(255,255,255,0); transition: color 0.45s ease, transform 0.45s ease; transform: translateX(-8px); }
  .lp-split:hover .lp-split-cta { color: rgba(255,255,255,0.65); transform: translateX(0); }
  .lp-split-line { width:1.25rem; transition: width 0.45s ease, opacity 0.45s ease; opacity:0.25; }
  .lp-split:hover .lp-split-line { width:2.25rem; opacity:0.55; }
  .lp-split-overlay { transition: opacity 0.5s ease; }
  .lp-split:hover .lp-split-overlay { opacity:0.88 !important; }
  .lp-row:hover .lp-row-img { transform: scale(1.04); }

  .lp-cat-img { transition: transform 0.85s cubic-bezier(0.25,0.46,0.45,0.94); }
  .lp-cat:hover .lp-cat-img { transform: scale(1.07); }
  .lp-cat-cta { opacity:0; transform:translateY(5px); transition: opacity 0.3s ease, transform 0.3s ease; }
  .lp-cat:hover .lp-cat-cta { opacity:1; transform:translateY(0); }

  .lp-feat-bar { transform:scaleX(0); transform-origin:left; transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94); }
  .lp-feat:hover .lp-feat-bar { transform:scaleX(1); }
  .lp-feat-num { transition: color 0.35s ease; }
  .lp-feat:hover .lp-feat-num { color: #3a7550; }

  .lp-dot { border:none; cursor:pointer; padding:0; transition: all 0.4s ease; }

  .lp-wordmark {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(5rem, 19vw, 19rem);
    font-weight: 300;
    letter-spacing: -0.04em;
    line-height: 0.82;
    color: white;
    opacity: 0.045;
    user-select: none;
    pointer-events: none;
    white-space: nowrap;
    display: block;
    padding: 0.5rem clamp(1rem, 4vw, 4rem);
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
      <div className="lp-sans" style={{ background: "#F7F3EC", color: "#111009" }}>

        {/* ══════════════════════════════════════════
            §1  HERO
            ══════════════════════════════════════════ */}
        <section style={{ position: "relative", height: "100svh", minHeight: 560, overflow: "hidden" }}>

          {heroImages.map((src, i) => (
            <div key={i} style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: i === current ? 1 : 0,
              transition: "opacity 1.8s ease-in-out",
            }} />
          ))}

          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.05) 100%)",
          }} />

          {/* Content */}
          <div style={{
            position: "relative", zIndex: 10, height: "100%",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "clamp(2rem, 5vw, 4.5rem)",
            paddingBottom: "clamp(4rem, 7vw, 6rem)",
          }}>
            <span className="lp-u0 lp-sans" style={{
              fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.38)", display: "block", marginBottom: "1rem",
            }}>
              — Farm to Table
            </span>

            <h1 className="lp-serif lp-u1" style={{
              fontSize: "clamp(4rem, 10vw, 9.5rem)",
              fontWeight: 300, lineHeight: 0.9,
              letterSpacing: "-0.02em", color: "#fff", marginBottom: "1.5rem",
            }}>
              AgriDirect
            </h1>

            <p className="lp-sans lp-u2" style={{
              fontSize: "clamp(0.875rem, 1.4vw, 1.05rem)",
              color: "rgba(255,255,255,0.5)", fontWeight: 300,
              maxWidth: 360, lineHeight: 1.7, marginBottom: "2.25rem",
            }}>
              Connecting farmers directly with your table.<br />
              No middlemen. No markups.
            </p>

            <div className="lp-u3" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link to="/register" style={{
                display: "inline-block", background: "#fff", color: "#111009",
                padding: "0.8rem 2rem", fontSize: 11, fontWeight: 600,
                letterSpacing: "0.09em", textTransform: "uppercase",
                textDecoration: "none", transition: "background 0.25s",
              }}
                onMouseOver={e => e.currentTarget.style.background = "#e5e1d8"}
                onMouseOut={e => e.currentTarget.style.background = "#fff"}
              >
                Get Started
              </Link>
              <a href="#split" style={{
                display: "inline-block", background: "transparent", color: "#fff",
                padding: "0.8rem 2rem", fontSize: 11, fontWeight: 400,
                letterSpacing: "0.09em", textTransform: "uppercase",
                textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)",
                transition: "border-color 0.25s, background 0.25s",
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.65)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}
              >
                Explore
              </a>
            </div>
          </div>

          {/* Slide dots */}
          <div style={{
            position: "absolute", bottom: "clamp(1.5rem, 3vw, 2.5rem)",
            right: "clamp(2rem, 5vw, 4.5rem)",
            display: "flex", gap: 7, alignItems: "center",
          }}>
            {heroImages.map((_, i) => (
              <button key={i} className="lp-dot" onClick={() => setCurrent(i)} style={{
                width: i === current ? 28 : 7, height: 7,
                background: i === current ? "#fff" : "rgba(255,255,255,0.28)",
              }} />
            ))}
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: "absolute", right: "clamp(2rem, 5vw, 4.5rem)", top: "50%",
            transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            <span style={{
              fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)", writingMode: "vertical-rl",
            }}>Scroll</span>
            <div className="lp-blink" style={{
              width: 1, height: 52,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)",
            }} />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §2  FARMER / CUSTOMER SPLIT
            ══════════════════════════════════════════ */}
        <section id="split">

          {/* ── Farmer row — image left, text right ── */}
          <div className="lp-row" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: "85vh",
          }}>
            {/* Image */}
            <div style={{ position: "relative", overflow: "hidden", minHeight: "60vh" }}>
              <div className="lp-row-img" style={{
                position: "absolute", inset: 0,
                backgroundImage: "url(/images/farmer-hero.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center top",
                transition: "transform 1.1s cubic-bezier(0.25,0.46,0.45,0.94)",
              }} />
            </div>

            {/* Text */}
            <Reveal>
              <div style={{
                height: "100%", minHeight: "60vh",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "clamp(3rem, 6vw, 7rem)",
                background: "#F7F3EC",
                borderLeft: "1px solid #ddd8cf",
              }}>
                <span className="lp-sans" style={{
                  fontSize: 9, letterSpacing: "0.55em", textTransform: "uppercase",
                  color: "#9c9c94", display: "block", marginBottom: "1rem",
                }}>
                  I am a
                </span>
                <h2 className="lp-serif" style={{
                  fontSize: "clamp(4.5rem, 8vw, 8.5rem)", fontWeight: 300,
                  color: "#111009", lineHeight: 0.9, letterSpacing: "-0.02em",
                  marginBottom: "1.75rem",
                }}>
                  Farmer
                </h2>
                <div style={{ width: 40, height: 1, background: "#ddd8cf", marginBottom: "1.75rem" }} />
                <p className="lp-sans" style={{
                  fontSize: "0.9375rem", color: "#6b6b63",
                  fontWeight: 300, lineHeight: 1.75, maxWidth: 280, marginBottom: "2.5rem",
                }}>
                  List your produce, get fair prices, and reach customers directly across India. No middlemen, no hassle.
                </p>
                <Link to="/register" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase",
                  color: "#111009", textDecoration: "none",
                  transition: "gap 0.3s ease",
                }}
                  onMouseOver={e => e.currentTarget.style.gap = "16px"}
                  onMouseOut={e => e.currentTarget.style.gap = "10px"}
                >
                  Start Selling
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* ── Customer row — text left, image right ── */}
          <div className="lp-row" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: "70vh",
            borderTop: "1px solid #ddd8cf",
          }}>
            {/* Text */}
            <Reveal>
              <div style={{
                height: "100%", minHeight: "60vh",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "clamp(3rem, 6vw, 7rem)",
                background: "#F7F3EC",
              }}>
                <span className="lp-sans" style={{
                  fontSize: 9, letterSpacing: "0.55em", textTransform: "uppercase",
                  color: "#9c9c94", display: "block", marginBottom: "1rem",
                }}>
                  I am a
                </span>
                <h2 className="lp-serif" style={{
                  fontSize: "clamp(4.5rem, 8vw, 8.5rem)", fontWeight: 300,
                  color: "#111009", lineHeight: 0.9, letterSpacing: "-0.02em",
                  marginBottom: "1.75rem",
                }}>
                  Customer
                </h2>
                <div style={{ width: 40, height: 1, background: "#ddd8cf", marginBottom: "1.75rem" }} />
                <p className="lp-sans" style={{
                  fontSize: "0.9375rem", color: "#6b6b63",
                  fontWeight: 300, lineHeight: 1.75, maxWidth: 320, marginBottom: "2.5rem",
                }}>
                  Buy fresh produce directly from verified farmers near you — harvested and delivered within 24 hours.
                </p>
                <Link to="/register" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase",
                  color: "#111009", textDecoration: "none",
                  transition: "gap 0.3s ease",
                }}
                  onMouseOver={e => e.currentTarget.style.gap = "16px"}
                  onMouseOut={e => e.currentTarget.style.gap = "10px"}
                >
                  Start Shopping
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </Reveal>

            {/* Image */}
            <div style={{
              position: "relative", overflow: "hidden", minHeight: "60vh",
              borderLeft: "1px solid #ddd8cf",
            }}>
              <div className="lp-row-img" style={{
                position: "absolute", inset: 0,
                backgroundImage: "url(/images/customer-hero.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "transform 1.1s cubic-bezier(0.25,0.46,0.45,0.94)",
              }} />
            </div>
          </div>

        </section>

        {/* ══════════════════════════════════════════
            §3  FEATURES + STATS
            ══════════════════════════════════════════ */}
        <section style={{ background: "#111009", padding: "clamp(5rem, 9vw, 8rem) clamp(2rem, 7vw, 7rem)" }}>
          <Reveal>
            <div style={{ marginBottom: "4.5rem", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "1.5rem" }}>
              <div>
                <span className="lp-sans" style={{
                  fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)", display: "block", marginBottom: "1rem",
                }}>Why AgriDirect</span>
                <h2 className="lp-serif" style={{
                  fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 300,
                  lineHeight: 1.05, letterSpacing: "-0.02em", color: "#fff",
                }}>
                  Farm fresh,{" "}
                  <em style={{ fontStyle: "italic", color: "#52b788" }}>fairly priced.</em>
                </h2>
              </div>
              <Link to="/register" style={{
                fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)", textDecoration: "none",
                display: "flex", alignItems: "center", gap: 7, transition: "color 0.25s",
              }}
                onMouseOver={e => e.currentTarget.style.color = "#fff"}
                onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
              >Join Now →</Link>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "0 2rem" }}>
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="lp-feat" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "2.25rem 0", position: "relative", cursor: "default" }}>
                  <div className="lp-feat-bar" style={{ position: "absolute", top: -1, left: 0, right: 0, height: 1, background: "#52b788" }} />
                  <span className="lp-feat-num lp-serif" style={{
                    fontSize: "clamp(2rem, 4vw, 3rem)", color: "rgba(255,255,255,0.1)",
                    display: "block", marginBottom: "1.5rem", lineHeight: 1,
                  }}>{f.num}</span>
                  <h3 className="lp-sans" style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", marginBottom: "0.65rem", letterSpacing: "-0.01em" }}>{f.title}</h3>
                  <p className="lp-sans" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.72, fontWeight: 300 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "5rem 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "2.5rem 1rem" }}>
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 90}>
                <div>
                  <div className="lp-serif" style={{
                    fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 300,
                    color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.5rem",
                  }}>{s.value}</div>
                  <div className="lp-sans" style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §4  SHOP BY CATEGORY
            ══════════════════════════════════════════ */}
        <section style={{ background: "#F7F3EC", padding: "clamp(5rem, 8vw, 7rem) clamp(2rem, 6vw, 6rem)" }}>
          <Reveal>
            <div style={{ marginBottom: "3rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span className="lp-sans" style={{ fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", color: "#9c9c94", display: "block", marginBottom: "0.875rem" }}>Browse</span>
                <h2 className="lp-serif" style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1, color: "#111009" }}>
                  Shop by category.
                </h2>
              </div>
              <Link to="/register" style={{
                fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                color: "#9c9c94", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.25s",
              }}
                onMouseOver={e => e.currentTarget.style.color = "#111009"}
                onMouseOut={e => e.currentTarget.style.color = "#9c9c94"}
              >View All →</Link>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1px", background: "#ddd8cf" }}>
            {categories.map((cat, i) => (
              <Reveal key={i} delay={i * 80}>
                <Link to={cat.link} className="lp-cat" style={{ position: "relative", display: "block", aspectRatio: "3/4", overflow: "hidden", textDecoration: "none", background: "#F7F3EC" }}>
                  <div className="lp-cat-img" style={{ position: "absolute", inset: 0, backgroundImage: `url(${cat.img})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.5rem" }}>
                    <p className="lp-sans" style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.35rem" }}>{cat.sub}</p>
                    <h3 className="lp-sans" style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{cat.label}</h3>
                    <span className="lp-cat-cta lp-sans" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: "0.5rem", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
                      Shop Now →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section style={{ background: "#111009", padding: "clamp(6rem, 10vw, 9rem) clamp(2rem, 6vw, 6rem)", textAlign: "center" }}>
          <Reveal>
            <span className="lp-sans" style={{ fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", display: "block", marginBottom: "1.5rem" }}>
              Stay Connected
            </span>
            <h2 className="lp-serif" style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 0.9, color: "#fff", marginBottom: "1.5rem" }}>
              Grow with us.
            </h2>
            <p className="lp-sans" style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.32)", fontWeight: 300, maxWidth: 400, margin: "0 auto 3rem", lineHeight: 1.72 }}>
              Join thousands of farmers and customers building a more direct, fair, and sustainable food chain.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" style={{ background: "#fff", color: "#111009", padding: "0.9rem 2.5rem", fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", textDecoration: "none", transition: "background 0.25s" }}
                onMouseOver={e => e.currentTarget.style.background = "#e5e1d8"}
                onMouseOut={e => e.currentTarget.style.background = "#fff"}
              >Create Free Account</Link>
              <Link to="/login" style={{ background: "transparent", color: "rgba(255,255,255,0.6)", padding: "0.9rem 2.5rem", fontSize: 11, fontWeight: 400, letterSpacing: "0.09em", textTransform: "uppercase", textDecoration: "none", border: "1px solid rgba(255,255,255,0.18)", transition: "border-color 0.25s, color 0.25s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              >Sign In</Link>
            </div>
          </Reveal>
        </section>

        {/* ── Footer ── */}
        <footer style={{ background: "#0b0a08" }}>
          <div style={{ padding: "2.5rem clamp(2rem, 6vw, 6rem)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="lp-serif" style={{ fontSize: "1.2rem", color: "#fff", letterSpacing: "-0.02em", fontWeight: 300 }}>AgriDirect</span>
            <div style={{ display: "flex", gap: "2.5rem" }}>
              {[["Join", "/register"], ["Login", "/login"], ["Explore", "#split"]].map(([label, href]) =>
                href.startsWith("/")
                  ? <Link key={label} to={href} style={{ fontSize: 10, letterSpacing: "0.38em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.color = "#fff"}
                    onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}
                  >{label}</Link>
                  : <a key={label} href={href} style={{ fontSize: 10, letterSpacing: "0.38em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.color = "#fff"}
                    onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}
                  >{label}</a>
              )}
            </div>
            <span className="lp-sans" style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>© {new Date().getFullYear()} AgriDirect. All rights reserved.</span>
          </div>
          <div style={{ overflow: "hidden", width: "100%" }}>
            <span
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",

                fontSize: "clamp(6rem, 16vw, 18rem)",
                lineHeight: 1.1, // FIXED

                letterSpacing: "0.02em",
                color: "#e5e5e5", // slightly reduced brightness

                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 300,

                paddingBottom: "0.15em", // 🔥 FIX FOR 'g'

                userSelect: "none",
                pointerEvents: "none",

                textShadow: "none",

                WebkitFontSmoothing: "antialiased",
              }}
            >
              AgriDirect
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}