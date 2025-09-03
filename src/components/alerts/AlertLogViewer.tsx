import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  name: string;
  description: string | null;
}

interface AlertLog {
  id: string;
  triggered_at: string;
  actual_value: number;
  threshold_value: number;
}

interface AlertLogViewerProps {
  alert: Alert;
  logs: AlertLog[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertLogViewer({ alert, logs, open, onOpenChange }: AlertLogViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alert Logs: {alert.name}
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>Alert History</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No alerts have been triggered yet.
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex justify-between p-2 border rounded">
                    <span>{new Date(log.triggered_at).toLocaleString()}</span>
                    <span>{log.actual_value} vs {log.threshold_value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}