import { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Lock, Eye, EyeOff, Camera, CheckCircle, Package, Heart, MapPin, Save, Shield,
  Sparkles, Home, Bell, ShoppingBag, ChevronRight, Loader2, Trash2, Plus, Calendar, Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const emptyAddress = { label: 'Home', street: '', city: '', state: '', zipCode: '', country: 'Pakistan', isDefault: true };

const ProfilePage = () => {
  const { user, fetchMe } = useAuthStore();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + (i.quantity || 0), 0));
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0 });
  const [prefs, setPrefs] = useState(() => ({
    orderUpdates: localStorage.getItem('pref_orderUpdates') !== 'false',
    promos: localStorage.getItem('pref_promos') === 'true',
    tips: localStorage.getItem('pref_tips') !== 'false',
  }));

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    bio: '',
  });

  const [addresses, setAddresses] = useState([]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const { user: currentUser } = await fetchMe();
        if (cancelled || !currentUser) return;
        setProfileForm({
          name: currentUser.name || '',
          phone: currentUser.phone || '',
          bio: currentUser.bio || '',
        });
        setAddresses(
          currentUser.addresses?.length
            ? currentUser.addresses.map(a => ({ ...a, _id: a._id }))
            : []
        );
      } catch { /* ignore */ }
    };
    loadProfile();
    return () => { cancelled = true; };
  }, [fetchMe]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const ordersRes = await api.get('/orders/my').catch(() => ({ data: { orders: [] } }));
        const wl = user?.wishlist?.length;
        const wishlistCount = typeof wl === 'number' ? wl : (Array.isArray(user?.wishlist) ? user.wishlist.length : 0);
        setStats({
          orders: ordersRes.data.orders?.length || 0,
          wishlist: wishlistCount,
        });
      } catch { /* ignore */ }
    };
    if (user) loadStats();
  }, [user]);

  const getInitials = (name) =>
    name?.split(/\s+/).filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const getRoleBadge = (role) =>
    ({
      customer: { label: 'Customer', ring: 'ring-blue-400/30', pill: 'bg-blue-500/20 text-blue-100 border-blue-400/30' },
      seller: { label: 'Seller', ring: 'ring-violet-400/30', pill: 'bg-violet-500/20 text-violet-100 border-violet-400/30' },
      admin: { label: 'Admin', ring: 'ring-rose-400/30', pill: 'bg-rose-500/20 text-rose-100 border-rose-400/30' },
    }[role] || { label: role, ring: 'ring-white/20', pill: 'bg-white/10 text-white border-white/20' });

  const avatarUrl = user?.avatar?.url;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })
    : null;

  const handleAvatarPick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const { data: up } = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const img = up.images?.[0];
      if (!img?.url) throw new Error('Upload failed');
      await api.put('/auth/profile', {
        avatar: { public_id: img.public_id || '', url: img.url },
      });
      await fetchMe();
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Could not upload photo. Check that Cloudinary is configured on the server, or try again later.'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
        bio: profileForm.bio,
      });
      await fetchMe();
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddresses = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleaned = addresses.map(({ label, street, city, state, zipCode, country, isDefault }) => ({
        label, street, city, state, zipCode, country: country || 'Pakistan', isDefault: !!isDefault,
      }));
      await api.put('/auth/profile', { addresses: cleaned });
      await fetchMe();
      toast.success('Addresses saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save addresses');
    } finally {
      setSaving(false);
    }
  };

  const addAddress = () => {
    setAddresses(prev => [...prev, { ...emptyAddress, isDefault: prev.length === 0 }]);
  };

  const removeAddress = (index) => {
    setAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const setDefaultAddress = (index) => {
    setAddresses(prev => prev.map((a, i) => ({ ...a, isDefault: i === index })));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const persistPref = (key, value) => {
    localStorage.setItem(`pref_${key}`, String(value));
    setPrefs(p => ({ ...p, [key]: value }));
    toast.success('Preference saved');
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'profile', label: 'Personal', icon: User },
    { id: 'addresses', label: 'Addresses', icon: Home },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Bell },
  ];

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
      </div>
    );
  }

  const roleStyle = getRoleBadge(user.role);

  return (
    <div className="min-h-screen bg-[#f4f0ff]">
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarChange} />

      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-400/30 to-fuchsia-400/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-cyan-400/20 to-violet-300/20 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-8">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-violet-900/15 border border-white/60 mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-900" />
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative px-6 sm:px-10 pt-10 pb-12 sm:pb-14">
            <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-12">
              {/* Avatar */}
              <div className="flex flex-col items-center lg:items-start shrink-0">
                <div className={`relative rounded-full p-1.5 ring-4 ${roleStyle.ring} shadow-2xl`}>
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-sm border border-white/30">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-black text-white/90 tracking-tight">
                        {getInitials(user.name)}
                      </div>
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAvatarPick}
                    disabled={uploadingPhoto}
                    className="absolute bottom-1 right-1 w-11 h-11 rounded-2xl bg-white text-violet-700 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 border border-violet-100"
                    title="Upload profile photo"
                  >
                    <Camera size={18} />
                  </button>
                </div>
                <p className="mt-3 text-xs text-violet-200/90 text-center lg:text-left max-w-[200px]">
                  JPG, PNG or WebP · max 5 MB
                </p>
              </div>

              {/* Name & meta */}
              <div className="flex-1 text-center lg:text-left pb-1">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${roleStyle.pill}`}>
                    {roleStyle.label}
                  </span>
                  {memberSince && (
                    <span className="text-[11px] text-violet-200/80 flex items-center gap-1">
                      <Calendar size={12} /> Member since {memberSince}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
                  {user.name}
                </h1>
                <p className="text-violet-100/90 text-sm sm:text-base flex items-center justify-center lg:justify-start gap-2">
                  <Mail size={16} className="opacity-70 shrink-0" />
                  {user.email}
                </p>
                {user.bio && (
                  <p className="mt-4 text-sm text-violet-100/85 max-w-xl mx-auto lg:mx-0 leading-relaxed line-clamp-3">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap justify-center lg:justify-end gap-3 lg:pb-1">
                {[
                  { to: '/orders', icon: Package, value: stats.orders, label: 'Orders' },
                  { to: '/wishlist', icon: Heart, value: stats.wishlist, label: 'Wishlist' },
                  { to: '/cart', icon: ShoppingBag, value: cartCount, label: 'Cart' },
                ].map(({ to, icon: Icon, value, label }) => (
                  <Link
                    key={label}
                    to={to}
                    className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 min-w-[130px] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="text-left">
                      {value !== null && <div className="text-xl font-black text-white leading-none">{value}</div>}
                      <div className="text-[11px] font-semibold text-violet-200 uppercase tracking-wide">{label}</div>
                    </div>
                    <ChevronRight size={16} className="text-white/40 group-hover:text-white/80 ml-auto shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            <nav className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg shadow-violet-900/5 p-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-0.5 last:mb-0
                    ${activeTab === id
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'}`}
                >
                  <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 2} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
              <p className="text-xs font-bold text-violet-200 uppercase tracking-wider mb-2">Need help?</p>
              <p className="text-sm text-violet-100 mb-4">Visit our stores or contact support from your orders page.</p>
              <Link to="/stores" className="text-sm font-bold inline-flex items-center gap-1 hover:gap-2 transition-all">
                Browse stores <ChevronRight size={14} />
              </Link>
            </div>
          </aside>

          {/* Main panel */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-6"
                >
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-violet-900/5 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Your ShopVerse hub</h2>
                        <p className="text-sm text-slate-500 mt-1">Shortcuts and snapshot of your account</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-4 py-2.5 rounded-xl transition-colors"
                      >
                        Edit profile <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { to: '/products', title: 'Continue shopping', desc: 'Discover new arrivals and deals', icon: ShoppingBag, color: 'from-violet-500 to-purple-600' },
                        { to: '/orders', title: 'Track orders', desc: 'See delivery status and history', icon: Package, color: 'from-fuchsia-500 to-pink-600' },
                        { to: '/wishlist', title: 'Wishlist', desc: 'Items you love, saved for later', icon: Heart, color: 'from-rose-500 to-orange-500' },
                        ...(user.role === 'seller'
                          ? [{ to: '/dashboard', title: 'Seller dashboard', desc: 'Manage your store and products', icon: Store, color: 'from-emerald-500 to-teal-600' }]
                          : []),
                      ].map(({ to, title, desc, icon: Icon, color }) => (
                        <Link
                          key={to}
                          to={to}
                          className="group flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all"
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md shrink-0`}>
                            <Icon size={22} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                          </div>
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-violet-400 ml-auto shrink-0 self-center" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Saved addresses', value: user.addresses?.length || 0, sub: 'For faster checkout' },
                      { label: 'Account status', value: user.isActive !== false ? 'Active' : '—', sub: 'Shopping enabled' },
                      { label: 'Profile photo', value: avatarUrl ? 'Uploaded' : 'Not set', sub: 'Shown across ShopVerse' },
                    ].map((row) => (
                      <div key={row.label} className="bg-white/90 backdrop-blur rounded-2xl border border-slate-100 p-5 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{row.label}</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{row.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{row.sub}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-violet-900/5 p-6 sm:p-8"
                >
                  <div className="flex flex-col sm:flex-row gap-6 mb-8 pb-8 border-b border-slate-100">
                    <div className="relative shrink-0 mx-auto sm:mx-0">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-violet-100 shadow-lg">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white">
                            {getInitials(user.name)}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAvatarPick}
                        disabled={uploadingPhoto}
                        className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-700 disabled:opacity-50"
                      >
                        {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                      </button>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-lg font-black text-slate-900">Photo & identity</h2>
                      <p className="text-sm text-slate-500 mt-1 max-w-md">
                        Your photo appears next to your name in the header. Use a clear square image for the best look.
                      </p>
                      <button
                        type="button"
                        onClick={handleAvatarPick}
                        disabled={uploadingPhoto}
                        className="mt-4 text-sm font-bold text-violet-600 hover:underline disabled:opacity-50"
                      >
                        {uploadingPhoto ? 'Uploading…' : 'Change profile photo'}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4">Personal details</h3>
                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="Enter your full name"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-violet-300 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={user.email}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-600 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Email cannot be changed from here for security.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone <span className="font-normal text-slate-400">(optional)</span></label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="e.g. +92 300 1234567"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">About you <span className="font-normal text-slate-400">(optional)</span></label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="A short bio — your interests, city, or what you love to shop for…"
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white resize-none transition-all"
                      />
                      <p className="text-xs text-slate-400 mt-1 text-right">{profileForm.bio.length}/500</p>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-8 py-3 rounded-xl hover:from-violet-700 hover:to-purple-700 shadow-md disabled:opacity-60"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Save changes
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-violet-900/5 p-6 sm:p-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Delivery addresses</h2>
                      <p className="text-sm text-slate-500 mt-1">Used at checkout — set one as default</p>
                    </div>
                    <button
                      type="button"
                      onClick={addAddress}
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <Plus size={18} /> Add address
                    </button>
                  </div>

                  <form onSubmit={handleSaveAddresses} className="space-y-6">
                    {addresses.length === 0 ? (
                      <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                        <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-600 font-medium">No addresses yet</p>
                        <p className="text-sm text-slate-400 mt-1 mb-4">Add your home or office for faster checkout</p>
                        <button type="button" onClick={addAddress} className="text-violet-600 font-bold text-sm hover:underline">
                          Add your first address
                        </button>
                      </div>
                    ) : (
                      addresses.map((addr, index) => (
                        <div key={index} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/80 space-y-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-violet-600 uppercase tracking-wide">Address {index + 1}</span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                                <input
                                  type="radio"
                                  name="defaultAddr"
                                  checked={!!addr.isDefault}
                                  onChange={() => setDefaultAddress(index)}
                                  className="accent-violet-600"
                                />
                                Default
                              </label>
                              <button type="button" onClick={() => removeAddress(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <input
                              placeholder="Label (e.g. Home, Office)"
                              value={addr.label || ''}
                              onChange={(e) => {
                                const next = [...addresses];
                                next[index] = { ...next[index], label: e.target.value };
                                setAddresses(next);
                              }}
                              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            />
                            <input
                              placeholder="Street address"
                              value={addr.street || ''}
                              onChange={(e) => {
                                const next = [...addresses];
                                next[index] = { ...next[index], street: e.target.value };
                                setAddresses(next);
                              }}
                              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none sm:col-span-2"
                            />
                            <input
                              placeholder="City"
                              value={addr.city || ''}
                              onChange={(e) => {
                                const next = [...addresses];
                                next[index] = { ...next[index], city: e.target.value };
                                setAddresses(next);
                              }}
                              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            />
                            <input
                              placeholder="Province / State"
                              value={addr.state || ''}
                              onChange={(e) => {
                                const next = [...addresses];
                                next[index] = { ...next[index], state: e.target.value };
                                setAddresses(next);
                              }}
                              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            />
                            <input
                              placeholder="Postal code"
                              value={addr.zipCode || ''}
                              onChange={(e) => {
                                const next = [...addresses];
                                next[index] = { ...next[index], zipCode: e.target.value };
                                setAddresses(next);
                              }}
                              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            />
                            <input
                              placeholder="Country"
                              value={addr.country || 'Pakistan'}
                              onChange={(e) => {
                                const next = [...addresses];
                                next[index] = { ...next[index], country: e.target.value };
                                setAddresses(next);
                              }}
                              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))
                    )}
                    {addresses.length > 0 && (
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-8 py-3 rounded-xl disabled:opacity-60"
                      >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save addresses
                      </button>
                    )}
                  </form>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-violet-900/5 p-6 sm:p-8"
                >
                  <h2 className="text-xl font-black text-slate-900 mb-1">Password & security</h2>
                  <p className="text-sm text-slate-500 mb-6">Use a unique password you do not reuse on other sites</p>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Current password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          placeholder="Enter your current password"
                          required
                          className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">New password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="At least 6 characters"
                          required
                          minLength={6}
                          className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
                        />
                        <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Confirm new password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Re-enter new password"
                          required
                          className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white ${
                            passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                              ? 'border-red-300'
                              : passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword
                                ? 'border-green-300'
                                : 'border-slate-200'
                          }`}
                        />
                        {passwordForm.confirmPassword && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {passwordForm.newPassword === passwordForm.confirmPassword ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <span className="text-red-400 text-xs font-bold">✗</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={saving || (passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-8 py-3 rounded-xl disabled:opacity-60"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                      Update password
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-violet-900/5 p-6 sm:p-8"
                >
                  <h2 className="text-xl font-black text-slate-900 mb-1">Notifications</h2>
                  <p className="text-sm text-slate-500 mb-6">These preferences are saved on this device</p>
                  <div className="space-y-4 max-w-lg">
                    {[
                      { key: 'orderUpdates', title: 'Order updates', desc: 'Shipping and delivery notifications' },
                      { key: 'promos', title: 'Offers & promotions', desc: 'Deals and seasonal sales (optional)' },
                      { key: 'tips', title: 'Tips & recommendations', desc: 'Curated picks based on your activity' },
                    ].map(({ key, title, desc }) => (
                      <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/80">
                        <div>
                          <p className="font-bold text-slate-900">{title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={prefs[key]}
                          onClick={() => persistPref(key, !prefs[key])}
                          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${prefs[key] ? 'bg-violet-600' : 'bg-slate-300'}`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${prefs[key] ? 'left-6' : 'left-1'}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
