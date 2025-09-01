import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X, Trash2, Plus } from "lucide-react"
import { DashboardWidget } from "./DashboardWidget"
import { AddWidgetModal } from "./AddWidgetModal"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface DashboardSection {
  id: string
  name: string
  display_order: number
  dashboard_id: string
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

interface DashboardSectionProps {
  section: DashboardSection
  widgets: DashboardWidget[]
  onSectionUpdate: () => void
  onWidgetUpdate: () => void
}

export function DashboardSection({ section, widgets, onSectionUpdate, onWidgetUpdate }: DashboardSectionProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(section.name)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const { toast } = useToast()

  const handleNameUpdate = async () => {
    if (!newName.trim()) return

    try {
      const { error } = await supabase
        .from('dashboard_sections')
        .update({ name: newName.trim() })
        .eq('id', section.id)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Nombre de sección actualizado correctamente"
      })

      setIsEditingName(false)
      onSectionUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleDeleteSection = async () => {
    if (widgets.length > 0) {
      toast({
        title: "Error",
        description: "No puedes eliminar una sección que contiene widgets",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('dashboard_sections')
        .delete()
        .eq('id', section.id)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Sección eliminada correctamente"
      })

      onSectionUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleWidgetAdded = () => {
    setShowAddWidget(false)
    onWidgetUpdate()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2 flex-1">
            {isEditingName ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameUpdate()
                    if (e.key === 'Escape') {
                      setIsEditingName(false)
                      setNewName(section.name)
                    }
                  }}
                />
                <Button size="sm" onClick={handleNameUpdate}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingName(false)
                    setNewName(section.name)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <CardTitle className="flex-1">{section.name}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingName(true)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={() => setShowAddWidget(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Widget
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteSection}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {widgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay widgets en esta sección</p>
              <p className="text-sm">Agrega un widget para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget) => (
                <DashboardWidget
                  key={widget.id}
                  widget={widget}
                  onUpdate={onWidgetUpdate}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddWidget && (
        <AddWidgetModal
          dashboardId={section.dashboard_id}
          sectionId={section.id}
          onClose={() => setShowAddWidget(false)}
          onWidgetAdded={handleWidgetAdded}
        />
      )}
    </div>
  )
}