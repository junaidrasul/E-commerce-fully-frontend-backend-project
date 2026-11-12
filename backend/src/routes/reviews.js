const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @GET /api/reviews/product/:productId
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Review.countDocuments({ product: req.params.productId });
  const stats = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } }
  ]);

  res.json({ success: true, reviews, total, stats });
}));

// @POST /api/reviews
router.post('/', protect, asyncHandler(async (req, res) => {
  const { product, rating, title, comment, orderId } = req.body;

  const existingReview = await Review.findOne({ product, user: req.user._id });
  if (existingReview) { res.status(400); throw new Error('You already reviewed this product'); }

  let isVerifiedPurchase = false;
  if (orderId) {
    const order = await Order.findOne({ _id: orderId, customer: req.user._id, 'items.product': product });
    isVerifiedPurchase = !!order;
  }

  const review = await Review.create({
    product, user: req.user._id, order: orderId, rating, title, comment, isVerifiedPurchase
  });

  const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');
  res.status(201).json({ success: true, review: populatedReview });
}));

// @PUT /api/reviews/:id
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }

  review.rating = req.body.rating || review.rating;
  review.title = req.body.title || review.title;
  review.comment = req.body.comment || review.comment;
  await review.save();

  res.json({ success: true, review });
}));

// @DELETE /api/reviews/:id
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
}));

// @PUT /api/reviews/:id/helpful
router.put('/:id/helpful', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  const idx = review.helpful.indexOf(req.user._id);
  if (idx === -1) review.helpful.push(req.user._id);
  else review.helpful.splice(idx, 1);
  await review.save();

  res.json({ success: true, helpful: review.helpful.length });
}));

module.exports = router;
