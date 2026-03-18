import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import api from "../../api/axios";

const Cart = () => {
    const navigate = useNavigate();
    const {
        cart, removeFromCart, increaseQuantity, decreaseQuantity,
        updateQuantity, clearCart, cartCount, cartTotal,
    } = useContext(CartContext);

    const placeOrder = async () => {
        if (cart.length === 0) return;
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
        }
    };

    return (
        <div className="min-h-screen bg-surface">

            {/* ── Header ── */}
            <div className="bg-surface-light pt-28 pb-14 px-6 lg:px-10 border-b border-border">
                <div className="max-w-4xl mx-auto">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-bold mb-2">Marketplace</p>
                    <h1 className="text-4xl md:text-5xl font-black text-brand tracking-tight">Your Cart</h1>
                    <p className="text-brand-muted mt-2 text-sm font-light">
                        {cart.length === 0
                            ? "Your cart is empty"
                            : `${cart.length} product${cart.length !== 1 ? "s" : ""} · ${cartCount} total items`}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">

                {/* ── Empty State ── */}
                {cart.length === 0 && (
                    <div className="bg-white rounded-xl border border-border py-20 text-center">
                        <div className="w-20 h-20 bg-surface border border-border rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-brand mb-1">Your cart is empty</h3>
                        <p className="text-sm text-brand-muted mb-6 font-light">Browse the marketplace to add products</p>
                        <button onClick={() => navigate("/customer")} className="pill pill-filled">
                            Browse Marketplace
                        </button>
                    </div>
                )}

                {/* ── Cart Items ── */}
                {cart.length > 0 && (
                    <div className="grid lg:grid-cols-[1fr_340px] gap-8">

                        {/* Items List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">
                                    Cart Items ({cart.length})
                                </h2>
                                <button onClick={clearCart} className="text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors">
                                    Clear All
                                </button>
                            </div>

                            {cart.map((item) => (
                                <div key={item._id} className="bg-white rounded-xl border border-border p-5 hover:border-brand-light transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] uppercase tracking-[0.15em] text-brand-muted font-bold mb-1">
                                                {item.masterProduct?.category || "Product"}
                                            </p>
                                            <h3 className="text-sm font-bold text-brand">
                                                {item.masterProduct?.name || item.farmerName || "Product"}
                                            </h3>
                                            {item.farmerName && (
                                                <p className="text-xs text-brand-muted font-light mt-0.5">
                                                    Seller: {item.farmerName}
                                                </p>
                                            )}
                                            {item.distance && (
                                                <p className="text-xs text-brand-muted font-light mt-0.5">
                                                    {item.distance} km away
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-lg font-black text-brand whitespace-nowrap">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => decreaseQuantity(item._id)}
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-brand-muted hover:bg-surface disabled:opacity-30 transition-all"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                                </svg>
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                                                min={1}
                                                max={item.availableStock}
                                                className="w-14 h-8 text-center text-sm font-bold text-brand border border-border rounded-lg bg-surface
                          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button
                                                onClick={() => increaseQuantity(item._id)}
                                                disabled={item.quantity >= (item.availableStock || 9999)}
                                                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-brand-muted hover:bg-surface disabled:opacity-30 transition-all"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            </button>
                                            <span className="text-[10px] text-brand-muted ml-2 font-medium">
                                                ₹{item.price}/{item.unit || "kg"}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-[11px] font-bold uppercase tracking-wider text-brand-muted hover:text-red-600 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Order Summary Sidebar ── */}
                        <div className="lg:sticky lg:top-24 h-fit">
                            <div style={{ backgroundColor: "#1a1a1a" }} className="rounded-xl overflow-hidden">
                                {/* Header */}
                                <div className="px-6 py-5 border-b border-white/10">
                                    <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">Order Summary</h3>
                                    <p className="text-white/40 text-[10px] mt-0.5">{cart.length} product{cart.length !== 1 ? "s" : ""}</p>
                                </div>

                                {/* Summary Items */}
                                <div className="p-6 space-y-3">
                                    {cart.map((item) => (
                                        <div key={item._id} className="flex items-center justify-between text-xs">
                                            <span className="text-white/60 truncate mr-3">
                                                {item.masterProduct?.name || "Product"} × {item.quantity}
                                            </span>
                                            <span className="text-white font-semibold whitespace-nowrap">
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="px-6 pb-6 space-y-3">
                                    <div className="h-px bg-white/10" />
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/40">Subtotal ({cartCount} items)</span>
                                        <span className="text-white font-semibold">₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/40">Delivery</span>
                                        <span className="text-accent font-semibold">Free</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/60 text-xs font-medium">Total</span>
                                        <span className="text-xl font-black text-white">₹{cartTotal.toLocaleString()}</span>
                                    </div>

                                    <button
                                        onClick={placeOrder}
                                        className="w-full mt-4 bg-white text-brand font-bold text-sm uppercase tracking-wider
                      py-3.5 rounded-full hover:bg-white/90 transition-colors"
                                    >
                                        Place Order
                                    </button>
                                    <button
                                        onClick={() => navigate("/customer")}
                                        className="w-full text-white/50 hover:text-white text-[11px] font-medium uppercase tracking-wider
                      py-2 transition-colors text-center"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
