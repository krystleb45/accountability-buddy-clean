import dotenvFlow from "dotenv-flow"
import mongoose from "mongoose"

import { UserService } from "../api/services/user-service.js"

dotenvFlow.config()

async function createAdminUser(
  username: string,
  email: string,
  password: string,
) {
  return await UserService.createUser({
    username,
    email,
    password,
    role: "admin",
  })
}

const username = process.argv[2]
const email = process.argv[3]
const password = process.argv[4]

if (!username || !email || !password) {
  console.error("Usage: npx tsx create-admin.ts <username> <email> <password>")
  process.exit(1)
}

const mongoUri = process.env.MONGO_URI
if (!mongoUri) {
  console.error("MONGO_URI is not defined or is empty.")
  process.exit(1)
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      dbName: "accountability-buddy",
    })
    console.log("Connected to MongoDB")

    createAdminUser(username, email, password)
      .then((user) => {
        console.log("Admin user created:", user)
        process.exit(0)
      })
      .catch((error) => {
        console.error("Error creating admin user:", error)
        process.exit(1)
      })
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    process.exit(1)
  }
}

main()
