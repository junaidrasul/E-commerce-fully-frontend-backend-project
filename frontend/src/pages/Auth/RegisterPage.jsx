import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Store, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Fashion', 'Food', 'Books', 'Beauty', 'Sports', 'Home', 'Other'];

const RegisterPage = () => {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'customer');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '', storeCategory: 'Other' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (role === 'seller' && !form.storeName.trim()) { toast.error('Store name is required'); return; }
    try {
      await register({ ...form, role });
      toast.success(`Account created! Welcome to ShopVerse 🎉`);
      navigate(role === 'seller' ? '/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex bg-gradient-to-br from-violet-700 via-violet-600 to-purple-700 flex-col justify-between p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-800/40 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                <Store size={22} className="text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">ShopVerse</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-3 leading-tight">
              {role === 'seller' ? '🏪 Start Your Store' : '🎉 Join ShopVerse'}
              <span className="block text-violet-200 text-lg font-semibold mt-2">Free account • No credit card needed</span>
            </h2>
            <p className="text-violet-200 leading-relaxed mb-8 text-sm">
              {role === 'seller'
                ? 'Set up your online store in minutes and start selling to thousands of customers across Pakistan.'
                : 'Create your free account and enjoy exclusive deals, fast delivery, and a smooth shopping experience.'}
            </p>
            <div className="space-y-3">
              {(role === 'seller' ? [
                ['🏪', 'Free Store Setup', 'Go live in under 5 minutes'],
                ['📊', 'Live Analytics', 'Track sales & revenue in real-time'],
                ['💰', 'Instant Earnings', 'Get paid directly to your account'],
                ['🛡️', 'Seller Protection', 'Dispute resolution & support']
              ] : [
                ['🎁', 'Member Discounts', 'Exclusive deals just for you'],
                ['📦', 'Order Tracking', 'Real-time delivery updates'],
                ['❤️', 'Wishlist', 'Save products for later'],
                ['⭐', 'Reviews & Ratings', 'Share your experience']
              ]).map(([icon, title, sub]) => (
                <div key={title} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/15 backdrop-blur-sm">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-violet-300 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mt-8 pt-6 border-t border-white/20 text-xs text-violet-300 flex items-center gap-4">
            <span>✓ Free forever</span>
            <span>✓ No hidden charges</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>

        {/* Right Panel */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 lg:p-10 flex flex-col justify-center overflow-y-auto">
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1.5">Create your account</h1>
            <p className="text-gray-500 text-sm">Already have an account? <Link to="/login" className="text-violet-600 font-semibold hover:underline">Sign in →</Link></p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
            <button onClick={() => setRole('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'customer' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <ShoppingBag size={15} /> I want to Shop
            </button>
            <button onClick={() => setRole('seller')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'seller' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Store size={15} /> I want to Sell
            </button>
          </div>

          {role === 'seller' && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium flex items-start gap-2">
              <span className="text-base">💡</span>
              <span>You're signing up as a <strong>Seller</strong>. Your store will be created instantly after registration.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-violet-300 transition-all placeholder:text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-violet-300 transition-all placeholder:text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password (min. 6 characters)"
                  required minLength={6}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-violet-300 transition-all placeholder:text-gray-400" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {role === 'seller' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3.5 pt-1 border-t border-dashed border-violet-200">
                <p className="text-xs font-bold text-violet-600 pt-2 flex items-center gap-1">🏪 Store Information</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })}
                      placeholder="e.g. Ahmed Electronics, Style Hub PK"
                      required={role === 'seller'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-violet-300 transition-all placeholder:text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">What will you sell?</label>
                  <select value={form.storeCategory} onChange={e => setForm({ ...form, storeCategory: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-violet-300 transition-all">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-extrabold py-3.5 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:shadow-violet-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-1 text-sm">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                : `🚀 Create ${role === 'seller' ? 'Seller Account' : 'My Account'}`
              }
            </button>

            <p className="text-xs text-center text-gray-400 pt-1">
              By signing up you agree to our <span className="text-violet-600 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-violet-600 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
