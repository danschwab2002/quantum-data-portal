
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, Hash, Table as TableIcon, Pencil, Trash2, Check, X, PieChart as PieChartIcon, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface DashboardWidgetProps {
  question?: {
    id: string
    name: string
    query: string
    visualization_type: string
  }
  widget?: {
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
    }
  }
  onUpdate?: () => void
}

export function DashboardWidget({ question, widget, onUpdate }: DashboardWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { toast } = useToast()

  // Use question from widget if available, otherwise use direct question prop
  const questionData = widget?.question || question

  useEffect(() => {
    const executeQuery = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { data: result, error } = await supabase.rpc('execute_sql_query', {
          query_text: questionData.query
        })

        if (error) {
          throw error
        }

        // The result comes as an array of objects inside the result field
        const queryResult = result && result.length > 0 ? result[0]?.result || [] : []
        setData(Array.isArray(queryResult) ? queryResult : [])
      } catch (err) {
        console.error('Error executing query:', err)
        setError('Error al ejecutar la consulta')
        // For demo purposes, set some mock data
        setData([
          { name: 'Ejemplo 1', value: 125 },
          { name: 'Ejemplo 2', value: 89 },
          { name: 'Ejemplo 3', value: 203 }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    if (questionData?.query) {
      executeQuery()
    }
  }, [questionData?.query])

  const handleNameUpdate = async () => {
    if (!newName.trim() || !questionData?.id) return

    try {
      const { error } = await supabase
        .from('questions')
        .update({ name: newName.trim() })
        .eq('id', questionData.id)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Nombre del widget actualizado correctamente"
      })

      setIsEditingName(false)
      if (onUpdate) onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleDeleteWidget = async () => {
    if (!widget?.id) return

    try {
      const { error } = await supabase
        .from('dashboard_widgets')
        .delete()
        .eq('id', widget.id)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Widget eliminado correctamente"
      })

      setShowEditDialog(false)
      if (onUpdate) onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const renderVisualization = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-destructive text-sm">{error}</div>
        </div>
      )
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Sin datos</div>
        </div>
      )
    }

    const vizType = questionData?.visualization_type?.toLowerCase?.() || '';
    
    switch (vizType) {
      case 'numero':
        return renderNumberWidget()
      case 'tabla':
        return renderTableWidget()
      case 'grafico-barras':
        return renderBarChart()
      case 'grafico-lineas':
        return renderLineChart()
      case 'grafico-circular':
        return renderPieChart()
      case 'grafico-funnel':
        return renderFunnelChart()
      default:
        return renderTableWidget()
    }
  }

  const renderNumberWidget = () => {
    const firstRow = data[0]
    const value = firstRow ? Object.values(firstRow)[0] : 0
    const numericValue = Number(value) || 0
    const changePercentage = Math.random() * 20 - 5 // Mock percentage change
    const isPositive = changePercentage >= 0

    return (
      <div className="text-center space-y-2">
        <div className="flex items-center justify-between">
          <Hash className="w-5 h-5 text-primary" />
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(changePercentage).toFixed(1)}%
          </div>
        </div>
        <div className="text-3xl font-bold text-foreground">
          {typeof numericValue === 'number' ? numericValue.toLocaleString() : String(value)}
        </div>
        <div className="text-sm text-muted-foreground">Este mes</div>
      </div>
    )
  }

  const renderTableWidget = () => {
    const keys = data.length > 0 ? Object.keys(data[0]) : []
    
    return (
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {keys.map((key) => (
                  <th key={key} className="text-left p-2 text-muted-foreground font-medium">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((row, index) => (
                <tr key={index} className="border-b border-border/50">
                  {keys.map((key) => (
                    <td key={key} className="p-2 text-foreground">
                      {row[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 5 && (
            <div className="text-center p-2 text-muted-foreground text-xs">
              Y {data.length - 5} filas más...
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderBarChart = () => {
    const chartData = data.slice(0, 10).map((row, index) => {
      const keys = Object.keys(row)
      return {
        name: row[keys[0]] || `Item ${index + 1}`,
        value: Number(row[keys[1]]) || 0
      }
    })

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderLineChart = () => {
    const chartData = data.slice(0, 10).map((row, index) => {
      const keys = Object.keys(row)
      return {
        name: row[keys[0]] || `Point ${index + 1}`,
        value: Number(row[keys[1]]) || 0
      }
    })

    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderPieChart = () => {
    const chartData = data.slice(0, 8).map((row, index) => {
      const keys = Object.keys(row)
      return {
        name: row[keys[0]] || `Item ${index + 1}`,
        value: Number(row[keys[1]]) || 0
      }
    })

    // Colores para el gráfico circular
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--accent))',
      'hsl(var(--muted))',
      'hsl(220, 70%, 60%)',
      'hsl(280, 70%, 60%)',
      'hsl(340, 70%, 60%)',
      'hsl(40, 70%, 60%)'
    ]

    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={70}
            fill="hsl(var(--primary))"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            formatter={(value) => [`${value}`, 'Valor']}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderFunnelChart = () => {
    const chartData = data.map((row, index) => {
      const keys = Object.keys(row)
      return {
        name: row[keys[0]] || `Stage ${index + 1}`,
        value: Number(row[keys[1]]) || 0
      }
    })

    return (
      <ResponsiveContainer width="100%" height={200}>
        <FunnelChart>
          <Funnel
            dataKey="value"
            data={chartData}
            isAnimationActive
            fill="hsl(var(--primary))"
          >
            <LabelList 
              position="center" 
              fill="white" 
              stroke="none" 
              fontSize={12}
              formatter={(value, entry) => `${entry.name}: ${value}`}
            />
          </Funnel>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            formatter={(value) => [`${value}`, 'Valor']}
          />
        </FunnelChart>
      </ResponsiveContainer>
    )
  }

  const getIcon = () => {
    if (!questionData?.visualization_type) return <BarChart3 className="w-4 h-4" />
    
    switch (questionData.visualization_type.toLowerCase()) {
      case 'numero':
        return <Hash className="w-4 h-4" />
      case 'tabla':
        return <TableIcon className="w-4 h-4" />
      case 'grafico-barras':
        return <BarChart3 className="w-4 h-4" />
      case 'grafico-lineas':
        return <LineChartIcon className="w-4 h-4" />
      case 'grafico-circular':
        return <PieChartIcon className="w-4 h-4" />
      case 'grafico-funnel':
        return <Filter className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  return (
    <Card className="bg-card/50 border-border group relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            {getIcon()}
            {questionData?.name || 'Sin título'}
          </CardTitle>
          
          {/* Edit Button - only show if we have a widget (not standalone question) */}
          {widget && (
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-muted"
                  onClick={() => setNewName(questionData?.name || "")}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Widget</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Edit Name Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Nombre del Widget</label>
                    <div className="flex gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nombre del widget"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNameUpdate()
                        }}
                      />
                      <Button onClick={handleNameUpdate} size="sm">
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Delete Section */}
                  <div className="space-y-3 pt-4 border-t">
                    <label className="text-sm font-medium text-destructive">Zona Peligrosa</label>
                    <div className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div>
                        <p className="text-sm font-medium">Eliminar Widget</p>
                        <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteWidget}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderVisualization()}
      </CardContent>
    </Card>
  )
}
