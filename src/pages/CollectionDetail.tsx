import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FolderOpen, FileText, LayoutDashboard, Plus, MoreHorizontal, Edit, Trash2, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AddExistingQuestionModal } from "@/components/collections/AddExistingQuestionModal";
import { AddExistingDashboardModal } from "@/components/collections/AddExistingDashboardModal";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: string;
  name: string;
  query: string;
  visualization_type: string;
  created_at: string;
}

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const CollectionDetail = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (collectionId) {
      fetchCollectionData();
    }
  }, [collectionId]);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);

      // Fetch collection details
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (collectionError) {
        console.error('Error fetching collection:', collectionError);
        toast({
          title: "Error",
          description: "Collection not found",
          variant: "destructive",
        });
        navigate('/collections');
        return;
      }

      setCollection(collectionData);

      // Fetch questions in this collection
      const { data: collectionQuestions, error: questionsError } = await supabase
        .from('collection_questions')
        .select('question_id')
        .eq('collection_id', collectionId);

      if (!questionsError && collectionQuestions) {
        const questionIds = collectionQuestions.map(cq => cq.question_id);
        
        if (questionIds.length > 0) {
          const { data: questionsData, error: questionsDetailError } = await supabase
            .from('questions')
            .select('*')
            .in('id', questionIds);

          if (!questionsDetailError && questionsData) {
            setQuestions(questionsData);
          }
        }
      }

      // Fetch dashboards in this collection
      const { data: collectionDashboards, error: dashboardsError } = await supabase
        .from('collection_dashboards')
        .select('dashboard_id')
        .eq('collection_id', collectionId);

      if (!dashboardsError && collectionDashboards) {
        const dashboardIds = collectionDashboards.map(cd => cd.dashboard_id);
        
        if (dashboardIds.length > 0) {
          const { data: dashboardsData, error: dashboardsDetailError } = await supabase
            .from('dashboards')
            .select('*')
            .in('id', dashboardIds);

          if (!dashboardsDetailError && dashboardsData) {
            setDashboards(dashboardsData);
          }
        }
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load collection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('collection_questions')
        .delete()
        .eq('collection_id', collectionId)
        .eq('question_id', questionId);

      if (error) {
        console.error('Error removing question:', error);
        toast({
          title: "Error",
          description: "Failed to remove question from collection",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Question removed from collection",
      });
      
      fetchCollectionData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to remove question from collection",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDashboard = async (dashboardId: string) => {
    try {
      const { error } = await supabase
        .from('collection_dashboards')
        .delete()
        .eq('collection_id', collectionId)
        .eq('dashboard_id', dashboardId);

      if (error) {
        console.error('Error removing dashboard:', error);
        toast({
          title: "Error",
          description: "Failed to remove dashboard from collection",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Dashboard removed from collection",
      });
      
      fetchCollectionData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to remove dashboard from collection",
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading collection...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">Collection not found</h2>
        <Button onClick={() => navigate('/collections')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/collections')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{collection.name}</h1>
              {collection.description && (
                <p className="text-muted-foreground">{collection.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/sql-editor?collection=${collectionId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Nueva Pregunta
              </DropdownMenuItem>
              <AddExistingQuestionModal 
                collectionId={collectionId!} 
                onQuestionAdded={fetchCollectionData}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <FileText className="h-4 w-4 mr-2" />
                  Agregar Pregunta Existente
                </DropdownMenuItem>
              </AddExistingQuestionModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{questions.length}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{dashboards.length}</p>
                <p className="text-sm text-muted-foreground">Dashboards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{formatDate(collection.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Questions</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/sql-editor?collection=${collectionId}`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nueva Pregunta
                </DropdownMenuItem>
                <AddExistingQuestionModal 
                  collectionId={collectionId!} 
                  onQuestionAdded={fetchCollectionData}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Agregar Pregunta Existente
                  </DropdownMenuItem>
                </AddExistingQuestionModal>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {questions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">No questions in this collection yet</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="mt-3" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Question
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={() => navigate(`/sql-editor?collection=${collectionId}`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nueva Pregunta
                    </DropdownMenuItem>
                    <AddExistingQuestionModal 
                      collectionId={collectionId!} 
                      onQuestionAdded={fetchCollectionData}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <FileText className="h-4 w-4 mr-2" />
                        Agregar Pregunta Existente
                      </DropdownMenuItem>
                    </AddExistingQuestionModal>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {questions.map((question) => (
                <Card key={question.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{question.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{question.visualization_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(question.created_at)}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Question
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove from Collection
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove question?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the question from this collection. The question itself will not be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveQuestion(question.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Dashboards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dashboards</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Dashboard
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/dashboard`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nuevo Dashboard
                </DropdownMenuItem>
                <AddExistingDashboardModal 
                  collectionId={collectionId!} 
                  onDashboardAdded={fetchCollectionData}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Agregar Dashboard Existente
                  </DropdownMenuItem>
                </AddExistingDashboardModal>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {dashboards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <LayoutDashboard className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">No dashboards in this collection yet</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="mt-3" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Dashboard
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={() => navigate(`/dashboard`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nuevo Dashboard
                    </DropdownMenuItem>
                    <AddExistingDashboardModal 
                      collectionId={collectionId!} 
                      onDashboardAdded={fetchCollectionData}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Agregar Dashboard Existente
                      </DropdownMenuItem>
                    </AddExistingDashboardModal>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {dashboards.map((dashboard) => (
                <Card key={dashboard.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{dashboard.name}</CardTitle>
                        {dashboard.description && (
                          <CardDescription className="mt-1">
                            {dashboard.description}
                          </CardDescription>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(dashboard.created_at)}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            View Dashboard
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove from Collection
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove dashboard?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the dashboard from this collection. The dashboard itself will not be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveDashboard(dashboard.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetail;