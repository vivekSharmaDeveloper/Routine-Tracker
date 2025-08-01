import mongoose from "mongoose"

interface DBConnection {
  isConnected?: number
}

// Use global object to persist connection across hot reloads (for Next.js dev environment)
const connection: DBConnection = (global as any).mongoose || {}

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("✅ Already connected to database")
    return
  }

  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not defined in environment variables")
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {})
    connection.isConnected = db.connections[0].readyState
    ;(global as any).mongoose = connection

    console.log("✅ DB Connected Successfully")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
  }
}

export default dbConnect
