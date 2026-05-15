import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import LocationPickerModal from "./LocationPickerModal";

/* ═══════════════════════════════════════════════════════════
   AgriDirect — Premium Marketplace UI v3
   Blinkit × Amazon × Instacart · Production-ready · Green
   ═══════════════════════════════════════════════════════════ */

/* ── Inject Poppins font ──────────────────────────────────── */
const FontLoader = () => (
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
);

/* ── Skeleton Loader ───────────────────────────────────── */
const ProductSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-4">
    {[...Array(12)].map((_, i) => (
      <div key={i} className="bg-white rounded-none shadow-sm p-3 flex flex-col">
        <div className="animate-shimmer w-full h-[130px] rounded-none mb-3" />
        <div className="animate-shimmer h-3.5 rounded-none w-full mb-2" />
        <div className="animate-shimmer h-3 rounded-none w-2/3 mb-1" />
        <div className="animate-shimmer h-2.5 rounded-none w-1/3 mb-3" />
        <div className="flex items-center justify-between mt-auto">
          <div className="animate-shimmer h-5 rounded-none w-14" />
          <div className="animate-shimmer h-9 rounded-none w-20" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Cart Slide-out Drawer ─────────────────────────────── */
const CartDrawer = ({
  isOpen, onClose, cart, cartTotal, cartCount,
  removeFromCart, increaseQuantity, decreaseQuantity, navigate, placeOrder
}) => (
  <>
    {/* Backdrop */}
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={onClose}
    />
    {/* Panel */}
    <div className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[70] shadow-2xl
      transform transition-transform duration-300 ease-out flex flex-col
      ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#16A34A] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Your Cart</h3>
            <p className="text-xs text-gray-500">{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-none hover:bg-gray-100 flex items-center justify-center transition">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-6">
            <div className="w-24 h-24 bg-green-50 rounded-none flex items-center justify-center mb-5">
              <svg className="w-12 h-12 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <p className="text-gray-900 font-bold text-lg">Cart is empty</p>
            <p className="text-gray-400 text-sm mt-1 text-center">Browse fresh produce and add items to your cart</p>
            <button onClick={onClose} className="mt-6 bg-[#16A34A] text-white font-semibold text-sm px-6 py-2.5 rounded-none hover:bg-[#15803d] transition">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {cart.map((item) => (
              <div key={item._id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#16A34A] font-bold uppercase tracking-wider">
                      {item.masterProduct?.category || "Product"}
                    </p>
                    <h4 className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug">
                      {item.masterProduct?.name || item.farmerName || "Product"}
                    </h4>
                    {item.farmerName && (
                      <p className="text-xs text-gray-400 mt-0.5">by {item.farmerName}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">₹{item.price}/{item.unit || "kg"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-none overflow-hidden">
                    <button onClick={() => decreaseQuantity(item._id)} disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-[#16A34A] hover:bg-green-100 disabled:opacity-30 transition text-base font-bold">−</button>
                    <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-900 border-x border-green-200 bg-white">{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item._id)} disabled={item.quantity >= (item.availableStock || 9999)}
                      className="w-8 h-8 flex items-center justify-center text-[#16A34A] hover:bg-green-100 disabled:opacity-30 transition text-base font-bold">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="text-[11px] text-gray-400 hover:text-red-500 font-semibold transition">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold text-gray-900">₹{cartTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery</span>
            <span className="font-bold text-[#16A34A]">FREE</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-2xl font-extrabold text-gray-900">₹{cartTotal.toLocaleString()}</span>
          </div>
          <button onClick={placeOrder}
            className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm py-4 rounded-none transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 active:scale-[0.98]">
            Proceed to Checkout
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <button onClick={() => { onClose(); navigate("/customer/cart"); }}
            className="w-full text-gray-400 hover:text-gray-700 text-xs font-semibold py-1.5 transition text-center">
            View Full Cart →
          </button>
        </div>
      )}
    </div>
  </>
);


/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const CustomerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const {
    cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity,
    updateQuantity, isInCart, clearCart, cartTotal, cartCount
  } = useContext(CartContext);
  const navigate = useNavigate();
  const catScrollRef = useRef(null);

  const [address, setAddress] = useState({
    fullName: "", phone: "", house: "", area: "", city: "", state: "", pincode: "",
  });
  const [location, setLocation] = useState(null);

  const switchToFarmer = () => {
    if (!user?.roles?.includes("farmer")) { alert("You need farmer access first."); return; }
    sessionStorage.setItem("activeRole", "farmer");
    navigate("/farmer");
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.addresses?.length > 0) {
          const primary = res.data.addresses.find(a => a.type === "home" && a.label === "primary");
          if (primary) setAddress(primary);
        }
        if (res.data.location) setLocation(res.data.location);
      } catch { /* silent */ }
    };
    fetchUserData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/customer/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Product fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellers = async (masterProductId, productName) => {
    try {
      const res = await api.get(`/customer/product/${masterProductId}`);
      if (!res.data?.length) { alert("No active sellers available."); return; }
      setSelectedSellers(res.data);
      setSelectedProductName(productName);
      setIsSellerModalOpen(true);
    } catch (err) { console.error(err); }
  };

  const selectSeller = (seller) => {
    addToCart({
      _id: seller._id, price: seller.pricePerKg,
      masterProduct: seller.masterProduct, quantity: 1,
      availableStock: seller.quantity,
    });
  };

  const placeOrder = async () => {
    if (cart.length === 0) { alert("Cart is empty"); return; }
    try {
      const orderItems = cart.map(item => ({ product: item._id, quantity: item.quantity }));
      const res = await api.post("/order/place", { items: orderItems, paymentMethod: "COD" });
      clearCart();
      navigate(`/customer/payment/${res.data.order._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  const lowestPrice = selectedSellers.length
    ? Math.min(...selectedSellers.map(s => s.pricePerKg))
    : null;

  /* ── Category icon mapping ──────────────────── */
  const catMeta = {
    all:        { emoji: "🛒", label: "All",        image: null },
    vegetables: { emoji: "🥬", label: "Vegetables", image: "/images/categories/vegetables.png" },
    fruits:     { emoji: "🍎", label: "Fruits",     image: "/images/categories/fruits.png" },
    grains:     { emoji: "🌾", label: "Grains",     image: "/images/categories/grains.png" },
    spices:     { emoji: "🌶️", label: "Spices",     image: "/images/categories/spices.png" },
    dairy:      { emoji: "🥛", label: "Dairy",      image: "/images/categories/dairy.png" },
    pulses:     { emoji: "🫘", label: "Pulses",     image: "/images/categories/pulses.png" },
    oil:        { emoji: "🫒", label: "Oil",        image: "/images/categories/oil.png" },
  };

  const getCatMeta = (cat) => catMeta[cat.toLowerCase()] || { emoji: "📦", label: cat.charAt(0).toUpperCase() + cat.slice(1), image: null };

  /* ── Group products by category ──────────────── */
  const productsByCategory = {};
  products.forEach(p => {
    if (!p.category) return;
    if (!productsByCategory[p.category]) productsByCategory[p.category] = [];
    productsByCategory[p.category].push(p);
  });

  /* ── Non-"all" categories that have products ─── */
  const activeCats = categories.filter(c => c !== "all" && productsByCategory[c]?.length > 0);

  /* ── Add-to-cart button animation state ─── */
  const [poppedCard, setPoppedCard] = useState(null);
  const handleAddClick = (e, product) => {
    e.stopPropagation();
    setPoppedCard(product.masterProductId);
    setTimeout(() => setPoppedCard(null), 400);
    navigate(`/customer/product/${product.masterProductId}`);
  };

  /* ── Mock rating helper ──────────────────────── */
  const getMockRating = (name) => {
    const hash = name?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) || 0;
    return (3.8 + (hash % 13) / 10).toFixed(1);
  };

  /* ── Reusable product card — Premium v3 ──── */
  const ProductCard = ({ product, grid = false }) => {
    const rating = getMockRating(product.name);

    return (
      <div
        className={`group bg-white rounded-none border border-gray-100 flex flex-col cursor-pointer
          transition-all duration-300 hover:shadow-xl hover:shadow-green-900/8 hover:border-green-100 hover:-translate-y-1
          overflow-hidden ${grid ? "w-full" : "w-[200px] sm:w-[210px] shrink-0"}`}
        onClick={() => navigate(`/customer/product/${product.masterProductId}`)}
      >
        {/* Image area */}
        <div className="relative w-full flex justify-center items-center h-[150px] p-4 bg-gradient-to-b from-[#f7faf7] to-white">
          <img
            src={product.image || "/images/default.jpg"}
            alt={product.name}
            className="max-w-[80%] max-h-[120px] object-contain group-hover:scale-[1.08] transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col flex-1 px-3.5 pt-2.5 pb-3.5">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-none">
              {rating}
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-[13px] text-gray-800 leading-[1.35] line-clamp-2 min-h-[35px]">{product.name}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5 mb-2">{product.unit ? `1 ${product.unit}` : "1 kg"}</p>

          {/* Price + ADD */}
          <div className="flex items-end justify-between mt-auto">
            <div>
              <span className="text-[16px] font-extrabold text-gray-900">₹{Number(product.minPrice || 0).toFixed(0)}</span>
            </div>
            <button
              onClick={(e) => handleAddClick(e, product)}
              className={`h-[34px] px-4 rounded-none text-[12px] font-bold uppercase tracking-wide transition-all duration-200
                border-2 border-[#16A34A] text-[#16A34A] bg-green-50 hover:bg-[#16A34A] hover:text-white active:scale-90 shrink-0
                ${poppedCard === product.masterProductId ? "bg-[#16A34A] text-white scale-90" : ""}`}
            >
              ADD
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ── Trust badges data ──────────────────── */
  const trustBadges = [
    { icon: "🌱", text: "Farm Fresh", sub: "Harvested daily" },
    { icon: "💰", text: "Best Prices", sub: "No middlemen" },
    { icon: "⚡", text: "Fast Delivery", sub: "Same-day dispatch" },
    { icon: "✅", text: "100% Verified", sub: "Trusted farmers" },
  ];

  return (
    <>
      <FontLoader />

      {/* ── Custom styles ── */}
      <style>{`
        .ag-font { font-family: 'Poppins', system-ui, -apple-system, sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; }
        @keyframes ag-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .ag-slide-up { animation: ag-slide-up 0.4s ease-out; }
        @keyframes ag-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .ag-pulse { animation: ag-pulse 2s ease-in-out infinite; }
        @keyframes ag-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .animate-shimmer { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 800px 100%; animation: ag-shimmer 1.5s infinite; }
      `}</style>

      <div className="ag-font min-h-screen bg-[#F9FAFB] pb-28 sm:pb-6">

        {/* ═══════════════════════════════════════════════════
            STICKY TOP BAR — Search + Location + Cart
            ═══════════════════════════════════════════════════ */}
        <div className="sticky top-[64px] z-40 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="flex items-center gap-3 sm:gap-4 py-2.5">

              {/* Location Chip — Desktop */}
              <button onClick={() => navigate("/customer/profile")}
                className="hidden md:flex flex-col items-start gap-0 hover:bg-green-50 rounded-none px-3 py-2 transition-all shrink-0 group">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] text-gray-900 font-bold leading-tight">Delivery in 24 hrs</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="w-3 h-3 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                  <p className="text-[12px] font-medium text-gray-500 truncate max-w-[140px] leading-tight">
                    {address?.city || address?.house?.split(",")[0] || "Set location"}
                  </p>
                  <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {/* Divider */}
              <div className="hidden md:block w-px h-8 bg-gray-200" />

              {/* Search Bar */}
              <div className="relative flex-1 max-w-2xl">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder='Search "tomato", "banana", "spinach"...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] border border-transparent rounded-none text-[14px] font-medium text-gray-800
                    placeholder:text-gray-400 focus:bg-white focus:border-[#16A34A] focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-none bg-gray-300 hover:bg-gray-400 flex items-center justify-center transition">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Right Actions */}
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                {!user && (
                  <button onClick={() => navigate("/login")}
                    className="text-[14px] font-semibold text-gray-500 hover:text-gray-900 px-3 py-2 rounded-none hover:bg-gray-50 transition-colors">
                    Login
                  </button>
                )}
                <button onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803d] text-white rounded-none px-5 py-3 transition-all shadow-sm hover:shadow-lg hover:shadow-green-600/20 active:scale-[0.97]">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <span className="text-[14px] font-bold">Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-0.5 min-w-[20px] h-5 flex items-center justify-center text-[11px] font-extrabold bg-white text-[#16A34A] rounded-none px-1.5 leading-none">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-4" />

        {/* ═══════════════════════════════════════════════════
            MAIN CONTENT
            ═══════════════════════════════════════════════════ */}
        <div className="max-w-[1400px] mx-auto w-full">

          {/* ── Search results mode ── */}
          {search ? (
            <div className="px-4 py-6">
              <h2 className="text-[18px] font-bold text-gray-900 mb-4">
                Search results for "{search}"
                <span className="text-[13px] font-medium text-gray-400 ml-2">
                  ({filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""})
                </span>
              </h2>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-none flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900">No products found</h3>
                  <p className="text-[13px] text-gray-400 mt-1 mb-5">Try a different search term</p>
                  <button onClick={() => setSearch("")}
                    className="bg-[#16A34A] text-white text-[13px] font-bold px-5 py-2.5 rounded-none hover:bg-[#15803d] transition">
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.masterProductId} product={product} grid />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>

              {/* ═══════ 1. HERO BANNER ═══════ */}
              <div className="px-4 pt-2 pb-2">
                <div className="relative overflow-hidden rounded-none bg-gradient-to-r from-[#065f28] via-[#16A34A] to-[#22c55e] min-h-[180px] sm:min-h-[220px] flex items-center">
                  {/* Decorative circles */}
                  <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-none" />
                  <div className="absolute -right-16 -bottom-12 w-72 h-72 bg-white/5 rounded-none" />
                  <div className="absolute left-1/2 -bottom-20 w-40 h-40 bg-white/5 rounded-none" />

                  <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-none mb-4">
                      <span className="w-1.5 h-1.5 bg-green-300 rounded-none animate-pulse" />
                      Farm to Table in 24 hours
                    </div>
                    <h2 className="text-[24px] sm:text-[32px] font-extrabold text-white leading-[1.15] mb-2">
                      Fresh Groceries,<br />
                      <span className="text-green-200">Directly from Farmers</span>
                    </h2>
                    <p className="text-green-100/70 text-[13px] sm:text-[14px] font-medium mb-5 max-w-md">
                      No middlemen. Best prices. Verified & trusted farmers across India.
                    </p>
                    <button onClick={() => document.querySelector('#cat-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-white text-[#16A34A] text-[13px] font-bold px-6 py-2.5 rounded-none hover:bg-green-50 transition-all shadow-lg shadow-black/10 active:scale-95">
                      Start Shopping →
                    </button>
                  </div>
                </div>
              </div>

              {/* ═══════ 2. TRUST BADGES ═══════ */}
              <div className="px-4 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {trustBadges.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-none px-4 py-3.5 hover:shadow-md hover:border-green-100 transition-all duration-300 cursor-default">
                      <span className="text-[24px] shrink-0">{b.icon}</span>
                      <div>
                        <p className="text-[13px] font-bold text-gray-800">{b.text}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{b.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ═══════ 3. PROMO CARDS ═══════ */}
              <div className="px-4 pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1 */}
                  <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] p-5 min-h-[130px] flex flex-col justify-between group cursor-pointer hover:shadow-lg transition-all border border-green-100">
                    <div>
                      <h3 className="text-[16px] font-extrabold text-green-800 leading-tight mb-1">Farm Fresh Picks!</h3>
                      <p className="text-[12px] text-green-600 font-medium">Seasonal vegetables & more</p>
                    </div>
                    <button onClick={() => setCategory("vegetables")}
                      className="mt-3 bg-[#16A34A] text-white text-[11px] font-bold px-4 py-2 rounded-none w-fit hover:bg-[#15803d] transition-all">
                      Shop Now →
                    </button>
                  </div>

                  {/* Card 2 */}
                  <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-[#fff7ed] to-[#fed7aa] p-5 min-h-[130px] flex flex-col justify-between group cursor-pointer hover:shadow-lg transition-all border border-orange-100">
                    <div>
                      <h3 className="text-[16px] font-extrabold text-orange-800 leading-tight mb-1">Spices & Flavors</h3>
                      <p className="text-[12px] text-orange-600 font-medium">Authentic from local farms</p>
                    </div>
                    <button onClick={() => setCategory("spices")}
                      className="mt-3 bg-[#F97316] text-white text-[11px] font-bold px-4 py-2 rounded-none w-fit hover:bg-[#ea580c] transition-all">
                      Explore →
                    </button>
                  </div>

                  {/* Card 3 */}
                  <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-[#eff6ff] to-[#bfdbfe] p-5 min-h-[130px] flex flex-col justify-between group cursor-pointer hover:shadow-lg transition-all border border-blue-100">
                    <div>
                      <h3 className="text-[16px] font-extrabold text-blue-800 leading-tight mb-1">Direct from Farmers</h3>
                      <p className="text-[12px] text-blue-600 font-medium">Fair pricing, zero middlemen</p>
                    </div>
                    <button onClick={() => setCategory("all")}
                      className="mt-3 bg-[#3b82f6] text-white text-[11px] font-bold px-4 py-2 rounded-none w-fit hover:bg-[#2563eb] transition-all">
                      Browse All →
                    </button>
                  </div>
                </div>
              </div>

              {/* ═══════ 4. CATEGORY SCROLL CHIPS ═══════ */}
              <div id="cat-section" className="px-4 py-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[18px] font-extrabold text-gray-900">Shop by Category</h2>
                </div>
                <div ref={catScrollRef} className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                  {categories.filter(c => c !== "all").map((cat) => {
                    const meta = getCatMeta(cat);
                    const active = category === cat;
                    return (
                      <button key={cat} onClick={() => setCategory(cat)}
                        className="flex flex-col items-center gap-2 group transition-all duration-200 shrink-0">
                        <div className={`w-[70px] h-[70px] sm:w-[78px] sm:h-[78px] rounded-none overflow-hidden border-2 transition-all duration-300
                          ${active ? "border-[#16A34A] shadow-lg shadow-green-500/20 scale-105 ring-2 ring-green-500/10" : "border-gray-100 hover:border-green-200 hover:shadow-md"}`}>
                          {meta.image ? (
                            <img src={meta.image} alt={meta.label}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[26px]">{meta.emoji}</div>
                          )}
                        </div>
                        <span className={`text-[11px] sm:text-[12px] text-center leading-tight line-clamp-1 transition-colors font-medium
                          ${active ? "text-[#16A34A] font-bold" : "text-gray-500 group-hover:text-gray-800"}`}>
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ═══════ 5. CATEGORY PRODUCT SECTIONS ═══════ */}
              {loading ? (
                <ProductSkeleton />
              ) : (
                <div className="pb-8">
                  {activeCats.map((cat) => {
                    const meta = getCatMeta(cat);
                    const catProducts = productsByCategory[cat] || [];
                    if (catProducts.length === 0) return null;
                    return (
                      <div key={cat} className="mb-8">
                        {/* Section Header */}
                        <div className="flex items-center justify-between px-4 mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-1 h-6 bg-[#16A34A] rounded-none" />
                            <h2 className="text-[18px] font-extrabold text-gray-900 tracking-tight">{meta.label}</h2>
                            <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-none">
                              {catProducts.length}
                            </span>
                          </div>
                          <button onClick={() => setCategory(cat)}
                            className="text-[13px] font-bold text-[#16A34A] hover:text-[#15803d] transition-colors flex items-center gap-1 hover:gap-2 duration-200">
                            see all
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                        </div>
                        {/* Horizontal Scroll Row */}
                        <div className="flex gap-3.5 overflow-x-auto px-4 pb-3 scrollbar-hide"
                          style={{ scrollbarWidth: "none" }}>
                          {catProducts.map((product) => (
                            <ProductCard key={product.masterProductId} product={product} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>


        {/* ═══════════════════════════════════════════════════
            STICKY MOBILE BOTTOM CART BAR
            ═══════════════════════════════════════════════════ */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden ag-slide-up">
            <div className="mx-3 mb-3">
              <button onClick={() => setIsCartOpen(true)}
                className="w-full bg-[#16A34A] text-white rounded-none px-5 py-4 flex items-center justify-between shadow-2xl shadow-green-900/30 active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 bg-white/20 rounded-none flex items-center justify-center text-sm font-extrabold">
                    {cartCount}
                  </span>
                  <div className="text-left">
                    <p className="text-green-200/70 text-[10px] font-medium uppercase tracking-wider">Your Cart</p>
                    <p className="text-sm font-bold -mt-0.5">{cart.length} item{cart.length !== 1 ? "s" : ""} · ₹{cartTotal.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold">View Cart</span>
                  <div className="w-7 h-7 bg-white/20 rounded-none flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>


      {/* ═══════════════════════════════════════════════════
          CART DRAWER
          ═══════════════════════════════════════════════════ */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        removeFromCart={removeFromCart}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        navigate={navigate}
        placeOrder={placeOrder}
      />


      {/* ═══════════════════════════════════════════════════
          SELLER MODAL (bottom sheet mobile, modal desktop)
          ═══════════════════════════════════════════════════ */}
      {isSellerModalOpen && (
        <div onClick={() => setIsSellerModalOpen(false)}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col
              rounded-none sm:rounded-none ag-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-none" />
            </div>
            {/* Header */}
            <div className="px-6 pt-3 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedProductName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedSellers.length} seller{selectedSellers.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setIsSellerModalOpen(false)}
                className="w-8 h-8 rounded-none hover:bg-gray-100 flex items-center justify-center transition">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Sellers */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {selectedSellers.map((seller) => {
                const isBest = seller.pricePerKg === lowestPrice;
                return (
                  <div key={seller._id}
                    className={`flex items-center justify-between p-4 rounded-none border transition-all
                      ${isBest ? "border-green-200 bg-green-50/50" : "border-gray-100 hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-none bg-[#16A34A] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {seller.farmer?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm truncate">{seller.farmer?.name}</p>
                          {isBest && (
                            <span className="text-[9px] bg-[#16A34A] text-white px-2 py-0.5 rounded-none font-bold">BEST</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400">{seller.distance ? `${seller.distance} km` : "N/A"}</span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-none ${seller.quantity > 5 ? "bg-green-400" : "bg-amber-400"}`} />
                            {seller.quantity} stock
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-2">
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-gray-900">
                          ₹{Number(seller.pricePerKg || 0).toFixed(0)}
                        </p>
                        <p className="text-[10px] text-gray-400">/{seller.masterProduct?.unit}</p>
                      </div>
                      <button onClick={() => { selectSeller(seller); setIsSellerModalOpen(false); setIsCartOpen(true); }}
                        className="bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-bold px-4 py-2.5 rounded-none transition active:scale-95">
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* Location Picker */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={async (data) => {
          try {
            const newAddr = {
              type: "home", label: "primary", isActive: true,
              fullName: address.fullName, phone: address.phone,
              house: data.formattedAddress, area: "", city: "", state: "", pincode: "",
              latitude: data.latitude, longitude: data.longitude,
            };
            await api.put("/customer/update-address", newAddr);
            setLocation({ latitude: data.latitude, longitude: data.longitude });
            setAddress(newAddr);
          } catch { alert("Failed to save location"); }
        }}
      />
    </>
  );
};

export default CustomerDashboard;