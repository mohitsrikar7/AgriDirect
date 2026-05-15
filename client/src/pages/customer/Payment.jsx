import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const paymentMethods = [
  {
    id: "COD",
    label: "Cash on Delivery",
    desc: "Pay when your order arrives",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    id: "UPI",
    label: "UPI",
    desc: "GPay, PhonePe, Paytm & more",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
  {
    id: "NET_BANKING",
    label: "Net Banking",
    desc: "All major banks supported",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    id: "CARD",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard, RuPay",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
];

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const [method, setMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [fetchingOrder, setFetchingOrder] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get("/order/my-orders");
        const found = res.data.find((o) => o._id === orderId);
        if (found) setOrder(found);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setFetchingOrder(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const confirmPayment = async () => {
    setLoading(true);
    setError("");

    try {
      if (method === "COD") {
        const res = await api.put(`/order/${orderId}/payment`, {
          paymentMethod: method,
        });
        navigate("/customer/payment-success", {
          state: { order: res.data.order },
        });
        return;
      }

      // ── ONLINE PAYMENT (Razorpay) ──
      const res = await loadRazorpayScript();
      if (!res) {
        setError("Razorpay SDK failed to load. Are you offline?");
        setLoading(false);
        return;
      }

      // 1. Create Razorpay order via our backend
      const { data } = await api.post(`/order/${orderId}/razorpay`);

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use Razorpay Key ID
        amount: data.amount,
        currency: data.currency,
        name: "AgriDirect",
        description: `Payment for Order #${orderId.slice(-6).toUpperCase()}`,
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            // 3. Verify payment on our backend
            const verifyRes = await api.post(`/order/${orderId}/razorpay/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              paymentMethod: method,
            });
            navigate("/customer/payment-success", {
              state: { order: verifyRes.data.order },
            });
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.addresses?.[0]?.phone || "",
        },
        theme: {
          color: "#0f6c4a" // Matches brand token generic dark green
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        setError(`Payment Failed: ${response.error.description}`);
        setLoading(false);
      });
      paymentObject.open();

    } catch (err) {
      setError(err.response?.data?.message || "Payment initialization failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Header — Rains-style neutral ── */}
      <div className="bg-gray-50 pt-28 pb-14 px-6 border-b border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand rounded-none mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2">Checkout</p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Secure Payment
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-light">
            Order #{orderId?.slice(-6).toUpperCase()} · Choose your preferred payment method
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* Left — Payment Methods */}
          <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Payment Method</h2>
              <p className="text-xs text-gray-500 mt-0.5 font-light">Select how you'd like to pay</p>
            </div>

            <div className="p-4 space-y-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setMethod(pm.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-none border-2 transition-all duration-200 text-left
                    ${method === pm.id
                      ? "border-brand bg-surface"
                      : "border-gray-200 hover:border-brand-light hover:bg-surface/50"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 transition-colors
                    ${method === pm.id ? "bg-brand text-white" : "bg-surface text-gray-500 border border-gray-200"}`}>
                    {pm.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${method === pm.id ? "text-gray-900" : "text-gray-900"}`}>
                      {pm.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 font-light">{pm.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-none border-2 flex items-center justify-center shrink-0 transition-all
                    ${method === pm.id ? "border-brand bg-brand" : "border-gray-200"}`}>
                    {method === pm.id && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Card Fields (demo) */}
            {method === "CARD" && (
              <div className="mx-6 mb-5 p-4 bg-surface rounded-none border border-gray-200 space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Card Details (Demo)</p>
                <input
                  type="text" placeholder="1234 5678 9012 3456" disabled
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-none text-sm outline-none
                    focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <div className="flex gap-3">
                  <input type="text" placeholder="MM / YY" disabled
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-none text-sm outline-none" />
                  <input type="text" placeholder="CVV" disabled
                    className="w-24 px-4 py-2.5 bg-white border border-gray-200 rounded-none text-sm outline-none" />
                </div>
                <p className="text-[10px] text-gray-500 font-light">Demo mode — no real card processing</p>
              </div>
            )}

            {method === "UPI" && (
              <div className="mx-6 mb-5 p-4 bg-surface rounded-none border border-gray-200 space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">UPI Details (Demo)</p>
                <input
                  type="text" placeholder="yourname@upi" disabled
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-none text-sm outline-none
                    focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <p className="text-[10px] text-gray-500 font-light">Demo mode — payment will be auto-confirmed</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mx-6 mb-4 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-none">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="px-6 pb-6 space-y-3">
              <button
                onClick={confirmPayment}
                disabled={loading}
                className="w-full bg-brand text-white py-3.5 rounded-none font-bold text-sm uppercase tracking-wider
                  hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Confirm Payment
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/customer")}
                className="w-full py-2.5 text-[11px] text-gray-500 hover:text-gray-900 font-bold uppercase tracking-wider transition-colors"
              >
                Cancel & Return to Marketplace
              </button>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="h-fit lg:sticky lg:top-24">
            <div style={{ backgroundColor: "#16A34A" }} className="rounded-none overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">Order Summary</h3>
                <p className="text-white/40 text-[10px] mt-0.5">#{orderId?.slice(-6).toUpperCase()}</p>
              </div>

              {fetchingOrder ? (
                <div className="p-5 space-y-3 animate-pulse">
                  <div className="h-4 bg-white/10 rounded-none w-3/4" />
                  <div className="h-4 bg-white/10 rounded-none w-1/2" />
                  <div className="h-4 bg-white/10 rounded-none w-2/3" />
                </div>
              ) : order ? (
                <>
                  <div className="p-5 space-y-3">
                    {order.items?.map((item) => (
                      <div key={item._id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 bg-white/10 rounded-none flex items-center justify-center text-[10px] font-bold text-white/60 shrink-0">
                            {item.quantity}
                          </span>
                          <span className="text-white/60 truncate">
                            {item.product?.masterProduct?.name || "Product"}
                          </span>
                        </div>
                        <span className="font-semibold text-white shrink-0 ml-3">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 pb-5 space-y-2">
                    <div className="h-px bg-white/10" />
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Subtotal</span>
                      <span className="font-semibold text-white">₹{order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Delivery</span>
                      <span className="text-accent font-semibold">Free</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex justify-between">
                      <span className="text-white/60 text-xs font-medium">Total</span>
                      <span className="text-xl font-black text-white">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-5 text-sm text-white/40 text-center">Order details unavailable</div>
              )}

              {/* Trust Badge */}
              <div className="border-t border-white/10 px-5 py-3">
                <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-wider font-medium">
                  <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                  256-bit SSL · Secure checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
