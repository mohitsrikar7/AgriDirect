import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ═══ Config maps ═══════════════════════════════════ */
const STATUS_CFG = {
  placed: { bg: "bg-surface", text: "text-brand-muted", dot: "bg-brand-muted", label: "Placed" },
  confirmed: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", label: "Confirmed" },
  delivered: { bg: "bg-accent-muted", text: "text-accent", dot: "bg-accent", label: "Delivered" },
  cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", label: "Cancelled" },
};

const PAY_CFG = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  paid: { bg: "bg-accent-muted", text: "text-accent", label: "Paid" },
  failed: { bg: "bg-red-50", text: "text-red-600", label: "Failed" },
  refunded: { bg: "bg-surface", text: "text-brand-muted", label: "Refunded" },
};

const METHOD_LABEL = { COD: "Cash on Delivery", UPI: "UPI", NET_BANKING: "Net Banking", CARD: "Card" };

/* Neutral charcoal palette for charts */
const CHART_LINE = "#1a1a1a";
const CHART_BAR = "#1a1a1a";
const PIE_COLORS = ["#1a1a1a", "#4a4a4a", "#8a8a8a", "#c4c4c4"];

/* ═══ Tiny components ═══════════════════════════════ */
const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-border px-4 py-3">
      <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">{label}</p>
      <p className="text-sm font-black text-brand mt-0.5">{prefix}{Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-border px-4 py-3">
      <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">{payload[0].name}</p>
      <p className="text-sm font-black text-brand mt-0.5">{payload[0].value} orders</p>
    </div>
  );
};

