const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    unique: true
  },
  slug: { type: String, unique: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  description: { type: String, default: '' },
  logo: {
    public_id: String,
    url: { type: String, default: '' }
  },
  banner: {
    public_id: String,
    url: { type: String, default: '' }
  },
  category: {
    type: String,
    enum: ['Electronics', 'Fashion', 'Food', 'Books', 'Beauty', 'Sports', 'Home', 'Other'],
    default: 'Other'
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'Pakistan' }
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  bankDetails: {
    accountTitle: String,
    accountNumber: String,
    bankName: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
