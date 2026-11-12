import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Star, Plus,
  DollarSign, Eye, BarChart2, LogOut,
  ChevronRight, Edit, Trash2, Wand2, X
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { getStatusColor, formatDate } from '../../utils/helpers';
import { getAutoProductImage } from '../../utils/autoImage';
import toast from 'react-hot-toast';

const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const SellerDashboard = () => {
  const { user, store, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [period, setPeriod] = useState('30');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', discountPrice: '', category: 'Electronics', stock: '', brand: '', images: [] });
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [autoImagePreview, setAutoImagePreview] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const { data } = await api.get(`/analytics/seller?period=${period}`);
      setAnalytics(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  }, [period]);

  const fetchProducts = useCallback(async () => {
    try {
      // Always fetch store fresh from API to avoid stale localStorage
      const { data: storeRes } = await api.get('/stores/my/store');
      const storeData = storeRes.store;
      if (!storeData) return;
      // Save fresh store to localStorage + global state
      localStorage.setItem('store', JSON.stringify(storeData));
      useAuthStore.setState({ store: storeData });
      const { data } = await api.get(`/products?store=${storeData._id}&limit=100&manage=true`);
      setProducts(data.products);
    } catch (err) {
      console.error('fetchProducts error:', err?.response?.data || err.message);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/orders/seller?limit=10');
      setOrders(data.orders);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'seller') { navigate('/login'); return; }
    const initDashboard = async () => {
      try {
        const { fetchMe } = useAuthStore.getState();
        await fetchMe();
      } catch { /* ignore */ }
      fetchAnalytics();
      fetchProducts();
      fetchOrders();
    };
    initDashboard();
  }, [period, user, navigate, fetchAnalytics, fetchProducts, fetchOrders]);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Auto-generate image if none provided
      let images = productForm.images;
      if (!images || images.length === 0) {
        const { url } = getAutoProductImage(productForm.name, productForm.brand, productForm.category);
        images = [{ url }];
      }

      const payload = {
        ...productForm,
        price: Number(productForm.price),
        discountPrice: Number(productForm.discountPrice) || 0,
        stock: Number(productForm.stock),
        images,
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast.success('Product submitted for admin approval!');
      }
      setShowAddProduct(false);
      setEditingProduct(null);
      setAutoImagePreview(null);
      setProductForm({ name: '', description: '', price: '', discountPrice: '', category: 'Electronics', stock: '', brand: '', images: [] });
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  // Update auto-image preview when name, brand, or category changes
  const updateFormField = (key, value) => {
    const updated = { ...productForm, [key]: value };
    setProductForm(updated);
    if (['name', 'brand', 'category'].includes(key) && updated.images.length === 0) {
      if (updated.name || updated.brand) {
        const { url, matched } = getAutoProductImage(updated.name, updated.brand, updated.category);
        setAutoImagePreview({ url, matched });
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product deleted');
    fetchProducts();
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const NAV_ITEMS = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  ];

  if (!user) return null;

  // Always get the freshest store data available
  const storeInfo = useAuthStore.getState().store
    || store
    || JSON.parse(localStorage.getItem('store') || 'null');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-violet-950 via-violet-900 to-purple-900 flex flex-col hidden lg:flex shrink-0 shadow-2xl">
        {/* Logo / Store Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 shrink-0">
              {storeInfo?.logo?.url ? (
                <img src={storeInfo.logo.url} alt="" className="w-11 h-11 rounded-xl object-cover" />
              ) : (
                <span className="text-white font-extrabold text-lg">{storeInfo?.name?.[0]?.toUpperCase() || 'S'}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white font-extrabold text-sm truncate">{storeInfo?.name || 'My Store'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${storeInfo?.isApproved ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <p className="text-violet-300 text-xs font-medium">
                  {storeInfo?.isApproved ? 'Live & Active' : 'Pending admin approval'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-violet-400 text-xs font-bold uppercase tracking-widest px-3 mb-3">Main Menu</p>
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                ${activeTab === id
                  ? 'bg-white text-violet-900 shadow-lg shadow-violet-900/30'
                  : 'text-violet-200 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={17} />
              {label}
              {activeTab === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-violet-200 hover:bg-red-500/20 hover:text-red-300 transition-all group">
            <LogOut size={17} className="group-hover:translate-x-0.5 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h1>
            <p className="text-sm text-gray-500">Welcome back, {user.name?.split(' ')[0]}! 👋</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>

            <Link to="/" className="text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">View Store</Link>

            {activeTab === 'products' && (
              <button onClick={() => { setShowAddProduct(true); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', discountPrice: '', category: 'Electronics', stock: '', brand: '', images: [] }); }}
                className="flex items-center gap-2 bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors">
                <Plus size={16} /> Add Product
              </button>
            )}
          </div>
        </header>

        <div className="p-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {loadingAnalytics ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
                </div>
              ) : analytics && (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Revenue', value: `PKR ${(analytics.overview.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'violet', change: '+12%' },
                      { label: 'Total Orders', value: analytics.overview.totalOrders, icon: ShoppingBag, color: 'blue', change: `${analytics.overview.recentOrders} new` },
                      { label: 'Products', value: analytics.overview.totalProducts, icon: Package, color: 'emerald', change: 'Active' },
                      { label: 'Reviews', value: analytics.overview.totalReviews, icon: Star, color: 'amber', change: `⭐ ${analytics.overview.rating || '0'}/5` },
                    ].map(({ label, value, icon: Icon, color, change }) => (
                      <motion.div key={label} whileHover={{ y: -2 }} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-11 h-11 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                            <Icon size={22} className={`text-${color}-600`} />
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{change}</span>
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                        <p className="text-sm text-gray-500 mt-1">{label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900">Revenue Overview</h3>
                      <span className="text-sm text-gray-400">Last {period} days</span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={analytics.revenueData || []}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={v => `PKR ${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(val) => [`PKR ${val.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revenueGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Order Status */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-6">Order Status Distribution</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={analytics.orderStatus || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}>
                            {(analytics.orderStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Top Products</h3>
                      <div className="space-y-3">
                        {(analytics.topProducts || []).map((product, i) => (
                          <div key={product._id} className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full text-xs font-bold flex items-center justify-center">{i + 1}</span>
                            <img src={product.images?.[0]?.url || `https://placehold.co/40x40/f3f4f6/9ca3af?text=P`} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-50" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs text-gray-400">{product.sold} sold</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">PKR {product.price?.toLocaleString()}</p>
                              <div className="flex items-center gap-0.5 justify-end">
                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                <span className="text-xs text-gray-400">{product.rating}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!analytics.topProducts || analytics.topProducts.length === 0) && (
                          <p className="text-gray-400 text-sm text-center py-6">No products yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Recent Orders</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-sm text-violet-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                        View All <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            {['Order #', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                              <th key={h} className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {(analytics.latestOrders || []).map(order => (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-2 text-sm font-semibold text-violet-700">{order.orderNumber?.split('-')[1]}</td>
                              <td className="py-3 px-2 text-sm text-gray-700">{order.customer?.name}</td>
                              <td className="py-3 px-2 text-sm font-bold text-gray-900">PKR {order.pricing?.total?.toLocaleString()}</td>
                              <td className="py-3 px-2">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                              </td>
                              <td className="py-3 px-2 text-sm text-gray-400">{formatDate(order.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(!analytics.latestOrders || analytics.latestOrders.length === 0) && (
                        <div className="text-center py-10 text-gray-400">
                          <ShoppingBag size={36} className="mx-auto mb-2 opacity-50" />
                          <p>No orders yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div>
              {showAddProduct && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-violet-200 p-6 mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">Image is automatically generated from your product name</p>
                    </div>
                    <button onClick={() => { setShowAddProduct(false); setEditingProduct(null); setAutoImagePreview(null); }}
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="grid md:grid-cols-3 gap-5">
                    {/* Image Preview Column */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <Wand2 size={14} className="text-violet-500" /> Product Image Preview
                      </label>
                      <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 aspect-square flex items-center justify-center">
                        {(productForm.images?.[0]?.url || autoImagePreview?.url) ? (
                          <>
                            <img src={productForm.images?.[0]?.url || autoImagePreview.url}
                              alt="preview" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                              <p className="text-white text-xs font-semibold flex items-center gap-1">
                                <Wand2 size={10} /> Auto-matched: <span className="opacity-80">"{autoImagePreview?.matched || 'manual'}"</span>
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6">
                            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <Wand2 size={28} className="text-violet-400" />
                            </div>
                            <p className="text-sm font-semibold text-violet-500">Magic Auto-Image</p>
                            <p className="text-xs text-violet-400 mt-1">Type the product name above to auto-generate a matching image</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center text-gray-400 mt-2">Image is automatically selected based on your product name & brand</p>
                    </div>

                    {/* Form Fields */}
                    <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                        <input type="text" value={productForm.name} onChange={e => updateFormField('name', e.target.value)}
                          placeholder="e.g. Samsung Galaxy S24 Ultra 256GB Black"
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand</label>
                        <input type="text" value={productForm.brand} onChange={e => updateFormField('brand', e.target.value)}
                          placeholder="e.g. Samsung, Nike, Khaadi"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                        <select value={productForm.category} onChange={e => updateFormField('category', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-all">
                          {['Electronics','Fashion','Food','Books','Beauty','Sports','Home','Other'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Selling Price (PKR) <span className="text-red-500">*</span></label>
                        <input type="number" value={productForm.price} onChange={e => updateFormField('price', e.target.value)}
                          placeholder="e.g. 25000" required min="1"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discounted Price <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                        <input type="number" value={productForm.discountPrice} onChange={e => updateFormField('discountPrice', e.target.value)}
                          placeholder="e.g. 19999 (leave blank for no discount)" min="0"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Available Stock <span className="text-red-500">*</span></label>
                        <input type="number" value={productForm.stock} onChange={e => updateFormField('stock', e.target.value)}
                          placeholder="e.g. 50 units in stock" required min="0"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-all" />
                      </div>
                      {productForm.price && productForm.discountPrice && Number(productForm.discountPrice) < Number(productForm.price) && (
                        <div className="sm:col-span-2">
                          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
                            <span className="text-emerald-600 font-bold">🏷️ {Math.round(((productForm.price - productForm.discountPrice) / productForm.price) * 100)}% OFF</span>
                            <span className="text-emerald-600">Customers save PKR {(productForm.price - productForm.discountPrice).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Description <span className="text-red-500">*</span></label>
                        <textarea value={productForm.description} onChange={e => updateFormField('description', e.target.value)}
                          placeholder="Write a detailed, honest description. Include features, specifications, material, size options, colors, what's included in the box, and warranty information..."
                          rows={4} required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white resize-none transition-all" />
                      </div>
                      <div className="sm:col-span-2 flex gap-3">
                        <button type="submit" disabled={saving}
                          className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm hover:shadow-lg">
                          {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                            : <><Plus size={16} /> {editingProduct ? 'Update Product' : 'Add Product'}</>}
                        </button>
                        <button type="button" onClick={() => { setShowAddProduct(false); setEditingProduct(null); setAutoImagePreview(null); }}
                          className="px-6 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">My Products ({products.length})</h3>
                </div>
                {products.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Package size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="font-semibold">No products yet</p>
                    <p className="text-sm mt-1">Add your first product to start selling!</p>
                    <button onClick={() => setShowAddProduct(true)}
                      className="mt-4 bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2 mx-auto">
                      <Plus size={16} /> Add Product
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          {['Product', 'Category', 'Price', 'Stock', 'Status', 'Sold', 'Actions'].map(h => (
                            <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {products.map(product => (
                          <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img src={product.images?.[0]?.url || `https://placehold.co/40x40/f3f4f6/9ca3af?text=P`} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-50" />
                                <span className="text-sm font-semibold text-gray-900 max-w-[160px] truncate">{product.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4"><span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-medium">{product.category}</span></td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-900">
                              PKR {(product.discountPrice > 0 ? product.discountPrice : product.price)?.toLocaleString()}
                              {product.discountPrice > 0 && <span className="text-xs text-gray-400 line-through ml-1.5">PKR {product.price?.toLocaleString()}</span>}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.stock > 10 ? 'bg-emerald-100 text-emerald-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {product.isApproved ? 'Published' : 'Pending approval'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{product.sold}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                {product.isApproved && (
                                <Link to={`/products/${product._id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Eye size={15} /></Link>
                                )}
                                <button onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, description: product.description, price: product.price, discountPrice: product.discountPrice || '', category: product.category, stock: product.stock, brand: product.brand || '', images: product.images || [] }); setShowAddProduct(true); }}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors">
                                  <Edit size={15} />
                                </button>
                                <button onClick={() => handleDeleteProduct(product._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Customer Orders</h3>
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {orders.map(order => (
                    <div key={order._id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-violet-700 text-sm">{order.orderNumber}</span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                          </div>
                          <p className="text-sm text-gray-700"><span className="font-medium">Customer:</span> {order.customer?.name} ({order.customer?.email})</p>
                          <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.createdAt)} • {order.items?.length} item(s)</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {order.items?.slice(0, 3).map(item => (
                              <span key={item._id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{item.name} x{item.quantity}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-gray-900">PKR {order.pricing?.total?.toLocaleString()}</p>
                          <p className="text-xs text-gray-400 mb-3 capitalize">{order.paymentInfo?.method} • {order.paymentInfo?.status}</p>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {['confirmed', 'processing', 'shipped', 'delivered'].filter(s => {
                              const flow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                              return flow.indexOf(s) > flow.indexOf(order.status);
                            }).slice(0, 2).map(s => (
                              <button key={s} onClick={() => handleUpdateOrderStatus(order._id, s)}
                                className="text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors capitalize font-medium">
                                Mark {s}
                              </button>
                            ))}
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <button onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                                className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium">
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-6">Revenue vs Orders</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.revenueData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px' }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Revenue (PKR)" />
                      <Bar yAxisId="right" dataKey="orders" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-6">Category Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={analytics.categoryBreakdown || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                        label={({ _id }) => _id}>
                        {(analytics.categoryBreakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
