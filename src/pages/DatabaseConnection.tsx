import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Database, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"

const DatabaseConnection = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected")
  const [formData, setFormData] = useState({
    host: "aws-0-eu-central-1.pooler.supabase.com",
    port: "5432",
    database: "postgres",
    username: "",
    password: ""
  })

  const testConnection = async () => {
    setConnectionStatus("testing")
    
    // Simulate connection test
    setTimeout(() => {
      if (formData.username && formData.password) {
        setConnectionStatus("connected")
      } else {
        setConnectionStatus("disconnected")
      }
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (connectionStatus === "connected") {
      setConnectionStatus("disconnected")
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Database Connection</h1>
          <p className="text-muted-foreground">Connect to your Supabase PostgreSQL database</p>
        </div>
        
        <Badge 
          variant="outline" 
          className={connectionStatus === "connected" 
            ? "text-green-500 border-green-500/20" 
            : "text-red-500 border-red-500/20"
          }
        >
          {connectionStatus === "connected" ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 mr-1" />
              Disconnected
            </>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Form */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Database className="w-5 h-5" />
                PostgreSQL Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={(e) => handleInputChange("host", e.target.value)}
                    placeholder="your-project.pooler.supabase.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={formData.port}
                    onChange={(e) => handleInputChange("port", e.target.value)}
                    placeholder="5432"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="database">Database</Label>
                <Input
                  id="database"
                  value={formData.database}
                  onChange={(e) => handleInputChange("database", e.target.value)}
                  placeholder="postgres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="postgres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Your database password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={testConnection}
                  disabled={connectionStatus === "testing"}
                  variant="outline"
                  className="flex-1"
                >
                  {connectionStatus === "testing" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 shadow-glow"
                  disabled={connectionStatus !== "connected"}
                >
                  Save Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <div className="space-y-4">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Connection Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">Supabase PostgreSQL</p>
                <p className="text-muted-foreground">Direct connection to your database</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-foreground">SSL Required</p>
                <p className="text-muted-foreground">Secure connection enabled</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-foreground">Connection Pooling</p>
                <p className="text-muted-foreground">Optimized for performance</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Quick Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">1. Get Connection Details</p>
                <p className="text-muted-foreground">From your Supabase project settings</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-foreground">2. Configure Access</p>
                <p className="text-muted-foreground">Ensure IP is whitelisted</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-foreground">3. Test & Save</p>
                <p className="text-muted-foreground">Verify connection works</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DatabaseConnection