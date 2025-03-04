import type { NextRequest } from "next/server"
import { jwtVerify, SignJWT } from "jose"

// Secret keys for JWT
const JWT_ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || "default_access_secret")
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || "default_refresh_secret")

// User type
export type User = {
  id: string
  name: string
  email: string
  role: string
}

// Verify authentication from request
export async function verifyAuth(request: NextRequest): Promise<{ success: boolean; user?: User }> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false }
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET)

    // Return user data from token
    return {
      success: true,
      user: {
        id: payload.id as string,
        name: payload.name as string,
        email: payload.email as string,
        role: payload.role as string,
      },
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return { success: false }
  }
}

// Generate access and refresh tokens
export async function generateTokens(user: User) {
  // Generate access token (expires in 15 minutes)
  const accessToken = await generateAccessToken(user)

  // Generate refresh token (expires in 7 days)
  const refreshToken = await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_REFRESH_SECRET)

  return { accessToken, refreshToken }
}

// Generate access token
export async function generateAccessToken(user: User) {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_ACCESS_SECRET)
}

// Verify refresh token
export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

