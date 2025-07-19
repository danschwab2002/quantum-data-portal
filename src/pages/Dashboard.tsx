import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, LayoutDashboard, Calendar, Clock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { CreateDashboardModal } from "@/components/dashboard/CreateDashboardModal"

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
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                    {dashboard.name}
                  </CardTitle>
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