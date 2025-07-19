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
        description: "El nombre del dashboard es requerido",
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
          description: "Debes estar autenticado para crear un dashboard",
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

      // Si hay una colección seleccionada, agregar el dashboard a la colección
      if (selectedCollection && selectedCollection !== "none" && data) {
        const { error: collectionError } = await supabase
          .from('collection_dashboards')
          .insert({
            collection_id: selectedCollection,
            dashboard_id: data.id
          })

        if (collectionError) {
          console.error('Error adding dashboard to collection:', collectionError)
          // Solo mostrar warning, el dashboard ya se creó
          toast({
            title: "Dashboard creado",
            description: "El dashboard se creó pero no se pudo agregar a la colección",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Dashboard creado",
            description: "Tu dashboard ha sido creado y agregado a la colección exitosamente",
          })
        }
      } else {
        toast({
          title: "Dashboard creado",
          description: "Tu dashboard ha sido creado exitosamente",
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
        description: "Hubo un error al crear el dashboard",
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
          <DialogTitle className="text-foreground">Crear Nuevo Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="dashboard-name" className="text-foreground">
              Nombre del Dashboard
            </Label>
            <Input
              id="dashboard-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi Dashboard"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dashboard-description" className="text-foreground">
              Descripción (opcional)
            </Label>
            <Textarea
              id="dashboard-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del dashboard..."
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="collection" className="text-foreground">
              Colección (opcional)
            </Label>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona una colección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna colección</SelectItem>
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
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateDashboard} 
              disabled={isCreating}
            >
              {isCreating ? "Creando..." : "Crear Dashboard"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}