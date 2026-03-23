import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Bookmark, ExternalLink, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/clerk-react";

const BookmarksPage = () => {
  const [bookmarkedTools, setBookmarkedTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getToken } = useAuth();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      // 1. Get the list of bookmarks (returns { id, tool_id, ... }) - authorized
      const token = await getToken();
      const bookmarksRes = await api.get('/bookmarks/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookmarks = bookmarksRes.data;

      if (bookmarks.length === 0) {
        setBookmarkedTools([]);
        return;
      }

      // 2. Extract Tool IDs (filtering out any nulls or workflow_ids if mixed)
      const toolIds = bookmarks
        .map((b) => b.tool_id)
        .filter((id) => id !== null);

      if (toolIds.length === 0) {
        setBookmarkedTools([]);
        return;
      }

      // 3. Fetch full details for these tools (authorized)
      // Backend doesn't expose a bulk GET by IDs consistently, so fetch individually
      const token2 = await getToken();
      const toolPromises = toolIds.map((id) =>
        api.get(`/tools/${id}`, { headers: { Authorization: `Bearer ${token2}` } })
      );
      const toolResponses = await Promise.all(toolPromises);
      const tools = toolResponses.map((r) => r.data);
      setBookmarkedTools(tools);

    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast({
        title: "Error",
        description: "Failed to load your bookmarks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (toolId, e) => {
    e.preventDefault(); // Prevent navigating to detail page if clicked
    e.stopPropagation();

    try {
      // Toggle/remove bookmark via authorized endpoint
      const token = await getToken();
      await api.post(`/tools/${toolId}/bookmark`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state immediately
      setBookmarkedTools((prev) => prev.filter((tool) => tool.id !== toolId));

      toast({
        title: "Bookmark Removed",
        description: "Tool removed from your saved list.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove bookmark.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen font-sans">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-blue-500 fill-blue-500" />
          My Bookmarks
        </h1>
        <p className="text-slate-400 mt-2">
          Your curated collection of AI tools.
        </p>
      </div>

      {bookmarkedTools.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
          <Bookmark className="h-16 w-16 mx-auto mb-4 text-slate-700" />
          <h2 className="text-xl font-semibold text-slate-200">No bookmarks yet</h2>
          <p className="text-slate-500 mt-2 mb-6">
            Explore tools and save your favorites to access them quickly here.
          </p>
          <Button asChild>
            <Link to="/">
              Browse Tools <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedTools.map((tool) => (
            <Link 
                to={`/tools/${tool.id}`} 
                key={tool.id}
                className="block group h-full"
            >
              <Card className="h-full border-slate-800 bg-slate-900 hover:border-slate-700 transition-all duration-200 flex flex-col hover:shadow-lg hover:shadow-blue-900/10">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-xl text-slate-100 group-hover:text-blue-400 transition-colors">
                        {tool.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1 mt-1">
                        {tool.tagline || "AI Tool"}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 shrink-0">
                      {tool.pricing_type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                    {tool.description}
                  </p>
                  
                  {tool.categories && tool.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {tool.categories.slice(0, 3).map((cat) => (
                        <Badge 
                          key={cat.id} 
                          variant="outline" 
                          className="border-slate-700 text-slate-400 text-xs"
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-4 border-t border-slate-800/50 flex justify-between gap-3">
                   <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/30 -ml-2"
                      onClick={(e) => handleRemoveBookmark(tool.id, e)}
                   >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                   </Button>

                   <Button 
                     variant="outline" 
                     size="sm"
                     className="bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300"
                     onClick={(e) => {
                       e.preventDefault();
                       window.open(tool.link, '_blank');
                     }}
                   >
                     Visit <ExternalLink className="ml-2 h-3 w-3" />
                   </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;