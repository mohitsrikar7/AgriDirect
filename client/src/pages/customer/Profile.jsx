import { useContext, useState, useEffect } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LocationPickerModal from "./LocationPickerModal";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [primaryAddress, setPrimaryAddress] = useState(null);
  const [secondaryAddress, setSecondaryAddress] = useState(null);
  const [editingPrimary, setEditingPrimary] = useState(false);
  const [editingSecondary, setEditingSecondary] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [addressTypeForMap, setAddressTypeForMap] = useState(null);
  const [primaryForm, setPrimaryForm] = useState({});
  const [secondaryForm, setSecondaryForm] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.addresses) {
          const primary = res.data.addresses.find(
            (addr) => addr.type === "home" && addr.label === "primary"
          );
          const secondary = res.data.addresses.find(
            (addr) => addr.type === "home" && addr.label === "secondary"
          );
          setPrimaryAddress(primary || null);
          setSecondaryAddress(secondary || null);
          if (primary) setPrimaryForm(primary);
          if (secondary) setSecondaryForm(secondary);
          if (primary?.phone) setPhone(primary.phone);
        }
      } catch (err) {
        console.error("Failed to load profile data");
      }
    };
    fetchUser();
  }, []);

  const saveAddress = async (formData, label) => {
    try {
      const payload = {
        type: "home", label, isActive: true,
        fullName: formData.fullName, phone: formData.phone,
        house: formData.house, area: formData.area,
        city: formData.city, state: formData.state,
        pincode: formData.pincode,
        latitude: formData.latitude, longitude: formData.longitude,
      };
      await api.put("/customer/update-address", payload);
      alert("Address updated successfully");
      const res = await api.get("/auth/me");
      const primary = res.data.addresses?.find((addr) => addr.type === "home" && addr.label === "primary");
      const secondary = res.data.addresses?.find((addr) => addr.type === "home" && addr.label === "secondary");
      setPrimaryAddress(primary || null);
      setSecondaryAddress(secondary || null);
      setEditingPrimary(false);
      setEditingSecondary(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update address");
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) { alert("All fields are required"); return; }
    if (newPassword !== confirmPassword) { alert("Passwords do not match"); return; }
    if (newPassword.length < 6) { alert("Password must be at least 6 characters"); return; }
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      alert("Password changed successfully. Please login again.");
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change password");
    }
  };

  /* ── reusable address form ── */
  const renderAddressForm = (form, setForm, label, onCancel) => (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { key: "house", placeholder: "House / Flat No." },
          { key: "area", placeholder: "Area / Street" },
          { key: "city", placeholder: "City" },
          { key: "state", placeholder: "State" },
          { key: "pincode", placeholder: "Pincode" },
          { key: "phone", placeholder: "Phone Number" },
        ].map(({ key, placeholder }) => (
          <div key={key}>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1.5">{placeholder}</label>
            <input
              placeholder={placeholder}
              value={form[key] || ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-none text-sm text-gray-900
                focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => saveAddress(form, label)}
          className="pill pill-filled"
        >
          Save Address
        </button>
        <button
          onClick={() => { setAddressTypeForMap(label); setIsLocationModalOpen(true); }}
          className="pill pill-outline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          Select on Map
        </button>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-900 px-4 py-2.5 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  /* ── reusable address display ── */
  const renderAddressView = (address, onEdit) => (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-none bg-surface border border-gray-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-relaxed">
            {address.house}, {address.area}, {address.city}, {address.state} - {address.pincode}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            {address.phone}
          </div>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="pill pill-outline text-xs"
      >
        Edit
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">

      {/* ─── Hero — Rains-style neutral header ─── */}
      <div className="bg-gray-50 pt-28 pb-24 px-6 border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center gap-5">
          <div className="w-20 h-20 bg-brand border border-brand rounded-none flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">Account</p>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{user?.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 bg-surface border border-gray-200 px-3 py-1.5 rounded-none">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "N/A"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent bg-accent-muted px-3 py-1.5 rounded-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-accent rounded-none animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* ═══ Profile Information ═══ */}
        <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Profile Information</h2>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1.5">Full Name</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-900
                    focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1.5">Phone</label>
                <input
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-900
                    focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                />
              </div>
            </div>
            <button className="mt-5 pill pill-filled">
              Save Changes
            </button>
          </div>
        </div>

        {/* ═══ Addresses ═══ */}
        <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Delivery Addresses</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Primary */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-gray-900 bg-surface border border-gray-200 px-2.5 py-1 rounded-none uppercase tracking-[0.15em]">Primary</span>
              </div>
              {primaryAddress && !editingPrimary && renderAddressView(primaryAddress, () => setEditingPrimary(true))}
              {editingPrimary && renderAddressForm(primaryForm, setPrimaryForm, "primary", () => setEditingPrimary(false))}
              {!primaryAddress && !editingPrimary && (
                <button
                  onClick={() => setEditingPrimary(true)}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-accent rounded-none py-6 text-sm text-gray-500 hover:text-accent font-medium transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Primary Address
                </button>
              )}
            </div>

            <div className="border-t border-gray-200" />

            {/* Secondary */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-gray-500 bg-surface border border-gray-200 px-2.5 py-1 rounded-none uppercase tracking-[0.15em]">Secondary</span>
              </div>
              {secondaryAddress && !editingSecondary && renderAddressView(secondaryAddress, () => setEditingSecondary(true))}
              {editingSecondary && renderAddressForm(secondaryForm, setSecondaryForm, "secondary", () => setEditingSecondary(false))}
              {!secondaryAddress && !editingSecondary && (
                <button
                  onClick={() => setEditingSecondary(true)}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-accent rounded-none py-6 text-sm text-gray-500 hover:text-accent font-medium transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Secondary Address
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Quick Actions ═══ */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/customer/orders")}
            className="group bg-white rounded-none border border-gray-200 p-5 text-left hover:border-brand transition-all duration-300"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Orders</h3>
            <p className="font-bold text-gray-900 text-sm">View My Orders</p>
            <p className="text-xs text-gray-500 mt-1 font-light">Track and manage your orders</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-gray-900 group-hover:gap-2 transition-all uppercase tracking-wider">
              View →
            </div>
          </button>

          <button
            onClick={() => navigate("/customer")}
            className="group bg-white rounded-none border border-gray-200 p-5 text-left hover:border-brand transition-all duration-300"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Marketplace</h3>
            <p className="font-bold text-gray-900 text-sm">Browse Products</p>
            <p className="text-xs text-gray-500 mt-1 font-light">Discover fresh farm produce</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-gray-900 group-hover:gap-2 transition-all uppercase tracking-wider">
              Explore →
            </div>
          </button>
        </div>

        {/* ═══ Security ═══ */}
        <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Security</h2>
          </div>
          <div className="p-6">
            {!showPasswordForm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Password</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-light">Last changed: Unknown</p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="pill pill-outline text-xs"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { key: "currentPassword", placeholder: "Current Password" },
                  { key: "newPassword", placeholder: "New Password" },
                  { key: "confirmPassword", placeholder: "Confirm New Password" },
                ].map(({ key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1.5">{placeholder}</label>
                    <input
                      type="password" placeholder={placeholder}
                      value={passwordData[key]}
                      onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                      className="w-full bg-surface border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-900
                        focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleChangePassword}
                    className="pill pill-filled"
                  >
                    Update Password
                  </button>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="text-gray-500 hover:text-gray-900 px-4 py-2.5 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust footer */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5 uppercase tracking-wider font-medium">
            <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            Your data is encrypted and secure
          </p>
        </div>
      </div>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => { setIsLocationModalOpen(false); setAddressTypeForMap(null); }}
        onSave={(data) => {
          const updatedData = {
            house: data.house, area: data.area, city: data.city,
            state: data.state, pincode: data.pincode,
            latitude: data.latitude, longitude: data.longitude,
          };
          if (addressTypeForMap === "primary") setPrimaryForm((prev) => ({ ...prev, ...updatedData }));
          if (addressTypeForMap === "secondary") setSecondaryForm((prev) => ({ ...prev, ...updatedData }));
          setIsLocationModalOpen(false);
          setAddressTypeForMap(null);
        }}
      />
    </div>
  );
};

export default Profile;