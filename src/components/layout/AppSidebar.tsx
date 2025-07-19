import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Database, FolderOpen, Plus, Settings, FileQuestion, LayoutDashboard, Home, ChevronRight, ChevronDown } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { CreateDashboardModal } from "@/components/dashboard/CreateDashboardModal";
const navigationItems = [{
  title: "Dashboard",
  url: "/",
  icon: Home
}, {
  title: "SQL Editor",
  url: "/sql-editor",
  icon: FileQuestion
}, {
  title: "Dashboards",
  url: "/dashboards",
  icon: LayoutDashboard
}, {
  title: "Collections",
  url: "/collections",
  icon: FolderOpen
}, {
  title: "Database",
  url: "/database",
  icon: Database
}, {
  title: "Settings",
  url: "/settings",
  icon: Settings
}];
interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
}

export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const collapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({
    isActive
  }: {
    isActive: boolean;
  }) => isActive ? "bg-primary text-primary-foreground font-medium shadow-glow" : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-smooth";

  const fetchDashboards = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dashboards:', error);
        return;
      }

      setDashboards(data || []);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, []);
  return <Sidebar className={collapsed ? "w-16" : "w-72"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && <div>
                <h1 className="text-lg font-semibold text-sidebar-foreground">Analytics Pro</h1>
                <p className="text-xs text-muted-foreground">Dashboard Builder</p>
              </div>}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-4 h-4 bg-slate-950" />
                      {!collapsed && <span className="text-slate-50">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dashboards */}
        {!collapsed && <SidebarGroup>
            <div className="flex items-center justify-between px-3 mb-3">
              <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                Dashboards
              </SidebarGroupLabel>
              <CreateDashboardModal />
            </div>
            <SidebarGroupContent>
              <div className="space-y-1">
                {dashboards.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                    No tienes dashboards
                  </div>
                ) : (
                  dashboards.map(dashboard => (
                    <Button 
                      key={dashboard.id} 
                      variant="ghost" 
                      className="w-full justify-start h-8 px-3 text-sm font-normal text-white hover:text-white hover:bg-white/10 hover:scale-105 transition-all"
                      onClick={() => navigate(`/dashboard/${dashboard.id}`)}
                    >
                      <LayoutDashboard className="w-3 h-3 mr-2" />
                      {dashboard.name}
                    </Button>
                  ))
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>}

        {/* Quick Actions */}
        {!collapsed && <div className="mt-auto p-4 border-t border-sidebar-border">
            <Button onClick={() => navigate('/sql-editor')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              New Question
            </Button>
          </div>}
      </SidebarContent>
    </Sidebar>;
}