import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { CartContext } from "../../context/CartContext";

/* ── status config ─────────────────────────────────────── */
const STATUS_CFG = {
  placed: {
    bg: "bg-surface", text: "text-brand-muted", dot: "bg-brand-muted",
    label: "Placed", step: 1, border: "border-l-brand-muted",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
  },
  confirmed: {
    bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400",
    label: "Confirmed", step: 2, border: "border-l-amber-400",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  delivered: {
    bg: "bg-accent-muted", text: "text-accent", dot: "bg-accent",
    label: "Delivered", step: 3, border: "border-l-accent",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />,
  },
  cancelled: {
    bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400",
    label: "Cancelled", step: -1, border: "border-l-red-400",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  },
};

const PAYMENT_CFG = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  paid: { bg: "bg-accent-muted", text: "text-accent", label: "Paid" },
  failed: { bg: "bg-red-50", text: "text-red-600", label: "Failed" },
  refunded: { bg: "bg-surface", text: "text-brand-muted", label: "Refunded" },
};

const METHOD_LABEL = { COD: "Cash on Delivery", UPI: "UPI", NET_BANKING: "Net Banking", CARD: "Card" };
const METHOD_ICON = {
  COD: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />,
  UPI: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />,
  NET_BANKING: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />,
  CARD: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />,
};

const ORDERS_PER_PAGE = 10;

