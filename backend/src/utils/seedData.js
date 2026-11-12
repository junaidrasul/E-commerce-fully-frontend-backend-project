const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

const PRODUCTS = [
  {
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Electronics', price: 280000, discountPrice: 250000, stock: 15, brand: 'Samsung',
    description: 'Latest flagship smartphone with 200MP camera, S-Pen, and AI features. 12GB RAM, 256GB Storage.',
    images: [{ url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop' }],
    isFeatured: true
  },
  {
    name: 'Apple MacBook Air M3',
    category: 'Electronics', price: 450000, discountPrice: 420000, stock: 8, brand: 'Apple',
    description: 'Ultra-thin laptop with M3 chip, 18-hour battery life, 256GB SSD.',
    images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop' }],
    isFeatured: true
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Electronics', price: 85000, discountPrice: 72000, stock: 25, brand: 'Sony',
    description: 'Industry-leading noise cancellation headphones with 30-hour battery life.',
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop' }],
    isFeatured: true
  },
  {
    name: "Men's Classic Polo T-Shirt",
    category: 'Fashion', price: 2500, discountPrice: 1800, stock: 100, brand: 'Breakout',
    description: 'Premium 100% cotton polo shirt with embroidered logo.',
    images: [{ url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=600&fit=crop' }]
  },
  {
    name: "Women's Embroidered Kurta",
    category: 'Fashion', price: 4500, discountPrice: 3500, stock: 60, brand: 'Khaadi',
    description: 'Beautiful embroidered kurta with intricate thread work.',
    images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=600&fit=crop' }],
    isFeatured: true
  },
  {
    name: 'Chicken BBQ Pizza (Large)',
    category: 'Food', price: 1200, stock: 999, brand: "Chef's Kitchen",
    description: 'Freshly made 14-inch pizza loaded with BBQ chicken and mozzarella.',
    images: [{ url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop' }]
  },
  {
    name: 'Clean Code by Robert Martin',
    category: 'Books', price: 3500, stock: 40, brand: 'Pearson',
    description: 'A Handbook of Agile Software Craftsmanship.',
    images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop' }]
  },
  {
    name: "L'Oreal Paris Revitalift Serum",
    category: 'Beauty', price: 3800, discountPrice: 3200, stock: 50, brand: "L'Oreal",
    description: 'Anti-aging face serum with Vitamin C and Hyaluronic Acid.',
    images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop' }]
  },
  {
    name: 'Adidas Ultraboost 23',
    category: 'Sports', price: 28000, discountPrice: 22000, stock: 30, brand: 'Adidas',
    description: 'Premium running shoes featuring BOOST midsole.',
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop' }],
    isFeatured: true
  },
  {
    name: 'Wooden Study Table',
    category: 'Home', price: 15000, discountPrice: 12000, stock: 12, brand: 'Home Express',
    description: 'Modern solid wood study table with storage drawers.',
    images: [{ url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=600&fit=crop' }]
  },
  {
    name: 'Xiaomi Smart Band 8 Pro',
    category: 'Electronics', price: 12000, discountPrice: 9500, stock: 45, brand: 'Xiaomi',
    description: 'Advanced fitness tracker with AMOLED display and GPS.',
    images: [{ url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop' }]
  },
  {
    name: 'Cricket Kit Complete Set',
    category: 'Sports', price: 18000, stock: 20, brand: 'GM',
    description: 'Professional cricket kit with bat, pads, gloves, and helmet.',
    images: [{ url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&h=600&fit=crop' }],
    isFeatured: true
  },
];

const runSeed = async ({ clear = false } = {}) => {
  if (clear) {
    await Promise.all([
      User.deleteMany(), Store.deleteMany(), Product.deleteMany(),
      Order.deleteMany(), Review.deleteMany()
    ]);
    console.log('🗑️  Cleared existing data');
  }

  const hashed = await bcrypt.hash('demo123', 12);

  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@gmail.com', password: hashed, role: 'admin' },
    { name: 'Ahmed Tech Store', email: 'seller@gmail.com', password: hashed, role: 'seller' },
    { name: 'Fashion Hub', email: 'seller2@gmail.com', password: hashed, role: 'seller' },
    { name: 'Muhammad Ali', email: 'customer@gmail.com', password: hashed, role: 'customer' },
  ]);
  const [, seller, seller2, customer] = users;

  const store1 = await Store.create({
    name: 'Ahmed Tech Store', slug: 'ahmed-tech-store', owner: seller._id,
    category: 'Electronics', description: 'Your trusted tech partner in Pakistan',
    isApproved: true, totalSales: 150, totalRevenue: 2500000, rating: 4.5, numReviews: 85
  });

  const store2 = await Store.create({
    name: 'Fashion Hub Pakistan', slug: 'fashion-hub-pakistan', owner: seller2._id,
    category: 'Fashion', description: 'Trendy fashion at affordable prices',
    isApproved: true, totalSales: 300, totalRevenue: 1200000, rating: 4.3, numReviews: 120
  });

  const products = [];
  for (let i = 0; i < PRODUCTS.length; i++) {
    const pd = PRODUCTS[i];
    const isStore2 = ['Fashion', 'Food', 'Beauty'].includes(pd.category);
    const storeId = isStore2 ? store2._id : store1._id;
    const sellerId = isStore2 ? seller2._id : seller._id;
    const slug = pd.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now() + i;
    const discountPercent = pd.discountPrice
      ? Math.round(((pd.price - pd.discountPrice) / pd.price) * 100)
      : 0;

    const product = await Product.create({
      ...pd, slug, store: storeId, seller: sellerId, isApproved: true,
      discountPercent, sold: Math.floor(Math.random() * 100),
      rating: 3.5 + Math.random() * 1.5, numReviews: Math.floor(Math.random() * 50) + 5,
      specifications: [
        { key: 'Brand', value: pd.brand },
        { key: 'Category', value: pd.category },
        { key: 'Warranty', value: '1 Year' }
      ]
    });
    products.push(product);
  }

  const orderDocs = await Order.insertMany([{
    orderNumber: 'ORD-' + Date.now() + '-001',
    customer: customer._id,
    items: [{
      product: products[0]._id, name: products[0].name, image: products[0].images[0].url,
      price: 250000, quantity: 1, store: store1._id
    }],
    shippingAddress: {
      name: 'Muhammad Ali', street: 'House 5, Street 3', city: 'Karachi',
      state: 'Sindh', zipCode: '75000', country: 'Pakistan', phone: '+92 300 1234567'
    },
    paymentInfo: { method: 'cod', status: 'paid', paidAt: new Date() },
    pricing: { subtotal: 250000, shippingCost: 0, tax: 12500, total: 262500 },
    status: 'delivered',
    deliveredAt: new Date(),
    statusHistory: [
      { status: 'pending', message: 'Order placed' },
      { status: 'delivered', message: 'Delivered successfully' }
    ]
  }]);

  await Review.insertMany([
    {
      product: products[0]._id, user: customer._id, order: orderDocs[0]._id,
      rating: 5, title: 'Excellent Product!',
      comment: 'Absolutely love this phone. Highly recommended!',
      isVerifiedPurchase: true
    },
    {
      product: products[2]._id, user: customer._id,
      rating: 4, title: 'Great Sound Quality',
      comment: 'The noise cancellation is incredible.',
      isVerifiedPurchase: false
    }
  ]);

  return { users, products };
};

const seedIfEmpty = async () => {
  const count = await User.countDocuments();
  if (count > 0) return;

  console.log('🌱 Seeding demo data (empty database)...');
  await runSeed();
  console.log('🎉 Demo data ready — customer@gmail.com, seller@gmail.com, admin@gmail.com / demo123');
};

module.exports = { runSeed, seedIfEmpty, PRODUCTS };
