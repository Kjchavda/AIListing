import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../services/api";

const ADMIN_USER_ID = "user_358uhfB0Qi2yobJpykzod0H7SaK";

const AdminPage = () => {
  const [pendingTools, setPendingTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (isLoaded) {
      if (!user || user.id !== ADMIN_USER_ID) {
        navigate("/"); // Redirect to home if not admin
      }
    }
  }, [isLoaded, user, navigate]);

  // Fetch pending tools on mount (only if admin)
  useEffect(() => {
    if (isLoaded && user && user.id === ADMIN_USER_ID) {
      fetchPendingTools();
    }
  }, [isLoaded, user]);

  const fetchPendingTools = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await api.get("/admin/pending-tools", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingTools(response.data);
    } catch (err) {
      console.error("Error fetching pending tools:", err);
      setError("Failed to load pending tools. Are you an admin?");
    } finally {
      setLoading(false);
    }
  };

  // Handle Approve Action
  const handleApprove = async (toolId) => {
    try {
      const token = await getToken();
      await api.post(
        `/admin/tools/${toolId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Remove the tool from the local list
      setPendingTools((prev) => prev.filter((tool) => tool.id !== toolId));
    } catch (err) {
      console.error("Error approving tool:", err);
      alert("Failed to approve tool.");
    }
  };

  // Handle Reject Action
  const handleReject = async (toolId) => {
    if (!window.confirm("Are you sure you want to reject and delete this tool?"))
      return;

    try {
      const token = await getToken();
      await api.delete(`/admin/tools/${toolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove the tool from the local list
      setPendingTools((prev) => prev.filter((tool) => tool.id !== toolId));
    } catch (err) {
      console.error("Error rejecting tool:", err);
      alert("Failed to reject tool.");
    }
  };

  // Show loading while checking auth
  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 pt-24 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-24 max-w-4xl font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Review and manage tool submissions.</p>
        </div>
        <Badge variant="outline" className="text-sm py-1 px-3 border-slate-700 text-slate-300">
          {pendingTools.length} Pending
        </Badge>
      </div>

      {pendingTools.length === 0 ? (
        <div className="text-center py-16 px-4 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-slate-600" />
          <p className="text-xl font-semibold text-slate-300">All caught up!</p>
          <p className="text-sm mt-2 text-slate-500">No pending tools to review at this moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingTools.map((tool) => (
            <Card
              key={tool.id}
              className="w-full transition-all duration-200 hover:shadow-lg hover:border-slate-700 border-slate-800 bg-slate-900 text-slate-100"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-white">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="text-base text-slate-400 font-medium">
                      {tool.tagline}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-2 h-9 text-blue-400 hover:text-blue-300 border-slate-700 bg-transparent hover:bg-slate-800"
                    asChild
                  >
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit Link
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-5">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  {tool.categories && tool.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tool.categories.map((cat) => (
                        <Badge 
                          key={cat.id} 
                          variant="secondary"
                          className="px-2.5 py-0.5 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center text-xs text-slate-500 pt-2">
                    <span className="font-medium mr-2">Submitter ID:</span>
                    <code className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-800">
                      {tool.user_id}
                    </code>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 bg-slate-950/30 p-4 rounded-b-xl border-t border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => handleReject(tool.id)}
                  className="gap-2 border-red-900/50 text-red-400 bg-red-950/10 hover:bg-red-950/30 hover:text-red-300 hover:border-red-900"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(tool.id)}
                  className="gap-2 bg-green-600 hover:bg-green-500 text-white shadow-sm border border-transparent"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;