import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BarChart, LineChart, Hash, Table } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  name: string
  query: string
  visualization_type: string
  created_at: string
}

interface AddWidgetModalProps {
  dashboardId: string
  sectionId?: string
  onClose?: () => void
  onWidgetAdded: () => void
}

const getVisualizationIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'número':
      return <Hash className="w-4 h-4" />
    case 'tabla':
      return <Table className="w-4 h-4" />
    case 'gráfico de barras':
      return <BarChart className="w-4 h-4" />
    case 'gráfico de líneas':
      return <LineChart className="w-4 h-4" />
    default:
      return <BarChart className="w-4 h-4" />
  }
}

export function AddWidgetModal({ dashboardId, sectionId, onClose, onWidgetAdded }: AddWidgetModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchQuestions = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las preguntas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddWidget = async (questionId: string) => {
    setIsAdding(questionId)
    try {
      // If sectionId is provided, use it. Otherwise, find the first section for this dashboard
      let targetSectionId = sectionId
      
      if (!targetSectionId) {
        const { data: sections, error: sectionsError } = await supabase
          .from('dashboard_sections')
          .select('id')
          .eq('dashboard_id', dashboardId)
          .order('display_order')
          .limit(1)
        
        if (sectionsError) {
          console.error('Error fetching sections:', sectionsError)
          throw new Error('No se pudo encontrar una sección para el dashboard')
        }
        
        if (sections && sections.length > 0) {
          targetSectionId = sections[0].id
        } else {
          throw new Error('No hay secciones disponibles en este dashboard')
        }
      }

      console.log('Adding widget with:', {
        dashboard_id: dashboardId,
        question_id: questionId,
        section_id: targetSectionId
      })

      const { data, error } = await supabase
        .from('dashboard_widgets')
        .insert({
          id: crypto.randomUUID(),
          dashboard_id: dashboardId,
          question_id: questionId,
          section_id: targetSectionId
        })
        .select()

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      console.log('Widget added successfully:', data)

      toast({
        title: "Widget agregado",
        description: "El widget ha sido agregado al dashboard",
      })

      setIsOpen(false)
      if (onClose) onClose()
      onWidgetAdded()
    } catch (error: any) {
      console.error('Error adding widget:', error)
      const errorMessage = error?.message || error?.details || 'Error desconocido'
      toast({
        title: "Error",
        description: `No se pudo agregar el widget: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsAdding(null)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  // If onClose is provided, this is controlled externally
  const isControlled = !!onClose
  const dialogOpen = isControlled ? true : isOpen

  return (
    <Dialog open={dialogOpen} onOpenChange={isControlled ? onClose : setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Agregar Widget</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Cargando preguntas...</div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-muted-foreground mb-2">No tienes preguntas guardadas</div>
                <div className="text-sm text-muted-foreground">
                  Ve al Editor SQL para crear tus primeras preguntas
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              {questions.map((question) => (
                <div 
                  key={question.id}
                  className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
                  onClick={() => handleAddWidget(question.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-muted-foreground">
                      {getVisualizationIcon(question.visualization_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {question.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {question.visualization_type}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAdding === question.id}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddWidget(question.id)
                    }}
                  >
                    {isAdding === question.id ? "Adding..." : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}