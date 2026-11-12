const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
const { protect, authorize, optionalProtect } = require('../middleware/auth');
const slugify = require('slugify');

const buildProductQuery = async (req) => {
  const { keyword, category, minPrice, maxPrice, rating, store, featured, manage } = req.query;
  const query = { isActive: true };

  const isManageView = manage === 'true' && req.user && ['seller', 'admin'].includes(req.user.role);

  if (!isManageView) {
    query.isApproved = true;
    const approvedStoreIds = await Store.distinct('_id', { isApproved: true, isActive: true });
    query.store = { $in: approvedStoreIds };
  }

  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) })
    };
  }
  if (rating) query.rating = { $gte: Number(rating) };
  if (featured === 'true') query.isFeatured = true;

  if (store) {
    if (isManageView && req.user.role === 'seller') {
      const sellerStore = await Store.findOne({ owner: req.user._id });
      if (!sellerStore || sellerStore._id.toString() !== store) {
        res.status(403);
        throw new Error('Not authorized to view this store');
      }
      query.store = store;
    } else if (isManageView && req.user.role === 'admin') {
      query.store = store;
    } else {
      query.store = store;
    }
  }

  return query;
};

// @GET /api/products - Get all products with filters
router.get('/', optionalProtect, asyncHandler(async (req, res) => {
  const { sort, page = 1, limit = 12 } = req.query;
  const query = await buildProductQuery(req);

  const sortOptions = {
    newest: '-createdAt', oldest: 'createdAt', 'price-asc': 'price',
    'price-desc': '-price', rating: '-rating', popular: '-sold'
  };
  const sortBy = sortOptions[sort] || '-createdAt';

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('store', 'name slug logo isApproved')
    .sort(sortBy)
    .skip(skip)
    .limit(Number(limit));

  res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}));

// @GET /api/products/categories - Get category stats
router.get('/categories', asyncHandler(async (req, res) => {
  const approvedStoreIds = await Store.distinct('_id', { isApproved: true, isActive: true });
  const categories = await Product.aggregate([
    { $match: { isActive: true, isApproved: true, store: { $in: approvedStoreIds } } },
    { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
    { $sort: { count: -1 } }
  ]);
  res.json({ success: true, categories });
}));

// @GET /api/products/pending - Admin: products awaiting approval
router.get('/pending', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const products = await Product.find({ isApproved: false, isActive: true })
    .populate('store', 'name owner')
    .populate('seller', 'name email')
    .sort('-createdAt');
  res.json({ success: true, products });
}));

// @GET /api/products/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('store', 'name slug logo rating numReviews isApproved')
    .populate('seller', 'name avatar');
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const store = await Store.findById(product.store);
  if (!product.isApproved || !store?.isApproved) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.views += 1;
  await product.save({ validateBeforeSave: false });
  res.json({ success: true, product });
}));

// @POST /api/products - Create product (seller)
router.post('/', protect, authorize('seller'), asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) { res.status(404); throw new Error('Store not found'); }
  if (!store.isApproved) {
    res.status(403);
    throw new Error('Your store must be approved by admin before listing products');
  }

  const { name, description, price, discountPrice, category, subcategory, tags, brand, stock, images, specifications, shippingInfo, variants } = req.body;

  const discountPercent = discountPrice > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();

  const product = await Product.create({
    name, slug, description, price, discountPrice: discountPrice || 0, discountPercent,
    category, subcategory, tags, brand, stock, images: images || [],
    specifications: specifications || [], shippingInfo, variants: variants || [],
    store: store._id, seller: req.user._id, isApproved: false
  });

  res.status(201).json({
    success: true,
    product,
    message: 'Product submitted. It will appear in the shop after admin approval.'
  });
}));

// @PUT /api/products/:id/approve - Admin approves product
router.put('/:id/approve', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  product.isApproved = true;
  await product.save({ validateBeforeSave: false });
  res.json({ success: true, product, message: 'Product approved and published' });
}));

// @PUT /api/products/:id/reject - Admin rejects (deactivates) product
router.put('/:id/reject', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  product.isApproved = false;
  product.isActive = false;
  await product.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Product rejected' });
}));

// @PUT /api/products/:id - Update product
router.put('/:id', protect, authorize('seller', 'admin'), asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  if (req.body.price && req.body.discountPrice) {
    req.body.discountPercent = Math.round(((req.body.price - req.body.discountPrice) / req.body.price) * 100);
  }

  if (req.user.role === 'seller' && req.body.isApproved !== undefined) {
    delete req.body.isApproved;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, product });
}));

// @DELETE /api/products/:id
router.delete('/:id', protect, authorize('seller', 'admin'), asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
}));

// @PUT /api/products/:id/wishlist
router.put('/:id/wishlist', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const isWishlisted = user.wishlist.includes(req.params.id);
  if (isWishlisted) {
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.id);
  } else {
    user.wishlist.push(req.params.id);
  }
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, wishlisted: !isWishlisted, wishlist: user.wishlist });
}));

module.exports = router;
