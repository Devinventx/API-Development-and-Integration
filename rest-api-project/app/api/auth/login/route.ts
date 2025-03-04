import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getRedisClient } from "@/lib/redis"
import { generateTokens } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const supabase = createClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role, password_hash")
      .eq("email", body.email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const hashedPassword = await hashPassword(body.password)
    if (hashedPassword !== user.password_hash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

    // Store refresh token in Redis
    const redis = await getRedisClient()
    await redis.set(`refresh_token:${refreshToken}`, user.id, { ex: 60 * 60 * 24 * 7 }) // 7 days

    // Return tokens and user info
    return NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

