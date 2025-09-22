import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, PlusCircle, BarChart3, Calendar } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface ManualEvent {
  event_type: string
  count: number
  lastUpdated: Date
}

export function ManualDataMapping() {
  const [manualEvents, setManualEvents] = useState<ManualEvent[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadManualEvents()
  }, [])

  const loadManualEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('setting_analytics')
        .select('event_type, created_at')
        .eq('account', 'MANUAL')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by event_type and count occurrences
      const eventCounts = data.reduce((acc: Record<string, { count: number, lastUpdated: Date }>, item) => {
        if (item.event_type) {
          if (!acc[item.event_type]) {
            acc[item.event_type] = { count: 0, lastUpdated: new Date(item.created_at!) }
          }
          acc[item.event_type].count++
          const itemDate = new Date(item.created_at!)
          if (itemDate > acc[item.event_type].lastUpdated) {
            acc[item.event_type].lastUpdated = itemDate
          }
        }
        return acc
      }, {})

      const events = Object.entries(eventCounts).map(([event_type, data]) => ({
        event_type,
        count: data.count,
        lastUpdated: data.lastUpdated
      }))

      setManualEvents(events)
    } catch (error) {
      console.error('Error loading manual events:', error)
      toast({
        title: "Error",
        description: "Failed to load manual events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createNewEvent = async () => {
    if (!newEventTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event title",
        variant: "destructive",
      })
      return
    }

    try {
      // Generate a unique ID for the new record
      const uniqueId = crypto.randomUUID()
      
      const { error } = await supabase
        .from('setting_analytics')
        .insert({
          id: uniqueId,
          event_type: newEventTitle.trim(),
          account: 'MANUAL',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Manual event created successfully",
      })

      setNewEventTitle("")
      setIsCreateModalOpen(false)
      loadManualEvents()
    } catch (error) {
      console.error('Error creating manual event:', error)
      toast({
        title: "Error",
        description: "Failed to create manual event",
        variant: "destructive",
      })
    }
  }

  const incrementEvent = async (eventName: string, amount: number = 1) => {
    try {
      const insertPromises = Array.from({ length: amount }, () => {
        const uniqueId = crypto.randomUUID()
        return supabase
          .from('setting_analytics')
          .insert({
            id: uniqueId,
            event_type: eventName,
            account: 'MANUAL',
            created_at: new Date().toISOString()
          })
      })

      await Promise.all(insertPromises)

      toast({
        title: "Success",
        description: `Added ${amount} to ${eventName}`,
      })

      loadManualEvents()
    } catch (error) {
      console.error('Error incrementing event:', error)
      toast({
        title: "Error",
        description: "Failed to increment event",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading manual events...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manual Data Mapping</h2>
          <p className="text-muted-foreground">
            Create and track custom events manually. These events will appear in your dashboards and can trigger alerts.
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Manual Event</DialogTitle>
              <DialogDescription>
                Define a new event type that you can track manually.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g., Customer Support Calls, Manual Sales, etc."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createNewEvent}>
                  Create Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {manualEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No manual events yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first manual event to start tracking custom metrics.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {manualEvents.map((event) => (
            <Card key={event.event_type} className="bg-card border-border shadow-card hover:shadow-glow transition-smooth">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.event_type}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3" />
                      Last: {event.lastUpdated.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {event.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {event.count}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Count</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => incrementEvent(event.event_type, 1)}
                    className="flex-1"
                  >
                    <PlusCircle className="w-3 h-3 mr-1" />
                    +1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => incrementEvent(event.event_type, 5)}
                    className="flex-1"
                  >
                    <PlusCircle className="w-3 h-3 mr-1" />
                    +5
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => incrementEvent(event.event_type, 10)}
                    className="flex-1"
                  >
                    <PlusCircle className="w-3 h-3 mr-1" />
                    +10
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}