/* ── helpers ─────────────────────────────────────── */
const getEstimatedDelivery = (order) => {
  const created = new Date(order.createdAt);
  if (order.status === "delivered") {
    return `Delivered on ${new Date(order.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
  }
  if (order.status === "cancelled") return null;
  const daysToAdd = order.status === "confirmed" ? 3 : 5;
  const est = new Date(created.getTime() + daysToAdd * 86400000);
  return `Expected by ${est.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
};

const getMonthKey = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

const groupByMonth = (orders) => {
  const groups = {};
  orders.forEach((o) => {
    const key = getMonthKey(o.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(o);
  });
  return Object.entries(groups);
};

/* ── progress tracker ─────────────────────────────── */
const ProgressTracker = ({ order }) => {
  const steps = [
    { label: "Placed", date: order.createdAt },
    { label: "Confirmed", date: order.status === "confirmed" || order.status === "delivered" ? order.updatedAt : null },
    { label: "Delivered", date: order.status === "delivered" ? order.updatedAt : null },
  ];
  const current = STATUS_CFG[order.status]?.step ?? 0;

  if (order.status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2 uppercase tracking-wider">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Order Cancelled
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 w-full max-w-sm">
      {steps.map((s, i) => {
        const stepNum = i + 1;
        const done = stepNum <= current;
        const isActive = stepNum === current;
        return (
          <div key={s.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${done ? "bg-brand text-white" : "bg-surface text-brand-muted border border-border"}
                ${isActive ? "ring-4 ring-brand/10" : ""}`}>
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : stepNum}
              </div>
              <span className={`text-[10px] mt-1 uppercase tracking-wider ${done ? "text-brand font-bold" : "text-brand-muted"}`}>
                {s.label}
              </span>
              {/* Date under step */}
              {done && s.date && (
                <span className="text-[9px] text-brand-muted font-light">
                  {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full mx-1 -mt-5 transition-all ${stepNum < current ? "bg-brand" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── skeleton loader ─────────────────────────────── */
const OrderSkeleton = () => (
  <div className="bg-white rounded-xl border border-border border-l-4 border-l-border p-6 animate-pulse">
    <div className="flex justify-between items-start mb-5">
      <div className="space-y-2">
        <div className="h-4 w-28 bg-surface rounded-lg" />
        <div className="h-3 w-40 bg-surface rounded-lg" />
      </div>
      <div className="h-6 w-20 bg-surface rounded-full" />
    </div>
    <div className="h-px bg-border mb-4" />
    <div className="flex gap-3 mb-4">
      <div className="w-12 h-12 bg-surface rounded-lg" />
      <div className="space-y-2 flex-1">
        <div className="h-3 w-32 bg-surface rounded-lg" />
        <div className="h-3 w-24 bg-surface rounded-lg" />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════ */
/*                     MyOrders                       */
/* ═══════════════════════════════════════════════════ */
const MyOrders = () => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useContext(CartContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(ORDERS_PER_PAGE);
  const [reorderFeedback, setReorderFeedback] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/order/my-orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Order history error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Reorder ── */
  const handleReorder = (order) => {
    let added = 0;
    order.items.forEach((item) => {
      if (item.product && !isInCart(item.product._id)) {
        addToCart({
          _id: item.product._id,
          masterProduct: item.product.masterProduct,
          farmerName: item.product.farmer?.name || "Farmer",
          price: item.price,
          quantity: item.quantity,
          availableStock: item.product.quantity || 100,
          unit: item.product.masterProduct?.unit || "kg",
        });
        added++;
      }
    });
    setReorderFeedback(added > 0 ? `${added} item${added > 1 ? "s" : ""} added to cart` : "Items already in cart");
    setTimeout(() => setReorderFeedback(null), 3000);
  };

  /* ── Filtering, searching, sorting ── */
  const processed = orders
    .filter((o) => filter === "all" || o.status === filter)
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        o._id.toLowerCase().includes(q) ||
        o.items.some((i) => i.product?.masterProduct?.name?.toLowerCase().includes(q)) ||
        o.customer?.name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      switch (sort) {
        case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest": return b.totalAmount - a.totalAmount;
        case "lowest": return a.totalAmount - b.totalAmount;
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const visible = processed.slice(0, visibleCount);
  const monthGroups = groupByMonth(visible);
  const hasMore = visibleCount < processed.length;

  const stats = {
    total: orders.length,
    placed: orders.filter((o) => o.status === "placed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    totalSpent: orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-surface">

      {/* ─── Hero ─── */}
      <div className="bg-surface-light pt-28 pb-16 px-6 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-bold mb-2">Account</p>
          <h1 className="text-4xl md:text-5xl font-black text-brand tracking-tight">My Orders</h1>
          <p className="text-brand-muted mt-2 text-sm font-light">Track and manage all your purchases</p>

          {/* Stats */}
          {!loading && orders.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { label: "Total Orders", value: stats.total },
                { label: "Active", value: stats.placed },
                { label: "Delivered", value: stats.delivered },
                { label: "Total Spent", value: `₹${stats.totalSpent.toLocaleString()}` },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-border rounded-xl px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-bold">{s.label}</p>
                  <p className="text-2xl font-black text-brand mt-1">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Search + Sort + Filters ── */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4 mb-8">
            {/* Top bar: search + sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  placeholder="Search by order ID, product name..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setVisibleCount(ORDERS_PER_PAGE); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-xs text-brand
                    placeholder:text-brand-muted focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="relative shrink-0">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-white border border-border rounded-lg text-xs font-bold text-brand
                    pl-3 pr-8 py-2.5 cursor-pointer outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all uppercase tracking-wider"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
                <svg className="w-3.5 h-3.5 text-brand-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {["all", "placed", "confirmed", "delivered", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setVisibleCount(ORDERS_PER_PAGE); }}
                  className={`pill ${filter === f ? "pill-filled" : "pill-outline"} capitalize`}
                >
                  {f === "all" ? "All Orders" : f}
                  <span className={`ml-1.5 text-[10px] ${filter === f ? "text-white/60" : "text-brand-muted"}`}>
                    {f === "all" ? orders.length : orders.filter((o) => o.status === f).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Results count */}
            {(search || filter !== "all") && (
              <p className="text-[11px] text-brand-muted font-light">
                Showing {processed.length} of {orders.length} orders
                {search && <> matching "<span className="font-bold">{search}</span>"</>}
              </p>
            )}
          </div>
        )}

        {/* Reorder feedback toast */}
        {reorderFeedback && (
          <div className="fixed bottom-6 right-6 z-50 bg-brand text-white px-5 py-3 rounded-full text-sm font-bold shadow-xl animate-bounce-in flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {reorderFeedback}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-xl border border-border py-20 text-center">
            <div className="w-20 h-20 bg-surface border border-border rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-brand mb-1">No orders yet</h3>
            <p className="text-sm text-brand-muted mb-6 font-light">Start shopping to see your orders here</p>
            <button onClick={() => navigate("/customer")} className="pill pill-filled">
              Browse Marketplace
            </button>
          </div>
        )}

        {/* No filter results */}
        {!loading && orders.length > 0 && processed.length === 0 && (
          <div className="bg-white rounded-xl border border-border py-14 text-center">
            <p className="text-brand-muted text-sm font-light">
              No {filter !== "all" ? <span className="font-bold capitalize">{filter}</span> : ""} orders
              {search ? <> matching "<span className="font-bold">{search}</span>"</> : " found"}
            </p>
            <button onClick={() => { setFilter("all"); setSearch(""); }}
              className="pill pill-outline mt-4 text-[10px]">Clear Filters</button>
          </div>
        )}

        {/* ── Order cards grouped by month ── */}
        {!loading && visible.length > 0 && (
          <div className="space-y-8">
            {monthGroups.map(([month, monthOrders]) => (
              <div key={month}>
                {/* Month separator */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted whitespace-nowrap">{month}</h2>
                  <div className="h-px bg-border flex-1" />
                  <span className="text-[10px] text-brand-muted font-light whitespace-nowrap">{monthOrders.length} order{monthOrders.length > 1 ? "s" : ""}</span>
                </div>

                <div className="space-y-4">
                  {monthOrders.map((order, idx) => {
                    const cfg = STATUS_CFG[order.status] || STATUS_CFG.placed;
                    const payCfg = PAYMENT_CFG[order.paymentStatus] || PAYMENT_CFG.pending;
                    const isOpen = expanded === order._id;
                    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                    const firstName = order.items[0]?.product?.masterProduct?.name || "Product";
                    const moreCount = order.items.length - 1;
                    const eta = getEstimatedDelivery(order);

                    return (
                      <div key={order._id}
                        className={`bg-white rounded-xl border border-border border-l-4 ${cfg.border} overflow-hidden
                          hover:shadow-md hover:shadow-brand/5 transition-all duration-300`}
                        style={{ animationDelay: `${idx * 60}ms` }}>

                        {/* Header */}
                        <div className="px-6 pt-5 pb-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Order ID + badges */}
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="text-sm font-bold text-brand">
                                  #{order._id.slice(-8).toUpperCase()}
                                </p>
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.12em] ${cfg.bg} ${cfg.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                  {cfg.label}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${payCfg.bg} ${payCfg.text}`}>
                                  {payCfg.label}
                                </span>
                              </div>

                              {/* Date + payment method */}
                              <div className="flex items-center gap-2 text-xs text-brand-muted font-light mt-1">
                                <span>
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })}
                                </span>
                                <span className="text-border">·</span>
                                <span className="inline-flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    {METHOD_ICON[order.paymentMethod] || METHOD_ICON.COD}
                                  </svg>
                                  {METHOD_LABEL[order.paymentMethod] || order.paymentMethod}
                                </span>
                              </div>

                              {/* First item preview */}
                              <div className="mt-3 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                                  <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                  </svg>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-brand truncate">
                                    {firstName} × {order.items[0]?.quantity || 1}
                                    {moreCount > 0 && (
                                      <span className="text-brand-muted font-normal"> + {moreCount} more</span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-brand-muted font-light">
                                    {itemCount} total item{itemCount !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right shrink-0 sm:ml-4">
                              <p className="text-xl font-black text-brand">₹{Number(order.totalAmount).toLocaleString()}</p>
                              {eta && (
                                <p className={`text-[10px] mt-1 font-medium ${order.status === "delivered" ? "text-accent" : "text-brand-muted"}`}>
                                  {eta}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress tracker */}
                        {order.status !== "cancelled" && (
                          <div className="px-6 pb-4">
                            <ProgressTracker order={order} />
                          </div>
                        )}

                        {/* Actions + expandable items */}
                        <div className="border-t border-border">
                          <div className="px-6 py-3 flex items-center justify-between">
                            {/* Left: actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleReorder(order)}
                                className="pill pill-outline text-[10px] py-1.5"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                </svg>
                                Reorder
                              </button>
                              {order.status === "delivered" && (
                                <button className="pill pill-outline text-[10px] py-1.5">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                  </svg>
                                  Invoice
                                </button>
                              )}
                            </div>

                            {/* Right: expand toggle */}
                            <button
                              onClick={() => setExpanded(isOpen ? null : order._id)}
                              className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-muted hover:text-brand transition-colors flex items-center gap-1"
                            >
                              {isOpen ? "Hide" : "Details"}
                              <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          </div>

                          {isOpen && (
                            <div className="px-6 pb-5 space-y-3 border-t border-border pt-4">
                              {order.items.map((item) => (
                                <div key={item._id} className="flex items-center justify-between bg-surface rounded-lg px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center flex-shrink-0">
                                      <svg className="w-5 h-5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-brand">
                                        {item.product?.masterProduct?.name || "Product"}
                                      </p>
                                      <p className="text-xs text-brand-muted font-light">
                                        {item.quantity} &times; ₹{Number(item.price).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-sm font-black text-brand">
                                    ₹{(item.price * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                              <div className="flex items-center justify-between pt-2 border-t border-border">
                                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-muted">Order Total</span>
                                <span className="text-xl font-black text-brand">₹{Number(order.totalAmount).toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Load more / pagination */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCount((v) => v + ORDERS_PER_PAGE)}
                  className="pill pill-outline"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                  Load More Orders
                  <span className="text-[10px] text-brand-muted ml-1">
                    ({visible.length} of {processed.length})
                  </span>
                </button>
              </div>
            )}

            {/* Showing count */}
            {!hasMore && processed.length > ORDERS_PER_PAGE && (
              <p className="text-center text-[10px] text-brand-muted font-light pt-2">
                Showing all {processed.length} orders
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;