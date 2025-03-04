import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getRedisClient } from "@/lib/redis"
import { generateAccessToken, verifyRefreshToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(body.refreshToken)
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 })
    }

    // Check if token is in Redis
    const redis = await getRedisClient()
    const userId = await redis.get(`refresh_token:${body.refreshToken}`)

    if (!userId) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 })
    }

    // Get user from database
    const supabase = createClient()

    const { data: user, error } = await supabase.from("users").select("id, name, email, role").eq("id", userId).single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate new access token
    const accessToken = await generateAccessToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

    // Return new access token
    return NextResponse.json({ accessToken })
  } catch (error) {
    console.error("Error refreshing token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

