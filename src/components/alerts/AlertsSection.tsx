import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, AlertTriangle, Clock, Webhook } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreateAlertModal } from './CreateAlertModal';
import { EditAlertModal } from './EditAlertModal';
import { AlertCard } from './AlertCard';
import { AlertLogViewer } from './AlertLogViewer';

interface Alert {
  id: string;
  name: string;
  description: string | null;
  question_id: string;
  threshold_operator: 'less_than' | 'greater_than' | 'equal_to';
  threshold_value: number;
  webhook_url: string;
  is_active: boolean;
  check_frequency: 'hourly' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
  questions?: {
    query: string;
    name: string;
  };
}

interface AlertLog {
  id: string;
  alert_id: string;
  triggered_at: string;
  threshold_value: number;
  actual_value: number;
  webhook_response_status: number | null;
}

export function AlertsSection() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const fetchAlerts = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Try to fetch from alerts table, fallback to mock data if table doesn't exist yet
      const { data, error } = await supabase
        .from('alerts' as any)
        .select(`
          *,
          questions (
            query,
            name
          )
        `)
        .eq('user_id', user.user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, show message and use empty array
        if (error.message.includes('relation "public.alerts" does not exist')) {
          toast({
            title: "Database Setup Required",
            description: "Please run the database migration to create the alerts table.",
            variant: "destructive",
          });
          setAlerts([]);
          return;
        }
        throw error;
      }
      
      setAlerts((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error", 
        description: "Failed to fetch alerts",
        variant: "destructive",
      });
    }
  };

  const fetchAlertLogs = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('alert_logs' as any)
        .select(`
          *,
          alerts!inner (
            user_id
          )
        `)
        .eq('alerts.user_id', user.user?.id)
        .order('triggered_at', { ascending: false })
        .limit(50);

      if (error) {
        if (error.message.includes('relation "public.alert_logs" does not exist')) {
          setAlertLogs([]);
          return;
        }
        throw error;
      }
      setAlertLogs((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching alert logs:', error);
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alerts' as any)
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        if (error.message.includes('relation "public.alerts" does not exist')) {
          toast({
            title: "Database Setup Required",
            description: "Please run the database migration to enable alert updates.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_active: !isActive, updated_at: new Date().toISOString() }
          : alert
      ));
      
      toast({
        title: "Success",
        description: `Alert ${!isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive",
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts' as any)
        .delete()
        .eq('id', alertId);

      if (error) {
        if (error.message.includes('relation "public.alerts" does not exist')) {
          toast({
            title: "Database Setup Required",
            description: "Please run the database migration to enable alert deletion.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAlerts(), fetchAlertLogs()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Smart Alerts</h2>
            <p className="text-muted-foreground">Configure intelligent alerts with webhook notifications</p>
          </div>
        </div>
        <div className="text-center py-8">Loading alerts...</div>
      </div>
    );
  }

  const activeAlerts = alerts.filter(alert => alert.is_active);
  const recentLogs = alertLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Alerts</h2>
          <p className="text-muted-foreground">Configure intelligent alerts with webhook notifications</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Triggers</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentLogs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Alerts</h3>
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No alerts configured yet.</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first alert to get started with intelligent monitoring.</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Alert
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggle={toggleAlert}
                onEdit={setEditingAlert}
                onDelete={deleteAlert}
                onViewLogs={setSelectedAlert}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentLogs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                {recentLogs.map((log) => {
                  const alert = alerts.find(a => a.id === log.alert_id);
                  return (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{alert?.name || 'Unknown Alert'}</span>
                        <span className="text-muted-foreground ml-2">
                          triggered at {new Date(log.triggered_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {log.actual_value} vs {log.threshold_value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      <CreateAlertModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onAlertCreated={fetchAlerts}
      />

      {editingAlert && (
        <EditAlertModal
          alert={editingAlert}
          open={!!editingAlert}
          onOpenChange={(open) => !open && setEditingAlert(null)}
          onAlertUpdated={fetchAlerts}
        />
      )}

      {selectedAlert && (
        <AlertLogViewer
          alert={selectedAlert}
          logs={alertLogs.filter(log => log.alert_id === selectedAlert.id)}
          open={!!selectedAlert}
          onOpenChange={(open) => !open && setSelectedAlert(null)}
        />
      )}
    </div>
  );
}