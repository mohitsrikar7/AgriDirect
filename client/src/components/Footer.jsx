import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import { AuthContext } from "../context/AuthContext";

/* ── Social Links ──────────────────────────────── */
const SOCIAL_LINKS = [
    {
        label: "Twitter / X",
        url: "https://twitter.com",
        icon: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
    },
    {
        label: "Instagram",
        url: "https://instagram.com",
        icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    },
    {
        label: "LinkedIn",
        url: "https://linkedin.com",
        icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
];

/* ── Role-Restricted Modal ──────────────────────── */
const FarmerOnlyModal = ({ isOpen, onClose, featureName, onSwitchRole }) => {
    if (!isOpen) return null;
    return createPortal(
        <div
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 2147483647 }}
            className="bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
            >
                {/* Header */}
                <div style={{ backgroundColor: "#1a1a1a" }} className="px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Farmer-Only Feature</h3>
                            <p className="text-white/40 text-xs mt-0.5">{featureName}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        <strong className="text-gray-900">{featureName}</strong> is a tool designed for farmers on our platform.
                        It provides real-time insights to help farmers make better decisions.
                    </p>

                    {onSwitchRole && (
                        <button
                            onClick={onSwitchRole}
                            className="w-full pill pill-filled justify-center py-3"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                            Switch to Farmer Mode
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full pill pill-outline justify-center py-3"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

/* ═══════════════════════════════════════════════════ */
/*                   FOOTER COMPONENT                 */
/* ═══════════════════════════════════════════════════ */
const Footer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalFeature, setModalFeature] = useState("");

    // Don't show footer on landing (scroll-snapping) or auth pages (full-bleed)
    const hiddenRoutes = ["/", "/login", "/register"];
    if (hiddenRoutes.includes(location.pathname)) return null;

    const currentYear = new Date().getFullYear();
    const activeRole = sessionStorage.getItem("activeRole");
    const isFarmer = activeRole === "farmer";
    const isCustomer = activeRole === "customer";
    const hasFarmerRole = user?.roles?.includes("farmer");

    /* ── Role-aware click handler for farmer-only features ── */
    const handleFarmerLink = (e, path, featureName) => {
        e.preventDefault();

        if (isFarmer) {
            // Already in farmer mode → navigate directly
            navigate(path);
        } else if (hasFarmerRole) {
            // Has farmer role but currently in customer mode → show switch modal
            setModalFeature(featureName);
            setModalOpen(true);
        } else {
            // Customer-only user → show info modal (no switch option)
            setModalFeature(featureName);
            setModalOpen(true);
        }
    };

    const handleSwitchToFarmer = () => {
        sessionStorage.setItem("activeRole", "farmer");
        setModalOpen(false);
        navigate("/farmer");
    };

    /* ── Navigation link definitions ── */
    const platformLinks = [
        { label: "Marketplace", to: "/customer" },
        { label: "For Farmers", to: isFarmer ? "/farmer" : "/register" },
        { label: "For Customers", to: isCustomer ? "/customer" : "/register" },
        { label: "Market Prices", to: "/farmer/mandi", farmerOnly: true },
    ];

    const resourceLinks = [
        { label: "AI Crop Advisor", to: "/farmer", farmerOnly: true },
        { label: "Weather Insights", to: "/farmer", farmerOnly: true },
        { label: "Mandi Prices", to: "/farmer/mandi", farmerOnly: true },
        { label: "How It Works", to: "/" },
    ];

    const accountLinks = [
        { label: "Login", to: "/login", hideWhenLoggedIn: true },
        { label: "Register", to: "/register", hideWhenLoggedIn: true },
        {
            label: "My Orders",
            to: isCustomer ? "/customer/orders" : isFarmer ? "/farmer" : "/customer/orders",
        },
        {
            label: "Profile",
            to: isCustomer ? "/customer/profile" : isFarmer ? "/farmer/profile" : "/customer/profile",
        },
    ];

    /* ── Render a link column ── */
    const renderLinkColumn = (title, links) => (
        <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 mb-5">
                {title}
            </h4>
            <ul className="space-y-3">
                {links
                    .filter((link) => !(link.hideWhenLoggedIn && user))
                    .map((link) => (
                        <li key={link.label}>
                            {link.farmerOnly ? (
                                <a
                                    href="#"
                                    onClick={(e) => handleFarmerLink(e, link.to, link.label)}
                                    className="text-sm text-white/50 hover:text-white transition-colors font-light cursor-pointer"
                                >
                                    {link.label}
                                    {!isFarmer && (
                                        <svg className="w-3 h-3 inline ml-1.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    )}
                                </a>
                            ) : (
                                <Link
                                    to={link.to}
                                    className="text-sm text-white/50 hover:text-white transition-colors font-light"
                                >
                                    {link.label}
                                </Link>
                            )}
                        </li>
                    ))}
            </ul>
        </div>
    );

    return (
        <>
            <footer style={{ backgroundColor: "#1a1a1a" }} className="text-white">
                {/* Main Footer Content */}
                <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                        {/* ── Brand Column ── */}
                        <div className="lg:col-span-1">
                            <h3 className="text-sm font-extrabold tracking-[0.2em] uppercase mb-4">
                                AgriDirect
                            </h3>
                            <p className="text-white/40 text-sm leading-relaxed font-light max-w-xs">
                                Connecting farmers directly with customers through smart technology,
                                fair pricing, and transparent trade.
                            </p>

                            {/* Social Icons — open in new tabs */}
                            <div className="flex items-center gap-3 mt-6">
                                {SOCIAL_LINKS.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Visit us on ${social.label}`}
                                        title={social.label}
                                        className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center
                      hover:bg-white/10 hover:border-white/30 transition-all"
                                    >
                                        <svg className="w-3.5 h-3.5 fill-current text-white/50" viewBox="0 0 24 24">
                                            <path d={social.icon} />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* ── Link Columns ── */}
                        {renderLinkColumn("Platform", platformLinks)}
                        {renderLinkColumn("Resources", resourceLinks)}
                        {renderLinkColumn("Account", accountLinks)}
                    </div>
                </div>

                {/* ── Bottom Bar ── */}
                <div className="border-t border-white/10">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-[11px] text-white/30 font-medium uppercase tracking-wider">
                            © {currentYear} AgriDirect. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            {["Privacy Policy", "Terms of Service", "Contact"].map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="text-[11px] text-white/30 hover:text-white/60
                    transition-colors font-medium uppercase tracking-wider"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Role-restricted modal (portalled to body) */}
            <FarmerOnlyModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                featureName={modalFeature}
                onSwitchRole={hasFarmerRole ? handleSwitchToFarmer : null}
            />
        </>
    );
};

export default Footer;
