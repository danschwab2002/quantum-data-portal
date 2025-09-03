import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Database, Calendar, FileText, Pencil, Trash2, Check, X, Info } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Question {
  id: string;
  name: string;
  query: string;
  visualization_type: string;
  created_at: string;
}

interface QuestionDetails {
  question: Question;
  collections: string[];
  dashboards: { name: string; id: string }[];
}

const SavedQueries = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Error",
          description: "Failed to load saved queries",
          variant: "destructive",
        });
        return;
      }

      setQuestions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load saved queries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionDetails = async (question: Question) => {
    setLoadingDetails(true);
    try {
      // Fetch collections that contain this question
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collection_questions')
        .select('collections(name)')
        .eq('question_id', question.id);

      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
      }

      // Fetch dashboards that contain this question
      const { data: dashboardsData, error: dashboardsError } = await supabase
        .from('dashboard_widgets')
        .select('dashboards(name, id)')
        .eq('question_id', question.id);

      if (dashboardsError) {
        console.error('Error fetching dashboards:', dashboardsError);
      }

      const collections = collectionsData?.map((item: any) => item.collections?.name).filter(Boolean) || [];
      const dashboards = dashboardsData?.map((item: any) => ({
        name: item.dashboards?.name || '',
        id: item.dashboards?.id || ''
      })).filter(item => item.name) || [];

      setSelectedQuestion({
        question,
        collections,
        dashboards
      });
    } catch (error) {
      console.error('Error fetching question details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la consulta",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateQuery = (query: string, maxLength: number = 100) => {
    return query.length > maxLength ? query.substring(0, maxLength) + '...' : query;
  };

  const handleEditStart = (question: Question, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(question.id)
    setEditName(question.name)
  }

  const handleEditSave = async (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { error } = await supabase
        .from('questions')
        .update({ name: editName })
        .eq('id', questionId)

      if (error) throw error

      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, name: editName } : q
      ))

      toast({
        title: "Éxito",
        description: "Consulta actualizada correctamente",
      })
    } catch (error) {
      console.error('Error updating question:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la consulta",
        variant: "destructive",
      })
    } finally {
      setEditingId(null)
      setEditName("")
    }
  }

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(null)
    setEditName("")
  }

  const handleDelete = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      setQuestions(prev => prev.filter(q => q.id !== questionId))

      toast({
        title: "Éxito",
        description: "Consulta eliminada correctamente",
      })
    } catch (error) {
      console.error('Error deleting question:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la consulta",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading saved queries...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Saved Queries</h1>
          <p className="text-muted-foreground">
            View and manage all your saved SQL queries
          </p>
        </div>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved queries</h3>
            <p className="text-muted-foreground text-center">
              You haven't saved any queries yet. Create and save queries from the SQL Editor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <Card key={question.id} className="transition-shadow hover:shadow-md group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    {editingId === question.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-lg font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleEditSave(question.id, e)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditCancel}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <CardTitle className="text-xl">{question.name}</CardTitle>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(question.created_at)}
                      </div>
                      <Badge variant="secondary">
                        {question.visualization_type}
                      </Badge>
                    </div>
                  </div>
                  {editingId !== question.id && (
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchQuestionDetails(question);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Info className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalles de la Consulta</DialogTitle>
                            <DialogDescription>
                              Información completa sobre "{question.name}"
                            </DialogDescription>
                          </DialogHeader>
                          {loadingDetails ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-muted-foreground">Cargando detalles...</div>
                            </div>
                          ) : selectedQuestion && (
                            <div className="space-y-6">
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Nombre</h4>
                                <p className="text-lg font-semibold">{selectedQuestion.question.name}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Fecha de Creación</h4>
                                <p>{formatDate(selectedQuestion.question.created_at)}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Tipo de Visualización</h4>
                                <Badge variant="secondary">{selectedQuestion.question.visualization_type}</Badge>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Consulta SQL Completa</h4>
                                <div className="bg-muted rounded-md p-4 max-h-60 overflow-y-auto">
                                  <pre className="text-sm font-mono whitespace-pre-wrap">
                                    {selectedQuestion.question.query}
                                  </pre>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Colecciones</h4>
                                {selectedQuestion.collections.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {selectedQuestion.collections.map((collection, index) => (
                                      <Badge key={index} variant="outline">{collection}</Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">No pertenece a ninguna colección</p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Dashboards</h4>
                                {selectedQuestion.dashboards.length > 0 ? (
                                  <div className="space-y-2">
                                    {selectedQuestion.dashboards.map((dashboard, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <Badge variant="outline">{dashboard.name}</Badge>
                                        <span className="text-xs text-muted-foreground">({dashboard.id})</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">No se muestra en ningún dashboard</p>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleEditStart(question, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar consulta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La consulta "{question.name}" será eliminada permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(question.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Query</h4>
                    <div className="bg-muted rounded-md p-3">
                      <code className="text-sm font-mono">
                        {truncateQuery(question.query)}
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedQueries;