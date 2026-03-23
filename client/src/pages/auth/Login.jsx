import { useState, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import authHero from "../../assets/auth-hero.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });

      login(res.data);

      const roles = res.data.user.roles;

      if (roles.includes("admin")) {
        sessionStorage.setItem("activeRole", "admin");
        navigate("/admin");
      }
      else if (roles.includes("farmer")) {
        sessionStorage.setItem("activeRole", "farmer");
        navigate("/farmer");
      }
      else {
        sessionStorage.setItem("activeRole", "customer");
        navigate("/customer");
      }


    } catch (err) {
      console.log("LOGIN ERROR:", err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex relative"
      style={{
        backgroundImage: `url(${authHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Outfit', system-ui, sans-serif",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 100%)",
      }} />

      {/* LEFT SIDE – HERO CONTENT */}
      <div className="hidden lg:flex w-3/5 relative z-10 items-end p-16 pb-20 text-white">
        <div className="max-w-2xl">
          <span style={{
            fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", display: "block", marginBottom: "1.5rem",
            fontWeight: 500,
          }}>
            Welcome back
          </span>
          <h1 style={{
            fontSize: "clamp(3.5rem, 7vw, 6rem)",
            fontWeight: 800, lineHeight: 0.92,
            letterSpacing: "-0.04em",
            color: "#f0e68c",
            textTransform: "lowercase",
            marginBottom: "1.5rem",
          }}>
            the future of farming starts here.
          </h1>

          <p className="text-base text-white/40 leading-relaxed max-w-md" style={{ fontWeight: 300 }}>
            Empowering farmers and customers through smart technology,
            real-time insights, and fair trade agriculture.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE – LOGIN CARD */}
      <div className="w-full lg:w-2/5 flex items-center justify-center relative z-10 p-8">

        <div className="w-full max-w-md bg-white/[0.95] backdrop-blur-2xl p-10 md:p-12
          rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.25)]
          border border-white/50">

          <h2 style={{
            fontSize: "1.75rem", fontWeight: 800, color: "#111",
            letterSpacing: "-0.03em", marginBottom: "0.5rem",
          }}>
            Welcome Back
          </h2>

          <p style={{
            fontSize: "0.875rem", color: "#888",
            marginBottom: "2rem", fontWeight: 300,
          }}>
            Login to continue to AgriDirect
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="email"
              placeholder="Email address"
              className="w-full px-5 py-3.5 rounded-full text-sm
                bg-gray-50 border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-[#2d5a3d]/30 focus:border-[#2d5a3d]
                transition-all placeholder:text-gray-400"
              style={{ fontWeight: 400 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-5 py-3.5 rounded-full text-sm
                bg-gray-50 border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-[#2d5a3d]/30 focus:border-[#2d5a3d]
                transition-all placeholder:text-gray-400"
              style={{ fontWeight: 400 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full py-3.5 rounded-full font-semibold text-sm
                transition-all duration-300 active:scale-[0.98]"
              style={{
                background: "#1a1a1a", color: "#fff",
                letterSpacing: "0.04em", textTransform: "uppercase",
                fontSize: "0.8125rem",
              }}
              onMouseOver={e => e.currentTarget.style.background = "#333"}
              onMouseOut={e => e.currentTarget.style.background = "#1a1a1a"}
            >
              Login
            </button>

          </form>

          <p className="text-sm text-center mt-8" style={{ color: "#999", fontWeight: 300 }}>
            New here?{" "}
            <Link to="/register" style={{
              color: "#2d5a3d", fontWeight: 600, textDecoration: "none",
            }}>
              Create an account
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;
