import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { getStatusColor, formatDate } from '../../utils/helpers';

const STATUS_ICONS = {
  pending: Clock, confirmed: CheckCircle, processing: RefreshCw,
  shipped: Truck, delivered: CheckCircle, cancelled: XCircle, refunded: RefreshCw
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my?limit=50');
        setOrders(data.orders);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">My Orders</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize
                ${filter === s ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'}`}>
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
            <Link to="/products" className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors inline-flex items-center gap-2">
              Start Shopping <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const StatusIcon = STATUS_ICONS[order.status] || Clock;
              const isExpanded = expandedOrder === order._id;
              const currentStep = STEPS.indexOf(order.status);

              return (
                <motion.div key={order._id} layout className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm hover:border-violet-100 transition-all">
                  <div className="p-5 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-900">{order.orderNumber}</span>
                          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            <StatusIcon size={12} /> {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)} • {order.items?.length} item(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-gray-900">PKR {order.pricing?.total?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 capitalize">{order.paymentInfo?.method}</p>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {order.items?.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                          <img src={item.image || `https://placehold.co/30x30/f3f4f6/9ca3af?text=P`} alt="" className="w-6 h-6 rounded object-cover" />
                          <span className="text-xs text-gray-700 font-medium max-w-[100px] truncate">{item.name}</span>
                          <span className="text-xs text-gray-400">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-gray-100 p-5 bg-gray-50">
                      {/* Progress */}
                      {order.status !== 'cancelled' && order.status !== 'refunded' && (
                        <div className="mb-5">
                          <div className="flex items-center justify-between relative">
                            {STEPS.map((step, i) => (
                              <div key={step} className="flex flex-col items-center relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                  ${i <= currentStep ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                  {i < currentStep ? '✓' : i + 1}
                                </div>
                                <span className="text-xs mt-1 text-gray-500 capitalize hidden sm:block">{step}</span>
                              </div>
                            ))}
                            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0">
                              <div className="h-full bg-violet-600 transition-all" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-2">Delivery Address</h4>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress?.name}<br />
                            {order.shippingAddress?.street}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                            {order.shippingAddress?.country}
                          </p>
                        </div>
                        {order.tracking?.number && (
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2">Tracking</h4>
                            <p className="text-sm text-gray-600">{order.tracking.company}</p>
                            <p className="text-sm font-mono text-violet-700">{order.tracking.number}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <img src={item.image || `https://placehold.co/40x40/f3f4f6/9ca3af?text=P`} alt="" className="w-8 h-8 rounded-lg object-cover bg-white" />
                                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                              </div>
                              <span className="font-semibold text-gray-900">PKR {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
