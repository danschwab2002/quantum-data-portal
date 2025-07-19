import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, Save, Database, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

const SqlEditor = () => {
  const [query, setQuery] = useState(`-- Sample query from your analytics data
SELECT 
  event_type,
  COUNT(*) as total_events,
  account
FROM setting_analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_type, account
ORDER BY total_events DESC;`)

  const [isExecuting, setIsExecuting] = useState(false)
  const [queryResult, setQueryResult] = useState<any>(null)
  const [queryError, setQueryError] = useState<string | null>(null)

  // Sample data for demo
  const sampleResult = {
    columns: ['date', 'total_leads', 'appointments', 'conversion_rate'],
    rows: [
      ['2024-01-15', 45, 31, 68.89],
      ['2024-01-14', 52, 35, 67.31],
      ['2024-01-13', 38, 26, 68.42],
      ['2024-01-12', 41, 29, 70.73],
      ['2024-01-11', 47, 32, 68.09],
    ]
  }

  const executeQuery = async () => {
    setIsExecuting(true)
    setQueryError(null)

    try {
      // For now, we'll simulate query execution but use real data from Supabase
      // In a production environment, you'd want to create a secure RPC function
      // to execute arbitrary SQL queries
      
      // Sample query execution based on the query content
      let data: any[] = []
      let error: any = null

      if (query.toLowerCase().includes('setting_analytics')) {
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('setting_analytics')
          .select('event_type, account, created_at')
          .limit(10)
        
        data = analyticsData || []
        error = analyticsError
      } else if (query.toLowerCase().includes('scraped_data_juanm')) {
        const { data: scrapedData, error: scrapedError } = await supabase
          .from('scraped_data_juanm')
          .select('profile, post_type, likes_count, comments_count, engagement_rate')
          .limit(10)
        
        data = scrapedData || []
        error = scrapedError
      } else if (query.toLowerCase().includes('n8n_chat_histories')) {
        const { data: chatData, error: chatError } = await supabase
          .from('n8n_chat_histories')
          .select('id, session_id, message')
          .limit(10)
        
        data = chatData || []
        error = chatError
      } else {
        // Default to analytics data
        const { data: defaultData, error: defaultError } = await supabase
          .from('setting_analytics')
          .select('*')
          .limit(5)
        
        data = defaultData || []
        error = defaultError
      }

      if (error) {
        setQueryError(error.message)
        setQueryResult(null)
      } else {
        // Transform the data to match our expected format
        if (data && data.length > 0) {
          const columns = Object.keys(data[0])
          const rows = data.map((row: any) => columns.map(col => row[col]))
          setQueryResult({ columns, rows })
        } else {
          setQueryResult({ columns: [], rows: [] })
        }
        setQueryError(null)
      }
    } catch (err: any) {
      setQueryError(err.message || 'Failed to execute query')
      setQueryResult(null)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SQL Editor</h1>
          <p className="text-muted-foreground">Write and execute SQL queries against your database</p>
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
                  <Button variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
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
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {queryResult.columns.map((column: string, index: number) => (
                          <th key={index} className="text-left py-3 px-2 text-muted-foreground font-medium">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row: any[], rowIndex: number) => (
                        <tr key={rowIndex} className="border-b border-border/50 hover:bg-muted/30">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="py-3 px-2 text-foreground">
                              {cell}
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