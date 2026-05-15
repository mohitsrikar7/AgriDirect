import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

/* ─── tiny icon helpers ─── */
const IconUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" /></svg>
);
const IconPhone = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
);
const IconHome = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
);
const IconMap = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
);
const IconPencil = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
);
const IconX = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);
const IconShield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
);
const IconBolt = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
);
const IconArrow = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
);

/* ─── toast component ─── */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-none shadow-2xl text-white text-sm font-medium animate-slide-in
      ${type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
      {type === "success" ? (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ) : (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
      )}
      {message}
    </div>
  );
};

/* ─── labeled input ─── */
const LabeledInput = ({ label, icon, value, disabled, onChange, placeholder }) => (
  <div className="relative">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-11 pr-4 py-3 rounded-none border text-sm font-medium transition-all duration-200
          ${disabled
            ? "bg-gray-50 border-gray-200 text-gray-500 cursor-default"
            : "bg-white border-green-300 text-gray-900 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 hover:border-green-400"
          }`}
      />
    </div>
  </div>
);

/* ─── section card ─── */
const SectionCard = ({ icon, title, badge, children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-none border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    <div className="flex items-center justify-between px-6 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-none bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {badge}
    </div>
    <div className="px-6 pb-6">{children}</div>
  </div>
);

const FarmerProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "", phone: "", house: "", area: "", city: "", state: "", pincode: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingFarm, setSavingFarm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [farmForm, setFarmForm] = useState({
    house: "", area: "", city: "", state: "", pincode: "",
  });
  const [farmAddress, setFarmAddress] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        const homeAddress = res.data.addresses?.find((addr) => addr.type === "home");
        const farm = res.data.addresses?.find((addr) => addr.type === "farm");

        if (homeAddress) {
          setProfile({
            name: res.data.name || "",
            phone: homeAddress.phone || "",
            house: homeAddress.house || "",
            area: homeAddress.area || "",
            city: homeAddress.city || "",
            state: homeAddress.state || "",
            pincode: homeAddress.pincode || "",
          });
        }

        if (farm) {
          setFarmAddress(farm);
        }
      } catch (err) {
        console.error("Failed to fetch profile");
        setToast({ message: "Failed to load profile", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/customer/update-address", {
        type: "home", label: "primary", isActive: true,
        fullName: profile.name, phone: profile.phone,
        house: profile.house, area: profile.area,
        city: profile.city, state: profile.state, pincode: profile.pincode,
      });
      setToast({ message: "Profile updated successfully!", type: "success" });
      setIsEditing(false);
    } catch (err) {
      setToast({ message: "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFarm = async () => {
    setSavingFarm(true);
    try {
      if (!navigator.geolocation) {
        setToast({ message: "Geolocation not supported", type: "error" });
        setSavingFarm(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await api.put("/customer/update-address", {
            type: "farm", label: "primary", isActive: true,
            fullName: profile.name, phone: profile.phone,
            house: farmForm.house, area: farmForm.area,
            city: farmForm.city, state: farmForm.state, pincode: farmForm.pincode,
            latitude, longitude,
          });
          setToast({ message: "Farm address updated!", type: "success" });
          setIsEditingFarm(false);
          setFarmAddress({ ...farmForm, type: "farm" });
          setSavingFarm(false);
        },
        () => {
          setToast({ message: "Location permission denied", type: "error" });
          setSavingFarm(false);
        }
      );
    } catch (err) {
      setToast({ message: "Failed to update farm address", type: "error" });
      setSavingFarm(false);
    }
  };

  /* ─── loading skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-none animate-spin" />
          <p className="text-gray-500 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: "View My Products", desc: "Manage your product listings", icon: "📦", color: "from-green-500 to-emerald-600", bg: "bg-green-50", border: "border-green-100", path: "/farmer" },
    { label: "Check Mandi Prices", desc: "View latest market prices", icon: "📈", color: "from-amber-500 to-orange-600", bg: "bg-amber-50", border: "border-amber-100", path: "/farmer/mandi" },
    { label: "AI Crop Advisor", desc: "Get smart crop recommendations", icon: "🤖", color: "from-violet-500 to-purple-600", bg: "bg-violet-50", border: "border-violet-100", path: "/farmer" },
    { label: "Weather Forecast", desc: "Check weather for your farm", icon: "🌤️", color: "from-sky-500 to-blue-600", bg: "bg-sky-50", border: "border-sky-100", path: "/farmer" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* ── toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ═══════════════════ HERO HEADER ═══════════════════ */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-none blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-300 rounded-none blur-3xl translate-y-1/2" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-none bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-none bg-emerald-400 border-2 border-white flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
            </div>

            {/* info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user?.name}
              </h1>
              <p className="text-green-100 mt-1">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-white/15 backdrop-blur-sm text-xs font-semibold text-white border border-white/20">
                  🌾 Farmer
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-white/15 backdrop-blur-sm text-xs font-semibold text-white border border-white/20">
                  📅 Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "N/A"}
                </span>
                {farmAddress && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-white/15 backdrop-blur-sm text-xs font-semibold text-white border border-white/20">
                    📍 {farmAddress.city}, {farmAddress.state}
                  </span>
                )}
              </div>
            </div>

            {/* back to dashboard */}
            <button
              onClick={() => navigate("/farmer")}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-none bg-white/15 backdrop-blur-sm border border-white/25 text-sm font-semibold text-white hover:bg-white/25 transition-all"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════ CONTENT ═══════════════════ */}
      <div className="max-w-5xl mx-auto px-6 -mt-4 pb-16 space-y-6">

        {/* ─── CONTACT & HOME ADDRESS ─── */}
        <SectionCard
          icon={<IconHome />}
          title="Contact & Home Address"
          badge={
            !isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-none bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 border border-green-200 transition-colors"
              >
                <IconPencil /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-none bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-none animate-spin" />
                  ) : (
                    <IconCheck />
                  )}
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-none bg-gray-100 text-gray-500 text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  <IconX /> Cancel
                </button>
              </div>
            )
          }
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <LabeledInput label="Full Name" icon={<IconUser />} value={profile.name} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Full Name" />
            <LabeledInput label="Phone Number" icon={<IconPhone />} value={profile.phone} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" />
            <LabeledInput label="House / Street" icon={<IconHome />} value={profile.house} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, house: e.target.value })} placeholder="House / Street" />
            <LabeledInput label="Area / Locality" icon={<IconMap />} value={profile.area} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, area: e.target.value })} placeholder="Area" />
            <LabeledInput label="City" icon={<IconMap />} value={profile.city} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="City" />
            <LabeledInput label="State" icon={<IconMap />} value={profile.state} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })} placeholder="State" />
            <LabeledInput label="Pincode" icon={<IconMap />} value={profile.pincode} disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} placeholder="Pincode" />
          </div>
        </SectionCard>

        {/* ─── FARM ADDRESS ─── */}
        <SectionCard
          icon={<IconMap />}
          title="Farm Address"
          badge={
            !isEditingFarm && farmAddress ? (
              <button
                onClick={() => {
                  setFarmForm({
                    house: farmAddress.house || "",
                    area: farmAddress.area || "",
                    city: farmAddress.city || "",
                    state: farmAddress.state || "",
                    pincode: farmAddress.pincode || "",
                  });
                  setIsEditingFarm(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-none bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 border border-green-200 transition-colors"
              >
                <IconPencil /> Edit
              </button>
            ) : isEditingFarm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveFarm}
                  disabled={savingFarm}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-none bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-60"
                >
                  {savingFarm ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-none animate-spin" />
                  ) : (
                    <IconCheck />
                  )}
                  {savingFarm ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setIsEditingFarm(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-none bg-gray-100 text-gray-500 text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  <IconX /> Cancel
                </button>
              </div>
            ) : null
          }
        >
          {isEditingFarm ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <LabeledInput label="Farm House / Name" icon={<IconHome />} value={farmForm.house}
                onChange={(e) => setFarmForm({ ...farmForm, house: e.target.value })} placeholder="Farm House" />
              <LabeledInput label="Area / Locality" icon={<IconMap />} value={farmForm.area}
                onChange={(e) => setFarmForm({ ...farmForm, area: e.target.value })} placeholder="Area" />
              <LabeledInput label="City" icon={<IconMap />} value={farmForm.city}
                onChange={(e) => setFarmForm({ ...farmForm, city: e.target.value })} placeholder="City" />
              <LabeledInput label="State" icon={<IconMap />} value={farmForm.state}
                onChange={(e) => setFarmForm({ ...farmForm, state: e.target.value })} placeholder="State" />
              <LabeledInput label="Pincode" icon={<IconMap />} value={farmForm.pincode}
                onChange={(e) => setFarmForm({ ...farmForm, pincode: e.target.value })} placeholder="Pincode" />
            </div>
          ) : farmAddress ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "House / Name", value: farmAddress.house },
                { label: "Area", value: farmAddress.area },
                { label: "City", value: farmAddress.city },
                { label: "State", value: farmAddress.state },
                { label: "Pincode", value: farmAddress.pincode },
              ].map((item) => (
                <div key={item.label} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-none p-4 border border-green-100">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-gray-900">{item.value || "—"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-14 h-14 rounded-none bg-amber-100 flex items-center justify-center text-2xl">📍</div>
              <p className="text-gray-500 font-medium">No farm address added yet</p>
              <button
                onClick={() => setIsEditingFarm(true)}
                className="px-5 py-2.5 rounded-none bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
              >
                + Add Farm Address
              </button>
            </div>
          )}
        </SectionCard>

        {/* ─── QUICK ACTIONS ─── */}
        <SectionCard icon={<IconBolt />} title="Quick Actions">
          <div className="grid sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`group relative flex items-center gap-4 p-5 rounded-none ${action.bg} ${action.border} border hover:shadow-md transition-all duration-300 text-left overflow-hidden`}
              >
                <div className={`w-12 h-12 rounded-none bg-gradient-to-br ${action.color} flex items-center justify-center text-xl shadow-sm shrink-0`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm">{action.label}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                </div>
                <span className="text-border group-hover:text-gray-500 group-hover:translate-x-1 transition-all">
                  <IconArrow />
                </span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ─── SECURITY ─── */}
        <SectionCard icon={<IconShield />} title="Account Security">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-5 rounded-none bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  🔒
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Password</p>
                  <p className="text-xs text-gray-500">Last changed: Unknown</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-none bg-white border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors shadow-sm">
                Change
              </button>
            </div>

            <div className="flex items-center justify-between p-5 rounded-none bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-sm">
                  ⚠️
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Delete Account</p>
                  <p className="text-xs text-gray-500">Permanently remove data</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-none bg-white border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors shadow-sm">
                Delete
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── slide-in animation ── */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0 }
          to   { transform: translateX(0);    opacity: 1 }
        }
        .animate-slide-in { animation: slide-in .3s ease-out }
      `}</style>
    </div>
  );
};

export default FarmerProfile;
