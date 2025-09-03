import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { User, Settings as SettingsIcon, Database, Palette, Plus, Edit, Trash2, Upload, Users, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { AlertsSection } from "@/components/alerts/AlertsSection"

type SettingsSection = 'profile' | 'workspace' | 'database' | 'appearance' | 'alerts'

// Mock data - in a real app this would come from your backend
const mockWorkspaceMembers = [
  { id: 1, name: "John Doe", email: "john@company.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@company.com", role: "Editor" },
  { id: 3, name: "Bob Johnson", email: "bob@company.com", role: "Viewer" },
]

const mockDatabaseConnections = [
  { id: 1, name: "Production DB", type: "PostgreSQL", status: "Connected", host: "prod.db.company.com" },
  { id: 2, name: "Staging DB", type: "PostgreSQL", status: "Connected", host: "staging.db.company.com" },
  { id: 3, name: "Analytics DB", type: "PostgreSQL", status: "Error", host: "analytics.db.company.com" },
]

export default function Settings() {
  const { section } = useParams<{ section?: SettingsSection }>()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SettingsSection>(section || 'profile')
  const [isAdmin] = useState(true) // Mock admin status - in real app this would come from auth
  const { user } = useAuth()
  const { toast } = useToast()

  // Update active section when URL changes
  useEffect(() => {
    if (section && ['profile', 'workspace', 'database', 'appearance', 'alerts'].includes(section)) {
      setActiveSection(section as SettingsSection)
    }
  }, [section])

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [workspaceName, setWorkspaceName] = useState('My Workspace')
  const [brandColor, setBrandColor] = useState('#3b82f6')

  const navigationItems = [
    { id: 'profile' as SettingsSection, label: 'User Profile', icon: User, adminOnly: false },
    { id: 'workspace' as SettingsSection, label: 'Workspace', icon: Users, adminOnly: true },
    { id: 'database' as SettingsSection, label: 'Database', icon: Database, adminOnly: false },
    { id: 'alerts' as SettingsSection, label: 'Smart Alerts', icon: AlertTriangle, adminOnly: false },
    { id: 'appearance' as SettingsSection, label: 'Appearance', icon: Palette, adminOnly: true },
  ]

  const handlePasswordChange = () => {
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }
    // TODO: Implement password change logic
    toast({
      title: "Success",
      description: "Password changed successfully",
    })
  }

  const handleProfileUpdate = () => {
    // TODO: Implement profile update logic
    toast({
      title: "Success",
      description: "Profile updated successfully",
    })
  }

  const handleLogoUpload = () => {
    // TODO: Implement logo upload logic
    toast({
      title: "Success",
      description: "Logo uploaded successfully",
    })
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profileForm.email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <Button onClick={handleProfileUpdate}>Update Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={profileForm.currentPassword}
              onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Enter current password"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={profileForm.confirmPassword}
                onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <Button onClick={handlePasswordChange}>Change Password</Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderWorkspaceSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Workspace</h2>
        <p className="text-muted-foreground">Manage your workspace settings and team members.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>Configure your workspace preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name"
                />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage workspace members and their permissions.</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWorkspaceMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  const renderDatabaseSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Connections</h2>
          <p className="text-muted-foreground">Manage your database connections and configurations.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Connection
        </Button>
      </div>

      <div className="grid gap-4">
        {mockDatabaseConnections.map((db) => (
          <Card key={db.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{db.name}</CardTitle>
                    <CardDescription>{db.type} • {db.host}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={db.status === 'Connected' ? 'default' : 'destructive'}
                    className={db.status === 'Connected' ? 'bg-green-500' : ''}
                  >
                    {db.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Appearance</h2>
        <p className="text-muted-foreground">Customize the look and feel of your workspace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>Upload your company logo to personalize your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Button onClick={handleLogoUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground">
                Recommended: 200x200px, PNG or JPG
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Color</CardTitle>
          <CardDescription>Choose your primary brand color for the interface.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand-color">Primary Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="brand-color"
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: brandColor }}
              />
              <span className="text-sm text-muted-foreground">Preview</span>
            </div>
          </div>
          <Button>Apply Changes</Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection()
      case 'workspace':
        return renderWorkspaceSection()
      case 'database':
        return renderDatabaseSection()
      case 'alerts':
        return <AlertsSection />
      case 'appearance':
        return renderAppearanceSection()
      default:
        return renderProfileSection()
    }
  }

  return (
    <div className="flex h-full gap-6">
      {/* Left Navigation */}
      <div className="w-64 space-y-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            Settings
          </h1>
        </div>
        <nav className="space-y-1">
          {navigationItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                navigate(`/settings/${item.id}`)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors",
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Content */}
      <div className="flex-1 max-w-4xl">
        {renderContent()}
      </div>
    </div>
  )
}