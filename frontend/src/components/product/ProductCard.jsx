import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(
    user?.wishlist?.some(item => (item?._id || item)?.toString() === product._id?.toString()) || false
  );
  const [imgError, setImgError] = useState(false);

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success('Added to cart!', { duration: 1500 });
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to save items ❤️'); return; }
    try {
      await api.put(`/products/${product._id}/wishlist`);
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? 'Removed from wishlist' : '❤️ Saved to wishlist!');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const categoryImages = {
    Electronics: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=400&fit=crop',
    Fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
    Food: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    Books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
    Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',
    Home: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    Other: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  };
  const fallbackImg = categoryImages[product.category] || categoryImages.Other;
  const imgSrc = (!imgError && product.images?.[0]?.url) ? product.images[0].url : fallbackImg;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="group">
      <Link to={`/products/${product._id}`} className="block">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-violet-100 transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <img
              src={imgSrc}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {hasDiscount && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  -{product.discountPercent}%
                </span>
              )}
              {product.stock === 0 && (
                <span className="bg-gray-800 text-white text-xs font-medium px-2.5 py-1 rounded-full">Out of Stock</span>
              )}
              {product.isFeatured && (
                <span className="bg-amber-400 text-white text-xs font-bold px-2.5 py-1 rounded-full">Featured</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleWishlist}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors
                  ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
              >
                <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); navigate(`/products/${product._id}`); }}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 hover:bg-violet-50 hover:text-violet-600 transition-colors"
              >
                <Eye size={16} />
              </button>
            </div>

            {/* Quick Add to Cart */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-violet-600 text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={16} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-violet-600 font-medium mb-1">{product.category}</p>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={12} className={s <= product.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.numReviews || 0})</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-gray-900">
                  PKR {price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through ml-2">
                    PKR {product.price.toLocaleString()}
                  </span>
                )}
              </div>
              {product.sold > 0 && (
                <span className="text-xs text-gray-400">{product.sold} sold</span>
              )}
            </div>

            {/* Store */}
            {product.store && (
              <p className="text-xs text-gray-400 mt-2 truncate">
                by <span className="text-gray-600 font-medium">{product.store.name}</span>
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
