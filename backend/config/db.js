const mongoose = require('mongoose');

let memServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostlink';
  console.log('MongoDB URI Host:', uri.split('@')[1]?.split('/')[0]);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`! Direct MongoDB connection failed (${error.message}).`);

    // In development mode, fallback to in-memory MongoDB for seamless execution without local mongod
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log(' Starting in-memory MongoDB fallback server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memServer = await MongoMemoryServer.create();
        const memUri = memServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(` In-memory MongoDB Connected: ${memUri}`);
        return conn;
      } catch (memError) {
        console.error(' Failed to start in-memory MongoDB server:', memError.message);
      }
    }
    
    console.error('CRITICAL: MongoDB connection error. Ensure MongoDB is running or configure MONGODB_URI in backend/.env.');
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memServer) {
      await memServer.stop();
    }
  } catch (err) {
    console.error('Error disconnecting database:', err);
  }
};

module.exports = { connectDB, disconnectDB };
