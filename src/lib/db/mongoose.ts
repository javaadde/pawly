import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

function getMongoUri() {
  if (!MONGODB_URI) {
    throw new Error('Database configuration error: MONGODB_URI is missing');
  }

  const mongoUri = MONGODB_URI.trim();

  if (mongoUri.includes('<user>') || mongoUri.includes('<pass>')) {
    throw new Error(
      'Database configuration error: replace the placeholder MONGODB_URI credentials in .env.local'
    );
  }

  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error(
      'Database configuration error: MONGODB_URI must start with "mongodb://" or "mongodb+srv://"'
    );
  }

  return mongoUri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const mongoUri = getMongoUri();

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
