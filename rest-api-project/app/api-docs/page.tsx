import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ApiDocs() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">Comprehensive documentation for the RESTful API endpoints</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users API</TabsTrigger>
          <TabsTrigger value="products">Products API</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="space-y-6">
            <EndpointDoc
              method="GET"
              path="/api/users"
              description="Retrieve a list of users with pagination and filtering options"
              parameters={[
                { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
                { name: "limit", type: "number", required: false, description: "Items per page (default: 10)" },
                { name: "search", type: "string", required: false, description: "Search term for name or email" },
              ]}
              responses={[
                {
                  code: "200",
                  description: "Success",
                  example:
                    '{\n  "data": [\n    {\n      "id": 1,\n      "name": "John Doe",\n      "email": "john@example.com",\n      "role": "user"\n    }\n  ],\n  "pagination": {\n    "total": 100,\n    "pages": 10,\n    "current": 1\n  }\n}',
                },
                { code: "401", description: "Unauthorized", example: '{\n  "error": "Authentication required"\n}' },
              ]}
            />

            <EndpointDoc
              method="GET"
              path="/api/users/:id"
              description="Retrieve a specific user by ID"
              parameters={[{ name: "id", type: "number", required: true, description: "User ID" }]}
              responses={[
                {
                  code: "200",
                  description: "Success",
                  example:
                    '{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com",\n  "role": "user",\n  "createdAt": "2023-01-01T00:00:00Z"\n}',
                },
                { code: "404", description: "Not Found", example: '{\n  "error": "User not found"\n}' },
              ]}
            />

            <EndpointDoc
              method="POST"
              path="/api/users"
              description="Create a new user"
              parameters={[
                { name: "name", type: "string", required: true, description: "User's full name" },
                { name: "email", type: "string", required: true, description: "User's email address" },
                { name: "password", type: "string", required: true, description: "User's password" },
                { name: "role", type: "string", required: false, description: "User role (default: user)" },
              ]}
              responses={[
                {
                  code: "201",
                  description: "Created",
                  example: '{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com",\n  "role": "user"\n}',
                },
                { code: "400", description: "Bad Request", example: '{\n  "error": "Invalid email format"\n}' },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-6">
            <EndpointDoc
              method="GET"
              path="/api/products"
              description="Retrieve a list of products with filtering options"
              parameters={[
                { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
                { name: "limit", type: "number", required: false, description: "Items per page (default: 10)" },
                { name: "category", type: "string", required: false, description: "Filter by category" },
              ]}
              responses={[
                {
                  code: "200",
                  description: "Success",
                  example:
                    '{\n  "data": [\n    {\n      "id": 1,\n      "name": "Product Name",\n      "price": 99.99,\n      "category": "electronics"\n    }\n  ],\n  "pagination": {\n    "total": 50,\n    "pages": 5,\n    "current": 1\n  }\n}',
                },
              ]}
            />

            <EndpointDoc
              method="GET"
              path="/api/products/:id"
              description="Retrieve a specific product by ID"
              parameters={[{ name: "id", type: "number", required: true, description: "Product ID" }]}
              responses={[
                {
                  code: "200",
                  description: "Success",
                  example:
                    '{\n  "id": 1,\n  "name": "Product Name",\n  "description": "Detailed product description",\n  "price": 99.99,\n  "category": "electronics",\n  "inStock": true\n}',
                },
                { code: "404", description: "Not Found", example: '{\n  "error": "Product not found"\n}' },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="auth">
          <div className="space-y-6">
            <EndpointDoc
              method="POST"
              path="/api/auth/login"
              description="Authenticate a user and receive access tokens"
              parameters={[
                { name: "email", type: "string", required: true, description: "User's email address" },
                { name: "password", type: "string", required: true, description: "User's password" },
              ]}
              responses={[
                {
                  code: "200",
                  description: "Success",
                  example:
                    '{\n  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "user": {\n    "id": 1,\n    "name": "John Doe",\n    "email": "john@example.com"\n  }\n}',
                },
                { code: "401", description: "Unauthorized", example: '{\n  "error": "Invalid credentials"\n}' },
              ]}
            />

            <EndpointDoc
              method="POST"
              path="/api/auth/refresh"
              description="Refresh an expired access token"
              parameters={[
                { name: "refreshToken", type: "string", required: true, description: "Valid refresh token" },
              ]}
              responses={[
                {
                  code: "200",
                  description: "Success",
                  example: '{\n  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\n}',
                },
                {
                  code: "401",
                  description: "Unauthorized",
                  example: '{\n  "error": "Invalid or expired refresh token"\n}',
                },
              ]}
            />

            <EndpointDoc
              method="POST"
              path="/api/auth/logout"
              description="Invalidate the current user session"
              parameters={[
                { name: "refreshToken", type: "string", required: true, description: "Current refresh token" },
              ]}
              responses={[
                { code: "200", description: "Success", example: '{\n  "message": "Successfully logged out"\n}' },
              ]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EndpointDoc({ method, path, description, parameters, responses }) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(method)}`}>{method}</span>
          <CardTitle className="font-mono text-lg">{path}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {parameters && parameters.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Parameters</h3>
              <div className="border rounded-md">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Required</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parameters.map((param, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm font-mono">{param.name}</td>
                        <td className="px-4 py-2 text-sm">{param.type}</td>
                        <td className="px-4 py-2 text-sm">
                          {param.required ? (
                            <Badge variant="default">Required</Badge>
                          ) : (
                            <Badge variant="outline">Optional</Badge>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {responses && responses.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Responses</h3>
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={response.code.startsWith("2") ? "default" : "destructive"}>{response.code}</Badge>
                      <span className="text-sm">{response.description}</span>
                    </div>
                    {response.example && (
                      <div className="bg-muted p-3 rounded-md">
                        <pre className="text-xs overflow-auto">{response.example}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

