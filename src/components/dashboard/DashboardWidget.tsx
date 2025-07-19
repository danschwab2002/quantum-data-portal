import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, Hash, Table as TableIcon } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface DashboardWidgetProps {
  question: {
    id: string
    name: string
    query: string
    visualization_type: string
  }
}

export function DashboardWidget({ question }: DashboardWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const executeQuery = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { data: result, error } = await supabase.rpc('execute_sql_query', {
          query_text: question.query
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

    executeQuery()
  }, [question.query])

  const renderVisualization = () => {
    // Debug log para ver qué tipo de visualización se está recibiendo
    console.log('Question visualization_type:', question.visualization_type)
    console.log('Question visualization_type (lowercase):', question.visualization_type?.toLowerCase())
    
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

    const vizType = question.visualization_type?.toLowerCase?.() || '';
    console.log('Switch case matching against:', vizType)
    
    switch (vizType) {
      case 'número':
        console.log('Rendering number widget')
        return renderNumberWidget()
      case 'tabla':
        console.log('Rendering table widget')
        return renderTableWidget()
      case 'gráfico de barras':
        console.log('Rendering bar chart')
        return renderBarChart()
      case 'gráfico de líneas':
        console.log('Rendering line chart')
        return renderLineChart()
      default:
        console.log('Rendering default table widget for type:', vizType)
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

  const getIcon = () => {
    switch (question.visualization_type.toLowerCase()) {
      case 'número':
        return <Hash className="w-4 h-4" />
      case 'tabla':
        return <TableIcon className="w-4 h-4" />
      case 'gráfico de barras':
        return <BarChart3 className="w-4 h-4" />
      case 'gráfico de líneas':
        return <LineChartIcon className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-base flex items-center gap-2">
          {getIcon()}
          {question.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderVisualization()}
      </CardContent>
    </Card>
  )
}