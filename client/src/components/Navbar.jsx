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
  const [mobileOpen, setMobileOpen] = useState(false);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      const res = await api.post("/auth/add-role", { role: "customer" });
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("roles", JSON.stringify(res.data.user.roles));
      sessionStorage.setItem("activeRole", "customer");
      window.location.reload();
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

  /* ── Pill style helpers ─────────────────────────── */
  const pillBase = `
    inline-flex items-center gap-2 rounded-none text-[13px] font-medium
    transition-all duration-300 ease-out
  `;

  const navPill = scrolled
    ? "bg-white/90 backdrop-blur-xl border border-gray-200/60 shadow-sm"
    : isLanding
      ? "bg-white/[0.08] backdrop-blur-xl border border-white/[0.12]"
      : "bg-white/90 backdrop-blur-xl border border-gray-200/60 shadow-sm";

  const textColor = scrolled
    ? "text-gray-800"
    : isLanding ? "text-white/90" : "text-gray-800";

  const textHover = scrolled
    ? "hover:text-[#16A34A]"
    : isLanding ? "hover:text-white" : "hover:text-[#16A34A]";

  /* ── Profile dropdown ─────────────────────────── */
  const DropdownMenu = ({ children }) => (
    <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl
      rounded-none shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100
      py-2 z-50 animate-fade-in-up">
      {children}
    </div>
  );

  const DropdownItem = ({ to, onClick, danger, children }) => {
    const cls = `block w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors
      ${danger ? "text-red-500 hover:bg-red-50/80" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`;
    if (to) return <Link to={to} onClick={onClick} className={cls}>{children}</Link>;
    return <button onClick={onClick} className={cls}>{children}</button>;
  };

  const ProfileAvatar = ({ onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2.5 ${pillBase} ${navPill} px-3 py-2`}>
      <div className="w-7 h-7 bg-[#16A34A] text-white flex items-center justify-center
        rounded-none text-xs font-bold tracking-tight">
        {user?.name?.charAt(0).toUpperCase()}
      </div>
      <span className={`hidden md:block text-[13px] font-medium ${textColor}`}>
        {user?.name}
      </span>
    </button>
  );

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
      ${scrolled ? "py-2.5 bg-white border-b border-gray-200/60" : "py-4"}`}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 flex items-center justify-between gap-3">

        {/* ── Logo Pill ── */}
        <Link to={homeRoute} className={`${pillBase} ${navPill} px-5 py-2.5 ${textColor} font-bold tracking-[-0.02em] text-[15px]`}>
          AgriDirect
        </Link>




        {/* ── Right-side Actions ── */}
        <div className="flex items-center gap-2.5">

          {/* Guest actions */}
          {!user && (
            <>
              <Link to="/login" className={`${pillBase} ${navPill} px-5 py-2.5 ${textColor} ${textHover}`}>
                Login
              </Link>
              <Link to="/register" className={`${pillBase} px-5 py-2.5 font-semibold tracking-wide
                ${scrolled
                  ? "bg-[#16A34A] text-white border border-[#16A34A] hover:bg-[#15803d]"
                  : isLanding
                    ? "bg-white text-[#16A34A] border border-white hover:bg-white/90"
                    : "bg-[#16A34A] text-white border border-[#16A34A] hover:bg-[#15803d]"
                }`}>
                Register
              </Link>
            </>
          )}

          {/* Customer profile */}
          {user && activeRole === "customer" && (
            <div ref={profileRef} className="relative">
              <ProfileAvatar onClick={() => setIsProfileOpen(!isProfileOpen)} />
              {isProfileOpen && (
                <DropdownMenu>
                  <DropdownItem to="/customer/profile" onClick={() => setIsProfileOpen(false)}>
                    Account
                  </DropdownItem>
                  <DropdownItem onClick={handleLogout} danger>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Farmer profile */}
          {user && activeRole === "farmer" && (
            <div ref={profileRef} className="relative">
              <ProfileAvatar onClick={() => setIsProfileOpen(!isProfileOpen)} />
              {isProfileOpen && (
                <DropdownMenu>
                  <DropdownItem to="/farmer" onClick={() => setIsProfileOpen(false)}>
                    Dashboard
                  </DropdownItem>
                  <DropdownItem to="/farmer/profile" onClick={() => setIsProfileOpen(false)}>
                    Account Details
                  </DropdownItem>
                  {user?.roles?.includes("customer") && (
                    <DropdownItem onClick={() => { setIsProfileOpen(false); switchRole("customer"); }}>
                      Switch to Customer
                    </DropdownItem>
                  )}
                  {!user?.roles?.includes("customer") && (
                    <DropdownItem onClick={() => { setIsProfileOpen(false); handleBecomeCustomer(); }}>
                      Become Customer
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={() => { setIsProfileOpen(false); handleLogout(); }} danger>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Admin profile */}
          {user && activeRole === "admin" && (
            <div ref={profileRef} className="relative">
              <ProfileAvatar onClick={() => setIsProfileOpen(!isProfileOpen)} />
              {isProfileOpen && (
                <DropdownMenu>
                  <DropdownItem to="/admin" onClick={() => setIsProfileOpen(false)}>
                    Dashboard
                  </DropdownItem>
                  <DropdownItem onClick={() => { setIsProfileOpen(false); handleLogout(); }} danger>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
