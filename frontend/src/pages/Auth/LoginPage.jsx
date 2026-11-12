import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      if (data.user.role === 'seller') navigate('/dashboard');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const fillDemo = (role) => {
    const demos = {
      customer: { email: 'customer@gmail.com', password: 'demo123' },
      seller: { email: 'seller@gmail.com', password: 'demo123' },
      admin: { email: 'admin@gmail.com', password: 'demo123' }
    };
    setForm(demos[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex bg-gradient-to-br from-violet-700 via-violet-600 to-purple-700 flex-col justify-between p-12 text-white relative overflow-hidden">
          {/* Background decoration */}
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
            <h2 className="text-3xl font-extrabold mb-4 leading-tight">
              Welcome back! 👋
              <span className="block text-violet-200 text-xl font-semibold mt-2">Pakistan's best marketplace</span>
            </h2>
            <p className="text-violet-200 leading-relaxed mb-8 text-sm">
              Shop from thousands of verified sellers, track your orders in real-time, and manage your account all in one place.
            </p>
            <div className="space-y-3">
              {[
                ['🛍️', 'Browse 50,000+ Products', 'Electronics, Fashion, Food & more'],
                ['🚚', 'Fast Delivery', 'Across all cities in Pakistan'],
                ['🔒', 'Safe & Secure', '100% protected payments']
              ].map(([icon, title, sub]) => (
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
          <div className="relative mt-8 grid grid-cols-3 gap-2">
            {[
              'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=150&fit=crop',
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=150&fit=crop',
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=150&fit=crop',
            ].map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden border-2 border-white/20 aspect-video">
                <img src={img} alt="" className="w-full h-full object-cover opacity-80" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1.5">Sign in to your account</h1>
            <p className="text-gray-500 text-sm">Don't have an account? <Link to="/register" className="text-violet-600 font-semibold hover:underline">Create one free →</Link></p>
          </div>

          {/* Demo accounts */}
          <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <p className="text-xs font-bold text-blue-700 mb-2.5 flex items-center gap-1.5">
              <span>🎭</span> Quick Demo Login — Click to fill credentials
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { role: 'customer', label: '🛍️ Customer', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                { role: 'seller', label: '🏪 Seller', color: 'bg-violet-100 text-violet-700 hover:bg-violet-200' },
                { role: 'admin', label: '⚙️ Admin', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
              ].map(({ role, label, color }) => (
                <button key={role} onClick={() => fillDemo(role)}
                  className={`text-xs ${color} px-4 py-2 rounded-lg transition-colors font-semibold`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-violet-300 transition-all placeholder:text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-violet-300 transition-all placeholder:text-gray-400" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-extrabold py-3.5 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:shadow-violet-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-1 text-sm">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : 'Sign In to ShopVerse'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>🔒 SSL Encrypted</span>
            <span>•</span>
            <span>🛡️ 100% Secure</span>
            <span>•</span>
            <span>✅ Trusted Platform</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
