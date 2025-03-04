import { createClient } from "redis"

let redisClient: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL

    if (!redisUrl) {
      throw new Error("Missing Redis environment variable")
    }

    redisClient = createClient({
      url: redisUrl,
    })

    await redisClient.connect()
  }

  return redisClient
}

