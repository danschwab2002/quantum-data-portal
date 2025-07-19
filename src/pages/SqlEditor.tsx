import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Save, Database, Clock, CheckCircle, AlertCircle, FolderOpen } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

const SqlEditor = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast()
  
  const [query, setQuery] = useState(`-- Sample query from your analytics data
SELECT 
  COUNT(*)
FROM setting_analytics
WHERE event_type = 'connection_message_sent';`)

  const [isExecuting, setIsExecuting] = useState(false)
  const [queryResult, setQueryResult] = useState<any>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [questionName, setQuestionName] = useState("")
  const [visualizationType, setVisualizationType] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string>("")
  const [collections, setCollections] = useState<Collection[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Get collection from URL parameter
  const collectionFromUrl = searchParams.get('collection')

  useEffect(() => {
    fetchCollections()
  }, [])

  useEffect(() => {
    // Pre-select collection from URL if available
    if (collectionFromUrl && collections.length > 0) {
      const collectionExists = collections.find(c => c.id === collectionFromUrl)
      if (collectionExists) {
        setSelectedCollection(collectionFromUrl)
      }
    }
  }, [collectionFromUrl, collections])

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name, description')
        .order('name')

      if (error) {
        console.error('Error fetching collections:', error)
        return
      }

      setCollections(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const executeQuery = async () => {
    setIsExecuting(true)
    setQueryError(null)

    try {
      await executeBasicQuery()
    } catch (err: any) {
      setQueryError(err.message || 'Failed to execute query')
      setQueryResult(null)
    } finally {
      setIsExecuting(false)
    }
  }

  const executeBasicQuery = async () => {
    try {
      console.log('Executing query:', query)
      
      // Use the SQL function to execute the query directly
      const { data, error } = await supabase
        .rpc('execute_sql_query', { query_text: query.trim() })
      
      if (error) {
        console.error('Supabase RPC error:', error)
        setQueryError(error.message)
        setQueryResult(null)
        return
      }

      console.log('RPC result:', data)
      
      if (data && data.length > 0) {
        const resultArray = data[0].result
        
        if (Array.isArray(resultArray) && resultArray.length > 0) {
          // Extract columns from the first row
          const columns = Object.keys(resultArray[0])
          
          // Extract rows data
          const rows = resultArray.map((row: any) => 
            columns.map(col => {
              const value = row[col]
              // Format complex objects for display
              if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value)
              }
              return value
            })
          )
          
          setQueryResult({ columns, rows })
          setQueryError(null)
        } else {
          // Empty result
          setQueryResult({ columns: [], rows: [] })
          setQueryError(null)
        }
      } else {
        setQueryResult({ columns: [], rows: [] })
        setQueryError(null)
      }
    } catch (err: any) {
      console.error('Execute query error:', err)
      setQueryError(err.message || 'Failed to execute query')
      setQueryResult(null)
    }
  }

  const handleSaveQuestion = async () => {
    // Validación: verificar que los campos requeridos no estén vacíos
    if (!questionName.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre de la pregunta es requerido",
        variant: "destructive"
      })
      return
    }

    if (!visualizationType) {
      toast({
        title: "Error de validación", 
        description: "Debe seleccionar un tipo de visualización",
        variant: "destructive"
      })
      return
    }

    if (!query.trim()) {
      toast({
        title: "Error de validación",
        description: "La consulta SQL no puede estar vacía",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      // Insertar la pregunta en la base de datos
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          name: questionName.trim(),
          query: query.trim(),
          visualization_type: visualizationType
        })
        .select()
        .single()

      if (questionError) {
        console.error('Error saving question:', questionError)
        toast({
          title: "Error al guardar",
          description: questionError.message,
          variant: "destructive"
        })
        return
      }

      // Si hay una colección seleccionada, agregar la pregunta a la colección
      if (selectedCollection && questionData) {
        const { error: collectionError } = await supabase
          .from('collection_questions')
          .insert({
            collection_id: selectedCollection,
            question_id: questionData.id
          })

        if (collectionError) {
          console.error('Error adding question to collection:', collectionError)
          // Solo mostrar warning, la pregunta ya se guardó
          toast({
            title: "Pregunta guardada",
            description: "La pregunta se guardó pero no se pudo agregar a la colección",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Pregunta guardada con éxito",
            description: `"${questionName}" se ha guardado y agregado a la colección`,
          })
        }
      } else {
        toast({
          title: "Pregunta guardada con éxito",
          description: `"${questionName}" se ha guardado correctamente`,
        })
      }

      // Éxito: cerrar modal y limpiar campos
      setIsModalOpen(false)
      setQuestionName("")
      setVisualizationType("")
      setSelectedCollection("")
      
    } catch (err: any) {
      console.error('Unexpected error saving question:', err)
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al guardar la pregunta. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const selectedCollectionName = collections.find(c => c.id === selectedCollection)?.name

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SQL Editor</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Write and execute SQL queries against your database</p>
            {selectedCollectionName && (
              <Badge variant="outline" className="gap-1">
                <FolderOpen className="h-3 w-3" />
                {selectedCollectionName}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-500 border-green-500/20">
            <Database className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Query Editor */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Query Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Guardar Pregunta</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="question-name">Nombre de la Pregunta</Label>
                          <Input
                            id="question-name"
                            value={questionName}
                            onChange={(e) => setQuestionName(e.target.value)}
                            placeholder="Ej: Mensajes de Conexión Enviados (Total)"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="visualization-type">Tipo de Visualización</Label>
                          <Select value={visualizationType} onValueChange={setVisualizationType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="numero">Número</SelectItem>
                              <SelectItem value="tabla">Tabla</SelectItem>
                              <SelectItem value="grafico-barras">Gráfico de Barras</SelectItem>
                              <SelectItem value="grafico-lineas">Gráfico de Líneas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="collection">Colección (opcional)</Label>
                          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una colección" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Ninguna colección</SelectItem>
                              {collections.map((collection) => (
                                <SelectItem key={collection.id} value={collection.id}>
                                  <div className="flex items-center gap-2">
                                    <FolderOpen className="h-4 w-4" />
                                    {collection.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleSaveQuestion}
                            disabled={!questionName || !visualizationType || isSaving}
                          >
                            {isSaving ? "Guardando..." : "Guardar"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    onClick={executeQuery}
                    disabled={isExecuting}
                    className="bg-primary hover:bg-primary/90 shadow-glow"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isExecuting ? "Running..." : "Run Query"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[300px] font-mono text-sm bg-input border-border resize-none"
                placeholder="Write your SQL query here..."
              />
            </CardContent>
          </Card>

          {/* Query Results */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2">
                Results
                {queryResult && (
                  <Badge variant="outline" className="text-green-500 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {queryResult.rows.length} rows
                  </Badge>
                )}
                {queryError && (
                  <Badge variant="outline" className="text-red-500 border-red-500/20">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Error
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isExecuting && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Executing query...</span>
                </div>
              )}

              {queryError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive font-medium">Query Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{queryError}</p>
                </div>
              )}

              {queryResult && !isExecuting && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-border rounded-lg">
                    <thead className="bg-muted/50">
                      <tr className="border-b border-border">
                        {queryResult.columns.map((column: string, index: number) => (
                          <th key={index} className="text-left py-3 px-4 text-muted-foreground font-medium border-r border-border last:border-r-0">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row: any[], rowIndex: number) => (
                        <tr key={rowIndex} className="border-b border-border/50 hover:bg-muted/30 last:border-b-0">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="py-3 px-4 text-foreground border-r border-border/50 last:border-r-0">
                              <div className="max-w-xs truncate" title={cell}>
                                {cell}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!queryResult && !queryError && !isExecuting && (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Run a query to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Database Schema */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-foreground">Database Schema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">setting_analytics</p>
                <div className="space-y-1 text-xs text-muted-foreground pl-2">
                  <p>• id (text)</p>
                  <p>• created_at (timestamp)</p>
                  <p>• event_type (text)</p>
                  <p>• account (text)</p>
                  <p>• metadata (jsonb)</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">scraped_data_juanm</p>
                <div className="space-y-1 text-xs text-muted-foreground pl-2">
                  <p>• profile (text)</p>
                  <p>• post_url (text)</p>
                  <p>• post_type (text)</p>
                  <p>• post_caption (text)</p>
                  <p>• likes_count (integer)</p>
                  <p>• comments_count (integer)</p>
                  <p>• engagement_rate (numeric)</p>
                  <p>• analyze_post (text)</p>
                  <p>• isrecent (text)</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">n8n_chat_histories</p>
                <div className="space-y-1 text-xs text-muted-foreground pl-2">
                  <p>• id (integer)</p>
                  <p>• session_id (varchar)</p>
                  <p>• message (jsonb)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Queries */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-foreground">Recent Queries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Analytics events by type",
                "Recent social media posts", 
                "Chat session analysis"
              ].map((queryName, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  className="w-full justify-start text-xs h-8 text-muted-foreground hover:text-foreground"
                >
                  <Clock className="w-3 h-3 mr-2" />
                  {queryName}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SqlEditor