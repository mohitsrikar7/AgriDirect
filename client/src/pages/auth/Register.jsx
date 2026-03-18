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

  return (
    <div
      className="min-h-screen flex relative"
      style={{
        backgroundImage: `url(${authHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* LEFT SIDE – HERO CONTENT */}
      <div className="hidden lg:flex w-3/5 relative z-10 items-center p-20 text-white">
        <div className="max-w-2xl">
          <h1 className="text-6xl xl:text-7xl 2xl:text-8xl font-extrabold leading-tight mb-6">
            Join the Future
            <br />
            of Smart Farming.
          </h1>

          <p className="text-lg text-gray-200 leading-relaxed">
            Connect directly with farmers and customers,
            access real-time insights, and grow with technology.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE – FLOATING REGISTER CARD */}
      <div className="w-full lg:w-2/5 flex items-center justify-center relative z-10 p-8">

        <div className="w-full max-w-md 
        bg-gradient-to-br from-white/95 to-white/85
        backdrop-blur-xl 
        p-12 
        rounded-[2.5rem] 
        rounded-tr-[3.5rem] 
        shadow-[0_30px_90px_rgba(0,0,0,0.35)] 
        border border-white/40">

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h2>

          <p className="text-gray-500 mb-8">
            Join AgriDirect and get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full border border-gray-300 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full border border-gray-300 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full border border-gray-300 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full appearance-none border border-gray-300 bg-gray-50 p-3 pr-10 rounded-2xl 
    focus:outline-none focus:ring-2 focus:ring-green-500 transition cursor-pointer"
              >
                <option value="customer">Customer</option>
                <option value="farmer">Farmer</option>
                <option value="admin">Admin</option>
              </select>

              {/* Custom Chevron */}
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                ▼
              </div>
            </div>



            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 hover:shadow-xl active:scale-95 text-white py-3 rounded-2xl font-semibold transition duration-300"
            >
              Create Account
            </button>

          </form>

          <p className="text-sm text-gray-500 mt-8 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 font-medium hover:underline">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div >
  );

};

export default Register;
