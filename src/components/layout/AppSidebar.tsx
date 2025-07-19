import { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import {
  BarChart3,
  Database,
  FolderOpen,
  Plus,
  Settings,
  FileQuestion,
  LayoutDashboard,
  Home,
  ChevronRight,
  ChevronDown
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "SQL Editor", url: "/sql-editor", icon: FileQuestion },
  { title: "Dashboards", url: "/dashboards", icon: LayoutDashboard },
  { title: "Collections", url: "/collections", icon: FolderOpen },
  { title: "Database", url: "/database", icon: Database },
  { title: "Settings", url: "/settings", icon: Settings },
]

const collections = [
  {
    name: "Sales Funnel",
    items: ["Lead Generation", "Appointment Setting", "Conversion Rate"],
  },
  {
    name: "AI Performance",
    items: ["Response Quality", "Call Analytics", "Success Rate"],
  },
  {
    name: "Business Metrics",
    items: ["Revenue", "ROI", "Customer Acquisition"],
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname
  const [expandedCollections, setExpandedCollections] = useState<string[]>(["Sales Funnel"])
  const collapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-glow" 
      : "text-white border-white/20 hover:scale-105 transition-smooth"

  const toggleCollection = (name: string) => {
    setExpandedCollections(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    )
  }

  return (
    <Sidebar className={collapsed ? "w-16" : "w-72"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-semibold text-sidebar-foreground">Analytics Pro</h1>
                <p className="text-xs text-muted-foreground">Dashboard Builder</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collections */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider mb-3">
              Collections
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2">
                {collections.map((collection) => (
                  <Collapsible
                    key={collection.name}
                    open={expandedCollections.includes(collection.name)}
                    onOpenChange={() => toggleCollection(collection.name)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 px-2 text-sm font-normal text-white hover:bg-secondary/80 hover:scale-105 transition-smooth"
                      >
                        {expandedCollections.includes(collection.name) ? (
                          <ChevronDown className="w-3 h-3 mr-2" />
                        ) : (
                          <ChevronRight className="w-3 h-3 mr-2" />
                        )}
                        <FolderOpen className="w-3 h-3 mr-2" />
                        {collection.name}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 space-y-1">
                      {collection.items.map((item) => (
                        <Button
                          key={item}
                          variant="ghost"
                          className="w-full justify-start h-7 px-2 text-xs font-normal text-white hover:bg-secondary/50 hover:scale-105 transition-smooth"
                        >
                          <FileQuestion className="w-3 h-3 mr-2" />
                          {item}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Quick Actions */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <Button 
              onClick={() => navigate('/sql-editor')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Question
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}