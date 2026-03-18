import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import LocationPickerModal from "./LocationPickerModal";

const ProductSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="animate-pulse bg-white rounded-2xl border border-border overflow-hidden">
        <div className="h-56 bg-gradient-to-br from-surface to-border-light" />
        <div className="p-5 space-y-3">
          <div className="h-3 bg-border-light rounded-full w-1/3" />
          <div className="h-4 bg-border rounded-full w-3/4" />
          <div className="h-3 bg-border-light rounded-full w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const CustomerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedSellers, setSelectedSellers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const { user } = useContext(AuthContext);
  const { cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, updateQuantity, isInCart, clearCart, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const switchToFarmer = () => {
    if (!user?.roles?.includes("farmer")) {
      alert("You need farmer access first.");
      return;
    }
    sessionStorage.setItem("activeRole", "farmer");
    navigate("/farmer");
  };
  const [address, setAddress] = useState({
    fullName: "", phone: "", house: "", area: "", city: "", state: "", pincode: "",
  });
  const [location, setLocation] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.addresses && res.data.addresses.length > 0) {
          const primaryAddress = res.data.addresses.find(
            (addr) => addr.type === "home" && addr.label === "primary"
          );
          if (primaryAddress) setAddress(primaryAddress);
        }
        if (res.data.location) setLocation(res.data.location);
      } catch (err) {
        console.error("Failed to fetch user data");
      }
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

  const saveAddress = async () => {
    try {
      await api.put("/customer/update-address", {
        type: "home", label: "primary", isActive: true,
        fullName: address.fullName, phone: address.phone,
        house: address.house, area: address.area, city: address.city,
        state: address.state, pincode: address.pincode,
        latitude: location?.latitude, longitude: location?.longitude,
      });
      alert("Delivery address saved successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save address");
    }
  };

  const fetchSellers = async (masterProductId, productName) => {
    try {
      const res = await api.get(`/customer/product/${masterProductId}`);
      if (!res.data || res.data.length === 0) {
        alert("No active sellers available for this product.");
        return;
      }
      setSelectedSellers(res.data);
      setSelectedProductName(productName);
      setIsSellerModalOpen(true);
    } catch (err) {
      console.error("Seller fetch error", err);
    }
  };

  const selectSeller = (seller) => {
    addToCart({
      _id: seller._id, price: seller.pricePerKg,
      masterProduct: seller.masterProduct, quantity: 1,
      availableStock: seller.quantity,
    });
  };

  const totalAmount = cartTotal;

  const placeOrder = async () => {
    if (cart.length === 0) { alert("Cart is empty"); return; }
    try {
      const orderItems = cart.map((item) => ({ product: item._id, quantity: item.quantity }));
      const res = await api.post("/order/place", { items: orderItems, paymentMethod: "COD" });
      clearCart();
      navigate(`/customer/payment/${res.data.order._id}`);
    } catch (err) {
      console.error("Order error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  const lowestPrice = selectedSellers.length
    ? Math.min(...selectedSellers.map((s) => s.pricePerKg))
    : null;

  return (
    <>
      <div className="min-h-screen bg-surface">

        {/* ── Rains-style Clean Header ──────────────── */}
        <div className="pt-24 pb-10 px-6 lg:px-10 bg-surface-light border-b border-border">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-brand-muted font-medium mb-3">
                  Marketplace
                </p>
                <h1 className="text-section text-brand">
                  Fresh from Farm
                </h1>
                <p className="text-sm text-brand-muted mt-2 max-w-lg font-light leading-relaxed">
                  Discover verified produce from local farmers. Compare prices, check quality, and order directly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {user?.roles?.includes("farmer") && (
                  <button onClick={switchToFarmer} className="pill pill-outline">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    Switch to Farmer
                  </button>
                )}
                <div
                  onClick={() => navigate("/customer/profile")}
                  className="flex items-center gap-3 border border-border rounded-full px-5 py-3 cursor-pointer hover:border-brand/30 transition group"
                >
                  <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[9px] text-brand-muted uppercase tracking-[0.2em] font-semibold">Delivering to</p>
                    {address?.house ? (
                      <p className="text-xs font-semibold text-brand truncate">
                        {address.house}, {address.city || address.area}
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-accent">Add delivery address</p>
                    )}
                  </div>
                  <svg className="w-3 h-3 text-brand-muted group-hover:text-brand transition shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Stats Row — clean bordered */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: "Categories", value: new Set(products.map(p => p.category)).size },
                { label: "Products", value: products.length },
                { label: "Location", value: address?.city || "Not set" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-border rounded-xl px-5 py-4">
                  <p className="text-[10px] text-brand-muted uppercase tracking-[0.2em] font-semibold">{stat.label}</p>
                  <p className="text-xl font-bold text-brand mt-1 truncate">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ──────────────────────────── */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">

          {/* Search + Category pills (Rains filter-chip style) */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text" placeholder="Search products..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-full text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`pill ${category === cat ? "pill-filled" : "pill-outline"
                    }`}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Count */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-brand-muted uppercase tracking-[0.2em] font-medium">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {/* Products Grid (Rains-style clean cards) */}
          {loading ? (
            <ProductSkeleton />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-border-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875V7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-brand">No products found</h3>
              <p className="text-xs text-brand-muted mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.masterProductId}
                  onClick={() => navigate(`/customer/product/${product.masterProductId}`)}
                  className="group bg-white rounded-2xl border border-border overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-black/5 hover:border-brand/10 transition-all duration-500 flex flex-col"
                >
                  {/* Image (Rains-style — edge-to-edge, clean bg) */}
                  <div className="relative h-56 bg-surface-light flex items-center justify-center p-8 overflow-hidden">
                    <img
                      src={product.image || "/images/default.jpg"}
                      alt={product.name}
                      className="max-h-44 object-contain group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Content — minimal text (Rains-style) */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-medium mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-semibold text-brand text-base group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-auto pt-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-brand-muted">From</span>
                        <span className="text-lg font-bold text-brand">
                          ₹{Number(product.minPrice || 0).toFixed(0)}
                        </span>
                        <span className="text-xs text-brand-muted">/ {product.unit}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/product/${product.masterProductId}`);
                        }}
                        className="mt-4 w-full pill pill-outline justify-center"
                      >
                        View Sellers
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Seller Modal (Glassmorphism) ────────── */}
      {isSellerModalOpen && (
        <div
          onClick={() => setIsSellerModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-fade-in-up"
          >
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-5 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-brand">{selectedProductName}</h3>
                  <p className="text-xs text-brand-muted mt-1 uppercase tracking-wider">
                    {selectedSellers.length} seller{selectedSellers.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                <button
                  onClick={() => setIsSellerModalOpen(false)}
                  className="w-9 h-9 rounded-full border border-border hover:bg-surface flex items-center justify-center text-brand-muted hover:text-brand transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Seller List */}
            <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">
              {selectedSellers.map((seller) => {
                const isBestPrice = seller.pricePerKg === lowestPrice;
                return (
                  <div
                    key={seller._id}
                    className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl transition-all duration-200 border
                      ${isBestPrice
                        ? "border-accent/30 bg-accent-muted"
                        : "border-border bg-white hover:bg-surface hover:border-brand/10"
                      }`}
                  >
                    {isBestPrice && (
                      <div className="absolute -top-2.5 left-5">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-brand text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Best Price
                        </span>
                      </div>
                    )}

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {seller.farmer?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-brand text-sm">{seller.farmer?.name}</p>
                          <p className="text-xs text-brand-muted">
                            {seller.distance ? `${seller.distance} km away` : "Distance N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-brand-muted pl-[46px]">
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${seller.quantity > 5 ? 'bg-accent' : 'bg-orange-400'}`} />
                          {seller.quantity} in stock
                        </span>
                        {seller.quantity <= 5 && (
                          <span className="text-orange-600 font-medium">Low stock</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 sm:mt-0">
                      <div className="text-right">
                        <p className="text-xl font-bold text-brand">
                          ₹{Number(seller.pricePerKg || 0).toFixed(0)}
                        </p>
                        <p className="text-xs text-brand-muted">per {seller.masterProduct?.unit}</p>
                      </div>
                      <button
                        onClick={() => { selectSeller(seller); setIsSellerModalOpen(false); }}
                        className="pill pill-filled"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={async (data) => {
          try {
            const newAddressData = {
              type: "home", label: "primary", isActive: true,
              fullName: address.fullName, phone: address.phone,
              house: data.formattedAddress, area: "", city: "", state: "", pincode: "",
              latitude: data.latitude, longitude: data.longitude,
            };
            await api.put("/customer/update-address", newAddressData);
            setLocation({ latitude: data.latitude, longitude: data.longitude });
            setAddress(newAddressData);
            alert("Location saved successfully!");
          } catch (err) {
            alert("Failed to save location");
          }
        }}
      />
    </>
  );
};

export default CustomerDashboard;