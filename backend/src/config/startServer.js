const { connectDatabase } = require('./db');
const { seedIfEmpty } = require('../utils/seedData');

async function startServer(httpServer, port) {
  await connectDatabase();
  console.log('✅ MongoDB Connected');
  await seedIfEmpty();
  httpServer.listen(port, () => console.log(`🚀 Server running on port ${port}`));
}

module.exports = { startServer };
