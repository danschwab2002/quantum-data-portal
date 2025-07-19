import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Button } from "@/components/ui/button"
import { Search, Bell, User, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useSidebar } from "@/components/ui/sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  
  return (
    <div className="min-h-screen w-full flex bg-background">
      <AppSidebar />
      
      {/* Main content area with proper margin */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-200 ease-linear ${
          isCollapsed ? 'ml-16' : 'ml-72'
        }`}
      >
        {/* Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search dashboards, questions..."
                className="w-64 h-9 pl-10 pr-4 bg-input border border-border rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <User className="w-4 h-4" />
            </Button>
            {user && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={signOut}
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  )
}