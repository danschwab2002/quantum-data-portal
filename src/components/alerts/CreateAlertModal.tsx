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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CustomFrequencySelector } from './CustomFrequencySelector';
import { Question } from './types';

const alertFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  query: z.string().min(1, 'SQL query is required'),
  threshold_operator: z.enum(['less_than', 'greater_than', 'equal_to']),
  threshold_value: z.number().min(0, 'Threshold must be positive'),
  webhook_url: z.string().url('Must be a valid URL'),
  check_frequency: z.string().min(1, 'Frequency is required'),
  is_active: z.boolean().default(true),
});

type AlertFormData = z.infer<typeof alertFormSchema>;

interface CreateAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertCreated: () => void;
}

export function CreateAlertModal({ open, onOpenChange, onAlertCreated }: CreateAlertModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      name: '',
      description: '',
      query: '',
      threshold_operator: 'less_than',
      threshold_value: 0,
      webhook_url: '',
      check_frequency: 'daily',
      is_active: true,
    },
  });


  const onSubmit = async (data: AlertFormData) => {
    setLoading(true);
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error: insertError } = await supabase
        .from('alerts' as any)
        .insert({
          name: data.name,
          description: data.description || null,
          query: data.query,
          threshold_operator: data.threshold_operator,
          threshold_value: data.threshold_value,
          webhook_url: data.webhook_url,
          check_frequency: data.check_frequency,
          is_active: data.is_active,
          user_id: user.user?.id
        });

      if (insertError) {
        if (insertError.message && insertError.message.includes('relation "public.alerts" does not exist')) {
          toast({
            title: "Database Setup Required",
            description: "Please run the database migration to create alerts. Your webhook URL will be saved: " + data.webhook_url,
            variant: "destructive",
          });
          return;
        }
        console.error('Insert error:', insertError);
        throw insertError;
      }
      
      toast({
        title: "Success",
        description: `Alert created successfully! Webhook: ${data.webhook_url}`,
      });

      form.reset();
      onAlertCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create alert",
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
          <DialogTitle>Create Smart Alert</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Low Daily Conversations" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SQL Query to Monitor</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="SELECT COUNT(*) FROM your_table WHERE condition"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this alert monitors and when it should trigger"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="threshold_operator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="less_than">Less than</SelectItem>
                        <SelectItem value="greater_than">Greater than</SelectItem>
                        <SelectItem value="equal_to">Equal to</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="threshold_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="check_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Frequency</FormLabel>
                    {field.value && field.value.startsWith('custom:') ? (
                      <FormControl>
                        <CustomFrequencySelector
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    ) : (
                      <div className="space-y-2">
                        <Select 
                          onValueChange={(value) => {
                            if (value === 'custom') {
                              // This will trigger the CustomFrequencySelector to open
                              field.onChange('custom:{"days":0,"hours":1,"minutes":0,"seconds":0}');
                            } else {
                              field.onChange(value);
                            }
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hourly">Every Hour</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="webhook_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://your-app.com/webhook/alerts"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this alert to start monitoring
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}