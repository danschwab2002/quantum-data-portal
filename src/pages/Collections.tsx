import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Plus, FileQuestion, MoreHorizontal, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Collections = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const collections = [
    {
      id: "1",
      name: "Sales Funnel",
      description: "Lead generation and conversion analytics",
      questions: 8,
      dashboards: 3,
      lastModified: "2 hours ago"
    },
    {
      id: "2", 
      name: "AI Performance",
      description: "AI appointment setter metrics and analysis",
      questions: 12,
      dashboards: 2,
      lastModified: "1 day ago"
    },
    {
      id: "3",
      name: "Business Metrics",
      description: "Revenue, ROI, and financial analytics",
      questions: 6,
      dashboards: 4,
      lastModified: "3 days ago"
    },
    {
      id: "4",
      name: "Customer Analytics",
      description: "Customer behavior and lifecycle analysis",
      questions: 10,
      dashboards: 1,
      lastModified: "1 week ago"
    }
  ]

  const recentQuestions = [
    { name: "Daily Conversion Rate", collection: "Sales Funnel", type: "question" },
    { name: "AI Call Success Rate", collection: "AI Performance", type: "question" },
    { name: "Monthly Revenue by Source", collection: "Business Metrics", type: "question" },
    { name: "Lead Quality Score", collection: "Sales Funnel", type: "question" },
    { name: "Response Time Analysis", collection: "AI Performance", type: "question" },
  ]

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Collections</h1>
          <p className="text-muted-foreground">Organize your questions and dashboards</p>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90 shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          New Collection
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search collections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Collections Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCollections.map((collection) => (
              <Card key={collection.id} className="bg-card border-border shadow-card hover:shadow-glow transition-smooth cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground text-lg">{collection.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{collection.description}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{collection.questions} questions</span>
                      <span>{collection.dashboards} dashboards</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {collection.lastModified}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Collection
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Recent Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentQuestions.map((question, index) => (
                <div key={index} className="p-2 rounded-lg hover:bg-muted/30 transition-smooth cursor-pointer">
                  <div className="flex items-start gap-2">
                    <FileQuestion className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{question.name}</p>
                      <p className="text-xs text-muted-foreground">{question.collection}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm h-9">
                <Plus className="w-4 h-4 mr-2" />
                New Question
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-9">
                <FolderOpen className="w-4 h-4 mr-2" />
                New Collection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Collections