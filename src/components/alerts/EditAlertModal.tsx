import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

const alertFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  question_id: z.string().min(1, 'Query is required'),
  threshold_operator: z.enum(['less_than', 'greater_than', 'equal_to']),
  threshold_value: z.number().min(0, 'Threshold must be positive'),
  webhook_url: z.string().url('Must be a valid URL'),
  check_frequency: z.enum(['hourly', 'daily', 'weekly']),
  is_active: z.boolean().default(true),
});

type AlertFormData = z.infer<typeof alertFormSchema>;

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
}

interface EditAlertModalProps {
  alert: Alert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertUpdated: () => void;
}

export function EditAlertModal({ alert, open, onOpenChange, onAlertUpdated }: EditAlertModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      name: alert.name,
      description: alert.description || '',
      question_id: alert.question_id,
      threshold_operator: alert.threshold_operator,
      threshold_value: alert.threshold_value,
      webhook_url: alert.webhook_url,
      check_frequency: alert.check_frequency,
      is_active: alert.is_active,
    },
  });

  const onSubmit = async (data: AlertFormData) => {
    setLoading(true);
    try {
      console.log('Would update alert:', { ...data, id: alert.id });
      toast({
        title: "Success",
        description: "Alert updated successfully! (Demo mode)",
      });
      onAlertUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Smart Alert</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Alert'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}