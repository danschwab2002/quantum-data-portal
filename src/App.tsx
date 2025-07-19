import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./components/auth/AuthProvider";
import Dashboard from "./pages/Dashboard";
import CustomDashboard from "./pages/CustomDashboard";
import SqlEditor from "./pages/SqlEditor";
import SavedQueries from "./pages/SavedQueries";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import DatabaseConnection from "./pages/DatabaseConnection";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard/:dashboardId" element={<CustomDashboard />} />
                  <Route path="/sql-editor" element={<SqlEditor />} />
                  <Route path="/saved-queries" element={<SavedQueries />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/collection/:collectionId" element={<CollectionDetail />} />
                  <Route path="/database" element={<DatabaseConnection />} />
                  <Route path="/dashboards" element={<Dashboard />} />
                  <Route path="/settings" element={<Dashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
