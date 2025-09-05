import type { User } from "./mongoose.gen"

declare module "express" {
  interface Request {
    user?: User
    rawBody?: string
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody?: string
  }
}
