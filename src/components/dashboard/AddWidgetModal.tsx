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
        const { data: sections } = await supabase
          .from('dashboard_sections')
          .select('id')
          .eq('dashboard_id', dashboardId)
          .order('display_order')
          .limit(1)
        
        if (sections && sections.length > 0) {
          targetSectionId = sections[0].id
        }
      }

      const { error } = await supabase
        .from('dashboard_widgets')
        .insert({
          dashboard_id: dashboardId,
          question_id: questionId,
          section_id: targetSectionId
        })

      if (error) {
        throw error
      }

      toast({
        title: "Widget agregado",
        description: "El widget ha sido agregado al dashboard",
      })

      setIsOpen(false)
      if (onClose) onClose()
      onWidgetAdded()
    } catch (error) {
      console.error('Error adding widget:', error)
      toast({
        title: "Error",
        description: "No se pudo agregar el widget",
        variant: "destructive",
      })
    } finally {
      setIsAdding(null)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchQuestions()
    }
  }, [isOpen])

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
            <div className="grid gap-3">
              {questions.map((question) => (
                <Card 
                  key={question.id}
                  className="bg-muted/50 border-border hover:bg-muted/70 transition-colors cursor-pointer"
                  onClick={() => handleAddWidget(question.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-foreground flex items-center gap-2">
                        {getVisualizationIcon(question.visualization_type)}
                        {question.name}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {question.visualization_type}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs font-mono text-muted-foreground truncate">
                      {question.query}
                    </CardDescription>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        disabled={isAdding === question.id}
                        className="w-full"
                      >
                        {isAdding === question.id ? "Agregando..." : "Agregar al Dashboard"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}