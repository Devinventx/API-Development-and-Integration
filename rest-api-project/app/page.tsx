import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowRight, Database, Key, RefreshCw, Shield } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit">
          RESTful API Dashboard
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <Button variant="outline">
            <Link href="/api-docs" className="flex items-center gap-1">
              API Docs <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-4xl font-bold">API Development & Integration</h1>
      </div>

      <Tabs defaultValue="features" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Secure Authentication"
              description="OAuth-based authentication and JWT for secure API access"
            />
            <FeatureCard
              icon={<Database className="h-8 w-8 text-primary" />}
              title="PostgreSQL Integration"
              description="Optimized query handling with proper indexing for fast data retrieval"
            />
            <FeatureCard
              icon={<RefreshCw className="h-8 w-8 text-primary" />}
              title="Redis Caching"
              description="Real-time data synchronization with efficient caching mechanisms"
            />
            <FeatureCard
              icon={<Key className="h-8 w-8 text-primary" />}
              title="API Documentation"
              description="Comprehensive Swagger documentation for better maintainability"
            />
          </div>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Available API Endpoints</CardTitle>
              <CardDescription>RESTful endpoints for your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <EndpointItem method="GET" path="/api/users" description="Retrieve all users with pagination support" />
                <EndpointItem method="GET" path="/api/users/:id" description="Get a specific user by ID" />
                <EndpointItem method="POST" path="/api/users" description="Create a new user" />
                <EndpointItem method="PUT" path="/api/users/:id" description="Update an existing user" />
                <EndpointItem method="DELETE" path="/api/users/:id" description="Delete a user" />
                <EndpointItem
                  method="GET"
                  path="/api/products"
                  description="Retrieve all products with filtering options"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Flow</CardTitle>
              <CardDescription>Secure API access with OAuth and JWT</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">1. User Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Users authenticate via OAuth providers (Google, GitHub, etc.)
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">2. Token Generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Server generates JWT with appropriate scopes and expiration
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">3. API Authorization</h3>
                  <p className="text-sm text-muted-foreground">
                    JWT is validated on each request to secure API endpoints
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">4. Token Refresh</h3>
                  <p className="text-sm text-muted-foreground">Refresh tokens allow for seamless session management</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimizations</CardTitle>
              <CardDescription>Techniques used to ensure API performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">PostgreSQL Indexing</h3>
                  <p className="text-sm text-muted-foreground">
                    Strategic indexes on frequently queried columns for faster data retrieval
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Redis Caching</h3>
                  <p className="text-sm text-muted-foreground">
                    In-memory caching of frequently accessed data to reduce database load
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Query Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Efficient SQL queries with proper joins and selective column fetching
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Rate Limiting</h3>
                  <p className="text-sm text-muted-foreground">
                    Prevents API abuse and ensures fair resource allocation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        {icon}
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}

function EndpointItem({ method, path, description }) {
  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800"
      case "POST":
        return "bg-green-100 text-green-800"
      case "PUT":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg">
      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(method)}`}>{method}</span>
      <div>
        <p className="font-mono text-sm">{path}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

