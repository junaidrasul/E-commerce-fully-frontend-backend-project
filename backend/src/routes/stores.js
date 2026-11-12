const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Store = require('../models/Store');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/stores/my/store - Seller's own store (must be before /:id)
router.get('/my/store', protect, authorize('seller'), asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) { res.status(404); throw new Error('Store not found'); }
  res.json({ success: true, store });
}));

// @GET /api/stores/admin/all - Admin: all stores including pending
router.get('/admin/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const stores = await Store.find()
    .populate('owner', 'name email phone createdAt')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Store.countDocuments();
  res.json({ success: true, stores, total });
}));

// @GET /api/stores
router.get('/', asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 12 } = req.query;
  const query = { isApproved: true, isActive: true };
  if (category) query.category = category;

  const stores = await Store.find(query)
    .populate('owner', 'name avatar')
    .sort('-totalRevenue')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Store.countDocuments(query);
  res.json({ success: true, stores, total });
}));

// @GET /api/stores/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).populate('owner', 'name avatar');
  if (!store) { res.status(404); throw new Error('Store not found'); }
  if (!store.isApproved) { res.status(404); throw new Error('Store not found'); }

  const products = await Product.find({ store: store._id, isActive: true, isApproved: true })
    .sort('-createdAt')
    .limit(8);
  res.json({ success: true, store, products });
}));

// @PUT /api/stores/:id
router.put('/:id', protect, authorize('seller', 'admin'), asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) { res.status(404); throw new Error('Store not found'); }
  if (store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  const allowed = req.user.role === 'admin'
    ? req.body
    : (({ name, description, logo, banner, category, address, contact, socialMedia, bankDetails }) =>
      ({ name, description, logo, banner, category, address, contact, socialMedia, bankDetails }))(req.body);

  const updatedStore = await Store.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
  res.json({ success: true, store: updatedStore });
}));

module.exports = router;
