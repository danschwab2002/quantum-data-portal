import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList, Legend } from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, Hash, Table as TableIcon, Pencil, Trash2, Check, X, PieChart as PieChartIcon, Filter, Percent } from "lucide-react"
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
  } | null
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
    } | null
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
  const [showExpandedView, setShowExpandedView] = useState(false)
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
    } else if (!questionData) {
      // Handle case where there's no question data
      setIsLoading(false)
      setError('No hay datos de pregunta disponibles')
      setData([])
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
      case 'porcentaje':
        return renderPercentageWidget()
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

  // Function to render expanded visualization with larger dimensions
  const renderExpandedVisualization = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-destructive text-sm">{error}</div>
        </div>
      )
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Sin datos</div>
        </div>
      )
    }

    const vizType = questionData?.visualization_type?.toLowerCase?.() || '';
    
    switch (vizType) {
      case 'numero':
        return renderExpandedNumberWidget()
      case 'porcentaje':
        return renderExpandedPercentageWidget()
      case 'tabla':
        return renderExpandedTableWidget()
      case 'grafico-barras':
        return renderExpandedBarChart()
      case 'grafico-lineas':
        return renderExpandedLineChart()
      case 'grafico-circular':
        return renderExpandedPieChart()
      case 'grafico-funnel':
        return renderExpandedFunnelChart()
      default:
        return renderExpandedTableWidget()
    }
  }

  const renderExpandedNumberWidget = () => {
    const firstRow = data[0]
    const value = firstRow ? Object.values(firstRow)[0] : 0
    const numericValue = Number(value) || 0

    return (
      <div className="text-center space-y-6 py-12">
        <div className="flex items-center justify-center">
          <Hash className="w-12 h-12 text-primary" />
        </div>
        <div className="text-8xl font-bold text-foreground">
          {typeof numericValue === 'number' ? numericValue.toLocaleString() : String(value)}
        </div>
      </div>
    )
  }

  const renderExpandedPercentageWidget = () => {
    const firstRow = data[0]
    const value = firstRow ? Object.values(firstRow)[0] : 0
    const numericValue = Number(value) || 0
    
    // Convert to percentage format - if value is between 0-1, multiply by 100
    const percentageValue = numericValue <= 1 ? numericValue * 100 : numericValue

    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6">
        <div className="flex items-center justify-center">
          <Percent className="w-12 h-12 text-primary" />
        </div>
        <div className="text-8xl font-bold text-foreground">
          {percentageValue.toFixed(1)}%
        </div>
      </div>
    )
  }

  const renderExpandedTableWidget = () => {
    const keys = data.length > 0 ? Object.keys(data[0]) : []
    
    return (
      <div className="overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b border-border">
                {keys.map((key) => (
                  <th key={key} className="text-left p-3 text-muted-foreground font-medium">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                  {keys.map((key) => (
                    <td key={key} className="p-3 text-foreground">
                      {row[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderExpandedBarChart = () => {
    const chartData = data.slice(0, 20).map((row, index) => {
      const keys = Object.keys(row)
      return {
        name: row[keys[0]] || `Item ${index + 1}`,
        value: Number(row[keys[1]]) || 0
      }
    })

    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={14}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={14}
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

  const renderExpandedLineChart = () => {
    const chartData = data.slice(0, 20).map((row, index) => {
      const keys = Object.keys(row)
      return {
        name: row[keys[0]] || `Point ${index + 1}`,
        value: Number(row[keys[1]]) || 0
      }
    })

    return (
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={14}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={14}
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
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderExpandedPieChart = () => {
    const chartData = data.map((row, index) => {
      const keys = Object.keys(row)
      return {
        name: row[keys[0]] || `Item ${index + 1}`,
        value: Number(row[keys[1]]) || 0
      }
    })

    // Solo filtrar si todos los valores son 0, de lo contrario mostrar todos
    const hasValidData = chartData.some(item => item.value > 0)
    
    if (!hasValidData && data.length > 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No hay datos válidos para mostrar
        </div>
      )
    }

    // Paleta de colores atractivos para el gráfico circular
    const pieColors = [
      '#3B82F6', // Azul
      '#10B981', // Verde
      '#F59E0B', // Amarillo
      '#8B5CF6', // Púrpura
      '#EF4444', // Rojo
      '#F97316', // Naranja
      '#06B6D4', // Cian
      '#EC4899'  // Rosa
    ]

    return (
      <div style={{ width: '100%', height: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={80}
              outerRadius={160}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={pieColors[index % pieColors.length]}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
              labelStyle={{
                color: 'white'
              }}
              itemStyle={{
                color: 'white'
              }}
              formatter={(value, name) => {
                const total = chartData.reduce((sum, item) => sum + Number(item.value), 0)
                const percentage = ((Number(value) / total) * 100).toFixed(1)
                return [`${value} (${percentage}%)`, name]
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={60}
              wrapperStyle={{
                color: 'hsl(var(--foreground))',
                fontSize: '14px',
                paddingTop: '20px'
              }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderExpandedFunnelChart = () => {
    const chartData = data.map((row, index) => {
      const keys = Object.keys(row)
      return {
        name: row[keys[0]] || `Stage ${index + 1}`,
        value: Number(row[keys[1]]) || 0
      }
    })

    // Colores personalizados para cada stage del funnel
    const funnelColors = [
      'hsl(217, 91%, 60%)', // Azul vibrante
      'hsl(142, 76%, 36%)', // Verde
      'hsl(45, 93%, 47%)',  // Amarillo/Dorado
      'hsl(271, 81%, 56%)', // Púrpura
      'hsl(346, 87%, 43%)', // Rojo
      'hsl(24, 94%, 50%)',  // Naranja
      'hsl(195, 85%, 41%)', // Cian
      'hsl(291, 64%, 42%)'  // Magenta
    ]

    return (
      <ResponsiveContainer width="100%" height={500}>
        <FunnelChart layout="horizontal" width={800} height={500}>
          <Funnel
            dataKey="value"
            data={chartData}
            isAnimationActive
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={funnelColors[index % funnelColors.length]} />
            ))}
            <LabelList 
              position="center" 
              fill="white" 
              stroke="none" 
              fontSize={16}
              fontWeight="bold"
              formatter={(value, entry) => {
                if (entry && entry.name) {
                  return `${entry.name}\n${value}`
                }
                return `${value}`
              }}
            />
          </Funnel>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'white !important'
            }}
            labelStyle={{
              color: 'white !important'
            }}
            itemStyle={{
              color: 'white !important'
            }}
            formatter={(value, name) => [
              `${value}`, 
              name || 'Valor'
            ]}
            labelFormatter={(label) => `Stage: ${label}`}
          />
        </FunnelChart>
      </ResponsiveContainer>
    )
  }

  const renderNumberWidget = () => {
    const firstRow = data[0]
    const value = firstRow ? Object.values(firstRow)[0] : 0
    const numericValue = Number(value) || 0
    return (
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center">
          <Hash className="w-5 h-5 text-primary" />
        </div>
        <div className="text-3xl font-bold text-foreground">
          {typeof numericValue === 'number' ? numericValue.toLocaleString() : String(value)}
        </div>
      </div>
    )
  }

  const renderPercentageWidget = () => {
    const firstRow = data[0]
    const value = firstRow ? Object.values(firstRow)[0] : 0
    const numericValue = Number(value) || 0
    
    // Convert to percentage format - if value is between 0-1, multiply by 100
    const percentageValue = numericValue <= 1 ? numericValue * 100 : numericValue

    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
        <div className="text-4xl font-bold text-foreground">
          {percentageValue.toFixed(1)}%
        </div>
        <div className="text-sm text-muted-foreground mt-2">Este mes</div>
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
    const chartData = data.map((row, index) => {
      const keys = Object.keys(row)
      return {
        name: row[keys[0]] || `Item ${index + 1}`,
        value: Number(row[keys[1]]) || 0
      }
    })

    // Solo filtrar si todos los valores son 0, de lo contrario mostrar todos
    const hasValidData = chartData.some(item => item.value > 0)
    
    if (!hasValidData && data.length > 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No hay datos válidos para mostrar
        </div>
      )
    }

    // Paleta de colores atractivos para el gráfico circular
    const pieColors = [
      '#3B82F6', // Azul
      '#10B981', // Verde
      '#F59E0B', // Amarillo
      '#8B5CF6', // Púrpura
      '#EF4444', // Rojo
      '#F97316', // Naranja
      '#06B6D4', // Cian
      '#EC4899'  // Rosa
    ]

    return (
      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={45}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={pieColors[index % pieColors.length]}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px'
              }}
              labelStyle={{
                color: 'white'
              }}
              itemStyle={{
                color: 'white'
              }}
              formatter={(value, name) => {
                const total = chartData.reduce((sum, item) => sum + Number(item.value), 0)
                const percentage = ((Number(value) / total) * 100).toFixed(1)
                return [`${value} (${percentage}%)`, name]
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{
                color: 'hsl(var(--foreground))',
                fontSize: '11px',
                paddingTop: '10px'
              }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
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

    // Colores personalizados para cada stage del funnel
    const funnelColors = [
      'hsl(217, 91%, 60%)', // Azul vibrante
      'hsl(142, 76%, 36%)', // Verde
      'hsl(45, 93%, 47%)',  // Amarillo/Dorado
      'hsl(271, 81%, 56%)', // Púrpura
      'hsl(346, 87%, 43%)', // Rojo
      'hsl(24, 94%, 50%)',  // Naranja
      'hsl(195, 85%, 41%)', // Cian
      'hsl(291, 64%, 42%)'  // Magenta
    ]

    return (
      <ResponsiveContainer width="100%" height={200}>
        <FunnelChart layout="horizontal" width={400} height={200}>
          <Funnel
            dataKey="value"
            data={chartData}
            isAnimationActive
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={funnelColors[index % funnelColors.length]} />
            ))}
            <LabelList 
              position="center" 
              fill="white" 
              stroke="none" 
              fontSize={14}
              fontWeight="bold"
              formatter={(value, entry) => {
                if (entry && entry.name) {
                  return `${entry.name}\n${value}`
                }
                return `${value}`
              }}
            />
          </Funnel>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'white !important'
            }}
            labelStyle={{
              color: 'white !important'
            }}
            itemStyle={{
              color: 'white !important'
            }}
            formatter={(value, name) => [
              `${value}`, 
              name || 'Valor'
            ]}
            labelFormatter={(label) => `Stage: ${label}`}
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
      case 'porcentaje':
        return <Percent className="w-4 h-4" />
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
    <>
      <Card 
        className="bg-card/50 border-border group relative cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
        onClick={() => setShowExpandedView(true)}
      >
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
                    onClick={(e) => {
                      e.stopPropagation() // Prevent card click
                      setNewName(questionData?.name || "")
                    }}
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
        <CardContent onClick={(e) => e.stopPropagation()}>
          {renderVisualization()}
        </CardContent>
      </Card>

      {/* Expanded View Modal */}
      <Dialog open={showExpandedView} onOpenChange={setShowExpandedView}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {getIcon()}
              {questionData?.name || 'Sin título'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[75vh]">
            {renderExpandedVisualization()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
