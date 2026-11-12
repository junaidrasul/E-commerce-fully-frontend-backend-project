const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Store = require('../models/Store');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/analytics/seller - Seller dashboard analytics
router.get('/seller', protect, authorize('seller'), asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) { res.status(404); throw new Error('Store not found'); }

  const { period = '30' } = req.query;
  const days = Number(period);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Overview stats
  const totalOrders = await Order.countDocuments({ 'items.store': store._id });
  const recentOrders = await Order.countDocuments({ 'items.store': store._id, createdAt: { $gte: startDate } });
  const totalProducts = await Product.countDocuments({ store: store._id, isActive: true });
  const totalReviews = await Review.countDocuments({ product: { $in: await Product.distinct('_id', { store: store._id }) } });

  // Revenue data for chart
  const revenueData = await Order.aggregate([
    { $match: { 'items.store': store._id, createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $match: { 'items.store': store._id } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $addToSet: '$_id' }
      }
    },
    { $project: { date: '$_id', revenue: 1, orders: { $size: '$orders' }, _id: 0 } },
    { $sort: { date: 1 } }
  ]);

  // Order status distribution
  const orderStatus = await Order.aggregate([
    { $match: { 'items.store': store._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Top products
  const topProducts = await Product.find({ store: store._id }).sort('-sold').limit(5).select('name sold rating images price');

  // Recent orders
  const latestOrders = await Order.find({ 'items.store': store._id })
    .populate('customer', 'name email')
    .sort('-createdAt')
    .limit(5);

  // Category breakdown
  const categoryBreakdown = await Product.aggregate([
    { $match: { store: store._id } },
    { $group: { _id: '$category', count: { $sum: 1 }, revenue: { $sum: { $multiply: ['$price', '$sold'] } } } }
  ]);

  res.json({
    success: true,
    overview: {
      totalOrders, recentOrders, totalProducts, totalReviews,
      totalRevenue: store.totalRevenue, rating: store.rating
    },
    revenueData,
    orderStatus,
    topProducts,
    latestOrders,
    categoryBreakdown
  });
}));

// @GET /api/analytics/admin - Admin global analytics
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = Number(period);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalUsers, totalSellers, totalOrders, totalProducts, totalStores] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'seller' }),
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Store.countDocuments({ isApproved: true })
  ]);

  const totalRevenue = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' }, 'paymentInfo.status': 'paid' } },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } }
  ]);

  const revenueChart = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const newUsers = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const topStores = await Store.find({ isApproved: true }).sort('-totalRevenue').limit(5).populate('owner', 'name');

  res.json({
    success: true,
    overview: {
      totalUsers, totalSellers, totalOrders, totalProducts, totalStores,
      totalRevenue: totalRevenue[0]?.total || 0
    },
    revenueChart,
    newUsers,
    topStores
  });
}));

module.exports = router;
