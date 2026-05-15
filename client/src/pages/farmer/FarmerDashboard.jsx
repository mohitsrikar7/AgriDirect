import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { createPortal } from "react-dom";
import api from "../../api/axios";
import AddProduct from "./AddProduct";
import { MANDI_CROPS, MANDI_STATES } from "../../constants/mandiOptions";
import { getMandiCommodity } from "../../utils/mandiMapping";
/* ═══ Section Card (Rains-clean version) ════════════════ */
const SectionCard = ({ title, badge, children, className = "" }) => (
  <div className={`bg-white rounded-none border border-gray-200 overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
      {badge && <span className="ml-auto text-[10px] font-semibold bg-surface text-gray-500 px-2.5 py-0.5 rounded-none border border-gray-100">{badge}</span>}
    </div>
    {children}
  </div>
);

const ProductSkeleton = () => (
  <div className="bg-white rounded-none border border-gray-200 p-5 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="space-y-2"><div className="h-4 w-24 bg-gray-200-light rounded-none" /><div className="h-3 w-16 bg-gray-200-light rounded-none" /></div>
      <div className="h-5 w-14 bg-gray-200-light rounded-none" />
    </div>
    <div className="h-7 w-28 bg-gray-200-light rounded-none mb-3" />
    <div className="space-y-2"><div className="h-3 w-40 bg-gray-200-light rounded-none" /><div className="h-2 w-full bg-gray-200-light rounded-none" /></div>
  </div>
);

const SOIL_OPTIONS = ["sandy", "laterite", "red", "loamy", "alluvial", "clay", "black"];
const IRRIGATION_OPTIONS = ["low", "medium", "high"];
const getDefaultSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 7 && month <= 10) return "kharif";
  if (month >= 11 || month <= 3) return "rabi";
  return "zaid";
};
const SEASON_OPTIONS = ["kharif", "rabi", "zaid"];
const ADVISOR_PROFILE_STORAGE_KEY = "farmerAdvisorProfile";

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
  const [soilPh, setSoilPh] = useState("");
  const [irrigation, setIrrigation] = useState("medium");
  const [season, setSeason] = useState(getDefaultSeason());
  const [cropResult, setCropResult] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [cropError, setCropError] = useState("");
  const [cropMeta, setCropMeta] = useState(null);
  const [cropMarketContext, setCropMarketContext] = useState(null);
  const [cropSummary, setCropSummary] = useState("");
  const [cropHighlights, setCropHighlights] = useState([]);

  const [mandiPrices, setMandiPrices] = useState([]);
  const [productMandiMap, setProductMandiMap] = useState({});
  const mandiCacheRef = useRef({});
  const hasBootstrappedRef = useRef(false);
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

  const renderAdvisorContent = (compact = false) => (
    <div className={`${compact ? "p-5" : "p-6"} space-y-4`}>
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"}`}>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Soil Type</label>
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            className="w-full border border-gray-200 rounded-none px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all appearance-none bg-white"
          >
            <option value="">Select Soil Type</option>
            {SOIL_OPTIONS.map((option) => (
              <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Soil pH</label>
          <input
            type="number"
            value={soilPh}
            onChange={(e) => setSoilPh(e.target.value)}
            min="3.5"
            max="10"
            step="0.1"
            placeholder="e.g. 6.5"
            className="w-full border border-gray-200 rounded-none px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all bg-white"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Irrigation</label>
          <select
            value={irrigation}
            onChange={(e) => setIrrigation(e.target.value)}
            className="w-full border border-gray-200 rounded-none px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all appearance-none bg-white"
          >
            {IRRIGATION_OPTIONS.map((option) => (
              <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Season</label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="w-full border border-gray-200 rounded-none px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all appearance-none bg-white"
          >
            {SEASON_OPTIONS.map((option) => (
              <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`flex ${compact ? "flex-col" : "flex-col lg:flex-row"} gap-3 ${compact ? "" : "lg:items-end lg:justify-between"}`}>
        <p className="text-sm text-gray-500">
          Recommendations now use farm inputs plus weather and only suggest crops already present in your platform catalog.
        </p>
        <button
          onClick={getCropRecommendation}
          disabled={cropLoading || !soilType || !soilPh || !weather}
          className={`${compact ? "w-full" : ""} pill pill-filled justify-center py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {cropLoading ? "Analyzing..." : "Get Recommendation"}
        </button>
      </div>

      {weather && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface border border-gray-100 rounded-none p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">5-Day Avg Temp</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{weather.avgTemperature5Days}°C</p>
          </div>
          <div className="bg-surface border border-gray-100 rounded-none p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">5-Day Avg Humidity</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{weather.avgHumidity5Days}%</p>
          </div>
          <div className="bg-surface border border-gray-100 rounded-none p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">5-Day Rainfall</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{weather.totalRainfall5Days} mm</p>
          </div>
        </div>
      )}

      {!weather && (
        <div className="bg-amber-50 border border-amber-100 rounded-none px-4 py-3 text-sm text-amber-700">
          Weather data is required for crop recommendations. {weatherError || "Loading..."}
        </div>
      )}

      {cropError && (
        <div className="bg-red-50 border border-red-100 rounded-none px-4 py-3 text-sm text-red-700">
          {cropError}
        </div>
      )}

      {cropMeta && (
        <div className="bg-surface border border-gray-100 rounded-none p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Advisor Inputs</p>
          <div className="flex flex-wrap gap-2 text-xs text-gray-900">
            <span className="px-3 py-1 rounded-none bg-white border border-gray-100">Soil: {cropMeta.soilType}</span>
            <span className="px-3 py-1 rounded-none bg-white border border-gray-100">pH: {cropMeta.ph}</span>
            <span className="px-3 py-1 rounded-none bg-white border border-gray-100">Irrigation: {cropMeta.irrigation}</span>
            <span className="px-3 py-1 rounded-none bg-white border border-gray-100">Season: {cropMeta.season}</span>
          </div>
        </div>
      )}

      {cropMarketContext?.state && (
        <div className="bg-surface border border-gray-100 rounded-none p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Market Layer</p>
          <p className="text-sm text-gray-500">
            Rankings include a mandi-price bonus using data from {cropMarketContext.state}. Market score can add up to {cropMarketContext.weightedMarketScoreMax} points.
          </p>
        </div>
      )}

      {cropSummary && (
        <div className="bg-white border border-gray-100 rounded-none p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Top Pick Summary</p>
          <p className="text-sm text-gray-500">{cropSummary}</p>
        </div>
      )}

      {cropHighlights.length > 0 && (
        <div className="bg-surface border border-gray-100 rounded-none p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Advisor Highlights</p>
          <div className="space-y-1.5">
            {cropHighlights.map((highlight) => (
              <p key={highlight} className="text-sm text-gray-500">{highlight}</p>
            ))}
          </div>
        </div>
      )}

      {cropResult && cropResult.length > 0 && (
        <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
          {cropResult.map((item, i) => (
            <div key={item.productId || item.crop} className="bg-accent-muted border border-accent/10 rounded-none p-4">
              <div className="flex items-center justify-between mb-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-none flex items-center justify-center text-xs font-bold bg-accent/10 text-accent">{i + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-accent-dark">{item.crop}</p>
                    <p className="text-[11px] text-gray-500">{item.category} · Score {item.score}/100</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-accent">{(item.confidence * 100).toFixed(0)}%</span>
              </div>

              <div className="w-full bg-accent/10 rounded-none h-2 mb-3">
                <div className="bg-accent h-2 rounded-none transition-all duration-700" style={{ width: `${item.confidence * 100}%` }} />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-white/70 border border-accent/10 rounded-none px-3 py-2">
                  <p className="text-gray-500">Suitability</p>
                  <p className="font-bold text-gray-900">{item.suitabilityScore}/100</p>
                </div>
                <div className="bg-white/70 border border-accent/10 rounded-none px-3 py-2">
                  <p className="text-gray-500">Market Bonus</p>
                  <p className="font-bold text-gray-900">+{item.marketScore || 0}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {item.reasons?.slice(0, 3).map((reason) => (
                  <p key={reason} className="text-xs text-gray-500">{reason}</p>
                ))}
              </div>

              {item.marketInsights?.marketAvailable && (
                <div className="mt-3 pt-3 border-t border-accent/10">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Market Insight</p>
                  <p className="text-xs text-gray-500">
                    Avg mandi price: Rs {item.marketInsights.averagePrice} in {item.marketInsights.state}
                  </p>
                  {item.marketInsights.bestMarket?.market && (
                    <p className="text-xs text-gray-500">
                      Best market: {item.marketInsights.bestMarket.market} ({item.marketInsights.bestMarket.modal_price})
                    </p>
                  )}
                </div>
              )}

              {item.cautions?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-accent/10">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Watchouts</p>
                  {item.cautions.slice(0, 2).map((caution) => (
                    <p key={caution} className="text-xs text-amber-700">{caution}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const fetchMyProducts = async () => {
    try {
      const res = await api.get("/farmer/my-products");
      const list = Array.isArray(res.data) ? res.data : [];

      setProducts(list);

      // 🔥 IMPORTANT FIX
      await fetchMandiForProducts(list);
    } catch (err) {
      console.error("Product fetch error", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchMandiForProducts = async (productsList) => {
    try {
      // ✅ Step 1: Group products by commodity
      const commodityMap = {};

      productsList.forEach((p) => {
        const commodity = getMandiCommodity(p.masterProduct?.name);
        if (!commodity) return;

        if (!commodityMap[commodity]) {
          commodityMap[commodity] = [];
        }

        commodityMap[commodity].push(p._id);
      });

      // ✅ Step 2: Fetch once per commodity
      const commodityResults = await Promise.all(
        Object.keys(commodityMap).map(async (commodity) => {
          try {
            const cacheKey = commodity + "::" + (selectedState || "Andhra Pradesh");

            // ✅ Check cache first
            if (mandiCacheRef.current[cacheKey] !== undefined) {
              return {
                commodity,
                avg: mandiCacheRef.current[cacheKey],
              };
            }

            // ✅ Fetch from API
            const res = await api.get("/farmer/mandi-prices", {
              params: {
                commodity,
                state: selectedState || "Andhra Pradesh",
              },
            });

            const avg = res.data?.averagePrice || null;

            // ✅ Store in cache
            mandiCacheRef.current[cacheKey] = avg;

            return {
              commodity,
              avg,
            };
          } catch {
            return {
              commodity,
              avg: null,
            };
          }
        })
      );

      // ✅ Step 3: Map results back to products
      const productMap = {};

      commodityResults.forEach(({ commodity, avg }) => {
        const productIds = commodityMap[commodity];

        productIds.forEach((id) => {
          productMap[id] = avg;
        });
      });

      // ✅ Step 4: Handle products without mapping
      productsList.forEach((p) => {
        if (productMap[p._id] === undefined) {
          productMap[p._id] = null;
        }
      });

      setProductMandiMap(productMap);

    } catch (err) {
      console.error("Optimized mandi fetch error", err);
    }
  };

  const fetchWeatherSmart = async () => {
    try {
      setWeatherError("");
      const localAdvisorProfile = (() => {
        try {
          return JSON.parse(localStorage.getItem(ADVISOR_PROFILE_STORAGE_KEY) || "null");
        } catch {
          return null;
        }
      })();

      if (localAdvisorProfile) {
        if (localAdvisorProfile.soilType) setSoilType(localAdvisorProfile.soilType);
        if (localAdvisorProfile.soilPh !== undefined && localAdvisorProfile.soilPh !== null) {
          setSoilPh(String(localAdvisorProfile.soilPh));
        }
        if (localAdvisorProfile.irrigation) setIrrigation(localAdvisorProfile.irrigation);
        if (localAdvisorProfile.season) setSeason(localAdvisorProfile.season);
      }

      const res = await api.get("/auth/me");
      const advisoryProfile = res.data?.advisoryProfile;

      if (advisoryProfile) {
        if (advisoryProfile.soilType) setSoilType(advisoryProfile.soilType);
        if (advisoryProfile.soilPh !== undefined && advisoryProfile.soilPh !== null) {
          setSoilPh(String(advisoryProfile.soilPh));
        }
        if (advisoryProfile.irrigation) setIrrigation(advisoryProfile.irrigation);
        if (advisoryProfile.season) setSeason(advisoryProfile.season);
      }

      const secondaryAddress = res.data.addresses?.find((addr) => addr.label === "secondary");
      const primaryAddress = res.data.addresses?.find((addr) => addr.label === "primary");
      const latitude = secondaryAddress?.latitude || primaryAddress?.latitude || res.data.location?.latitude;
      const longitude = secondaryAddress?.longitude || primaryAddress?.longitude || res.data.location?.longitude;
      if (!latitude || !longitude) {
        setWeather(null);
        setWeatherError("No farm address set. Please add secondary address in your profile.");
        return;
      }
      const weatherRes = await api.get(`/farmer/weather?lat=${latitude}&lon=${longitude}`);
      setWeather(weatherRes.data);
      checkWeatherAlerts(weatherRes.data);
    } catch (err) {
      console.error("Weather fetch error", err.response?.data || err.message);
      setWeather(null);
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
    if (!soilType || !soilPh || !weather) {
      alert("Select soil type, pH, and wait for weather data");
      return;
    }

    setCropLoading(true);
    setCropError("");
    try {
      localStorage.setItem(
        ADVISOR_PROFILE_STORAGE_KEY,
        JSON.stringify({
          soilType,
          soilPh,
          irrigation,
          season,
        })
      );

      const res = await api.post("/farmer/ai-crop", {
        avgTemperature5Days: weather.avgTemperature5Days,
        avgHumidity5Days: weather.avgHumidity5Days,
        totalRainfall5Days: weather.totalRainfall5Days,
        soilType,
        ph: soilPh,
        irrigation,
        season,
      });

      setCropMeta(res.data?.input || null);
      setCropMarketContext(res.data?.marketContext || null);
      setCropSummary(res.data?.whyTopRecommendation || "");
      setCropHighlights(Array.isArray(res.data?.advisorHighlights) ? res.data.advisorHighlights : []);
      setCropResult(Array.isArray(res.data?.recommendations) ? res.data.recommendations : []);
    } catch (error) {
      console.error("AI recommendation error:", error);
      setCropResult([]);
      setCropMeta(null);
      setCropMarketContext(null);
      setCropSummary("");
      setCropHighlights([]);
      setCropError(error.response?.data?.error || error.response?.data?.message || "Failed to get crop recommendation");
    } finally {
      setCropLoading(false);
    }
  };

  const fetchMandiPrices = async () => {
    if (!selectedCrop || !selectedState) {
      alert("Select crop and state");
      return;
    }

    setMandiSummary(null);
    setMandiPrices([]);

    setMandiLoading(true);

    try {
      // ✅ use mapping correctly
      const commodity = getMandiCommodity(selectedCrop);

      if (!commodity) {
        setMandiSummary(null);
        setMandiPrices([]);
        return;
      }

      const res = await api.get("/farmer/mandi-prices", {
        params: {
          commodity,
          state: selectedState,
        },
      });

      setMandiSummary({
        bestMarket: res.data.bestMarket,
        lowestMarket: res.data.lowestMarket,
        averagePrice: res.data.averagePrice,
        priceSpread: res.data.priceSpread,
        totalMarkets: res.data.totalMarkets,
        usedFallback: Boolean(res.data.usedFallback),
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
    if (user) {
      if (hasBootstrappedRef.current) return;
      hasBootstrappedRef.current = true;
      fetchMyProducts();
      fetchWeatherSmart();
    }
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

      {/* ── Green Hero Header ──────────────── */}
      <div className="pt-24 pb-16 px-6 lg:px-10 relative overflow-hidden bg-gradient-to-r from-[#065f28] via-[#16A34A] to-[#22c55e]">
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-64 h-64 bg-white/5 rounded-none" />
        <div className="absolute right-1/4 -bottom-16 w-80 h-80 bg-white/5 rounded-none" />
        <div className="absolute left-10 -bottom-20 w-48 h-48 bg-white/5 rounded-none" />

        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-none mb-4">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-none animate-pulse" />
                Farmer Dashboard
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
                Grow Your Business,<br />
                <span className="text-green-200">Sell Directly.</span>
              </h1>
              <p className="text-green-50 mt-4 text-sm font-medium max-w-md">
                Manage your harvest, track market trends, and get smart AI crop advice — all in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
              {user?.roles?.includes("customer") && (
                <button onClick={switchToCustomer} className="pill pill-outline-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Switch to Customer
                </button>
              )}
              {weather && (
                <div className="pill bg-white/10 text-white border border-white/20 backdrop-blur-sm !cursor-default">
                  <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                  {weather.temperature}°C · {weather.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards - overlapping the hero banner slightly */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Listings", value: products.length },
            { label: "Total Stock", value: `${totalStock} kg` },
            { label: "Est. Revenue", value: `₹${totalRevenue.toLocaleString()}` },
            { label: "Low Stock", value: lowStockProducts.length, isWarning: lowStockProducts.length > 0 },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-none px-5 py-4 shadow-md">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{c.label}</p>
              <p className={`text-2xl font-extrabold mt-1 ${c.isWarning ? 'text-amber-600' : 'text-gray-900'}`}>{c.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 space-y-6">

        {/* Weather Alert Banner */}
        {weatherAlert && (
          <div className={`rounded-none px-5 py-4 flex items-center gap-3
            ${weatherAlert.type === "heat" ? "bg-red-50 border border-red-100 text-red-700" :
              weatherAlert.type === "rain" ? "bg-blue-50 border border-blue-100 text-blue-700" :
                "bg-cyan-50 border border-cyan-100 text-cyan-700"}`}>
            <div className={`w-10 h-10 rounded-none flex items-center justify-center text-lg flex-shrink-0
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
          <div className="rounded-none px-5 py-4 bg-red-50 border border-red-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374H2.305c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0L21.303 16.126z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-700">{weatherError}</p>
          </div>
        )}

        {/* Tab Bar — Rains pill style */}
        <div className="bg-white rounded-none border border-gray-200 p-1.5 flex gap-1">
          {[
            { key: "overview", label: "Overview" },
            { key: "products", label: "My Products" },
            { key: "add", label: "Add Product" },
            { key: "market", label: "Market Intel" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-none text-xs font-semibold uppercase tracking-wider transition-all
                ${activeTab === tab.key
                  ? "bg-brand text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-surface"
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
                        <div key={w.label} className="bg-surface border border-gray-100 rounded-none p-4 text-center">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{w.label}</p>
                          <p className="text-sm font-bold text-gray-900 mt-1 capitalize">{w.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-gray-500">
                    {weatherError || "Loading weather data..."}
                  </div>
                )}
              </SectionCard>

              {/* AI Crop Advisor */}
              <SectionCard title="AI Crop Advisor">
                {renderAdvisorContent(true)}
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
                    <div className="w-14 h-14 bg-surface rounded-none flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-gray-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">No products yet</p>
                    <button onClick={() => setActiveTab("add")} className="text-sm text-accent font-semibold mt-1 hover:underline">Add your first product →</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.slice(0, 6).map((p) => {
                      const initial = Number(p.initialQuantity) || 1;
                      const current = Number(p.quantity) || 0;
                      const pct = Math.min(100, Math.max(0, Math.round((current / initial) * 100)));
                      const barColor = current === 0 ? "bg-gray-200" : pct <= 25 ? "bg-red-500" : pct <= 50 ? "bg-amber-500" : "bg-accent";
                      return (
                        <div key={p._id} className="bg-surface rounded-none p-4 hover:bg-gray-50 transition-colors border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-bold text-gray-900">{p.masterProduct?.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{p.masterProduct?.category}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-accent-muted text-accent border border-accent/10">Active</span>
                          </div>
                          <div className="text-xl font-extrabold text-gray-900">
                            ₹{p.pricePerKg.toFixed(2)} <span className="text-xs font-medium text-gray-500">/{p.masterProduct?.unit}</span>
                            {productMandiMap[p._id] === null ? (
                              <div className="text-xs text-gray-500 mt-1">
                                No mandi data
                              </div>
                            ) : (
                              <div className="text-xs text-green-600 mt-1 font-medium">
                                Mandi Avg: ₹{Math.round((productMandiMap[p._id] ?? 0) / 100)}/kg
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 mb-1.5">
                            <span>{current}/{initial} {p.masterProduct?.unit}</span>
                            <span className="font-semibold">{pct}%</span>
                          </div>
                          <div className="w-full bg-gray-200-light rounded-none h-1.5">
                            <div className={`${barColor} h-1.5 rounded-none transition-all duration-700`} style={{ width: `${pct}%` }} />
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
                  <p className="text-sm font-medium text-gray-500">No products listed yet</p>
                  <button onClick={() => setActiveTab("add")} className="mt-2 text-sm text-accent font-semibold hover:underline">Add your first product →</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((p) => {
                    const initial = Number(p.initialQuantity) || 1;
                    const current = Number(p.quantity) || 0;
                    const pct = Math.min(100, Math.max(0, Math.round((current / initial) * 100)));
                    const barColor = current === 0 ? "bg-gray-200" : pct <= 25 ? "bg-red-500" : pct <= 50 ? "bg-amber-500" : "bg-accent";
                    const isLow = pct <= 25 && pct > 0;

                    return (
                      <div key={p._id} className="bg-white rounded-none border border-gray-200 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 overflow-hidden">
                        <div className={`h-0.5 ${isLow ? "bg-amber-400" : "bg-accent"}`} />
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-base font-bold text-gray-900">{p.masterProduct?.name}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">{p.masterProduct?.category}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-none ${isLow ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-accent-muted text-accent border border-accent/10"}`}>
                              {isLow ? "Low Stock" : "Active"}
                            </span>
                          </div>
                          <div className="text-2xl font-extrabold text-gray-900">
                            ₹{p.pricePerKg.toFixed(2)}
                            {productMandiMap[p._id] === null ? (
                              <div className="text-xs text-gray-500 mt-1">
                                No mandi data
                              </div>
                            ) : (
                              <div className="text-xs text-green-600 mt-1 font-medium">
                                Mandi Avg: ₹{Math.round((productMandiMap[p._id] ?? 0) / 100)}/kg
                              </div>
                            )}
                            <span className="text-xs font-medium text-gray-500 ml-1">/{p.masterProduct?.unit}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-surface rounded-none px-3 py-2 border border-gray-100">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Total Value</p>
                              <p className="text-sm font-bold text-gray-900">₹{p.totalValue.toLocaleString()}</p>
                            </div>
                            <div className="bg-surface rounded-none px-3 py-2 border border-gray-100">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">In Stock</p>
                              <p className="text-sm font-bold text-gray-900">{p.quantity} {p.masterProduct?.unit}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                              <span>{current} / {initial} {p.masterProduct?.unit}</span>
                              <span className="font-semibold">{pct}%</span>
                            </div>
                            <div className="w-full bg-gray-200-light rounded-none h-2">
                              <div className={`${barColor} h-2 rounded-none transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="flex gap-2.5 mt-5">
                            <button onClick={() => openEdit(p)}
                              className="flex-1 pill pill-outline justify-center !rounded-none py-2.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              Edit
                            </button>
                            <button onClick={() => deleteProduct(p._id)}
                              className="flex-1 py-2.5 rounded-none text-xs font-semibold border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider">
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
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Crop</label>
                    <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}
                      className="w-full border border-gray-200 rounded-none px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all appearance-none bg-white">
                      <option value="">Select Crop</option>
                      {MANDI_CROPS.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">State</label>
                    <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full border border-gray-200 rounded-none px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all appearance-none bg-white">
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
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-surface border border-gray-100 border-l-4 border-l-accent rounded-none p-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Best Market</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{mandiSummary?.bestMarket?.market || "N/A"}</p>
                        <p className="text-lg font-extrabold text-gray-900">₹{mandiSummary?.bestMarket?.modal_price ?? 0}</p>
                      </div>
                      <div className="bg-surface border border-gray-100 border-l-4 border-l-brand-muted rounded-none p-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Average Price</p>
                        <p className="text-xl font-extrabold text-gray-900 mt-2">₹{mandiSummary.averagePrice}</p>
                      </div>
                      <div className="bg-surface border border-gray-100 border-l-4 border-l-red-400 rounded-none p-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Lowest Market</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{mandiSummary?.lowestMarket?.market || "N/A"}</p>
                        <p className="text-lg font-extrabold text-gray-900">₹{mandiSummary?.lowestMarket?.modal_price ?? 0}</p>
                      </div>
                      <div className="bg-surface border border-gray-100 border-l-4 border-l-amber-400 rounded-none p-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Price Spread</p>
                        <p className="text-xl font-extrabold text-gray-900 mt-2">₹{mandiSummary.priceSpread}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{mandiSummary.totalMarkets} markets</p>
                      </div>
                    </div>
                    {mandiSummary?.usedFallback && mandiPrices.length > 0 && (
                      <p className="text-xs text-amber-600 mt-2">
                        Showing data from nearby markets (state data unavailable)
                      </p>
                    )}
                  </div>
                )}

                {mandiPrices.length > 0 && (
                  <div className="bg-surface rounded-none border border-gray-100 overflow-hidden">
                    <div className="max-h-72 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white sticky top-0 border-b border-gray-200">
                          <tr>
                            {["Market", "Variety", "Min", "Max", "Modal"].map((h) => (
                              <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-semibold text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                          {mandiPrices.map((m, i) => (
                            <tr key={i} className="hover:bg-white transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900">{m.market}</td>
                              <td className="px-4 py-3 text-gray-500">{m.variety || "—"}</td>
                              <td className="px-4 py-3 text-gray-500">₹{m.min_price}</td>
                              <td className="px-4 py-3 text-gray-500">₹{m.max_price}</td>
                              <td className="px-4 py-3 font-bold text-gray-900">₹{m.modal_price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {mandiPrices.length === 0 && selectedCrop && selectedState && !mandiLoading && (
                  <div className="py-8 text-center text-sm text-gray-500">No mandi data available for selected crop/state</div>
                )}
              </div>
            </SectionCard>

            {/* AI Crop Recommendation */}
            <SectionCard title="AI Crop Recommendation">
              {renderAdvisorContent(false)}
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
              className="w-full max-w-md bg-white rounded-none shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="bg-brand px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Edit Product</h3>
                  <p className="text-white/40 text-xs mt-0.5">{editingProduct.masterProduct?.name}</p>
                </div>
                <button onClick={closeEdit} className="w-8 h-8 rounded-none bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Total Value (₹)</label>
                  <input type="number" name="totalValue" value={editForm.totalValue} onChange={handleEditChange}
                    className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all bg-surface"
                    min="0" step="0.01" placeholder="Enter total value" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Quantity ({editingProduct.masterProduct?.unit || "kg"})</label>
                  <input type="number" name="quantity" value={editForm.quantity} onChange={handleEditChange}
                    className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all bg-surface"
                    min="0" placeholder="Enter quantity" />
                </div>
                {editForm.totalValue && editForm.quantity && Number(editForm.quantity) > 0 && (
                  <div className="bg-surface rounded-none px-4 py-3 flex items-center justify-between border border-gray-100">
                    <span className="text-xs text-gray-500">Calculated Price / {editingProduct.masterProduct?.unit || "kg"}</span>
                    <span className="text-sm font-bold text-gray-900">₹{(Number(editForm.totalValue) / Number(editForm.quantity)).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={closeEdit}
                    className="flex-1 pill pill-outline justify-center py-3 !rounded-none">
                    Cancel
                  </button>
                  <button onClick={saveEdit} disabled={isSavingEdit || editForm.totalValue === "" || editForm.quantity === ""}
                    className="flex-1 pill pill-filled justify-center py-3 !rounded-none disabled:opacity-50 disabled:cursor-not-allowed">
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
