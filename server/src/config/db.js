const mongoose = require('mongoose');

let isConnected = false;
let dbEngine = 'Disconnected';
let mongoMemoryServerInstance = null;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  // Enable buffering so mongoose safely queues requests until database connection completes
  mongoose.set('bufferCommands', true);

  // 1. First, attempt connection to configured MONGO_URI (MongoDB Atlas or Local MongoDB Service)
  if (mongoURI) {
    try {
      console.log('🔄 Attempting connection to MongoDB Atlas...');
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 3000,
      });

      isConnected = true;
      dbEngine = `MongoDB Atlas (${conn.connection.host})`;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (error) {
      console.warn(`⚠️ MongoDB Atlas Connection Warning: ${error.message}`);
      console.log(`💡 Note: MongoDB Atlas requires your current IP in Network Access whitelist (0.0.0.0/0).`);
    }
  }

  // 2. High-Performance Persistent Embedded MongoDB
  try {
    console.log('⚡ Initializing High-Performance Persistent MongoDB Engine...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const path = require('path');
    const fs = require('fs');

    const dbPath = path.join(__dirname, '../../data/mongodb');
    fs.mkdirSync(dbPath, { recursive: true });

    // Clean up stale mongod lock file if previous process was abruptly killed by nodemon
    const lockFile = path.join(dbPath, 'mongod.lock');
    if (fs.existsSync(lockFile)) {
      try {
        fs.unlinkSync(lockFile);
      } catch (e) {
        // ignore if active
      }
    }

    if (!mongoMemoryServerInstance) {
      try {
        mongoMemoryServerInstance = await MongoMemoryServer.create({
          instance: {
            dbPath,
            storageEngine: 'wiredTiger',
          },
        });
      } catch (pathErr) {
        console.warn('⚠️ Falling back to clean memory instance:', pathErr.message);
        mongoMemoryServerInstance = await MongoMemoryServer.create();
      }
    }
    
    const memoryUri = mongoMemoryServerInstance.getUri();

    const conn = await mongoose.connect(memoryUri);
    isConnected = true;
    dbEngine = 'Persistent Embedded MongoDB (Disk Backed)';
    console.log(`✅ Persistent MongoDB Connected: ${memoryUri} [Storage: data/mongodb]`);

    // Gracefully stop mongo server on process termination
    process.on('SIGINT', async () => {
      if (mongoMemoryServerInstance) await mongoMemoryServerInstance.stop();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      if (mongoMemoryServerInstance) await mongoMemoryServerInstance.stop();
      process.exit(0);
    });

    // Auto-seed database ONLY on initial fresh setup, preserving all registered users & allocations forever
    try {
      const { runSeedData } = require('../controllers/seedController');
      const counts = await runSeedData(false);
      if (counts.alreadySeeded) {
        console.log(`💾 Preserved all registered users and data: ${counts.users} users, ${counts.rooms} rooms, ${counts.notices} notices.`);
      } else {
        console.log(`🌱 Initialized base dataset: ${counts.users} users, ${counts.halls} halls, ${counts.rooms} rooms, ${counts.notices} notices.`);
      }
    } catch (seedErr) {
      console.warn('⚠️ Auto-seed notice:', seedErr.message);
    }
  } catch (memError) {
    isConnected = false;
    dbEngine = 'Disconnected';
    console.error('❌ Failed to initialize persistent MongoDB engine:', memError.message);
  }
};

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
