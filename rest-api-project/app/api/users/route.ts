import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getRedisClient } from "@/lib/redis"
import { verifyAuth } from "@/lib/auth"

// GET /api/users - Get all users with pagination
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Create cache key based on query parameters
    const cacheKey = `users:${page}:${limit}:${search}`

    // Try to get data from Redis cache first
    const redis = await getRedisClient()
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData))
    }

    // If not in cache, query the database
    const supabase = createClient()

    let query = supabase.from("users").select("id, name, email, role, created_at", { count: "exact" })

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Add pagination
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Prepare response
    const response = {
      data,
      pagination: {
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        current: page,
      },
    }

    // Cache the result in Redis (expire after 5 minutes)
    await redis.set(cacheKey, JSON.stringify(response), { ex: 300 })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    // Verify authentication with admin role
    const authResult = await verifyAuth(request)
    if (!authResult.success || authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Create user in database
    const supabase = createClient()

    // First check if email already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", body.email).single()

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    // Insert new user
    const { data, error } = await supabase
      .from("users")
      .insert({
        name: body.name,
        email: body.email,
        password_hash: await hashPassword(body.password),
        role: body.role || "user",
      })
      .select("id, name, email, role")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Invalidate users cache
    const redis = await getRedisClient()
    const keys = await redis.keys("users:*")
    if (keys.length > 0) {
      await redis.del(keys)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  // In a real application, use a proper password hashing library like bcrypt
  // This is a simplified example
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

