import { useState, useEffect } from "react"
import { useParams, Navigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { DashboardSection } from "@/components/dashboard/DashboardSection"

interface Dashboard {
  id: string
  name: string
  description: string | null
  user_id: string
  created_at: string
}

interface DashboardSectionType {
  id: string
  dashboard_id: string
  name: string
  display_order: number
  created_at: string
}

interface DashboardWidget {
  id: string
  dashboard_id: string
  section_id: string
  question_id: string
  grid_position: any
  question: {
    id: string
    name: string
    query: string
    visualization_type: string
    created_at: string
  } | null
}

export default function CustomDashboard() {
  const { dashboardId } = useParams<{ dashboardId: string }>()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [sections, setSections] = useState<DashboardSectionType[]>([])
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [activeSection, setActiveSection] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
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

  const fetchSections = async () => {
    if (!dashboardId) return

    try {
      const { data, error } = await supabase
        .from('dashboard_sections')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .order('display_order', { ascending: true })

      if (error) {
        throw error
      }

      setSections(data || [])
      
      // Set active section to first section if not set
      if (data && data.length > 0 && !activeSection) {
        setActiveSection(data[0].id)
      }
    } catch (err) {
      console.error('Error fetching sections:', err)
      toast({
        title: "Error",
        description: "No se pudieron cargar las secciones",
        variant: "destructive",
      })
    }
  }

  const fetchWidgets = async () => {
    if (!dashboardId) return

    try {
      // First, fetch the widgets
      const { data: widgetsData, error: widgetsError } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: true })

      if (widgetsError) {
        throw widgetsError
      }

      if (!widgetsData || widgetsData.length === 0) {
        setWidgets([])
        return
      }

      // Get unique question IDs
      const questionIds = [...new Set(widgetsData.map(widget => widget.question_id).filter(Boolean))]

      if (questionIds.length === 0) {
        // If no questions are associated, set widgets without question data
        setWidgets(widgetsData.map(widget => ({ ...widget, question: null })))
        return
      }

      // Fetch questions separately
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds)

      if (questionsError) {
        console.warn('Error fetching questions:', questionsError)
        // Still set widgets, but without question data
        setWidgets(widgetsData.map(widget => ({ ...widget, question: null })))
        return
      }

      // Combine widgets with their corresponding questions
      const questionsMap = new Map(questionsData?.map(q => [q.id, q]) || [])
      const widgetsWithQuestions = widgetsData.map(widget => ({
        ...widget,
        question: questionsMap.get(widget.question_id) || null
      }))

      setWidgets(widgetsWithQuestions)
    } catch (err) {
      console.error('Error fetching widgets:', err)
      toast({
        title: "Error",
        description: "No se pudieron cargar los widgets",
        variant: "destructive",
      })
    }
  }

  const handleSectionUpdate = () => {
    fetchSections()
  }

  const handleWidgetUpdate = () => {
    fetchWidgets()
  }

  const handleAddSection = async () => {
    if (!newSectionName.trim() || !dashboardId) return

    try {
      const maxOrder = Math.max(...sections.map(s => s.display_order), -1)
      
      const { error } = await supabase
        .from('dashboard_sections')
        .insert({
          dashboard_id: dashboardId,
          name: newSectionName.trim(),
          display_order: maxOrder + 1
        })

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Sección creada correctamente"
      })

      setNewSectionName("")
      setShowAddSection(false)
      fetchSections()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchDashboard(), fetchSections(), fetchWidgets()])
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

  const getWidgetsForSection = (sectionId: string) => {
    return widgets.filter(widget => widget.section_id === sectionId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{dashboard.name}</h1>
        {dashboard.description && (
          <p className="text-muted-foreground">{dashboard.description}</p>
        )}
      </div>

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="flex items-center justify-center min-h-96 border-2 border-dashed border-border rounded-lg">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-2">
              Este dashboard no tiene secciones
            </div>
            <div className="text-muted-foreground text-sm mb-4">
              Crea tu primera sección para comenzar a organizar widgets
            </div>
            <Button onClick={() => setShowAddSection(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Sección
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Metabase-style Section Tabs */}
          <div className="flex items-center space-x-1 border-b border-border pb-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {section.name}
              </button>
            ))}
            
            {/* Add Section Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddSection(true)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Active Section Content */}
          {sections.map((section) => (
            activeSection === section.id && (
              <div key={section.id} className="animate-fade-in">
                <DashboardSection
                  section={section}
                  widgets={getWidgetsForSection(section.id)}
                  onSectionUpdate={handleSectionUpdate}
                  onWidgetUpdate={handleWidgetUpdate}
                />
              </div>
            )
          ))}
        </div>
      )}

      {/* Add Section Modal */}
      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Sección</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nombre de la sección"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSection()
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddSection(false)
                  setNewSectionName("")
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddSection} disabled={!newSectionName.trim()}>
                Crear Sección
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}