import { type NextRequest, NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    // Remove refresh token from Redis
    const redis = await getRedisClient()
    await redis.del(`refresh_token:${body.refreshToken}`)

    return NextResponse.json({ message: "Successfully logged out" })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

