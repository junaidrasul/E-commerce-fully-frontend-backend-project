export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const truncate = (str, n) => str?.length > n ? str.substr(0, n - 1) + '...' : str;

export const getRatingStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? 'full' : i < rating ? 'half' : 'empty');
};

export const CATEGORIES = ['Electronics', 'Fashion', 'Food', 'Books', 'Beauty', 'Sports', 'Home', 'Other'];

export const CATEGORY_ICONS = {
  Electronics: '💻', Fashion: '👗', Food: '🍔', Books: '📚',
  Beauty: '💄', Sports: '⚽', Home: '🏠', Other: '📦'
};
