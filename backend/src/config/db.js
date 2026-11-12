const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer = null;

const isPlaceholderMongoUri = (uri) => {
  if (!uri) return true;
  return /abcd123\.mongodb\.net/i.test(uri) || /<cluster>/i.test(uri) || /your_cluster/i.test(uri);
};

const shouldUseMemoryDb = () => {
  if (process.env.USE_MEMORY_DB === 'true') return true;
  return process.env.NODE_ENV !== 'production' && isPlaceholderMongoUri(process.env.MONGO_URI);
};

const connectDatabase = async () => {
  const options = { serverSelectionTimeoutMS: 10000 };
  let uri = process.env.MONGO_URI;

  if (shouldUseMemoryDb()) {
    try {
      memoryServer = await MongoMemoryServer.create({
        binary: { version: '5.0.28' }
      });
      uri = memoryServer.getUri('shopverse');
      console.log('📦 Using in-memory MongoDB for local development.');
      console.log('   For persistent data, set a valid MONGO_URI and USE_MEMORY_DB=false in backend/.env');
    } catch (err) {
      const hint = 'In-memory MongoDB failed to start (often a large binary download). '
        + 'Use MongoDB Atlas: set USE_MEMORY_DB=false and a real MONGO_URI in backend/.env';
      throw new Error(`${err.message}\n   ${hint}`);
    }
  }

  await mongoose.connect(uri, options);
  return uri;
};

module.exports = { connectDatabase, shouldUseMemoryDb, isPlaceholderMongoUri };
