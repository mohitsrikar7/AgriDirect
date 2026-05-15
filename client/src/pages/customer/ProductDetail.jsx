import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { CartContext } from "../../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQuantity, isInCart, clearCart, cartTotal, cartCount } = useContext(CartContext);
  const cartRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchSellers();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/customer/products`);
      const found = res.data.find((p) => p.masterProductId === id);
      setProduct(found);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSellers = async () => {
    try {
      const res = await api.get(`/customer/product/${id}`);
      setSellers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const lowestPrice = sellers.length
    ? Math.min(...sellers.map((s) => s.pricePerKg))
    : null;

  const handleSelectSeller = (seller) => {
    if (isInCart(seller._id)) return;

    addToCart({
      _id: seller._id,
      farmerName: seller.farmer?.name || "Unknown",
      price: seller.pricePerKg,
      unit: seller.masterProduct?.unit || product?.unit || "kg",
      quantity: 1,
      availableStock: seller.quantity,
      distance: seller.distance,
      masterProduct: seller.masterProduct || { name: product?.name, category: product?.category },
    });

    setTimeout(() => {
      cartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const cartItemCount = cartCount;

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);

    try {
      const orderItems = cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      const res = await api.post("/order/place", {
        items: orderItems,
        paymentMethod: "COD",
      });

      clearCart();
      navigate(`/customer/payment/${res.data.order._id}`);
    } catch (err) {
      console.error("Order error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong placing order");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Loading skeleton
  if (loading || !product) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="pt-24 pb-8 px-6 lg:px-10 bg-gray-50 border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto">
            <div className="h-3 w-20 bg-gray-200 rounded-none animate-pulse mb-4" />
            <div className="h-8 w-48 bg-gray-200 rounded-none animate-pulse" />
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
          <div className="bg-white rounded-none border border-gray-200 p-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="h-80 bg-surface rounded-none" />
              <div className="space-y-4">
                <div className="h-3 bg-gray-200 rounded-none w-24" />
                <div className="h-8 bg-gray-200 rounded-none w-48" />
                <div className="h-4 bg-gray-200-light rounded-none w-36" />
                <div className="h-3 bg-gray-200-light rounded-none w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Rains-style Clean Header ─── */}
      <div className="pt-24 pb-8 px-6 lg:px-10 bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto">
          <button
            onClick={() => navigate("/customer")}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-xs font-semibold mb-4 transition group uppercase tracking-wider"
          >
            <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Marketplace
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-section text-gray-900">{product.name}</h1>
            <span className="pill pill-outline text-[10px]">
              {product.category}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">
            {sellers.length} seller{sellers.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {/* ── Main Content (Rains-style two-column) ─── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 space-y-8">

        {/* Product Card — Rains PDP style */}
        <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="relative bg-gray-50 flex items-center justify-center p-12 lg:p-20 min-h-[320px]">
              <img
                src={product.image || "/images/default.jpg"}
                alt={product.name}
                className="max-h-72 object-contain"
              />
              {lowestPrice && (
                <div className="absolute top-5 right-5 bg-white border border-gray-200 rounded-none px-3 py-2">
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Starting at</p>
                  <p className="text-lg font-bold text-accent">
                    ₹{Number(lowestPrice).toFixed(0)}
                    <span className="text-xs text-gray-500 font-normal">/{product.unit}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-8 lg:p-10 flex flex-col justify-center border-l border-gray-200">
              <span className="pill pill-outline w-fit text-[10px] mb-4">
                {product.category}
              </span>

              <h2 className="text-display text-gray-900">{product.name}</h2>

              <p className="text-sm text-gray-500 mt-4 leading-relaxed font-light">
                Fresh produce sourced directly from trusted local farmers.
                Compare sellers below to find the best price and closest farmer to your location.
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-xs text-gray-500">From</span>
                <span className="text-4xl font-extrabold text-gray-900">
                  ₹{Number(product.minPrice || 0).toFixed(0)}
                </span>
                <span className="text-sm text-gray-500">/ {product.unit}</span>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="bg-surface rounded-none px-4 py-3 text-center border border-gray-100">
                  <p className="text-xl font-bold text-gray-900">{sellers.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-0.5">Sellers</p>
                </div>
                <div className="bg-surface rounded-none px-4 py-3 text-center border border-gray-100">
                  <p className="text-xl font-bold text-gray-900">
                    {sellers.reduce((sum, s) => sum + (s.quantity || 0), 0)}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-0.5">Total Stock</p>
                </div>
                <div className="bg-surface rounded-none px-4 py-3 text-center border border-gray-100">
                  <p className="text-xl font-bold text-accent">₹{Number(lowestPrice || 0).toFixed(0)}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-0.5">Best Price</p>
                </div>
              </div>

              <a
                href="#sellers"
                className="mt-8 pill pill-filled justify-center w-full lg:w-auto"
              >
                Compare Sellers Below
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ── Sellers + Cart Grid ──── */}
        <div className={`grid gap-8 ${cart.length > 0 ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1"}`}>

          {/* Sellers Section */}
          <div id="sellers" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Available Sellers</h2>
                <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">
                  Sorted by price · {sellers.length} result{sellers.length !== 1 ? "s" : ""}
                </p>
              </div>
              {lowestPrice && (
                <div className="hidden sm:flex items-center gap-2 pill pill-outline text-accent !border-accent/30">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Best: ₹{Number(lowestPrice).toFixed(0)}/{product.unit}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {sellers
                .sort((a, b) => a.pricePerKg - b.pricePerKg)
                .map((seller, index) => {
                  const isBest = seller.pricePerKg === lowestPrice;

                  return (
                    <div
                      key={seller._id}
                      className={`relative bg-white rounded-none border overflow-hidden transition-all duration-200
                        ${isBest
                          ? "border-accent/30 shadow-md shadow-accent/5"
                          : "border-gray-200 hover:border-brand/10 hover:shadow-md shadow-sm"
                        }`}
                    >
                      {isBest && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
                      )}

                      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-none flex items-center justify-center text-sm font-bold shrink-0 border
                          ${isBest ? "bg-accent-muted text-accent border-accent/20" : "bg-surface text-gray-500 border-gray-200"}`}>
                          #{index + 1}
                        </div>

                        {/* Seller Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-none flex items-center justify-center text-white font-bold text-sm shrink-0
                            ${isBest ? "bg-accent" : "bg-brand"}`}>
                            {seller.farmer?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 truncate">{seller.farmer?.name}</p>
                              {isBest && (
                                <span className="pill !py-0.5 !px-2 text-[9px] bg-brand text-white !border-brand">
                                  Best Price
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                                {seller.distance ? `${seller.distance} km` : "N/A"}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-none ${seller.quantity > 5 ? "bg-accent" : "bg-orange-400"}`} />
                                {seller.quantity} in stock
                              </span>
                              {seller.quantity <= 5 && (
                                <span className="text-orange-600 font-semibold">Low stock</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center gap-5 sm:ml-auto">
                          <div className="text-right">
                            <p className={`text-xl font-extrabold ${isBest ? "text-accent" : "text-gray-900"}`}>
                              ₹{Number(seller.pricePerKg || 0).toFixed(0)}
                            </p>
                            <p className="text-xs text-gray-500">per {seller.masterProduct?.unit}</p>
                          </div>

                          <button
                            onClick={() => handleSelectSeller(seller)}
                            disabled={isInCart(seller._id)}
                            className={`pill ${isInCart(seller._id)
                              ? "!bg-accent-muted !text-accent !border-accent/20 cursor-default"
                              : "pill-filled"
                              }`}
                          >
                            {isInCart(seller._id) ? (
                              <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                                In Cart
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add to Cart
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {sellers.length === 0 && (
              <div className="text-center py-16 bg-white rounded-none border border-gray-200">
                <div className="w-14 h-14 bg-surface rounded-none flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">No sellers available</h3>
                <p className="text-xs text-gray-500 mt-1">Check back later for new listings</p>
              </div>
            )}
          </div>

          {/* ── Cart Sidebar ──── */}
          {cart.length > 0 && (
            <div ref={cartRef} className="scroll-mt-24">
              <div className="bg-white rounded-none border border-gray-200 shadow-lg shadow-black/5 sticky top-24 overflow-hidden">
                {/* Cart Header */}
                <div className="bg-brand px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-none flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-xs uppercase tracking-wider">Your Cart</h3>
                        <p className="text-white/40 text-[10px]">{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <span className="bg-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-none">
                      {cartItemCount}
                    </span>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="divide-y divide-border-light max-h-[400px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item._id} className="px-5 py-4 hover:bg-surface/50 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-none bg-accent flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                            {item.farmerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{item.farmerName}</p>
                            <p className="text-[10px] text-gray-500">₹{item.price}/{item.unit}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-gray-500/30 hover:text-red-500 transition p-1 shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Quantity + Subtotal */}
                      <div className="flex items-center justify-between mt-3 pl-11">
                        <div className="flex items-center border border-gray-200 rounded-none overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-surface disabled:opacity-30 transition text-xs"
                          >−</button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                            className="w-9 h-7 text-center text-xs font-semibold border-x border-gray-200 outline-none bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={item.quantity >= item.availableStock}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-surface disabled:opacity-30 transition text-xs"
                          >+</button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(0)}
                          </p>
                          {item.quantity >= item.availableStock && (
                            <p className="text-[9px] text-orange-500 font-medium">Max stock</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t border-gray-200 bg-surface/50 px-5 py-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Subtotal ({cartItemCount} {product.unit})</span>
                    <span className="font-semibold text-gray-900">₹{cartTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Delivery</span>
                    <span className="font-medium text-accent">Free</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 text-sm">Total</span>
                    <span className="text-lg font-extrabold text-gray-900">₹{cartTotal.toFixed(0)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="px-5 pb-5 pt-1">
                  <button
                    onClick={placeOrder}
                    disabled={placingOrder}
                    className="w-full pill pill-filled justify-center py-3.5 text-sm
                      disabled:opacity-60 disabled:cursor-not-allowed
                      shadow-lg shadow-brand/10"
                  >
                    {placingOrder ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Proceed to Checkout
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-gray-500 mt-3 uppercase tracking-wider">
                    Payment: Cash on Delivery
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;