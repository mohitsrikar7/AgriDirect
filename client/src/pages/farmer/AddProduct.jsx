import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { MANDI_STATES } from "../../constants/mandiOptions";
import { getMandiCommodity } from "../../utils/mandiMapping";

const AddProduct = ({ onAdded }) => {
  const [masterProducts, setMasterProducts] = useState([]);
  const [form, setForm] = useState({ masterProduct: "", price: "", quantity: "", state: "" });
  const [recommendedPrice, setRecommendedPrice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const requestCounterRef = useRef(0);

  useEffect(() => {
    const fetchMasterProducts = async () => {
      try {
        const { data } = await api.get("/master-products");
        setMasterProducts(data);
      } catch (error) {
        console.error("Failed to load master products");
      }
    };
    fetchMasterProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.masterProduct) { alert("Please select a product"); return; }

    const priceNumber = Number(form.price);
    const quantityNumber = Number(form.quantity);

    if (isNaN(priceNumber) || isNaN(quantityNumber)) { alert("Price and Quantity must be valid numbers"); return; }
    if (priceNumber < 1 || priceNumber > 100000) { alert("Price must be between ₹1 and ₹100000"); return; }
    if (quantityNumber < 1 || quantityNumber > 100000) { alert("Quantity must be between 1 and 100000"); return; }

    setSubmitting(true);
    try {
      await api.post("/farmer/add-product", {
        masterProduct: form.masterProduct,
        totalValue: priceNumber,
        quantity: quantityNumber,
      });
      alert("Product added successfully");
      onAdded && onAdded();
      setForm({ masterProduct: "", price: "", quantity: "", state: "" });
      setRecommendedPrice(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchPriceRecommendation = async (cropName, stateValue) => {
    try {
      requestCounterRef.current += 1;
      const requestId = requestCounterRef.current;

      const mapped = getMandiCommodity(cropName);
      if (!mapped) {
        if (requestCounterRef.current !== requestId) return;
        setRecommendedPrice(null);
        return;
      }

      const res = await api.get("/farmer/mandi-prices", {
        params: {
          commodity: mapped,
          state: stateValue,
        },
      });

      const records = res.data.records;
      if (!records || records.length === 0) {
        if (requestCounterRef.current !== requestId) return;
        setRecommendedPrice(null);
        return;
      }

      const prices = records
        .map((r) => Number(r.modal_price))
        .filter((p) => !isNaN(p) && p > 0);

      if (prices.length === 0) {
        if (requestCounterRef.current !== requestId) return;
        setRecommendedPrice(null);
        return;
      }

      const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;

      const quintalPrice = Math.round(avg);
      const perKgPrice = Math.round(quintalPrice / 100);
      const lower = Math.round(perKgPrice * 0.95);
      const upper = Math.round(perKgPrice * 1.05);

      if (requestCounterRef.current !== requestId) return;

      setRecommendedPrice({ quintal: quintalPrice, perKg: perKgPrice, lower, upper });
    } catch (err) {
      console.error("Recommendation error:", err);
    }
  };

  /* Derived */
  const pricePerKg = form.price && form.quantity && Number(form.quantity) > 0
    ? (Number(form.price) / Number(form.quantity)).toFixed(2)
    : null;

  const priceStatus = (() => {
    if (!recommendedPrice || !pricePerKg) return null;
    const pk = Number(pricePerKg);
    if (pk > recommendedPrice.upper) return { label: "Overpriced", color: "bg-red-50 text-red-700 border-red-100", icon: "⚠" };
    if (pk < recommendedPrice.lower) return { label: "Underpriced", color: "bg-blue-50 text-blue-700 border-blue-100", icon: "📉" };
    return { label: "Competitive", color: "bg-green-50 text-green-700 border-green-100", icon: "✅" };
  })();

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-900 text-sm">Add Product Listing</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Product + State row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">Product</label>
            <select name="masterProduct" value={form.masterProduct} required
              onChange={(e) => {
                handleChange(e);
                const selected = masterProducts.find((p) => p._id === e.target.value);
                if (selected) fetchPriceRecommendation(selected.name, form.state);
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition-all appearance-none bg-white">
              <option value="">Select Product</option>
              {masterProducts.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">State (for price insight)</label>
            <select name="state" value={form.state} onChange={(e) => {
              const nextState = e.target.value;
              handleChange(e);

              if (form.masterProduct) {
                const selected = masterProducts.find((p) => p._id === form.masterProduct);
                if (selected) {
                  fetchPriceRecommendation(selected.name, nextState);
                }
              }
            }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition-all appearance-none bg-white">
              <option value="">Select State</option>
              {MANDI_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Market Insight Card */}
        {recommendedPrice && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Market Insight</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg px-3 py-2">
                <p className="text-[10px] text-gray-400 font-medium">Mandi Price (quintal)</p>
                <p className="text-sm font-bold text-gray-900">₹{recommendedPrice.quintal}</p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2">
                <p className="text-[10px] text-gray-400 font-medium">Suggested / kg</p>
                <p className="text-sm font-bold text-green-700">₹{recommendedPrice.perKg}</p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2">
                <p className="text-[10px] text-gray-400 font-medium">Recommended Range</p>
                <p className="text-sm font-bold text-gray-900">₹{recommendedPrice.lower} – ₹{recommendedPrice.upper}</p>
              </div>
            </div>
          </div>
        )}

        {/* Price + Quantity row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">Total Value (₹)</label>
            <input name="price" type="number" placeholder="e.g. 5000" value={form.price} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">Quantity (kg)</label>
            <input name="quantity" type="number" placeholder="e.g. 100" value={form.quantity} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition-all" />
          </div>
        </div>

        {/* Price Status Badge */}
        {priceStatus && (
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${priceStatus.color}`}>
            <span>{priceStatus.icon}</span> {priceStatus.label} compared to market
          </div>
        )}

        {/* Revenue Summary */}
        {form.price && form.quantity && Number(form.quantity) > 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2">Revenue Preview</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Revenue</span>
                <span className="text-sm font-bold text-gray-900">₹{Number(form.price).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Price / kg</span>
                <span className="text-sm font-bold text-green-700">₹{pricePerKg}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={submitting}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-green-600/25 transition-all">
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Adding Product...
            </span>
          ) : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
