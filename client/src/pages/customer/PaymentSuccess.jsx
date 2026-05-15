import { Link, useLocation, Navigate } from "react-router-dom";

const PaymentSuccess = () => {
  const { state } = useLocation();

  if (!state?.order) {
    return <Navigate to="/customer" />;
  }

  const { order } = state;
  const formattedDate = new Date(order.updatedAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const isPaid = order.paymentStatus === "paid";

  const methodLabels = {
    COD: "Cash on Delivery",
    UPI: "UPI Payment",
    NET_BANKING: "Net Banking",
    CARD: "Card Payment",
  };

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Header ── */}
      <div className="bg-gray-50 pt-28 pb-20 px-6 border-b border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-none bg-white border border-gray-200 mb-6">
            {isPaid ? (
              <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2">
            {isPaid ? "Payment Confirmed" : "Order Placed"}
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            {isPaid ? "Thank You!" : "Order Confirmed"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-light">
            {isPaid
              ? "Your payment has been processed securely"
              : "Pay with cash when your order is delivered"}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-6 -mt-10 pb-16 space-y-5">

        {/* Status Banner */}
        <div className={`rounded-none border px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2
          ${isPaid
            ? "bg-accent-muted text-accent border-accent/20"
            : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
          <span className={`w-2 h-2 rounded-none ${isPaid ? "bg-accent" : "bg-amber-500 animate-pulse"}`} />
          {isPaid ? "Payment confirmed" : "Cash on Delivery — Pay when delivered"}
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Order Details</h3>
          </div>

          <div className="divide-y divide-border">
            {[
              {
                label: "Order ID",
                value: (
                  <span className="text-sm font-mono font-bold text-gray-900 bg-surface px-3 py-1 rounded-none border border-gray-200">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                ),
              },
              {
                label: "Payment Method",
                value: <span className="text-sm font-bold text-gray-900">{methodLabels[order.paymentMethod] || order.paymentMethod}</span>,
              },
              {
                label: "Status",
                value: (
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-none uppercase tracking-[0.12em]
                    ${isPaid ? "bg-accent-muted text-accent" : "bg-amber-50 text-amber-700"}`}>
                    <span className={`w-1.5 h-1.5 rounded-none ${isPaid ? "bg-accent" : "bg-amber-500"}`} />
                    {order.paymentStatus}
                  </span>
                ),
              },
              {
                label: "Total Amount",
                value: <span className="text-2xl font-black text-gray-900">₹{Number(order.totalAmount).toLocaleString()}</span>,
              },
              {
                label: "Date",
                value: <span className="text-sm text-gray-500">{formattedDate}</span>,
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-6 py-4">
                <span className="text-xs text-gray-500 font-medium">{row.label}</span>
                {row.value}
              </div>
            ))}
          </div>
        </div>

        {/* Items Card */}
        <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Order Items</h3>
          </div>

          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item._id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface border border-gray-200 rounded-none flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {item.product?.masterProduct?.name || "Product"}
                    </p>
                    <p className="text-xs text-gray-500 font-light">
                      {item.quantity} &times; ₹{Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-gray-900">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-6 py-4 bg-surface border-t border-gray-200 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500">Total</span>
            <span className="text-xl font-black text-gray-900">₹{Number(order.totalAmount).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/customer/orders" className="pill pill-filled flex-1 justify-center py-3.5 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            View My Orders
          </Link>

          <Link to="/customer" className="pill pill-outline flex-1 justify-center py-3.5 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Trust footer */}
        <p className="text-center text-[10px] text-gray-500 font-light flex items-center justify-center gap-1.5 pt-2">
          <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          Your transaction is secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
