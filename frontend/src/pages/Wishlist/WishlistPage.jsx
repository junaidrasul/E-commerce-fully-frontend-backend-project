import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { addItem } = useCartStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchWishlist = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      const wishlist = data.user.wishlist || [];

      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // /auth/me populates wishlist with full product objects
      // Handle both cases: populated objects OR plain IDs (string/ObjectId)
      const isPopulated = wishlist[0] && typeof wishlist[0] === 'object' && wishlist[0].name;

      if (isPopulated) {
        setProducts(wishlist.filter(p => p && p._id));
      } else {
        // Fallback: fetch products by ID
        const results = await Promise.all(
          wishlist.map(id =>
            api.get(`/products/${id}`).then(r => r.data.product).catch(() => null)
          )
        );
        setProducts(results.filter(Boolean));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchWishlist();
    });
    return () => { active = false; };
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemoving(productId);
    try {
      await api.put(`/products/${productId}/wishlist`);
      setProducts(prev => prev.filter(p => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleMoveAllToCart = () => {
    products.forEach(p => addItem(p, 1));
    toast.success(`${products.length} items added to cart! 🛒`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Heart size={20} className="text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">My Wishlist</h1>
              <p className="text-sm text-gray-500">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {products.length > 0 && (
            <button
              onClick={handleMoveAllToCart}
              className="flex items-center gap-2 bg-violet-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors text-sm shadow-sm"
            >
              <ShoppingCart size={16} /> Move All to Cart
            </button>
          )}
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-24">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-red-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Save items you love by clicking the heart icon on any product
            </p>
            <Link to="/products"
              className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-violet-700 transition-colors shadow-sm">
              Discover Products <ArrowRight size={18} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {products.map((product) => {
                const price = product.discountPrice > 0 ? product.discountPrice : product.price;
                const hasDiscount = product.discountPrice > 0;
                const imgSrc = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-violet-100 transition-all duration-300 group"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <Link to={`/products/${product._id}`}>
                        <img src={imgSrc} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </Link>

                      {hasDiscount && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          -{product.discountPercent}%
                        </span>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white text-gray-800 font-bold text-sm px-4 py-2 rounded-full">Out of Stock</span>
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(product._id)}
                        disabled={removing === product._id}
                        className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                      >
                        {removing === product._id
                          ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Heart size={16} fill="currentColor" />
                        }
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-xs text-violet-600 font-medium mb-1">{product.category}</p>
                      <Link to={`/products/${product._id}`}>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug hover:text-violet-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Stars */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`text-xs ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">({product.numReviews})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-extrabold text-gray-900">PKR {price.toLocaleString()}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">PKR {product.price.toLocaleString()}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart size={15} />
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button
                          onClick={() => handleRemove(product._id)}
                          className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
