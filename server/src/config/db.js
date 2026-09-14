const mongoose = require('mongoose');

let isConnected = false;
let dbEngine = 'Disconnected';
let mongoMemoryServerInstance = null;
let isConnecting = false;

const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27019/hall_management';
  const fixedPort = 27019;
  const localUri = `mongodb://127.0.0.1:${fixedPort}/hall_management`;
  mongoose.set('bufferCommands', true);

  // 1. If configured to use local MongoDB (default and recommended)
  if (mongoURI.includes('127.0.0.1') || mongoURI.includes('localhost')) {
    try {
      console.log(`🔌 Connecting to Local High-Performance MongoDB (port ${fixedPort})...`);
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      });
      await conn.connection.db.admin().ping();

      isConnected = true;
      dbEngine = `High-Performance Local MongoDB (Port ${fixedPort})`;
      console.log(`✅ High-Performance Local MongoDB Connected: ${localUri}`);
      isConnecting = false;
      return;
    } catch (localErr) {
      console.log(`⚠️ Local MongoDB not yet active on port ${fixedPort}. Starting engine...`);
      await mongoose.disconnect().catch(() => {});
    }
  } else {
    // Attempt remote Atlas connection with strict timeout
    try {
      console.log('🔄 Checking MongoDB Atlas connection...');
      try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
      } catch (e) {}

      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });

      await conn.connection.db.admin().ping();
      isConnected = true;
      dbEngine = `MongoDB Atlas (${conn.connection.host})`;
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}/${conn.connection.name}`);
      isConnecting = false;
      return;
    } catch (error) {
      console.warn(`⚠️ MongoDB Atlas unavailable (${error.message}). Falling back to local high-performance database.`);
      await mongoose.disconnect().catch(() => {});
    }
  }

  // 2. Fallback / Embedded MongoDB Engine on FIXED port 27019
  try {
    // Check if an instance is already active on port 27019
    let connectedDirectly = false;
    try {
      const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
      await conn.connection.db.admin().ping();
      connectedDirectly = true;
      isConnected = true;
      dbEngine = `High-Performance Local MongoDB (Port ${fixedPort})`;
      console.log(`✅ Connected to active local MongoDB on port ${fixedPort}`);
    } catch (e) {
      await mongoose.disconnect().catch(() => {});
    }

    if (!connectedDirectly) {
      console.log(`⚡ Initializing High-Performance MongoDB Engine on port ${fixedPort}...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const path = require('path');
      const fs = require('fs');

      const dbPath = path.join(__dirname, '../../data/mongodb');
      fs.mkdirSync(dbPath, { recursive: true });

      // Clean up stale mongod lock file
      const lockFile = path.join(dbPath, 'mongod.lock');
      if (fs.existsSync(lockFile)) {
        try {
          fs.unlinkSync(lockFile);
        } catch (e) {}
      }

      if (!mongoMemoryServerInstance) {
        try {
          mongoMemoryServerInstance = await MongoMemoryServer.create({
            instance: {
              port: fixedPort,
              dbPath,
              storageEngine: 'wiredTiger',
              dbName: 'hall_management',
            },
          });
        } catch (pathErr) {
          console.warn('⚠️ Starting clean storage on fixed port 27019:', pathErr.message);
          try {
            fs.rmSync(dbPath, { recursive: true, force: true });
            fs.mkdirSync(dbPath, { recursive: true });
          } catch (e) {}
          mongoMemoryServerInstance = await MongoMemoryServer.create({
            instance: {
              port: fixedPort,
              dbName: 'hall_management',
            },
          });
        }
      }

      const memoryUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      isConnected = true;
      dbEngine = `Persistent Embedded MongoDB (Port ${fixedPort})`;
      console.log(`✅ Persistent MongoDB Connected: ${memoryUri}`);

      process.on('SIGINT', async () => {
        if (mongoMemoryServerInstance) await mongoMemoryServerInstance.stop();
        process.exit(0);
      });
      process.on('SIGTERM', async () => {
        if (mongoMemoryServerInstance) await mongoMemoryServerInstance.stop();
        process.exit(0);
      });
    }

    // Auto-seed dataset on initial run
    try {
      const { runSeedData } = require('../controllers/seedController');
      const counts = await runSeedData(false);
      if (counts.alreadySeeded) {
        console.log(`💾 Preserved existing data: ${counts.users} users, ${counts.rooms} rooms, ${counts.notices} notices.`);
      } else {
        console.log(`🌱 Initialized base dataset: ${counts.users} users, ${counts.halls} halls, ${counts.rooms} rooms, ${counts.notices} notices.`);
      }
    } catch (seedErr) {
      console.warn('⚠️ Seed notice:', seedErr.message);
    }
  } catch (memError) {
    isConnected = false;
    dbEngine = 'Disconnected';
    console.error('❌ Failed to initialize persistent MongoDB engine:', memError.message);
  } finally {
    isConnecting = false;
  }
};

// Auto-reconnect if connection drops
mongoose.connection.on('disconnected', () => {
  if (isConnected) {
    console.warn('⚠️ MongoDB connection lost. Reconnecting in 1.5s...');
    isConnected = false;
    setTimeout(() => connectDB(), 1500);
  }
});

const getDBStatus = () => {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const state = mongoose.connection.readyState;
  return {
    state: states[state] || 'Unknown',
    isConnected: state === 1,
    engine: dbEngine,
  };
};

module.exports = { connectDB, getDBStatus };
