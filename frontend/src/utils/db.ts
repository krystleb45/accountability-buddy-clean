// src/utils/db.ts

// 1) Suppress TS errors until you add @types/mongoose.
//    After running `npm install mongoose @types/mongoose`, remove these @ts-ignore lines.
// @ts-ignore
import mongoose from 'mongoose';
// @ts-ignore
import type { Connection } from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env.local'
  );
}

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache;
}

const cache: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (process.env.NODE_ENV === 'development') {
  global.mongooseCache = cache;
}

// cast opts to any so TS won’t complain about missing ConnectOptions
const opts = {
  bufferCommands: false,
  // …add other mongoose options here once you have types installed
} as any;

/**
 * Connects to MongoDB (or returns the existing connection if already connected).
 */
export async function connectToDB(): Promise<Connection> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGO_URI, opts)
      // mongooseInstance will be typed once you install @types/mongoose
      .then((mongooseInstance: any) => {
        return mongooseInstance.connection;
      })
      .catch((err: any) => {
        cache.promise = null; // reset on failure
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
