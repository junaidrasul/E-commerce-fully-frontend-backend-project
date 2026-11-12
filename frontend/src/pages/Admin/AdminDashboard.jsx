import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, ShoppingBag, Package,
  LogOut, CheckCircle, XCircle, Eye, Trash2, ChevronRight,
  DollarSign, UserCheck, AlertCircle, RefreshCw, Shield
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { getStatusColor, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, sellersRes, storesRes, ordersRes, productsRes, pendingRes] = await Promise.all([
        api.get(`/analytics/admin?period=${period}`),
        api.get('/auth/admin/users'),
        api.get('/auth/admin/sellers'),
        api.get('/stores/admin/all?limit=100'),
        api.get('/orders/seller'),
        api.get('/products?limit=100&manage=true'),
        api.get('/products/pending'),
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data.users || []);
      setSellers(sellersRes.data.sellers || []);
      setStores(storesRes.data.stores || []);
      setOrders(ordersRes.data.orders || []);
      setProducts(productsRes.data.products || []);
      setPendingProducts(pendingRes.data.products || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchAll();
    });
    return () => { active = false; };
  }, [user, navigate, fetchAll]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleApproveProduct = async (id) => {
    try {
      await api.put(`/products/${id}/approve`);
      toast.success('Product approved');
      fetchAll();
    } catch { toast.error('Failed to approve product'); }
  };

  const handleRejectProduct = async (id) => {
    if (!confirm('Reject this product?')) return;
    try {
      await api.put(`/products/${id}/reject`);
      toast.success('Product rejected');
      fetchAll();
    } catch { toast.error('Failed to reject product'); }
  };

  const NAV_ITEMS = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'sellers', icon: UserCheck, label: 'Sellers' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'stores', icon: Store, label: 'Stores' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'products', icon: Package, label: 'Products' },
  ];

  if (!user) return null;

  const overview = analytics?.overview || {};

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col hidden lg:flex shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Admin Panel</p>
              <p className="text-slate-400 text-xs">ShopVerse</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === id ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <Eye size={18} /> View Store
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h1>
            <p className="text-sm text-gray-500">Admin Dashboard • {user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button onClick={fetchAll} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'Total Revenue', value: `PKR ${(overview.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'violet', sub: 'All time' },
                      { label: 'Total Orders', value: overview.totalOrders || 0, icon: ShoppingBag, color: 'blue', sub: 'Placed orders' },
                      { label: 'Customers', value: overview.totalUsers || 0, icon: Users, color: 'emerald', sub: 'Registered' },
                      { label: 'Sellers', value: overview.totalSellers || 0, icon: UserCheck, color: 'orange', sub: 'Active vendors' },
                      { label: 'Products', value: overview.totalProducts || 0, icon: Package, color: 'purple', sub: 'Listed' },
                      { label: 'Stores', value: overview.totalStores || 0, icon: Store, color: 'cyan', sub: 'Approved' },
                    ].map(({ label, value, icon: Icon, color, sub }) => (
                      <motion.div key={label} whileHover={{ y: -2 }}
                        className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                        <div className={`w-11 h-11 bg-${color}-100 rounded-xl flex items-center justify-center mb-4`}>
                          <Icon size={22} className={`text-${color}-600`} />
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                        <p className="text-sm text-gray-500 mt-1">{label}</p>
                        <p className="text-xs text-gray-400">{sub}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-6">Revenue Trend</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={analytics?.revenueChart || []}>
                          <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={{ borderRadius: '12px' }} formatter={v => [`PKR ${v.toLocaleString()}`, 'Revenue']} />
                          <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#grad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-6">New Users Per Day</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={analytics?.newUsers || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px' }} />
                          <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} name="New Users" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Stores */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Top Stores by Revenue</h3>
                      <button onClick={() => setActiveTab('stores')} className="text-sm text-violet-600 font-semibold flex items-center gap-1">
                        View All <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(analytics?.topStores || []).map((store, i) => (
                        <div key={store._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <span className="w-7 h-7 bg-violet-100 text-violet-700 rounded-full text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{store.name}</p>
                            <p className="text-xs text-gray-400">{store.category} • {store.owner?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-sm">PKR {store.totalRevenue?.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">{store.totalSales} orders</p>
                          </div>
                        </div>
                      ))}
                      {(!analytics?.topStores || analytics.topStores.length === 0) && (
                        <p className="text-center text-gray-400 py-6">No store data yet</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* SELLERS */}
          {activeTab === 'sellers' && (
            <motion.div className="space-y-6">
              {pendingProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-3">
                    <AlertCircle size={18} /> {pendingProducts.length} product(s) awaiting approval
                  </h3>
                  <div className="space-y-2">
                    {pendingProducts.slice(0, 5).map(p => (
                      <div key={p._id} className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl p-3 border border-amber-100">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.store?.name} • {p.seller?.name} ({p.seller?.email})</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveProduct(p._id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-1">
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button onClick={() => handleRejectProduct(p._id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1">
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">All Seller Accounts</h3>
                  <span className="text-sm text-gray-400">{sellers.length} sellers</span>
                </div>
                {sellers.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <UserCheck size={40} className="mx-auto mb-3 opacity-40" />
                    <p>No seller accounts yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {['Seller', 'Email', 'Store', 'Category', 'Store Status', 'Joined'].map(h => (
                            <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {sellers.map(s => (
                          <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{s.name?.[0]}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{s.email}</td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{s.store?.name || '—'}</td>
                            <td className="py-3 px-4">
                              {s.store ? (
                                <span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-medium">{s.store.category}</span>
                              ) : '—'}
                            </td>
                            <td className="py-3 px-4">
                              {s.store ? (
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.store.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {s.store.isApproved ? 'Approved' : 'Pending'}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">No store</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400">{formatDate(s.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">All Users</h3>
                <span className="text-sm text-gray-400">{users.length} total</span>
              </div>
              {users.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users size={40} className="mx-auto mb-3 opacity-40" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{u.name?.[0]}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize
                              ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'seller' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-400">{formatDate(u.createdAt)}</td>
                          <td className="py-3 px-4">
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STORES */}
          {activeTab === 'stores' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">All Stores</h3>
                <span className="text-sm text-gray-400">{stores.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Store', 'Category', 'Revenue', 'Sales', 'Rating', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stores.map(store => (
                      <tr key={store._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{store.name?.[0]}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{store.name}</p>
                              <p className="text-xs text-gray-400">{store.owner?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-medium">{store.category}</span>
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">PKR {store.totalRevenue?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{store.totalSales}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">⭐ {store.rating}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${store.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {store.isApproved ? '✓ Approved' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(`/stores/${store._id}`, { isApproved: !store.isApproved });
                                  toast.success(store.isApproved ? 'Store suspended' : 'Store approved');
                                  fetchAll();
                                } catch { toast.error('Failed'); }
                              }}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${store.isApproved ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                              {store.isApproved ? 'Suspend' : 'Approve'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {stores.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Store size={36} className="mx-auto mb-2 opacity-40" />
                    <p>No stores registered yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">All Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-bold text-violet-700">{order.orderNumber}</td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900">{order.customer?.name}</p>
                          <p className="text-xs text-gray-400">{order.customer?.email}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{order.items?.length}</td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">PKR {order.pricing?.total?.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${getStatusColor(order.paymentInfo?.status)}`}>
                            {order.paymentInfo?.method}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <ShoppingBag size={36} className="mx-auto mb-2 opacity-40" />
                    <p>No orders yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">All Products</h3>
                <span className="text-sm text-gray-400">{products.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Product', 'Category', 'Store', 'Price', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=40&h=40&fit=crop'}
                              alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-50" />
                            <span className="text-sm font-semibold text-gray-900 max-w-[150px] truncate">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-medium">{p.category}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{p.store?.name}</td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">
                          PKR {(p.discountPrice > 0 ? p.discountPrice : p.price)?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {!p.isApproved && (
                              <button onClick={() => handleApproveProduct(p._id)}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100">
                                Approve
                              </button>
                            )}
                            {p.isApproved && (
                              <Link to={`/products/${p._id}`}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                <Eye size={15} />
                              </Link>
                            )}
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this product?')) return;
                                try { await api.delete(`/products/${p._id}`); toast.success('Deleted'); fetchAll(); }
                                catch { toast.error('Failed'); }
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
