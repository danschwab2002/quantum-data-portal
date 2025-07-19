import { useState, useEffect } from "react"
import { useParams, Navigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AddWidgetModal } from "@/components/dashboard/AddWidgetModal"
import { DashboardWidget } from "@/components/dashboard/DashboardWidget"

interface Dashboard {
  id: string
  name: string
  description: string | null
  user_id: string
  created_at: string
}

interface DashboardWidget {
  id: string
  dashboard_id: string
  question_id: string
  grid_position: any
  question: {
    id: string
    name: string
    query: string
    visualization_type: string
    created_at: string
  }
}

export default function CustomDashboard() {
  const { dashboardId } = useParams<{ dashboardId: string }>()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchDashboard = async () => {
    if (!dashboardId) return

    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', dashboardId)
        .single()

      if (error) {
        throw error
      }

      setDashboard(data)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError('Dashboard no encontrado')
    }
  }

  const fetchWidgets = async () => {
    if (!dashboardId) return

    try {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .select(`
          *,
          question:questions(*)
        `)
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      setWidgets(data || [])
    } catch (err) {
      console.error('Error fetching widgets:', err)
      toast({
        title: "Error",
        description: "No se pudieron cargar los widgets",
        variant: "destructive",
      })
    }
  }

  const handleWidgetAdded = () => {
    fetchWidgets()
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchDashboard(), fetchWidgets()])
      setIsLoading(false)
    }

    loadData()
  }, [dashboardId])

  if (!dashboardId) {
    return <Navigate to="/" replace />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-muted-foreground">Cargando dashboard...</div>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-destructive text-lg mb-2">
            {error || 'Dashboard no encontrado'}
          </div>
          <div className="text-muted-foreground">
            Verifica que el dashboard existe y tienes permisos para acceder
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{dashboard.name}</h1>
          {dashboard.description && (
            <p className="text-muted-foreground mt-1">{dashboard.description}</p>
          )}
        </div>
        <AddWidgetModal 
          dashboardId={dashboardId} 
          onWidgetAdded={handleWidgetAdded}
        />
      </div>

      {/* Widgets Grid */}
      {widgets.length === 0 ? (
        <div className="flex items-center justify-center min-h-96 border-2 border-dashed border-border rounded-lg">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-2">
              Tu dashboard está vacío
            </div>
            <div className="text-muted-foreground text-sm mb-4">
              Agrega tu primer widget para comenzar a visualizar datos
            </div>
            <AddWidgetModal 
              dashboardId={dashboardId} 
              onWidgetAdded={handleWidgetAdded}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {widgets.map((widget) => (
            <div 
              key={widget.id} 
              className="col-span-1"
            >
              <DashboardWidget question={widget.question} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}