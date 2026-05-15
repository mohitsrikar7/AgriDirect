import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import authHero from "../../assets/auth-hero.jpg";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", formData);
      alert("Registration successful 🎉 Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const roles = [
    { value: "customer", label: "Customer", desc: "Buy fresh produce" },
    { value: "farmer", label: "Farmer", desc: "Sell your harvest" },
    { value: "admin", label: "Admin", desc: "Manage platform" },
  ];

  return (
    <div
      className="min-h-screen flex relative"
      style={{
        backgroundImage: `url(${authHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Poppins', system-ui, sans-serif",
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
            Get started
          </span>
          <h1 style={{
            fontSize: "clamp(3.5rem, 7vw, 6rem)",
            fontWeight: 800, lineHeight: 0.92,
            letterSpacing: "-0.04em",
            color: "#f0e68c",
            textTransform: "lowercase",
            marginBottom: "1.5rem",
          }}>
            join the future of smart farming.
          </h1>

          <p className="text-base text-white/40 leading-relaxed max-w-md" style={{ fontWeight: 300 }}>
            Connect directly with farmers and customers,
            access real-time insights, and grow with technology.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE – REGISTER CARD */}
      <div className="w-full lg:w-2/5 flex items-center justify-center relative z-10 p-8">

        <div className="w-full max-w-md bg-white/[0.95] backdrop-blur-2xl p-10 md:p-12
          rounded-none shadow-[0_24px_80px_rgba(0,0,0,0.25)]
          border border-white/50">

          <h2 style={{
            fontSize: "1.75rem", fontWeight: 800, color: "#111",
            letterSpacing: "-0.03em", marginBottom: "0.5rem",
          }}>
            Create Account
          </h2>

          <p style={{
            fontSize: "0.875rem", color: "#888",
            marginBottom: "2rem", fontWeight: 300,
          }}>
            Join AgriDirect and get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full px-5 py-3.5 rounded-none text-sm
                bg-gray-50 border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]
                transition-all placeholder:text-gray-400"
              style={{ fontWeight: 400 }}
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full px-5 py-3.5 rounded-none text-sm
                bg-gray-50 border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]
                transition-all placeholder:text-gray-400"
              style={{ fontWeight: 400 }}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full px-5 py-3.5 rounded-none text-sm
                bg-gray-50 border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]
                transition-all placeholder:text-gray-400"
              style={{ fontWeight: 400 }}
              value={formData.password}
              onChange={handleChange}
              required
            />

            {/* Role Selector Pill Toggle */}
            <div>
              <p style={{
                fontSize: "0.75rem", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "#999", marginBottom: "0.75rem",
              }}>
                I am a
              </p>
              <div className="flex gap-2">
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r.value })}
                    className="flex-1 py-2.5 rounded-none text-xs font-semibold transition-all duration-300"
                    style={{
                      background: formData.role === r.value ? "#16A34A" : "transparent",
                      color: formData.role === r.value ? "#fff" : "#999",
                      border: formData.role === r.value
                        ? "1.5px solid #16A34A"
                        : "1.5px solid #e5e5e5",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-none font-semibold text-sm
                transition-all duration-300 active:scale-[0.98]"
              style={{
                background: "#16A34A", color: "#fff",
                letterSpacing: "0.04em", textTransform: "uppercase",
                fontSize: "0.8125rem",
              }}
              onMouseOver={e => e.currentTarget.style.background = "#15803d"}
              onMouseOut={e => e.currentTarget.style.background = "#16A34A"}
            >
              Create Account
            </button>

          </form>

          <p className="text-sm text-center mt-8" style={{ color: "#999", fontWeight: 300 }}>
            Already have an account?{" "}
            <Link to="/login" style={{
              color: "#16A34A", fontWeight: 600, textDecoration: "none",
            }}>
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};

export default Register;
