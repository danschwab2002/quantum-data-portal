import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Question {
  id: string
  name: string
  query: string
  visualization_type: string
  created_at: string
}

interface AddExistingQuestionModalProps {
  collectionId: string
  onQuestionAdded: () => void
  children: React.ReactNode
}

export function AddExistingQuestionModal({ collectionId, onQuestionAdded, children }: AddExistingQuestionModalProps) {
  const [open, setOpen] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchAvailableQuestions()
    }
  }, [open, collectionId])

  useEffect(() => {
    const filtered = questions.filter(question =>
      question.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredQuestions(filtered)
  }, [questions, searchTerm])

  const fetchAvailableQuestions = async () => {
    setLoading(true)
    try {
      // First, get questions already in this collection
      const { data: collectionQuestions, error: collectionError } = await supabase
        .from('collection_questions')
        .select('question_id')
        .eq('collection_id', collectionId)

      if (collectionError) throw collectionError

      const existingQuestionIds = collectionQuestions?.map(cq => cq.question_id) || []

      // Then get all questions not in this collection
      const { data: allQuestions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (questionsError) throw questionsError

      // Filter out questions already in the collection
      const availableQuestions = allQuestions?.filter(q => !existingQuestionIds.includes(q.id)) || []
      setQuestions(availableQuestions)
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: "Error",
        description: "Failed to load available questions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async (questionId: string) => {
    setAddingIds(prev => new Set(prev).add(questionId))
    
    try {
      const { error } = await supabase
        .from('collection_questions')
        .insert({
          collection_id: collectionId,
          question_id: questionId
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Question added to collection",
      })

      // Remove the question from available list
      setQuestions(prev => prev.filter(q => q.id !== questionId))
      onQuestionAdded()
    } catch (error) {
      console.error('Error adding question:', error)
      toast({
        title: "Error",
        description: "Failed to add question to collection",
        variant: "destructive",
      })
    } finally {
      setAddingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Existing Question</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-3 max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading questions...</div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  {searchTerm ? "No questions found" : "No questions available to add"}
                </p>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <Card key={question.id} className="transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{question.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{question.visualization_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(question.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddQuestion(question.id)}
                        disabled={addingIds.has(question.id)}
                      >
                        {addingIds.has(question.id) ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}