const OrderSkeleton = () => (
  <div className="bg-white rounded-xl border border-border p-5 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-border rounded-full" />
        <div className="h-3 w-48 bg-border-light rounded-full" />
      </div>
      <div className="h-6 w-20 bg-border rounded-full" />
    </div>
    <div className="h-px bg-border mb-3" />
    <div className="space-y-2">
      <div className="h-3 w-40 bg-border-light rounded-full" />
      <div className="h-3 w-36 bg-border-light rounded-full" />
    </div>
  </div>
);

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ═══════════════════════════════════════════════════════ */
/*                   ADMIN DASHBOARD                      */
/* ═══════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ monthlyRevenue: [], orderStatus: [] });
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [platformStats, setPlatformStats] = useState(null);
  const [farmerSales, setFarmerSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  useEffect(() => {
    fetchOrders(); fetchStats(); fetchAnalytics(); fetchPlatformStats();
    fetchFarmerSales(); fetchTopProducts(); fetchUsers(); fetchRecentActivity();
  }, []);

  const fetchOrders = async () => {
    try { const r = await api.get("/admin/orders"); setOrders(r.data); }
    catch (e) { console.error("Orders error", e); }
    finally { setLoading(false); }
  };
  const fetchStats = async () => { try { const r = await api.get("/admin/sales"); setStats(r.data); } catch (e) { console.error(e); } };
  const fetchAnalytics = async () => { try { const r = await api.get("/admin/analytics"); setAnalytics(r.data); } catch (e) { console.error(e); } };
  const fetchPlatformStats = async () => { try { const r = await api.get("/admin/platform-stats"); setPlatformStats(r.data); } catch (e) { console.error(e); } };
  const fetchFarmerSales = async () => { try { const r = await api.get("/admin/farmer-sales"); setFarmerSales(r.data); } catch (e) { console.error(e); } };
  const fetchTopProducts = async () => { try { const r = await api.get("/admin/top-products"); setTopProducts(r.data); } catch (e) { console.error(e); } };
  const fetchUsers = async () => { try { const r = await api.get("/admin/users"); setUsers(r.data); } catch (e) { console.error(e); } };
  const fetchRecentActivity = async () => { try { const r = await api.get("/admin/recent-activity"); setRecentActivity(r.data); } catch (e) { console.error(e); } };

  const updateStatus = async (orderId, status) => {
    try { await api.put(`/admin/order/${orderId}/status`, { status }); fetchOrders(); }
    catch (e) { alert("Failed to update order status"); }
  };
  const markDelivered = async (orderId) => {
    try { await api.put(`/admin/order/${orderId}/deliver`); fetchOrders(); }
    catch (e) { alert("Failed to mark order as delivered"); }
  };

  const orderCounts = {
    all: orders.length,
    placed: orders.filter((o) => o.status === "placed").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const avgOrderValue = orders.length
    ? (orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length).toFixed(0) : 0;

  const payMethodDist = (() => {
    const map = {};
    orders.forEach((o) => { map[o.paymentMethod] = (map[o.paymentMethod] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: METHOD_LABEL[name] || name, value }));
  })();

  const filteredOrders = orders
    .filter((o) => filter === "all" || o.status === filter)
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return o._id.toLowerCase().includes(q) || o.customer?.name?.toLowerCase().includes(q) || o.customer?.email?.toLowerCase().includes(q);
    });

  const filteredUsers = users
    .filter((u) => userFilter === "all" || u.roles.includes(userFilter))
    .filter((u) => {
      if (!userSearch) return true;
      const q = userSearch.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });

  return (
    <div className="min-h-screen bg-surface">

      {/* ─────── HEADER — Rains-style neutral ─────── */}
      <div className="bg-surface-light pt-28 pb-14 px-6 lg:px-10 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-bold mb-2">Admin Panel</p>
              <h1 className="text-4xl md:text-5xl font-black text-brand tracking-tight">Dashboard</h1>
              <p className="text-brand-muted mt-2 text-sm font-light">Monitor sales, manage orders, track users & performance</p>
            </div>
            <span className="pill pill-outline text-[10px] self-start md:self-auto">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              System Operational
            </span>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            {[
              {
                label: "Total Orders", value: stats?.totalOrders ?? "—",
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              },
              {
                label: "Revenue", value: stats ? `₹${Number(stats.totalRevenue).toLocaleString()}` : "—",
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              },
              {
                label: "Avg Order", value: `₹${Number(avgOrderValue).toLocaleString()}`,
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
              },
              {
                label: "Farmers", value: platformStats?.totalFarmers ?? "—",
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              },
              {
                label: "Customers", value: platformStats?.totalCustomers ?? "—",
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl border border-border p-5">
                <span className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center mb-3">
                  <svg className="w-4.5 h-4.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{c.icon}</svg>
                </span>
                <p className="text-[10px] uppercase tracking-[0.15em] text-brand-muted font-bold">{c.label}</p>
                <p className="text-2xl font-black text-brand mt-1">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────── CONTENT ─────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-6">

        {/* Tab bar — pill style */}
        <div className="bg-white rounded-xl border border-border p-1.5 flex gap-1">
          {[
            { key: "overview", label: "Overview", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /> },
            { key: "orders", label: "Orders", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /> },
            { key: "users", label: "Users", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /> },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex-1 justify-center
                ${activeTab === tab.key ? "bg-brand text-white" : "text-brand-muted hover:bg-surface hover:text-brand"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{tab.icon}</svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════ TAB: OVERVIEW ═══════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Revenue Line Chart */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">Revenue Trend</h3>
                </div>
                <div className="p-6">
                  {analytics.monthlyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={analytics.monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e3" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#8a8a7a", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8a8a7a", fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip prefix="₹" />} />
                        <Line type="monotone" dataKey="revenue" stroke={CHART_LINE} strokeWidth={2.5}
                          dot={{ r: 4, fill: CHART_LINE, strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 6, fill: CHART_LINE, strokeWidth: 2, stroke: "#fff" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-sm text-brand-muted font-light">No revenue data yet</div>
                  )}
                </div>
              </div>

              {/* Order Status Bar Chart */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">Order Status</h3>
                </div>
                <div className="p-6">
                  {analytics.orderStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={analytics.orderStatus} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e3" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#8a8a7a", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8a8a7a", fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={CHART_BAR} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-sm text-brand-muted font-light">No order data yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* Second row: Pie + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Payment Method Pie */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">Payment Methods</h3>
                </div>
                <div className="p-6">
                  {payMethodDist.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={payMethodDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                            {payMethodDist.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {payMethodDist.map((d, i) => (
                          <div key={d.name} className="flex items-center gap-1.5 text-xs text-brand-muted">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            {d.name} ({d.value})
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-sm text-brand-muted font-light">No data yet</div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">Recent Activity</h3>
                </div>
                <div className="p-4 max-h-[340px] overflow-y-auto">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-1">
                      {recentActivity.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors">
                          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-brand truncate">{a.message}</p>
                            <p className="text-[10px] text-brand-muted mt-0.5 font-light">{timeAgo(a.time)}</p>
                          </div>
                          {a.type === "order" && a.status && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CFG[a.status]?.bg} ${STATUS_CFG[a.status]?.text}`}>
                              {STATUS_CFG[a.status]?.label}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-sm text-brand-muted font-light">No recent activity</div>
                  )}
                </div>
              </div>
            </div>

            {/* Third row: Farmer Leaderboard + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">Farmer Sales Leaderboard</h3>
                  <span className="pill pill-outline text-[10px]">{farmerSales.length} farmers</span>
                </div>
                <div className="p-4">
                  {farmerSales.length > 0 ? (
                    <div className="space-y-1">
                      {farmerSales.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 8).map((f, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 border
                            ${i < 3 ? "bg-brand text-white border-brand" : "bg-surface text-brand-muted border-border"}`}>
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-brand truncate">{f.farmer}</p>
                            <p className="text-[10px] text-brand-muted font-light">{f.totalOrders} order{f.totalOrders !== 1 ? "s" : ""}</p>
                          </div>
                          <span className="text-sm font-black text-brand">₹{Number(f.totalRevenue).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-sm text-brand-muted font-light">No farmer sales data</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">Top Selling Products</h3>
                </div>
                <div className="p-4">
                  {topProducts.length > 0 ? (
                    <div className="space-y-1">
                      {topProducts.slice(0, 8).map((p, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 border
                            ${i < 3 ? "bg-brand text-white border-brand" : "bg-surface text-brand-muted border-border"}`}>
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-brand truncate">{p.productName}</p>
                            <p className="text-[10px] text-brand-muted font-light">by {p.farmerName} · {p.totalQty} units · {p.orderCount} orders</p>
                          </div>
                          <span className="text-sm font-black text-brand">₹{Number(p.totalRevenue).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-sm text-brand-muted font-light">No product data yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TAB: ORDERS ═══════════ */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">All Orders</h3>
                  <span className="pill pill-outline text-[10px]">{orders.length}</span>
                </div>
                <div className="relative">
                  <svg className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input placeholder="Search by ID, name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-border rounded-lg text-xs w-64 focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all bg-surface" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {["all", "placed", "confirmed", "delivered", "cancelled"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`pill text-[10px] capitalize
                      ${filter === f ? "pill-filled" : "pill-outline"}`}>
                    {f === "all" ? "All" : f}
                    <span className="ml-1 opacity-60">{orderCounts[f] ?? ""}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-border">
              {loading && <div className="p-6 space-y-4">{[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}</div>}

              {!loading && filteredOrders.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm text-brand-muted font-light">No orders found</p>
                </div>
              )}

              {!loading && filteredOrders.map((order) => {
                const cfg = STATUS_CFG[order.status] || STATUS_CFG.placed;
                const payCfg = PAY_CFG[order.paymentStatus] || PAY_CFG.pending;
                const isOpen = expanded === order._id;
                const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                const isCODPending = order.paymentMethod === "COD" && order.status !== "delivered";

                return (
                  <div key={order._id} className="hover:bg-surface/50 transition-colors">
                    <div className="px-6 py-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg} ${cfg.text}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-brand">#{order._id.slice(-8).toUpperCase()}</p>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                                <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />{cfg.label}
                              </span>
                              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${payCfg.bg} ${payCfg.text}`}>
                                {payCfg.label}
                              </span>
                              {isCODPending && (
                                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 uppercase tracking-wider">COD</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-brand-muted font-light">
                              <span>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                              <span className="text-border">|</span>
                              <span>{order.customer?.name || "Unknown"}</span>
                              <span className="text-border">|</span>
                              <span>{METHOD_LABEL[order.paymentMethod] || order.paymentMethod}</span>
                              <span className="text-border">|</span>
                              <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-base font-black text-brand">₹{Number(order.totalAmount).toLocaleString()}</span>
                          <div className="relative">
                            <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}
                              className="appearance-none bg-surface hover:bg-border-light border border-border text-xs font-bold text-brand pl-3 pr-7 py-2 rounded-lg cursor-pointer transition-colors outline-none uppercase tracking-wider">
                              <option value="placed">Placed</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <svg className="w-3 h-3 text-brand-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </div>
                          {isCODPending && (
                            <button onClick={() => markDelivered(order._id)}
                              className="pill pill-filled text-[10px]">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Deliver
                            </button>
                          )}
                          <button onClick={() => setExpanded(isOpen ? null : order._id)}
                            className="w-8 h-8 rounded-lg bg-surface border border-border hover:bg-border-light flex items-center justify-center transition-colors">
                            <svg className={`w-4 h-4 text-brand-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="mt-4 bg-surface rounded-xl border border-border p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.15em]">Order Items</p>
                            {order.customer?.email && <span className="text-[10px] text-brand-muted font-light ml-auto">{order.customer.email}</span>}
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item._id} className="flex items-center justify-between bg-white rounded-lg border border-border px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-surface border border-border rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-brand">{item.product?.masterProduct?.name || "Product"}</p>
                                    <p className="text-[10px] text-brand-muted font-light">{item.quantity} &times; ₹{Number(item.price).toLocaleString()}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-black text-brand">₹{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Order Total</span>
                            <span className="text-lg font-black text-brand">₹{Number(order.totalAmount).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════ TAB: USERS ═══════════ */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">All Users</h3>
                  <span className="pill pill-outline text-[10px]">{users.length}</span>
                </div>
                <div className="relative">
                  <svg className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-border rounded-lg text-xs w-56 focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all bg-surface" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {[
                  { key: "all", label: "All", count: users.length },
                  { key: "farmer", label: "Farmers", count: users.filter((u) => u.roles.includes("farmer")).length },
                  { key: "customer", label: "Customers", count: users.filter((u) => u.roles.includes("customer")).length },
                  { key: "admin", label: "Admins", count: users.filter((u) => u.roles.includes("admin")).length },
                ].map((f) => (
                  <button key={f.key} onClick={() => setUserFilter(f.key)}
                    className={`pill text-[10px]
                      ${userFilter === f.key ? "pill-filled" : "pill-outline"}`}>
                    {f.label}
                    <span className="ml-1 opacity-60">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-border">
              {filteredUsers.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm text-brand-muted font-light">No users found</p>
                </div>
              )}

              {filteredUsers.map((u) => {
                const roleCfg = {
                  farmer: { bg: "bg-accent-muted", text: "text-accent" },
                  customer: { bg: "bg-surface", text: "text-brand-muted" },
                  admin: { bg: "bg-brand", text: "text-white" },
                };

                return (
                  <div key={u._id} className="px-6 py-4 hover:bg-surface/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-brand-muted">{u.name?.charAt(0)?.toUpperCase() || "?"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-brand">{u.name}</p>
                          {u.roles.map((r) => (
                            <span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${roleCfg[r]?.bg || "bg-surface"} ${roleCfg[r]?.text || "text-brand-muted"}`}>
                              {r}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-brand-muted mt-0.5 font-light">{u.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-brand-muted uppercase tracking-wider font-bold">Joined</p>
                        <p className="text-xs font-semibold text-brand">
                          {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      {u.addresses?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-brand-muted flex-shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {u.addresses.length}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;