import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, LayoutDashboard, Calendar, Clock, Pencil, Trash2, Check, X } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { CreateDashboardModal } from "@/components/dashboard/CreateDashboardModal"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Dashboard {
  id: string
  name: string
  description: string | null
  user_id: string
  created_at: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const { toast } = useToast()

  const fetchDashboards = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setDashboards(data || [])
    } catch (error) {
      console.error('Error fetching dashboards:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los dashboards",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboards()
  }, [])

  const handleEditStart = (dashboard: Dashboard, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(dashboard.id)
    setEditName(dashboard.name)
  }

  const handleEditSave = async (dashboardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { error } = await supabase
        .from('dashboards')
        .update({ name: editName })
        .eq('id', dashboardId)

      if (error) throw error

      setDashboards(prev => prev.map(d => 
        d.id === dashboardId ? { ...d, name: editName } : d
      ))

      toast({
        title: "Éxito",
        description: "Dashboard actualizado correctamente",
      })
    } catch (error) {
      console.error('Error updating dashboard:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el dashboard",
        variant: "destructive",
      })
    } finally {
      setEditingId(null)
      setEditName("")
    }
  }

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(null)
    setEditName("")
  }

  const handleDelete = async (dashboardId: string) => {
    try {
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', dashboardId)

      if (error) throw error

      setDashboards(prev => prev.filter(d => d.id !== dashboardId))

      toast({
        title: "Éxito",
        description: "Dashboard eliminado correctamente",
      })
    } catch (error) {
      console.error('Error deleting dashboard:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el dashboard",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-muted-foreground">Cargando dashboards...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboards</h1>
          <p className="text-muted-foreground mt-1">
            Crea y gestiona tus dashboards personalizados
          </p>
        </div>
        <CreateDashboardModal />
      </div>

      {dashboards.length === 0 ? (
        <div className="flex items-center justify-center min-h-96 border-2 border-dashed border-border rounded-lg">
          <div className="text-center max-w-md">
            <LayoutDashboard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tienes dashboards
            </h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer dashboard personalizado para comenzar a visualizar tus datos.
            </p>
            <CreateDashboardModal />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Card 
              key={dashboard.id}
              className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer group"
              onClick={() => navigate(`/dashboard/${dashboard.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                    {editingId === dashboard.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-lg font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleEditSave(dashboard.id, e)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditCancel}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                        {dashboard.name}
                      </CardTitle>
                    )}
                  </div>
                  {editingId !== dashboard.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleEditStart(dashboard, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar dashboard?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. El dashboard "{dashboard.name}" será eliminado permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(dashboard.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                {dashboard.description && (
                  <CardDescription className="text-muted-foreground">
                    {dashboard.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Creado el {formatDate(dashboard.created_at)}</span>
                </div>
                <div className="mt-4">
                  <Button size="sm" className="w-full">
                    Abrir Dashboard
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