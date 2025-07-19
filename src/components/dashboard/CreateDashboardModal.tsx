import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FolderOpen } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

export function CreateDashboardModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string>("none")
  const [collections, setCollections] = useState<Collection[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      fetchCollections()
    }
  }, [isOpen])

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name, description')
        .order('name')

      if (error) {
        console.error('Error fetching collections:', error)
        return
      }

      setCollections(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCreateDashboard = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Dashboard name is required",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be authenticated to create a dashboard",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from('dashboards')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // If a collection is selected, add the dashboard to the collection
      if (selectedCollection && selectedCollection !== "none" && data) {
        const { error: collectionError } = await supabase
          .from('collection_dashboards')
          .insert({
            collection_id: selectedCollection,
            dashboard_id: data.id
          })

        if (collectionError) {
          console.error('Error adding dashboard to collection:', collectionError)
          // Only show warning, the dashboard was already created
          toast({
            title: "Dashboard created",
            description: "The dashboard was created but could not be added to the collection",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Dashboard created",
            description: "Your dashboard has been created and added to the collection successfully",
          })
        }
      } else {
        toast({
          title: "Dashboard created",
          description: "Your dashboard has been created successfully",
        })
      }

      setIsOpen(false)
      setName("")
      setDescription("")
      setSelectedCollection("none")
      
      // Navigate to the new dashboard
      navigate(`/dashboard/${data.id}`)
    } catch (error) {
      console.error('Error creating dashboard:', error)
      toast({
        title: "Error",
        description: "There was an error creating the dashboard",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="dashboard-name" className="text-foreground">
              Dashboard Name
            </Label>
            <Input
              id="dashboard-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Dashboard"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dashboard-description" className="text-foreground">
              Description (optional)
            </Label>
            <Textarea
              id="dashboard-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dashboard description..."
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="collection" className="text-foreground">
              Collection (optional)
            </Label>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No collection</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      {collection.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDashboard} 
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Dashboard"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}