import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Store, Star, Package, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Food', 'Books', 'Beauty', 'Sports', 'Home', 'Other'];

const CATEGORY_COLORS = {
  Electronics: 'from-blue-500 to-cyan-500',
  Fashion: 'from-pink-500 to-rose-500',
  Food: 'from-orange-500 to-amber-500',
  Books: 'from-green-500 to-emerald-500',
  Beauty: 'from-purple-500 to-fuchsia-500',
  Sports: 'from-red-500 to-orange-500',
  Home: 'from-teal-500 to-green-500',
  Other: 'from-gray-500 to-slate-500',
};

const StoreCard = ({ store, index }) => {
  const navigate = useNavigate();
  const initials = store.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const color = CATEGORY_COLORS[store.category] || CATEGORY_COLORS.Other;
  const rating = Number(store.rating) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/stores/${store._id}`)}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* Store Banner */}
      <div className={`h-24 bg-gradient-to-br ${color} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-8 h-8 bg-white rounded-full"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, opacity: 0.3 }} />
          ))}
        </div>
        {store.banner?.url && (
          <img src={store.banner.url} alt="" className="w-full h-full object-cover opacity-60" />
        )}
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30">
            {store.category || 'General'}
          </span>
        </div>
      </div>

      {/* Logo */}
      <div className="px-5 pb-5">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-extrabold text-lg shadow-lg -mt-7 mb-3 border-4 border-white relative z-10`}>
          {store.logo?.url
            ? <img src={store.logo.url} alt="" className="w-14 h-14 rounded-2xl object-cover" />
            : initials
          }
        </div>

        <h3 className="font-extrabold text-gray-900 text-base mb-1 group-hover:text-violet-600 transition-colors truncate">
          {store.name}
        </h3>

        {store.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {store.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="font-semibold text-gray-700">{rating ? rating.toFixed(1) : 'New'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package size={12} className="text-gray-400" />
            <span>{store.totalProducts || 0} products</span>
          </div>
          {store.location && (
            <div className="flex items-center gap-1">
              <MapPin size={11} className="text-gray-400" />
              <span className="truncate">{store.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12}
                className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
          <span className="text-xs font-bold text-violet-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Visit Store <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [total, setTotal] = useState(0);

  const fetchStores = useCallback(async () => {
    try {
      const params = { limit: 50 };
      if (selectedCategory !== 'All') params.category = selectedCategory;
      const { data } = await api.get('/stores', { params });
      setStores(data.stores || []);
      setTotal(data.total || 0);
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchStores();
    });
    return () => { active = false; };
  }, [fetchStores]);

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setLoading(true);
    setSelectedCategory(category);
  };

  const filtered = stores.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-purple-700 py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-800/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-2 rounded-full mb-4 border border-white/20 backdrop-blur-sm">
              <Store size={14} />
              <span>{total.toLocaleString()} Verified Sellers on ShopVerse</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
              Discover Amazing Stores
            </h1>
            <p className="text-violet-200 text-lg mb-8 max-w-xl mx-auto">
              Browse verified sellers across all categories. Find your favourite stores and shop with confidence.
            </p>

            {/* Search */}
            <div className="max-w-lg mx-auto relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search stores by name or category..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-sm focus:outline-none shadow-xl placeholder:text-gray-400"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {search ? `${filtered.length} stores found for "${search}"` : `Showing ${filtered.length} stores`}
            </p>
            {selectedCategory !== 'All' && (
              <button onClick={() => handleCategoryChange('All')}
                className="text-xs text-violet-600 font-semibold hover:underline">
                Clear filter ✕
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-24 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-200 -mt-7" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Store size={40} className="text-violet-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Stores Found</h3>
            <p className="text-gray-400 mb-6">
              {search ? `No stores match "${search}"` : 'No stores available in this category yet.'}
            </p>
            <div className="flex gap-3 justify-center">
              {search && (
                <button onClick={() => setSearch('')}
                  className="bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  Clear Search
                </button>
              )}
              <Link to="/register?role=seller"
                className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2">
                <ShoppingBag size={16} /> Become a Seller
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((store, i) => (
              <StoreCard key={store._id} store={store} index={i} />
            ))}
          </div>
        )}

        {/* Become a Seller CTA */}
        {!loading && filtered.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-8 text-center text-white">
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="text-2xl font-extrabold mb-2">Want to Sell Here?</h3>
            <p className="text-violet-200 mb-6">Open your store for free and reach thousands of customers across Pakistan</p>
            <Link to="/register?role=seller"
              className="inline-flex items-center gap-2 bg-white text-violet-700 font-extrabold px-8 py-3.5 rounded-xl hover:shadow-xl transition-all">
              Start Selling Today <ChevronRight size={18} />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StoresPage;
