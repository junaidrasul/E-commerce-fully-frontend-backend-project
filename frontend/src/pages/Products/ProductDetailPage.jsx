import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck, Shield, Package, ChevronLeft, ChevronRight, Minus, Plus, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import StarRating from '../../components/ui/StarRating';
import { formatDate } from '../../utils/helpers';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [tab, setTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, reviewRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`)
        ]);
        setProduct(prodRes.data.product);
        setReviews(reviewRes.data.reviews);
        setWishlisted(
          user?.wishlist?.some(item => (item?._id || item)?.toString() === id) || false
        );
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, user, navigate]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity}x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login first'); return; }
    await api.put(`/products/${id}/wishlist`);
    setWishlisted(!wishlisted);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/reviews', { product: id, ...reviewForm });
      setReviews([data.review, ...reviews]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!product) return null;

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const categoryFallbacks = {
    Electronics: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=600&fit=crop',
    Fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=600&fit=crop',
    Food: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop',
    Books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop',
    Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop',
    Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=600&fit=crop',
    Home: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
  };
  const images = product.images?.length > 0
    ? product.images
    : [{ url: categoryFallbacks[product.category] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop' }];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-violet-600">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-violet-600">Products</Link>
            <span>/</span>
            <Link to={`/products?category=${product.category}`} className="hover:text-violet-600">{product.category}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Images */}
            <div className="p-6 lg:p-8">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
                <img src={images[activeImg]?.url} alt={product.name} className="w-full h-full object-contain p-4" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(p => p === 0 ? images.length - 1 : p - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setActiveImg(p => p === images.length - 1 ? 0 : p + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                {product.discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                    -{product.discountPercent}% OFF
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-violet-500' : 'border-transparent'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full">{product.category}</span>
                <div className="flex gap-2">
                  <button onClick={handleWishlist}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'}`}>
                    <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
                  </button>
                  <button className="w-9 h-9 rounded-xl border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={product.rating} size={18} />
                <span className="text-sm font-semibold text-gray-700">{product.rating}/5</span>
                <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">{product.sold} sold</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                <span className="text-3xl font-extrabold text-gray-900">PKR {price.toLocaleString()}</span>
                {product.discountPrice > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">PKR {product.price.toLocaleString()}</span>
                    <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">Save PKR {(product.price - price).toLocaleString()}</span>
                  </>
                )}
              </div>

              {/* Brand & Stock */}
              <div className="flex gap-4 mb-5 text-sm">
                {product.brand && <span className="text-gray-600">Brand: <span className="font-semibold text-gray-900">{product.brand}</span></span>}
                <span className={`font-semibold ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                  {product.stock > 10 ? `✓ In Stock (${product.stock})` : product.stock > 0 ? `⚠️ Only ${product.stock} left` : '✕ Out of Stock'}
                </span>
              </div>

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 hover:bg-gray-50 transition-colors"><Minus size={16} /></button>
                    <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2.5 hover:bg-gray-50 transition-colors"><Plus size={16} /></button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                <button onClick={handleAddToCart} disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  <ShoppingCart size={20} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  Buy Now
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  [Truck, 'Free Delivery', 'Above PKR 2,000'],
                  [Shield, 'Secure Pay', '100% Safe'],
                  [Package, 'Easy Return', '30 Days'],
                ].map(([Icon, title, sub]) => (
                  <div key={title} className="text-center p-3 bg-gray-50 rounded-xl">
                    <Icon size={20} className="mx-auto text-violet-600 mb-1" />
                    <p className="text-xs font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Store info */}
              {product.store && (
                <Link to={`/stores/${product.store._id}`} className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl hover:border-violet-200 hover:bg-violet-50 transition-all">
                  {product.store.logo?.url ? (
                    <img src={product.store.logo.url} alt={product.store.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{product.store.name?.[0]}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{product.store.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-500">{product.store.rating}/5 • {product.store.numReviews} reviews</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-gray-400" />
                </Link>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-100">
            <div className="flex border-b border-gray-100 px-6 lg:px-8">
              {['description', 'specifications', 'reviews'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all capitalize ${tab === t ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {t} {t === 'reviews' && `(${product.numReviews})`}
                </button>
              ))}
            </div>

            <div className="p-6 lg:p-8">
              {tab === 'description' && (
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</div>
              )}

              {tab === 'specifications' && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {product.specifications?.map((spec, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-semibold text-gray-500 w-1/3 shrink-0">{spec.key}</span>
                      <span className="text-sm text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                  {(!product.specifications || product.specifications.length === 0) && (
                    <p className="text-gray-500">No specifications available</p>
                  )}
                </div>
              )}

              {tab === 'reviews' && (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Rating Summary */}
                  <div className="lg:col-span-1">
                    <div className="text-center p-6 bg-gray-50 rounded-2xl mb-6">
                      <div className="text-5xl font-extrabold text-gray-900 mb-2">{product.rating}</div>
                      <StarRating rating={product.rating} size={24} />
                      <p className="text-gray-500 mt-2 text-sm">Based on {product.numReviews} reviews</p>
                    </div>

                    {/* Write Review */}
                    {user && (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <h3 className="font-bold text-gray-900">Write a Review</h3>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Your Rating</label>
                          <StarRating rating={reviewForm.rating} interactive size={24} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                        </div>
                        <input type="text" placeholder="Review title" value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        <textarea placeholder="Share your experience..." rows={4} value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
                        <button type="submit" disabled={submittingReview}
                          className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50">
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div className="lg:col-span-2 space-y-4">
                    {reviews.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-3">⭐</div>
                        <p>No reviews yet. Be the first to review!</p>
                      </div>
                    ) : reviews.map((review) => (
                      <motion.div key={review._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-5 border border-gray-100 rounded-2xl hover:border-violet-100 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{review.user?.name?.[0]}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{review.user?.name}</p>
                              <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {review.isVerifiedPurchase && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                            )}
                          </div>
                        </div>
                        <StarRating rating={review.rating} size={14} />
                        <h4 className="font-semibold text-gray-900 mt-2 mb-1">{review.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
