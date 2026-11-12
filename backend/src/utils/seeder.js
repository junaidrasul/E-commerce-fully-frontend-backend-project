require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { connectDatabase } = require('../config/db');
const { runSeed } = require('./seedData');

const seedDatabase = async () => {
  try {
    await connectDatabase();
    console.log('✅ Connected to MongoDB');
    await runSeed({ clear: true });
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📧 Demo Accounts:');
    console.log('   Customer: customer@gmail.com / demo123');
    console.log('   Seller:   seller@gmail.com   / demo123');
    console.log('   Admin:    admin@gmail.com    / demo123\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDatabase();
