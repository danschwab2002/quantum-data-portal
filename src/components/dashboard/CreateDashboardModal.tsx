import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

export function CreateDashboardModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

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

      toast({
        title: "Dashboard creado",
        description: "Tu dashboard ha sido creado exitosamente",
      })

      setIsOpen(false)
      setName("")
      setDescription("")
      
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