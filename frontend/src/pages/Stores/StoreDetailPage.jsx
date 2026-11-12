import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Package, MapPin, Calendar, ChevronRight, Store, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';

const CATEGORY_COLORS = {
  Electronics: 'from-blue-600 to-cyan-500',
  Fashion: 'from-pink-600 to-rose-500',
  Food: 'from-orange-600 to-amber-500',
  Books: 'from-green-600 to-emerald-500',
  Beauty: 'from-purple-600 to-fuchsia-500',
  Sports: 'from-red-600 to-orange-500',
  Home: 'from-teal-600 to-green-500',
  Other: 'from-violet-600 to-purple-500',
};

const StoreDetailPage = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/stores/${id}`);
        setStore(data.store);
        setProducts(data.products || []);
      } catch {
        setStore(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!store) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Store size={64} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Store not found</h2>
        <Link to="/stores" className="text-violet-600 font-semibold hover:underline">← Back to Stores</Link>
      </div>
    </div>
  );

  const color = CATEGORY_COLORS[store.category] || CATEGORY_COLORS.Other;
  const initials = store.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Banner */}
      <div className={`relative h-56 bg-gradient-to-br ${color} overflow-hidden`}>
        {store.banner?.url && (
          <img src={store.banner.url} alt="" className="w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-4 left-4">
          <Link to="/stores" className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors bg-black/20 px-3 py-2 rounded-xl backdrop-blur-sm">
            <ArrowLeft size={15} /> All Stores
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Header Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 -mt-16 relative z-10 shadow-xl border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Logo */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shrink-0 border-4 border-white`}>
              {store.logo?.url
                ? <img src={store.logo.url} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                : initials
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold text-gray-900">{store.name}</h1>
                {store.isApproved && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    ✓ Verified
                  </span>
                )}
                <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {store.category || 'General'}
                </span>
              </div>
              {store.description && (
                <p className="text-gray-500 text-sm leading-relaxed mb-3 max-w-2xl">{store.description}</p>
              )}
              <div className="flex flex-wrap gap-5 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-gray-900">{store.rating?.toFixed(1) || '4.5'}</span>
                  <span>rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package size={14} className="text-gray-400" />
                  <span className="font-semibold text-gray-700">{store.totalProducts || products.length}</span>
                  <span>products</span>
                </div>
                {store.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{store.location}</span>
                  </div>
                )}
                {store.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    <span>Joined {new Date(store.createdAt).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products */}
        <div className="pb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Products from {store.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{products.length} items available</p>
            </div>
            <Link to={`/products?store=${store._id}`}
              className="text-sm text-violet-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight size={15} />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Package size={48} className="text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-600 mb-1">No products yet</h3>
              <p className="text-sm text-gray-400">This store hasn't listed any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product, i) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreDetailPage;
