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
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* LEFT SIDE – HERO CONTENT */}
      <div className="hidden lg:flex w-3/5 relative z-10 items-center p-20 text-white">
        <div className="max-w-2xl">
          <h1 className="text-6xl xl:text-7xl 2xl:text-8xl font-extrabold leading-tight mb-6">
            The Future of
            <br />
            Farming Starts
            <br />
            Here.
          </h1>

          <p className="text-lg text-gray-200 leading-relaxed">
            Empowering farmers and customers through smart technology,
            real-time insights, and fair trade agriculture.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE – FLOATING LOGIN CARD */}
      <div className="w-full lg:w-2/5 flex items-center justify-center relative z-10 p-8">

        <div className="w-full max-w-md bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-xl p-12 
rounded-[2.5rem] 
rounded-tr-[3.5rem] 
shadow-[0_30px_90px_rgba(0,0,0,0.35)] 
border border-white/40">

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h2>

          <p className="text-gray-500 mb-8">
            Login to continue to AgriDirect
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="email"
              placeholder="Email address"
              className="w-full border border-gray-300 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 hover:shadow-xl active:scale-95 text-white py-3 rounded-2xl font-semibold transition duration-300"
            >
              Login
            </button>

          </form>

          <p className="text-sm text-gray-500 mt-8 text-center">
            New here?{" "}
            <Link to="/register" className="text-green-600 font-medium hover:underline">
              Create an account
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;
