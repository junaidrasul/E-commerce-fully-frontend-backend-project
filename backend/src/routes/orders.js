const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { protect, authorize } = require('../middleware/auth');

// @POST /api/orders - Place order
router.post('/', protect, asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentInfo, pricing, notes } = req.body;

  if (!items || items.length === 0) { res.status(400); throw new Error('No order items'); }

  // Verify stock and enrich items with fresh product + store data
  const enrichedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product).populate('store', '_id');
    if (!product) {
      res.status(400);
      throw new Error(`One or more products in your cart are no longer available. Please refresh your cart.`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`"${product.name}" only has ${product.stock} units left`);
    }
    // Always use store from DB record (handles missing store in cart item)
    const storeId = product.store?._id || product.store;
    enrichedItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      quantity: item.quantity,
      store: storeId
    });
  }

  const order = await Order.create({
    customer: req.user._id,
    items: enrichedItems,
    shippingAddress, paymentInfo,
    pricing, notes,
    statusHistory: [{ status: 'pending', message: 'Order placed successfully' }]
  });

  // Reduce stock
  for (const item of enrichedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity }
    });
  }

  // Update store stats
  const storeIds = [...new Set(enrichedItems.map(i => i.store?.toString()).filter(Boolean))];
  for (const storeId of storeIds) {
    const storeItems = enrichedItems.filter(i => i.store?.toString() === storeId);
    const storeRevenue = storeItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    await Store.findByIdAndUpdate(storeId, { $inc: { totalSales: 1, totalRevenue: storeRevenue } });
  }

  const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images').populate('customer', 'name email');
  res.status(201).json({ success: true, order: populatedOrder });
}));

// @GET /api/orders/my - Get customer orders
router.get('/my', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { customer: req.user._id };
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('items.product', 'name images')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Order.countDocuments(query);
  res.json({ success: true, orders, total });
}));

// @GET /api/orders/seller - Get seller orders (or all orders for admin)
router.get('/seller', protect, authorize('seller', 'admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status } = req.query;
  let query = {};

  if (req.user.role === 'seller') {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) { res.status(404); throw new Error('Store not found'); }
    query['items.store'] = store._id;
  }
  // Admin gets all orders

  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name images')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Order.countDocuments(query);
  res.json({ success: true, orders, total });
}));

// @GET /api/orders/:id
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name images price')
    .populate('items.store', 'name logo');

  if (!order) { res.status(404); throw new Error('Order not found'); }

  const isOwner = order.customer._id.toString() === req.user._id.toString();
  const isSeller = req.user.role === 'seller';
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isSeller && !isAdmin) { res.status(403); throw new Error('Not authorized'); }

  res.json({ success: true, order });
}));

// @PUT /api/orders/:id/status - Update order status
router.put('/:id/status', protect, authorize('seller', 'admin'), asyncHandler(async (req, res) => {
  const { status, message, trackingCompany, trackingNumber, trackingUrl } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.status = status;
  order.statusHistory.push({ status, message: message || `Order ${status}` });

  if (status === 'shipped' && trackingNumber) {
    order.tracking = { company: trackingCompany, number: trackingNumber, url: trackingUrl };
  }
  if (status === 'delivered') order.deliveredAt = Date.now();
  if (status === 'cancelled') { order.cancelledAt = Date.now(); order.cancelReason = message; }

  await order.save();
  res.json({ success: true, order });
}));

// @PUT /api/orders/:id/pay - Mark as paid
router.put('/:id/pay', protect, asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.paymentInfo.status = 'paid';
  order.paymentInfo.transactionId = transactionId;
  order.paymentInfo.paidAt = Date.now();
  order.status = 'confirmed';
  order.statusHistory.push({ status: 'confirmed', message: 'Payment confirmed' });

  await order.save();
  res.json({ success: true, order });
}));

module.exports = router;
