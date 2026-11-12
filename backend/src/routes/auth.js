const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Store = require('../models/Store');
const { generateToken, protect, authorize } = require('../middleware/auth');
const slugify = require('slugify');

// @POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role, storeName, storeCategory } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error('Email already registered'); }

  const user = await User.create({ name, email, password, role: role || 'customer' });

  let newStore = null;
  if (role === 'seller' && storeName) {
    const slug = slugify(storeName, { lower: true, strict: true }) + '-' + Date.now();
    newStore = await Store.create({
      name: storeName,
      slug,
      owner: user._id,
      category: storeCategory || 'Other',
      isApproved: false
    });
  }

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    store: newStore
  });
}));

// @POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error('Please provide email and password'); }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); throw new Error('Invalid email or password');
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  let store = null;
  if (user.role === 'seller') {
    store = await Store.findOne({ owner: user._id });
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    store
  });
}));

// @GET /api/auth/me
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  let store = null;
  if (user.role === 'seller') store = await Store.findOne({ owner: user._id });
  res.json({ success: true, user, store });
}));

// @PUT /api/auth/profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, phone, addresses, avatar, bio } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (phone !== undefined) update.phone = phone;
  if (addresses !== undefined) update.addresses = addresses;
  if (bio !== undefined) update.bio = bio;
  if (avatar && typeof avatar === 'object' && avatar.url) {
    update.avatar = {
      public_id: avatar.public_id || '',
      url: avatar.url
    };
  }
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
  res.json({ success: true, user });
}));

// @PUT /api/auth/password
router.put('/password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401); throw new Error('Current password is wrong');
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
}));

// @GET /api/auth/admin/sellers - All seller accounts with store info
router.get('/admin/sellers', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const sellers = await User.find({ role: 'seller' }).sort('-createdAt').select('-password');
  const stores = await Store.find({ owner: { $in: sellers.map(s => s._id) } });
  const storeByOwner = Object.fromEntries(stores.map(s => [s.owner.toString(), s]));

  const sellersWithStores = sellers.map(seller => ({
    ...seller.toObject(),
    store: storeByOwner[seller._id.toString()] || null
  }));

  res.json({ success: true, sellers: sellersWithStores, total: sellersWithStores.length });
}));

// @GET /api/auth/admin/users - Admin only
router.get('/admin/users', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, role } = req.query;
  const query = {};
  if (role) query.role = role;
  const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
  const total = await User.countDocuments(query);
  res.json({ success: true, users, total });
}));

// @DELETE /api/auth/admin/users/:id - Admin only
router.delete('/admin/users/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) { res.status(400); throw new Error('Cannot delete yourself'); }
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
}));

module.exports = router;
