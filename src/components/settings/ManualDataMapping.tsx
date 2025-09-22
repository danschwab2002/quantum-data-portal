import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { Plus, PlusCircle, BarChart3, Calendar, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"

interface ManualEvent {
  event_type: string
  display_name: string
  count: number
  lastUpdated: Date
}

// Utility function to convert display name to technical event type
const formatEventType = (displayName: string): string => {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores
}

export function ManualDataMapping() {
  const [manualEvents, setManualEvents] = useState<ManualEvent[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newEventDisplayName, setNewEventDisplayName] = useState("")
  const [newEventType, setNewEventType] = useState("")
  const [loading, setLoading] = useState(true)
  const [isIncrementModalOpen, setIsIncrementModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [incrementAmount, setIncrementAmount] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
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

      // Get display name mappings from localStorage
      const displayMappings = JSON.parse(localStorage.getItem('manual_event_display_names') || '{}')

      // Group by event_type and count occurrences
      const eventCounts = data.reduce((acc: Record<string, { count: number, lastUpdated: Date, display_name: string }>, item) => {
        if (item.event_type) {
          if (!acc[item.event_type]) {
            acc[item.event_type] = { 
              count: 0, 
              lastUpdated: new Date(item.created_at!),
              display_name: displayMappings[item.event_type] || item.event_type
            }
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
        display_name: data.display_name,
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
    if (!newEventDisplayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a display name",
        variant: "destructive",
      })
      return
    }

    if (!newEventType.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event type",
        variant: "destructive",
      })
      return
    }

    // Validate event_type format
    const validEventTypeRegex = /^[a-z0-9_]+$/
    if (!validEventTypeRegex.test(newEventType)) {
      toast({
        title: "Error",
        description: "Event type must only contain lowercase letters, numbers, and underscores",
        variant: "destructive",
      })
      return
    }

    // Check if event_type already exists
    const existingEvent = manualEvents.find(e => e.event_type === newEventType)
    if (existingEvent) {
      toast({
        title: "Error",
        description: "An event with this identifier already exists",
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
          event_type: newEventType.trim(),
          account: 'MANUAL',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // Store display name mapping in localStorage
      const displayMappings = JSON.parse(localStorage.getItem('manual_event_display_names') || '{}')
      displayMappings[newEventType.trim()] = newEventDisplayName.trim()
      localStorage.setItem('manual_event_display_names', JSON.stringify(displayMappings))

      toast({
        title: "Success",
        description: "Manual event created successfully",
      })

      setNewEventDisplayName("")
      setNewEventType("")
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

  const handleDisplayNameChange = (value: string) => {
    setNewEventDisplayName(value)
    setNewEventType(formatEventType(value))
  }

  const incrementEvent = async (eventName: string, amount: number = 1, eventDate: Date = new Date()) => {
    try {
      const insertPromises = Array.from({ length: amount }, () => {
        const uniqueId = crypto.randomUUID()
        return supabase
          .from('setting_analytics')
        .insert({
          id: uniqueId,
          event_type: eventName,
          account: 'MANUAL',
          created_at: eventDate.toISOString()
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

  const openIncrementModal = (eventType: string, amount: number) => {
    setSelectedEvent(eventType)
    setIncrementAmount(amount)
    setSelectedDate(new Date()) // Reset to current date
    setIsIncrementModalOpen(true)
  }

  const handleIncrementSubmit = async () => {
    await incrementEvent(selectedEvent, incrementAmount, selectedDate)
    setIsIncrementModalOpen(false)
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
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={newEventDisplayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  placeholder="e.g., New Lead, Customer Support Call"
                />
                <p className="text-xs text-muted-foreground">
                  This is the friendly name that will be displayed in the interface.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type (Technical Identifier)</Label>
                <Input
                  id="event-type"
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  placeholder="e.g., new_lead, customer_support_call"
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and underscores only. This identifier will be used in the database.
                </p>
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
                    <CardTitle className="text-lg">{event.display_name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3" />
                      Last: {event.lastUpdated.toLocaleDateString()}
                    </CardDescription>
                    <Badge variant="outline" className="text-xs font-mono">
                      {event.event_type}
                    </Badge>
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
                    onClick={() => openIncrementModal(event.event_type, 1)}
                    className="flex-1"
                  >
                    <PlusCircle className="w-3 h-3 mr-1" />
                    +1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openIncrementModal(event.event_type, 5)}
                    className="flex-1"
                  >
                    <PlusCircle className="w-3 h-3 mr-1" />
                    +5
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openIncrementModal(event.event_type, 10)}
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

      {/* Increment Modal */}
      <Dialog open={isIncrementModalOpen} onOpenChange={setIsIncrementModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event Record</DialogTitle>
            <DialogDescription>
              Add {incrementAmount} record(s) for the selected event with a specific date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Event Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Select the date when this event occurred. Defaults to today.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsIncrementModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleIncrementSubmit}>
                Add {incrementAmount} Record{incrementAmount > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}