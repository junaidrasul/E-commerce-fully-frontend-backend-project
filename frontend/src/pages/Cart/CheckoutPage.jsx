import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, Smartphone, Truck, MapPin, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Payment', 'Review'];

const CheckoutPage = () => {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  const [address, setAddress] = useState({
    name: user?.name || '', street: '', city: '', state: '', zipCode: '',
    country: 'Pakistan', phone: user?.phone || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const subtotal = getSubtotal();
  const shipping = subtotal >= 2000 ? 0 : 200;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Send minimal item info - backend will enrich from DB
      const orderItems = items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const { data } = await api.post('/orders', {
        items: orderItems,
        shippingAddress: address,
        paymentInfo: { method: paymentMethod, status: 'pending' },
        pricing: { subtotal, shippingCost: shipping, tax, total }
      });

      clearCart();
      setOrderPlaced(data.order);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order';
      toast.error(msg, { duration: 5000 });
      // If cart is stale, prompt user to refresh
      if (msg.includes('no longer available') || msg.includes('refresh')) {
        setTimeout(() => {
          if (confirm('Your cart has stale items. Clear cart and go back to shop?')) {
            clearCart();
            navigate('/products');
          }
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Order Placed! 🎉</h2>
        <p className="text-gray-500 mb-4">Your order has been placed successfully</p>
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500">Order Number</p>
          <p className="font-bold text-gray-900 text-lg">{orderPlaced.orderNumber}</p>
          <p className="text-sm text-gray-500 mt-2">Total: <span className="font-semibold text-gray-900">PKR {total.toLocaleString()}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/orders')}
            className="flex-1 bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition-colors">
            Track Order
          </button>
          <button onClick={() => navigate('/')}
            className="flex-1 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
            Home
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-violet-700' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-violet-600 text-white' : 'bg-gray-200'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-sm font-semibold hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-4 ${i < step ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Step 0: Address */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2"><MapPin size={20} className="text-violet-600" /> Delivery Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', icon: User, placeholder: 'Enter recipient full name' },
                    { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: 'e.g. +92 300 1234567' },
                    { key: 'street', label: 'Complete Street Address', icon: MapPin, placeholder: 'House no., Street no., Block, Area name', full: true },
                    { key: 'city', label: 'City', placeholder: 'e.g. Karachi, Lahore, Islamabad' },
                    { key: 'state', label: 'Province', placeholder: 'e.g. Sindh, Punjab, KPK, Balochistan' },
                    { key: 'zipCode', label: 'Postal Code', placeholder: 'e.g. 75000' },
                  ].map(({ key, label, icon: Icon, placeholder, full }) => (
                    <div key={key} className={full ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <div className="relative">
                        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                        <input type="text" value={address[key]} onChange={e => setAddress({ ...address, [key]: e.target.value })}
                          placeholder={placeholder} required
                          className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500`} />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                  if (!address.name || !address.street || !address.city || !address.phone) { toast.error('Please fill all required fields'); return; }
                  setStep(1);
                }} className="w-full mt-6 bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 transition-colors">
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2"><CreditCard size={20} className="text-violet-600" /> Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'cod', icon: Truck, label: 'Cash on Delivery', desc: 'Pay when you receive' },
                    { id: 'easypaisa', icon: Smartphone, label: 'Easypaisa', desc: 'Pay via Easypaisa mobile wallet' },
                    { id: 'jazzcash', icon: Smartphone, label: 'JazzCash', desc: 'Pay via JazzCash mobile wallet' },
                  ].map(({ id, icon: Icon, label, desc }) => (
                    <label key={id} className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all
                      ${paymentMethod === id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="hidden" />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{label}</p>
                        <p className="text-sm text-gray-500">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === id ? 'border-violet-600' : 'border-gray-300'}`}>
                        {paymentMethod === id && <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="flex-1 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={() => setStep(2)} className="flex-1 bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition-colors">Review Order</button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Review Your Order</h2>
                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={item.product._id} className="flex gap-3 items-center">
                      <img src={item.product.images?.[0]?.url || `https://placehold.co/60x60/f3f4f6/9ca3af?text=P`} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-50" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900">PKR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600"><span>Delivery to:</span><span className="font-medium">{address.city}, {address.state}</span></div>
                  <div className="flex justify-between text-sm text-gray-600"><span>Payment:</span><span className="font-medium capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {loading ? 'Placing...' : '🎉 Place Order'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `PKR ${shipping}`}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (5%)</span><span>PKR {tax.toLocaleString()}</span></div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span><span>PKR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
