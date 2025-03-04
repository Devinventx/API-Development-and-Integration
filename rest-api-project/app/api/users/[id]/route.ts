import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getRedisClient } from "@/lib/redis"
import { verifyAuth } from "@/lib/auth"

// GET /api/users/[id] - Get a specific user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Try to get from cache first
    const redis = await getRedisClient()
    const cacheKey = `user:${userId}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData))
    }

    // If not in cache, query the database
    const supabase = createClient()

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .eq("id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Cache the result (expire after 5 minutes)
    await redis.set(cacheKey, JSON.stringify(data), { ex: 300 })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to update this user
    // Admin can update any user, users can only update themselves
    if (authResult.user.role !== "admin" && authResult.user.id !== params.id) {
      return NextResponse.json({ error: "You do not have permission to update this user" }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()

    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
      }
    }

    // Update user in database
    const supabase = createClient()

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (body.name) updateData.name = body.name
    if (body.email) updateData.email = body.email
    if (body.role && authResult.user.role === "admin") updateData.role = body.role
    if (body.password) updateData.password_hash = await hashPassword(body.password)

    // Update user
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select("id, name, email, role")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Invalidate cache
    const redis = await getRedisClient()
    await redis.del(`user:${userId}`)
    const userListKeys = await redis.keys("users:*")
    if (userListKeys.length > 0) {
      await redis.del(userListKeys)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication with admin role
    const authResult = await verifyAuth(request)
    if (!authResult.success || authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 })
    }

    const userId = params.id

    // Delete user from database
    const supabase = createClient()

    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Invalidate cache
    const redis = await getRedisClient()
    await redis.del(`user:${userId}`)
    const userListKeys = await redis.keys("users:*")
    if (userListKeys.length > 0) {
      await redis.del(userListKeys)
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
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

