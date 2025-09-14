import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Edit, Trash2, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Alert } from './types';

interface AlertCardProps {
  alert: Alert;
  onToggle: (alertId: string, isActive: boolean) => void;
  onEdit: (alert: Alert) => void;
  onDelete: (alertId: string) => void;
  onViewLogs: (alert: Alert) => void;
}

export function AlertCard({ alert, onToggle, onEdit, onDelete, onViewLogs }: AlertCardProps) {
  return (
    <Card className={`transition-all ${alert.is_active ? 'border-primary/20' : 'border-muted'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {alert.is_active ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
            {alert.name}
          </CardTitle>
          <Switch
            checked={alert.is_active}
            onCheckedChange={() => onToggle(alert.id, alert.is_active)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <span>Trigger when result &lt; {alert.threshold_value}</span>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant={alert.is_active ? "default" : "secondary"}>
            {alert.is_active ? "Active" : "Inactive"}
          </Badge>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onViewLogs(alert)}>
              <Activity className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(alert)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(alert.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}