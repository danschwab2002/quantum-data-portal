import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FolderOpen, Search, FileText } from "lucide-react";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { useNavigate } from "react-router-dom";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  questionsCount?: number;
  dashboardsCount?: number;
}

interface RecentQuestion {
  id: string;
  name: string;
  visualization_type: string;
  created_at: string;
  collectionName?: string;
}

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<RecentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollections();
    fetchRecentQuestions();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      
      // Fetch collections with counts
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .order('updated_at', { ascending: false });

      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        toast({
          title: "Error",
          description: "Failed to load collections",
          variant: "destructive",
        });
        return;
      }

      // Fetch counts for each collection
      const collectionsWithCounts = await Promise.all(
        (collectionsData || []).map(async (collection) => {
          const [questionsResult, dashboardsResult] = await Promise.all([
            supabase
              .from('collection_questions')
              .select('id', { count: 'exact' })
              .eq('collection_id', collection.id),
            supabase
              .from('collection_dashboards')
              .select('id', { count: 'exact' })
              .eq('collection_id', collection.id)
          ]);

          return {
            ...collection,
            questionsCount: questionsResult.count || 0,
            dashboardsCount: dashboardsResult.count || 0,
          };
        })
      );

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent questions:', error);
        return;
      }

      setRecentQuestions(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewCollection = (collectionId: string) => {
    navigate(`/collection/${collectionId}`);
  };

  const handleAddQuestion = (collectionId: string) => {
    navigate(`/sql-editor?collection=${collectionId}`);
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (collection.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-muted-foreground">
              Organize your questions and dashboards
            </p>
          </div>
        </div>
        <CreateCollectionModal onCollectionCreated={fetchCollections} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          {filteredCollections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No collections found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm 
                    ? "No collections match your search criteria."
                    : "You haven't created any collections yet. Create your first collection to organize your queries and dashboards."
                  }
                </p>
                {!searchTerm && <CreateCollectionModal onCollectionCreated={fetchCollections} />}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCollections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onUpdate={fetchCollections}
                  onViewCollection={handleViewCollection}
                  onAddQuestion={handleAddQuestion}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Questions Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentQuestions.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent questions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentQuestions.map((question) => (
                    <div key={question.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{question.name}</h4>
                          <p className="text-xs text-muted-foreground">{question.visualization_type}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(question.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Collections;