import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface CustomFrequencyValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CustomFrequencySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
}

export function CustomFrequencySelector({ value, onChange, children }: CustomFrequencySelectorProps) {
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState<CustomFrequencyValue>({
    days: 0,
    hours: 1,
    minutes: 0,
    seconds: 0,
  });

  // Parse the custom frequency value when component mounts or value changes
  useEffect(() => {
    if (value && value.startsWith('custom:')) {
      try {
        const parsed = JSON.parse(value.replace('custom:', ''));
        setFrequency(parsed);
      } catch (error) {
        console.error('Error parsing custom frequency:', error);
      }
    }
  }, [value]);

  const handleFrequencyChange = (field: keyof CustomFrequencyValue, val: string) => {
    const numValue = Math.max(0, parseInt(val) || 0);
    setFrequency(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = () => {
    // Ensure at least one value is greater than 0
    if (frequency.days === 0 && frequency.hours === 0 && frequency.minutes === 0 && frequency.seconds === 0) {
      frequency.minutes = 1; // Default to 1 minute if all are 0
    }
    
    const customValue = `custom:${JSON.stringify(frequency)}`;
    onChange(customValue);
    setOpen(false);
  };

  const formatFrequencyDisplay = (freq: CustomFrequencyValue): string => {
    const parts = [];
    if (freq.days > 0) parts.push(`${freq.days}d`);
    if (freq.hours > 0) parts.push(`${freq.hours}h`);
    if (freq.minutes > 0) parts.push(`${freq.minutes}m`);
    if (freq.seconds > 0) parts.push(`${freq.seconds}s`);
    
    return parts.length > 0 ? parts.join(' ') : '1m';
  };

  const getCurrentDisplay = (): string => {
    if (value && value.startsWith('custom:')) {
      return `Custom (${formatFrequencyDisplay(frequency)})`;
    }
    return 'Custom';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full justify-start">
            <Clock className="w-4 h-4 mr-2" />
            {getCurrentDisplay()}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Custom Frequency</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Set how often the alert should be checked. At least one field must be greater than 0.
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                min="0"
                max="365"
                value={frequency.days}
                onChange={(e) => handleFrequencyChange('days', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="23"
                value={frequency.hours}
                onChange={(e) => handleFrequencyChange('hours', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={frequency.minutes}
                onChange={(e) => handleFrequencyChange('minutes', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seconds">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={frequency.seconds}
                onChange={(e) => handleFrequencyChange('seconds', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm font-medium">Preview:</div>
            <div className="text-sm text-muted-foreground">
              Check every {formatFrequencyDisplay(frequency)}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}