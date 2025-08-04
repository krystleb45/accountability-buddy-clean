import type { Connection } from "mongoose"

import mongoose from "mongoose"

const maybeUri = process.env.MONGO_URI
if (!maybeUri) {
  throw new Error("❌ Missing MONGO_URI environment variable")
}
const MONGO_URI: string = maybeUri

interface MongooseCache {
  conn: Connection | null
  promise: Promise<Connection> | null
}

declare global {
  // eslint-disable-next-line vars-on-top
  var mongooseCache: MongooseCache
}

const cache: MongooseCache = globalThis.mongooseCache || {
  conn: null,
  promise: null,
}

if (process.env.NODE_ENV === "development") {
  globalThis.mongooseCache = cache
}

// unlike the typed ConnectOptions, we just drop this in as “any” to avoid the missing-type complaint
const opts = {
  bufferCommands: false,
} as any

async function dbConnect(): Promise<Connection> {
  if (cache.conn) {
    return cache.conn
  }
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGO_URI, opts)
      // suppress the implicit-any parameter here too
      .then((mongooseInstance: any) => mongooseInstance.connection)
  }
  cache.conn = await cache.promise
  return cache.conn
}

export default dbConnect
