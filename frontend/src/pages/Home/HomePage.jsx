import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RefreshCw, Star, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', color: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50' },
  { name: 'Fashion', icon: '👗', color: 'from-pink-500 to-rose-400', bg: 'bg-pink-50' },
  { name: 'Food', icon: '🍔', color: 'from-orange-500 to-amber-400', bg: 'bg-orange-50' },
  { name: 'Books', icon: '📚', color: 'from-emerald-500 to-green-400', bg: 'bg-emerald-50' },
  { name: 'Beauty', icon: '💄', color: 'from-purple-500 to-violet-400', bg: 'bg-purple-50' },
  { name: 'Sports', icon: '⚽', color: 'from-lime-500 to-green-400', bg: 'bg-lime-50' },
  { name: 'Home', icon: '🏠', color: 'from-amber-500 to-yellow-400', bg: 'bg-amber-50' },
  { name: 'Other', icon: '📦', color: 'from-gray-500 to-slate-400', bg: 'bg-gray-50' },
];

const FEATURES = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above PKR 2,000', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Shield, title: 'Secure Payment', desc: '100% protected transactions', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Star, title: 'Top Rated', desc: 'Verified seller reviews', color: 'text-violet-600', bg: 'bg-violet-50' },
];

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featured, newest, popular] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products?sort=newest&limit=8'),
          api.get('/products?sort=popular&limit=8'),
        ]);
        setFeaturedProducts(featured.data.products);
        setNewArrivals(newest.data.products);
        setTopSelling(popular.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const displayProducts = activeTab === 'featured' ? featuredProducts : activeTab === 'new' ? newArrivals : topSelling;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero — layered depth, soft top blend, wave into content */}
      <section className="relative overflow-hidden">
        {/* Deep base + mesh lights */}
        <div className="absolute inset-0 bg-[#0b0220]" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-[#5b21b6] to-indigo-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,rgba(167,139,250,0.45),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_20%,rgba(244,114,182,0.18),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_80%,rgba(34,211,238,0.12),transparent_40%)]" />
        {/* Soft top fade so navbar meets hero gently */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-violet-950/30 to-transparent pointer-events-none" />
        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 sm:pt-14 sm:pb-32 lg:pt-16 lg:pb-36">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border border-white/20 bg-white/10 text-white/95 text-sm font-medium shadow-lg shadow-violet-950/20 backdrop-blur-md"
              >
                <Sparkles size={15} className="text-amber-300 shrink-0" />
                <span className="tracking-wide">Pakistan&apos;s #1 multi-vendor marketplace</span>
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] xl:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
                <span className="text-white/95">Discover</span>{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent drop-shadow-sm">
                    everything
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-amber-400/60 via-orange-400/50 to-transparent blur-[2px]" aria-hidden />
                </span>
                <br />
                <span className="text-white/90">you love — in one place.</span>
              </h1>

              <p className="text-base sm:text-lg text-violet-100/90 mb-9 leading-relaxed max-w-lg font-medium">
                Curated stores, fair prices, and delivery you can trust. Shop electronics, fashion, food &amp; more from verified sellers nationwide.
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/products')}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-white px-8 py-4 font-bold text-violet-900 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.35)] ring-1 ring-white/60 transition-shadow hover:shadow-[0_12px_40px_-6px_rgba(124,58,237,0.45)]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-violet-50/0 via-violet-100/80 to-violet-50/0 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative">Shop now</span>
                  <ArrowRight size={18} className="relative transition-transform group-hover:translate-x-0.5" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register?role=seller')}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/35 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/55 hover:bg-white/15"
                >
                  Become a seller
                </motion.button>
              </div>

              {/* Stats — glass chips */}
              <div className="mt-12 flex flex-wrap gap-3 sm:gap-4">
                {[
                  ['50K+', 'Products'],
                  ['10K+', 'Sellers'],
                  ['200K+', 'Customers'],
                ].map(([num, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md shadow-inner shadow-white/5"
                  >
                    <div className="font-display text-xl sm:text-2xl font-extrabold tabular-nums text-white">{num}</div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-violet-200/90">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Category bento — light cards that lift off the purple */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {[
                { label: 'Electronics', sub: 'Gadgets & tech', price: 'From PKR 1,500', img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=280&fit=crop', cat: 'Electronics', accent: 'from-blue-500 to-cyan-500' },
                { label: 'Fashion', sub: 'Trending styles', price: 'From PKR 799', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=280&fit=crop', cat: 'Fashion', accent: 'from-pink-500 to-rose-500' },
                { label: 'Smartphones', sub: 'Latest models', price: 'From PKR 25,000', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=280&fit=crop', cat: 'Electronics', accent: 'from-violet-500 to-purple-600' },
                { label: 'Food & snacks', sub: 'Fresh & tasty', price: 'From PKR 250', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=280&fit=crop', cat: 'Food', accent: 'from-orange-500 to-amber-500' },
              ].map((item, i) => (
                <motion.button
                  type="button"
                  key={item.label}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  onClick={() => navigate(`/products?category=${item.cat}`)}
                  className="group text-left rounded-3xl bg-white p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/80 transition-shadow hover:shadow-[0_28px_60px_-12px_rgba(124,58,237,0.35)]"
                >
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src={item.img}
                      alt=""
                      className="h-32 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className={`absolute left-3 top-3 rounded-lg bg-gradient-to-br ${item.accent} px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md`}>
                      {item.cat}
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-3">
                    <p className="font-display text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{item.label}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{item.sub}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-sm font-bold text-violet-600">{item.price}</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600 transition-all group-hover:bg-violet-600 group-hover:text-white">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Mobile / tablet category strip */}
          <div className="mt-10 flex gap-3 overflow-x-auto pb-2 pl-0.5 snap-x snap-mandatory lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { label: 'Electronics', img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&h=140&fit=crop', cat: 'Electronics' },
              { label: 'Fashion', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=140&fit=crop', cat: 'Fashion' },
              { label: 'Phones', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=140&fit=crop', cat: 'Electronics' },
              { label: 'Food', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=140&fit=crop', cat: 'Food' },
            ].map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={() => navigate(`/products?category=${item.cat}`)}
                className="snap-start shrink-0 w-[42%] max-w-[200px] overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/80 text-left"
              >
                <div className="relative h-24">
                  <img src={item.img} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2 font-display text-sm font-bold text-white">{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Wave transition to white content */}
        <div className="absolute bottom-0 left-0 right-0 text-white pointer-events-none">
          <svg className="w-full h-[48px] sm:h-[56px] block" viewBox="0 0 1440 56" preserveAspectRatio="none" aria-hidden>
            <path fill="currentColor" d="M0,24 C240,56 480,0 720,24 C960,48 1200,8 1440,32 L1440,56 L0,56 Z" />
          </svg>
        </div>
      </section>

      {/* Features Bar — airy, premium strip */}
      <section className="relative bg-white pt-2 pb-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06 }}
                className="group flex gap-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm transition-all hover:border-violet-200/80 hover:shadow-md hover:shadow-violet-500/5"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg} shadow-inner ring-1 ring-black/[0.03] transition-transform duration-300 group-hover:scale-105`}>
                  <Icon size={22} className={color} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-slate-900 text-sm">{title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600/90 mb-2">Categories</p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Shop by category</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md">Jump straight into what you need — every aisle, one marketplace.</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 self-start sm:self-auto rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 hover:gap-2"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {CATEGORIES.map(({ name, icon, color, bg }, i) => (
            <motion.div key={name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
              <Link
                to={`/products?category=${name}`}
                className={`${bg} flex flex-col items-center gap-2 rounded-2xl border border-white/80 p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 hover:ring-2 hover:ring-violet-200/60 group`}
              >
                <div className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-xl sm:text-2xl shadow-md ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  {icon}
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight group-hover:text-violet-700 transition-colors">{name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 p-8 lg:p-12 shadow-xl shadow-rose-500/20 ring-1 ring-white/20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="relative flex flex-col items-center justify-between gap-8 text-center text-white lg:flex-row lg:text-left">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-amber-100 ring-1 ring-white/25">
                Limited time
              </p>
              <h2 className="font-display text-3xl font-extrabold tracking-tight lg:text-4xl">Mega sale is live</h2>
              <p className="mt-3 max-w-lg text-lg text-white/90">
                Up to <span className="font-black text-3xl text-white drop-shadow-md">70% off</span> on selected picks — don&apos;t miss out.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/products?sort=popular')}
              className="shrink-0 rounded-2xl bg-white px-8 py-4 font-bold text-rose-600 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
            >
              Shop the sale <ArrowRight className="ml-1 inline" size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Products Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-widest text-violet-600">For you</p>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Trending picks</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1 shadow-inner">
              {[
                ['featured', 'Featured'],
                ['new', 'New'],
                ['popular', 'Popular'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                    activeTab === key ? 'bg-white text-violet-700 shadow-md ring-1 ring-slate-200/60' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-sm font-bold text-violet-600 hover:gap-2 transition-all"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-6">Be the first seller to add products!</p>
            <Link to="/register?role=seller" className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors inline-flex items-center gap-2">
              Start Selling <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12 sm:mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600 mb-2">How it works</p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Shopping made simple</h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-lg mx-auto">From browse to doorstep — four quick steps.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: '01', icon: '🔍', title: 'Browse Products', desc: 'Explore thousands of products from verified sellers' },
            { step: '02', icon: '🛒', title: 'Add to Cart', desc: 'Select items and add them to your shopping cart' },
            { step: '03', icon: '💳', title: 'Secure Checkout', desc: 'Pay safely via COD, Easypaisa, or JazzCash' },
            { step: '04', icon: '📦', title: 'Fast Delivery', desc: 'Receive your order at your doorstep' },
          ].map(({ step, icon, title, desc }, i) => (
            <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-violet-200/60 hover:shadow-lg hover:shadow-violet-500/5">
              <div className="relative mx-auto mb-4 w-fit">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-inner ring-1 ring-violet-100/50">
                  {icon}
                </div>
                <span className="absolute -top-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-700 text-[11px] font-black text-white shadow-md ring-2 ring-white">
                  {step.replace('0', '')}
                </span>
              </div>
              <h3 className="font-display font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gradient-to-r from-violet-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { value: '50,000+', label: 'Products Listed' },
              { value: '10,000+', label: 'Active Sellers' },
              { value: '200,000+', label: 'Happy Customers' },
              { value: '4.8★', label: 'Average Rating' },
              { value: '99.9%', label: 'Uptime' },
            ].map(({ value, label }) => (
              <motion.div key={label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-2 rounded-full mb-6 border border-white/20 backdrop-blur-sm">
              🚀 Join 10,000+ sellers already growing with us
            </div>
            <h2 className="font-display text-3xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Start Selling on<br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">ShopVerse Today</span>
            </h2>
            <p className="text-violet-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Set up your store in minutes. Reach millions of customers across Pakistan. Free to start, no monthly fees.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/register?role=seller"
                className="bg-white text-violet-900 font-extrabold px-10 py-4 rounded-xl hover:shadow-2xl hover:shadow-violet-500/30 transition-all flex items-center gap-2 text-lg">
                Create Your Store Free <ArrowRight size={20} />
              </Link>
              <Link to="/stores" className="border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm">
                Browse Stores
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-violet-200 text-sm">
              {['✓ Free store setup', '✓ No monthly fees', '✓ Real-time analytics', '✓ Seller protection'].map(t => (
                <span key={t} className="font-medium">{t}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
