const mongoose = require('mongoose');

/**
 * Establishes the MongoDB connection using Mongoose.
 * Fails fast and loudly if the connection string is missing or invalid,
 * since the API is useless without a database.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in the environment');
    }

    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== 'production', // build indexes only in dev
    });

    console.log(`[db] MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[db] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[db] MongoDB disconnected');
    });
  } catch (error) {
    console.error(`[db] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
