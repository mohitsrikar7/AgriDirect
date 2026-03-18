import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

const Navbar = () => {
  const { user, logout, cartCount } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  const isLanding = location.pathname === "/";

  useEffect(() => {
    if (!isLanding) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  const [activeRole, setActiveRole] = useState(
    sessionStorage.getItem("activeRole")
  );

  useEffect(() => {
    if (user?.roles?.length && !activeRole) {
      const firstRole = user.roles[0];
      sessionStorage.setItem("activeRole", firstRole);
      setActiveRole(firstRole);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const switchRole = (role) => {
    sessionStorage.setItem("activeRole", role);
    setActiveRole(role);

    if (role === "farmer") navigate("/farmer");
    if (role === "customer") navigate("/customer");
    if (role === "admin") navigate("/admin");
  };
  const handleBecomeCustomer = async () => {
    try {
      const res = await api.post("/auth/add-role", {
        role: "customer",
      });

      // Update auth context with new data
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem(
        "roles",
        JSON.stringify(res.data.user.roles)
      );
      sessionStorage.setItem("activeRole", "customer");

      window.location.reload(); // refresh UI cleanly

    } catch (err) {
      alert(err.response?.data?.message || "Failed to add role");
    }
  };
  let homeRoute = "/";

  if (user && activeRole) {
    if (activeRole === "customer") homeRoute = "/customer";
    else if (activeRole === "farmer") homeRoute = "/farmer";
    else if (activeRole === "admin") homeRoute = "/admin";
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          : "bg-transparent border-b-0"
        }`}
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        {/* Brand */}
        <Link
          to={homeRoute}
          className={`text-2xl font-bold tracking-tight transition-colors duration-500 ${scrolled ? "text-gray-900" : isLanding ? "text-white" : "text-gray-900"
            }`}
        >
          AgriDirect
        </Link>

        <div className={`flex items-center gap-6 text-sm ${scrolled ? "text-gray-700" : isLanding ? "text-white/90" : "text-gray-700"
          }`}>
          {!user && (
            <>
              <Link to="/login" className={`hover:${scrolled ? 'text-green-600' : 'text-white'} transition font-medium`}>
                Login
              </Link>
              <Link
                to="/register"
                className={`px-5 py-2 rounded-xl font-medium transition ${scrolled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : isLanding
                      ? "bg-white text-[#1a1a1a] hover:bg-white/90"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                Register
              </Link>
            </>
          )}

          {user && activeRole === "customer" && (
            <>
              <Link to="/customer" className="hover:text-green-600">
                Marketplace
              </Link>

              <Link to="/customer/orders" className="hover:text-green-600">
                Orders
              </Link>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-green-600 text-white flex items-center justify-center rounded-full font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block font-medium">
                    {user?.name}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                    <Link
                      to="/customer/profile"
                      className="block px-4 py-2 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Account
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* FARMER NAV */}
          {user && activeRole === "farmer" && (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-green-50 transition"
              >
                <div className="w-9 h-9 bg-green-700 text-white flex items-center justify-center rounded-full font-semibold shadow">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block font-medium text-gray-700">
                  {user?.name}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <Link
                    to="/farmer"
                    className="block px-4 py-2 hover:bg-gray-50 transition"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/farmer/profile"
                    className="block px-4 py-2 hover:bg-gray-50 transition"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Account Details
                  </Link>

                  {user?.roles?.includes("customer") && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        switchRole("customer");
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition"
                    >
                      Switch to Customer
                    </button>
                  )}

                  {!user?.roles?.includes("customer") && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleBecomeCustomer();
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition"
                    >
                      Become Customer
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ADMIN NAV */}
          {user && activeRole === "admin" && (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-green-50 transition"
              >
                <div className="w-9 h-9 bg-green-700 text-white flex items-center justify-center rounded-full font-semibold shadow">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block font-medium text-gray-700">
                  {user?.name}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <Link
                    to="/admin"
                    className="block px-4 py-2 hover:bg-gray-50 transition"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
