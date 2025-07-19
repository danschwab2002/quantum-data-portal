import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { LayoutDashboard, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Dashboard {
  id: string
  name: string
  description: string | null
  created_at: string
}

interface AddExistingDashboardModalProps {
  collectionId: string
  onDashboardAdded: () => void
  children: React.ReactNode
}

export function AddExistingDashboardModal({ collectionId, onDashboardAdded, children }: AddExistingDashboardModalProps) {
  const [open, setOpen] = useState(false)
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [filteredDashboards, setFilteredDashboards] = useState<Dashboard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchAvailableDashboards()
    }
  }, [open, collectionId])

  useEffect(() => {
    const filtered = dashboards.filter(dashboard =>
      dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dashboard.description && dashboard.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredDashboards(filtered)
  }, [dashboards, searchTerm])

  const fetchAvailableDashboards = async () => {
    setLoading(true)
    try {
      // First, get dashboards already in this collection
      const { data: collectionDashboards, error: collectionError } = await supabase
        .from('collection_dashboards')
        .select('dashboard_id')
        .eq('collection_id', collectionId)

      if (collectionError) throw collectionError

      const existingDashboardIds = collectionDashboards?.map(cd => cd.dashboard_id) || []

      // Then get all dashboards not in this collection
      const { data: allDashboards, error: dashboardsError } = await supabase
        .from('dashboards')
        .select('*')
        .order('created_at', { ascending: false })

      if (dashboardsError) throw dashboardsError

      // Filter out dashboards already in the collection
      const availableDashboards = allDashboards?.filter(d => !existingDashboardIds.includes(d.id)) || []
      setDashboards(availableDashboards)
    } catch (error) {
      console.error('Error fetching dashboards:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los dashboards disponibles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDashboard = async (dashboardId: string) => {
    setAddingIds(prev => new Set(prev).add(dashboardId))
    
    try {
      const { error } = await supabase
        .from('collection_dashboards')
        .insert({
          collection_id: collectionId,
          dashboard_id: dashboardId
        })

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Dashboard agregado a la colección",
      })

      // Remove the dashboard from available list
      setDashboards(prev => prev.filter(d => d.id !== dashboardId))
      onDashboardAdded()
    } catch (error) {
      console.error('Error adding dashboard:', error)
      toast({
        title: "Error",
        description: "No se pudo agregar el dashboard a la colección",
        variant: "destructive",
      })
    } finally {
      setAddingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(dashboardId)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Agregar Dashboard Existente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar dashboards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-3 max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Cargando dashboards...</div>
              </div>
            ) : filteredDashboards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LayoutDashboard className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  {searchTerm ? "No se encontraron dashboards" : "No hay dashboards disponibles para agregar"}
                </p>
              </div>
            ) : (
              filteredDashboards.map((dashboard) => (
                <Card key={dashboard.id} className="transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{dashboard.name}</CardTitle>
                        {dashboard.description && (
                          <CardDescription className="mt-1">
                            {dashboard.description}
                          </CardDescription>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(dashboard.created_at)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddDashboard(dashboard.id)}
                        disabled={addingIds.has(dashboard.id)}
                      >
                        {addingIds.has(dashboard.id) ? "Agregando..." : "Agregar"}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}