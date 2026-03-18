import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { createPortal } from "react-dom";
import api from "../../api/axios";
import AddProduct from "./AddProduct";
import { MANDI_CROPS, MANDI_STATES } from "../../constants/mandiOptions";

/* ═══ Section Card (Rains-clean version) ════════════════ */
const SectionCard = ({ title, badge, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-border overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-border-light flex items-center gap-3">
      <h3 className="text-xs font-bold text-brand uppercase tracking-wider">{title}</h3>
      {badge && <span className="ml-auto text-[10px] font-semibold bg-surface text-brand-muted px-2.5 py-0.5 rounded-full border border-border-light">{badge}</span>}
    </div>
    {children}
  </div>
);

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl border border-border p-5 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="space-y-2"><div className="h-4 w-24 bg-border-light rounded-lg" /><div className="h-3 w-16 bg-border-light rounded-lg" /></div>
      <div className="h-5 w-14 bg-border-light rounded-full" />
    </div>
    <div className="h-7 w-28 bg-border-light rounded-lg mb-3" />
    <div className="space-y-2"><div className="h-3 w-40 bg-border-light rounded-lg" /><div className="h-2 w-full bg-border-light rounded-lg" /></div>
  </div>
);

/* ═══════════════════════════════════════════════════════ */
/*                  FARMER DASHBOARD                      */
/* ═══════════════════════════════════════════════════════ */
const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  const [soilType, setSoilType] = useState("");
  const [cropResult, setCropResult] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);

  const [mandiPrices, setMandiPrices] = useState([]);
  const [mandiSummary, setMandiSummary] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [mandiLoading, setMandiLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const switchToCustomer = () => {
    if (!user?.roles?.includes("customer")) {
      alert("You need customer access first.");
      return;
    }
    sessionStorage.setItem("activeRole", "customer");
    navigate("/customer");
  };

  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({ totalValue: "", quantity: "" });
  const [activeTab, setActiveTab] = useState("overview");

  const fetchMyProducts = async () => {
    try {
      const res = await api.get("/farmer/my-products");
      setProducts(res.data);
    } catch (err) {
      console.error("Product fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherSmart = async () => {
    try {
      const res = await api.get("/auth/me");
      const secondaryAddress = res.data.addresses?.find((addr) => addr.label === "secondary");
      const primaryAddress = res.data.addresses?.find((addr) => addr.label === "primary");
      const latitude = secondaryAddress?.latitude || primaryAddress?.latitude || res.data.location?.latitude;
      const longitude = secondaryAddress?.longitude || primaryAddress?.longitude || res.data.location?.longitude;
      if (!latitude || !longitude) {
        setWeatherError("No farm address set. Please add secondary address in your profile.");
        return;
      }
      const weatherRes = await api.get(`/farmer/weather?lat=${latitude}&lon=${longitude}`);
      setWeather(weatherRes.data);
      checkWeatherAlerts(weatherRes.data);
    } catch (err) {
      console.error("Weather fetch error");
      setWeatherError("Failed to fetch weather");
    }
  };

  const checkWeatherAlerts = (data) => {
    if (!data) return;
    if (data.temperature >= 38) setWeatherAlert({ message: "Heat Alert! High temperature may affect crops.", type: "heat" });
    else if (data.rainfall >= 50) setWeatherAlert({ message: "Heavy Rain Alert! Risk of crop damage.", type: "rain" });
    else if (data.temperature <= 10) setWeatherAlert({ message: "Cold Alert! Frost conditions possible.", type: "cold" });
    else setWeatherAlert(null);
  };

  const getCropRecommendation = async () => {
    if (!soilType || !weather) { alert("Select soil type and wait for weather data"); return; }
    setCropLoading(true);
    try {
      const res = await api.post("/farmer/ai-crop", {
        avgTemperature5Days: weather.avgTemperature5Days,
        avgHumidity5Days: weather.avgHumidity5Days,
        totalRainfall5Days: weather.totalRainfall5Days,
        soilType,
      });
      setCropResult(res.data.recommendations);
    } catch (error) {
      console.error("AI recommendation error:", error);
      alert("Failed to get AI recommendation");
    } finally {
      setCropLoading(false);
    }
  };

  const fetchMandiPrices = async () => {
    if (!selectedCrop || !selectedState) { alert("Select crop and state"); return; }
    setMandiLoading(true);
    try {
      const res = await api.get("/farmer/mandi-prices", { params: { commodity: selectedCrop, state: selectedState } });
      setMandiSummary({
        bestMarket: res.data.bestMarket,
        lowestMarket: res.data.lowestMarket,
        averagePrice: res.data.averagePrice,
        priceSpread: res.data.priceSpread,
        totalMarkets: res.data.totalMarkets,
      });
      setMandiPrices(res.data.records || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch mandi prices");
    } finally {
      setMandiLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/farmer/product/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch { alert("Failed to delete product"); }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setEditForm({ totalValue: String(product?.totalValue ?? ""), quantity: String(product?.quantity ?? "") });
    setIsEditOpen(true);
  };

  const closeEdit = () => { setIsEditOpen(false); setEditingProduct(null); setIsSavingEdit(false); setEditForm({ totalValue: "", quantity: "" }); };
  const handleEditChange = (e) => { const { name, value } = e.target; setEditForm((prev) => ({ ...prev, [name]: value })); };

  const saveEdit = async () => {
    if (!editingProduct) return;
    if (editForm.totalValue === "" || editForm.quantity === "") { alert("Total value and quantity cannot be empty"); return; }
    setIsSavingEdit(true);
    try {
      const res = await api.put(`/farmer/product/${editingProduct._id}`, {
        totalValue: Number(editForm.totalValue),
        quantity: Number(editForm.quantity),
      });
      setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? res.data.product : p)));
      closeEdit();
    } catch (err) {
      console.error(err);
      setIsSavingEdit(false);
      alert("Failed to update product");
    }
  };

  useEffect(() => {
    if (user) { fetchMyProducts(); fetchWeatherSmart(); }
  }, [user]);

  useEffect(() => {
    const handleFocus = () => fetchMyProducts();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const totalStock = products.reduce((s, p) => s + p.quantity, 0);
  const totalRevenue = products.reduce((s, p) => s + p.totalValue, 0);
  const lowStockProducts = products.filter((p) => {
    const pct = (p.quantity / (p.initialQuantity || 1)) * 100;
    return pct <= 25 && pct > 0;
  });

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Rains-style Clean Header ──────────────── */}
      <div className="pt-24 pb-10 px-6 lg:px-10 bg-surface-light border-b border-border">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-[0.3em] mb-3">Farmer Panel</p>
              <h1 className="text-section text-brand">Dashboard</h1>
              <p className="text-sm text-brand-muted mt-2 font-light">Manage listings, monitor weather and track market trends</p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              {user?.roles?.includes("customer") && (
                <button onClick={switchToCustomer} className="pill pill-outline">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Switch to Customer
                </button>
              )}
              {weather && (
                <div className="pill pill-outline !cursor-default">
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                  {weather.temperature}°C · {weather.location}
                </div>
              )}
            </div>
          </div>

          {/* Stat Cards — clean bordered */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Active Listings", value: products.length },
              { label: "Total Stock", value: `${totalStock} kg` },
              { label: "Est. Revenue", value: `₹${totalRevenue.toLocaleString()}` },
              { label: "Low Stock", value: lowStockProducts.length, isWarning: lowStockProducts.length > 0 },
            ].map((c) => (
              <div key={c.label} className="bg-white border border-border rounded-xl px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-semibold">{c.label}</p>
                <p className={`text-2xl font-extrabold mt-1 ${c.isWarning ? 'text-amber-600' : 'text-brand'}`}>{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 space-y-6">

        {/* Weather Alert Banner */}
        {weatherAlert && (
          <div className={`rounded-2xl px-5 py-4 flex items-center gap-3
            ${weatherAlert.type === "heat" ? "bg-red-50 border border-red-100 text-red-700" :
              weatherAlert.type === "rain" ? "bg-blue-50 border border-blue-100 text-blue-700" :
                "bg-cyan-50 border border-cyan-100 text-cyan-700"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0
              ${weatherAlert.type === "heat" ? "bg-red-100" :
                weatherAlert.type === "rain" ? "bg-blue-100" :
                  "bg-cyan-100"}`}>
              {weatherAlert.type === "heat" ? "🔥" : weatherAlert.type === "rain" ? "🌧" : "❄️"}
            </div>
            <div>
              <p className="font-bold text-sm">{weatherAlert.message}</p>
              <p className="text-xs opacity-60 mt-0.5">Take necessary precautions for your crops</p>
            </div>
          </div>
        )}

        {weatherError && (
          <div className="rounded-2xl px-5 py-4 bg-red-50 border border-red-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374H2.305c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0L21.303 16.126z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-700">{weatherError}</p>
          </div>
        )}

        {/* Tab Bar — Rains pill style */}
        <div className="bg-white rounded-full border border-border p-1.5 flex gap-1">
          {[
            { key: "overview", label: "Overview" },
            { key: "products", label: "My Products" },
            { key: "add", label: "Add Product" },
            { key: "market", label: "Market Intel" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all
                ${activeTab === tab.key
                  ? "bg-brand text-white"
                  : "text-brand-muted hover:text-brand hover:bg-surface"
                }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Weather Card */}
              <SectionCard title={`Weather${weather ? ` — ${weather.location}` : ""}`} className="lg:col-span-2">
                {weather ? (
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: "Temperature", value: `${weather.temperature}°C` },
                        { label: "Humidity", value: `${weather.humidity}%` },
                        { label: "Rainfall", value: `${weather.rainfall} mm` },
                        { label: "Wind", value: `${weather.windSpeed} m/s` },
                        { label: "Condition", value: weather.condition },
                      ].map((w) => (
                        <div key={w.label} className="bg-surface border border-border-light rounded-xl p-4 text-center">
                          <p className="text-[10px] text-brand-muted uppercase tracking-wider font-medium">{w.label}</p>
                          <p className="text-sm font-bold text-brand mt-1 capitalize">{w.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-brand-muted">
                    {weatherError || "Loading weather data..."}
                  </div>
                )}
              </SectionCard>

              {/* AI Crop Advisor */}
              <SectionCard title="AI Crop Advisor">
                <div className="p-5 space-y-3">
                  <select value={soilType} onChange={(e) => setSoilType(e.target.value)}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all bg-white">
                    <option value="">Select Soil Type</option>
                    {["sandy", "laterite", "red", "loamy", "alluvial", "clay", "black"].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <button onClick={getCropRecommendation} disabled={cropLoading || !soilType || !weather}
                    className="w-full pill pill-filled justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                    {cropLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Analyzing...
                      </span>
                    ) : "Get AI Recommendation"}
                  </button>

                  {cropResult && (
                    <div className="space-y-2 mt-2 max-h-[220px] overflow-y-auto pr-1">
                      {cropResult.map((item, i) => (
                        <div key={i} className="bg-accent-muted border border-accent/10 rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-accent-dark">{item.crop}</span>
                            <span className="text-[11px] font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                              {(item.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-accent/10 rounded-full h-1.5 mt-2">
                            <div className="bg-accent h-1.5 rounded-full transition-all duration-700" style={{ width: `${item.confidence * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Product Overview Grid */}
            <SectionCard title="Product Overview" badge={`${products.length} listings`}>
              <div className="p-5">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <ProductSkeleton key={i} />)}
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-brand-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-brand-muted">No products yet</p>
                    <button onClick={() => setActiveTab("add")} className="text-sm text-accent font-semibold mt-1 hover:underline">Add your first product →</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.slice(0, 6).map((p) => {
                      const initial = Number(p.initialQuantity) || 1;
                      const current = Number(p.quantity) || 0;
                      const pct = Math.min(100, Math.max(0, Math.round((current / initial) * 100)));
                      const barColor = current === 0 ? "bg-border" : pct <= 25 ? "bg-red-500" : pct <= 50 ? "bg-amber-500" : "bg-accent";
                      return (
                        <div key={p._id} className="bg-surface rounded-xl p-4 hover:bg-surface-light transition-colors border border-border-light">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-bold text-brand">{p.masterProduct?.name}</p>
                              <p className="text-[10px] text-brand-muted uppercase tracking-wider">{p.masterProduct?.category}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-muted text-accent border border-accent/10">Active</span>
                          </div>
                          <p className="text-xl font-extrabold text-brand">
                            ₹{p.pricePerKg.toFixed(2)} <span className="text-xs font-medium text-brand-muted">/{p.masterProduct?.unit}</span>
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-brand-muted mt-3 mb-1.5">
                            <span>{current}/{initial} {p.masterProduct?.unit}</span>
                            <span className="font-semibold">{pct}%</span>
                          </div>
                          <div className="w-full bg-border-light rounded-full h-1.5">
                            <div className={`${barColor} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {products.length > 6 && (
                  <button onClick={() => setActiveTab("products")} className="mt-4 text-sm text-accent font-semibold hover:underline">
                    View all {products.length} products →
                  </button>
                )}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ═══════════ PRODUCTS TAB ═══════════ */}
        {activeTab === "products" && (
          <SectionCard title="My Products" badge={`${products.length} Active`}>
            <div className="p-5">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => <ProductSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm font-medium text-brand-muted">No products listed yet</p>
                  <button onClick={() => setActiveTab("add")} className="mt-2 text-sm text-accent font-semibold hover:underline">Add your first product →</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((p) => {
                    const initial = Number(p.initialQuantity) || 1;
                    const current = Number(p.quantity) || 0;
                    const pct = Math.min(100, Math.max(0, Math.round((current / initial) * 100)));
                    const barColor = current === 0 ? "bg-border" : pct <= 25 ? "bg-red-500" : pct <= 50 ? "bg-amber-500" : "bg-accent";
                    const isLow = pct <= 25 && pct > 0;

                    return (
                      <div key={p._id} className="bg-white rounded-2xl border border-border hover:shadow-lg hover:shadow-black/5 transition-all duration-300 overflow-hidden">
                        <div className={`h-0.5 ${isLow ? "bg-amber-400" : "bg-accent"}`} />
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-base font-bold text-brand">{p.masterProduct?.name}</p>
                              <p className="text-[10px] text-brand-muted mt-0.5 uppercase tracking-wider">{p.masterProduct?.category}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isLow ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-accent-muted text-accent border border-accent/10"}`}>
                              {isLow ? "Low Stock" : "Active"}
                            </span>
                          </div>
                          <p className="text-2xl font-extrabold text-brand">
                            ₹{p.pricePerKg.toFixed(2)}
                            <span className="text-xs font-medium text-brand-muted ml-1">/{p.masterProduct?.unit}</span>
                          </p>
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-surface rounded-lg px-3 py-2 border border-border-light">
                              <p className="text-[10px] text-brand-muted uppercase tracking-wider font-medium">Total Value</p>
                              <p className="text-sm font-bold text-brand">₹{p.totalValue.toLocaleString()}</p>
                            </div>
                            <div className="bg-surface rounded-lg px-3 py-2 border border-border-light">
                              <p className="text-[10px] text-brand-muted uppercase tracking-wider font-medium">In Stock</p>
                              <p className="text-sm font-bold text-brand">{p.quantity} {p.masterProduct?.unit}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-[11px] text-brand-muted mb-1.5">
                              <span>{current} / {initial} {p.masterProduct?.unit}</span>
                              <span className="font-semibold">{pct}%</span>
                            </div>
                            <div className="w-full bg-border-light rounded-full h-2">
                              <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="flex gap-2.5 mt-5">
                            <button onClick={() => openEdit(p)}
                              className="flex-1 pill pill-outline justify-center !rounded-xl py-2.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              Edit
                            </button>
                            <button onClick={() => deleteProduct(p._id)}
                              className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ═══════════ ADD PRODUCT TAB ═══════════ */}
        {activeTab === "add" && (
          <AddProduct onAdded={() => { fetchMyProducts(); setActiveTab("products"); }} />
        )}

        {/* ═══════════ MARKET INTEL TAB ═══════════ */}
        {activeTab === "market" && (
          <div className="space-y-6">
            <SectionCard title="Live Mandi Prices">
              <div className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider text-brand-muted font-semibold mb-1.5">Crop</label>
                    <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}
                      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all appearance-none bg-white">
                      <option value="">Select Crop</option>
                      {products.map((p) => (
                        <option key={p._id} value={p.masterProduct?.name}>{p.masterProduct?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider text-brand-muted font-semibold mb-1.5">State</label>
                    <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all appearance-none bg-white">
                      <option value="">Select State</option>
                      {MANDI_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="self-end">
                    <button onClick={fetchMandiPrices} disabled={mandiLoading || !selectedCrop || !selectedState}
                      className="pill pill-filled py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed">
                      {mandiLoading ? "Fetching..." : "Get Prices"}
                    </button>
                  </div>
                </div>

                {/* Mandi Summary Cards */}
                {mandiSummary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface border border-border-light border-l-4 border-l-accent rounded-xl p-4">
                      <p className="text-[10px] uppercase tracking-wider text-brand-muted font-medium">Best Market</p>
                      <p className="text-sm font-bold text-brand mt-1">{mandiSummary.bestMarket.market}</p>
                      <p className="text-lg font-extrabold text-brand">₹{mandiSummary.bestMarket.modal_price}</p>
                    </div>
                    <div className="bg-surface border border-border-light border-l-4 border-l-brand-muted rounded-xl p-4">
                      <p className="text-[10px] uppercase tracking-wider text-brand-muted font-medium">Average Price</p>
                      <p className="text-xl font-extrabold text-brand mt-2">₹{mandiSummary.averagePrice}</p>
                    </div>
                    <div className="bg-surface border border-border-light border-l-4 border-l-red-400 rounded-xl p-4">
                      <p className="text-[10px] uppercase tracking-wider text-brand-muted font-medium">Lowest Market</p>
                      <p className="text-sm font-bold text-brand mt-1">{mandiSummary.lowestMarket.market}</p>
                      <p className="text-lg font-extrabold text-brand">₹{mandiSummary.lowestMarket.modal_price}</p>
                    </div>
                    <div className="bg-surface border border-border-light border-l-4 border-l-amber-400 rounded-xl p-4">
                      <p className="text-[10px] uppercase tracking-wider text-brand-muted font-medium">Price Spread</p>
                      <p className="text-xl font-extrabold text-brand mt-2">₹{mandiSummary.priceSpread}</p>
                      <p className="text-[10px] text-brand-muted mt-0.5">{mandiSummary.totalMarkets} markets</p>
                    </div>
                  </div>
                )}

                {mandiPrices.length > 0 && (
                  <div className="bg-surface rounded-xl border border-border-light overflow-hidden">
                    <div className="max-h-72 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white sticky top-0 border-b border-border">
                          <tr>
                            {["Market", "Variety", "Min", "Max", "Modal"].map((h) => (
                              <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider text-brand-muted font-semibold text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                          {mandiPrices.map((m, i) => (
                            <tr key={i} className="hover:bg-white transition-colors">
                              <td className="px-4 py-3 font-medium text-brand">{m.market}</td>
                              <td className="px-4 py-3 text-brand-muted">{m.variety || "—"}</td>
                              <td className="px-4 py-3 text-brand-muted">₹{m.min_price}</td>
                              <td className="px-4 py-3 text-brand-muted">₹{m.max_price}</td>
                              <td className="px-4 py-3 font-bold text-brand">₹{m.modal_price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {mandiPrices.length === 0 && selectedCrop && selectedState && !mandiLoading && (
                  <div className="py-8 text-center text-sm text-brand-muted">No mandi data available for selected crop/state</div>
                )}
              </div>
            </SectionCard>

            {/* AI Crop Recommendation */}
            <SectionCard title="AI Crop Recommendation">
              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider text-brand-muted font-semibold mb-1.5">Soil Type</label>
                    <select value={soilType} onChange={(e) => setSoilType(e.target.value)}
                      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all appearance-none bg-white">
                      <option value="">Select Soil Type</option>
                      {["sandy", "laterite", "red", "loamy", "alluvial", "clay", "black"].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="self-end">
                    <button onClick={getCropRecommendation} disabled={cropLoading || !soilType || !weather}
                      className="pill pill-filled py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed">
                      {cropLoading ? "Analyzing..." : "Get Recommendation"}
                    </button>
                  </div>
                </div>

                {!weather && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
                    Weather data is required for crop recommendations. {weatherError || "Loading..."}
                  </div>
                )}

                {cropResult && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {cropResult.map((item, i) => (
                      <div key={i} className="bg-accent-muted border border-accent/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-accent/10 text-accent">{i + 1}</span>
                            <span className="text-sm font-bold text-accent-dark">{item.crop}</span>
                          </div>
                          <span className="text-sm font-extrabold text-accent">{(item.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-accent/10 rounded-full h-2">
                          <div className="bg-accent h-2 rounded-full transition-all duration-700" style={{ width: `${item.confidence * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      {/* ═══ EDIT MODAL (Glassmorphism) ═══ */}
      {isEditOpen && editingProduct &&
        createPortal(
          <div onClick={closeEdit}
            style={{ position: "fixed", inset: 0, zIndex: 2147483647 }}
            className="bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="bg-brand px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Edit Product</h3>
                  <p className="text-white/40 text-xs mt-0.5">{editingProduct.masterProduct?.name}</p>
                </div>
                <button onClick={closeEdit} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-brand-muted font-semibold mb-1.5">Total Value (₹)</label>
                  <input type="number" name="totalValue" value={editForm.totalValue} onChange={handleEditChange}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all bg-surface"
                    min="0" step="0.01" placeholder="Enter total value" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-brand-muted font-semibold mb-1.5">Quantity ({editingProduct.masterProduct?.unit || "kg"})</label>
                  <input type="number" name="quantity" value={editForm.quantity} onChange={handleEditChange}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all bg-surface"
                    min="0" placeholder="Enter quantity" />
                </div>
                {editForm.totalValue && editForm.quantity && Number(editForm.quantity) > 0 && (
                  <div className="bg-surface rounded-xl px-4 py-3 flex items-center justify-between border border-border-light">
                    <span className="text-xs text-brand-muted">Calculated Price / {editingProduct.masterProduct?.unit || "kg"}</span>
                    <span className="text-sm font-bold text-brand">₹{(Number(editForm.totalValue) / Number(editForm.quantity)).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={closeEdit}
                    className="flex-1 pill pill-outline justify-center py-3 !rounded-xl">
                    Cancel
                  </button>
                  <button onClick={saveEdit} disabled={isSavingEdit || editForm.totalValue === "" || editForm.quantity === ""}
                    className="flex-1 pill pill-filled justify-center py-3 !rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default FarmerDashboard;