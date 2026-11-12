import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 2000 ? 0 : 200;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!user) { toast.error('Please login to checkout'); navigate('/login', { state: { from: '/checkout' } }); return; }
    navigate('/checkout');
  };

  if (items.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
        <Link to="/products" className="bg-violet-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-violet-700 transition-colors inline-flex items-center gap-2">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Shopping Cart <span className="text-violet-600">({items.length} items)</span></h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors">
            <Trash2 size={15} /> Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div key={item.product._id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-sm hover:border-violet-100 transition-all">
                  <Link to={`/products/${item.product._id}`}>
                    <img
                      src={item.product.images?.[0]?.url || `https://placehold.co/100x100/f3f4f6/9ca3af?text=Product`}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-xl bg-gray-50"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product._id}`}>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug hover:text-violet-600 transition-colors line-clamp-2">{item.product.name}</h3>
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">{item.product.category}</p>
                    {item.variant && <p className="text-xs text-gray-500 mt-1">Variant: {item.variant}</p>}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50 transition-colors"><Minus size={14} /></button>
                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-50 transition-colors"><Plus size={14} /></button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900">PKR {(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">PKR {item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => { removeItem(item.product._id); toast.success('Removed from cart'); }}
                    className="self-start text-gray-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium text-gray-900">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {shipping === 0 ? 'FREE' : `PKR ${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2.5 rounded-xl">
                    Add PKR {(2000 - subtotal).toLocaleString()} more for FREE shipping
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2 mb-5">
                <div className="relative flex-1">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Promo code"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <button className="bg-gray-100 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-colors">Apply</button>
              </div>

              <button onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-violet-200 flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center gap-3 mt-4">
                {['🔒 Secure', '💳 Multiple Payment', '📦 Fast Delivery'].map(text => (
                  <span key={text} className="text-xs text-gray-400">{text}</span>
                ))}
              </div>

              <Link to="/products" className="flex items-center justify-center gap-2 mt-4 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors">
                <ShoppingBag size={16} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
