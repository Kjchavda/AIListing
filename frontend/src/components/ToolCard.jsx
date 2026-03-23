import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Bookmark, BookmarkMinus } from "lucide-react";

import api from "@/services/api";
import { toast } from "@/components/ui/use-toast";

export function ToolCard({ tool }) {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [bookmarked, setBookmarked] = useState(false);
  const [bmLoading, setBmLoading] = useState(false);

  // Prevent effect from overwriting user intent
  const userHasToggledRef = useRef(false);

  const pricingColors = {
    free: "from-green-500 to-emerald-500",
    freemium: "from-blue-500 to-cyan-500",
    paid: "from-purple-500 to-pink-500",
    contact_us: "from-orange-500 to-red-500",
  };

  const pricingDisplay = {
    free: "Free",
    freemium: "Freemium",
    paid: "Paid",
    contact_us: "Contact Us",
  };

  const gradientColor =
    pricingColors[tool.pricing_type] || "from-gray-500 to-gray-700";

  /**
   * INITIAL BOOKMARK SYNC
   * Runs ONLY on mount / tool change
   * Never overwrites user toggle
   */
  useEffect(() => {
    if (!tool?.id || userHasToggledRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const token = await getToken();
        const res = await api.get("/bookmarks/check", {
          params: { tool_id: tool.id },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!cancelled && typeof res.data?.exists === "boolean") {
          setBookmarked(res.data.exists);
        }
      } catch {
        // ignore (unauthenticated users)
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tool?.id]); // 🚨 intentionally NOT depending on getToken

  /**
   * TOGGLE BOOKMARK
   * Local state is authoritative after user action
   */
  const handleToggleBookmark = async (e) => {
    e.stopPropagation();

    if (!tool?.id || bmLoading) return;

    setBmLoading(true);
    userHasToggledRef.current = true;

    try {
      const token = await getToken();
      const res = await api.post(`/tools/${tool.id}/bookmark`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        setBookmarked(true);
        toast({ title: "Bookmarked", description: tool.name });
      } else if (res.status === 204) {
        setBookmarked(false);
        toast({ title: "Bookmark removed", description: tool.name });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not update bookmark",
      });
    } finally {
      setBmLoading(false);
    }
  };
  useEffect(() => {
  console.log("ToolCard mounted:", tool.id);
  return () => console.log("ToolCard unmounted:", tool.id);
}, []);


  return (
    <div
      onClick={() => navigate(`/tools/${tool.id}`)}
      className="group cursor-pointer rounded-2xl border border-white/5 bg-card/60 backdrop-blur-sm shadow-xl shadow-black/20 hover:shadow-black/30 transition-all hover:scale-[1.02] overflow-hidden"
    >
      {/* Header */}
      <div
        className={`relative h-40 w-full bg-gradient-to-br ${gradientColor} flex items-center justify-center`}
      >
        {tool.logo_url ? (
          <img
            src={tool.logo_url}
            alt={tool.name}
            className="w-20 h-20 object-contain rounded-xl bg-white/10 p-2"
          />
        ) : (
          <span className="text-4xl font-bold text-white">
            {tool.name[0]}
          </span>
        )}

        {/* Bookmark Button */}
        <button
          onClick={handleToggleBookmark}
          disabled={bmLoading}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-md bg-black/30 hover:bg-black/40 text-white flex items-center justify-center"
        >
          {bookmarked ? (
            <BookmarkMinus className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-semibold">{tool.name}</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
            {pricingDisplay[tool.pricing_type]}
          </span>
        </div>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {tool.description}
        </p>

        {tool.categories?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tool.categories.slice(0, 2).map((cat) => (
              <span
                key={cat.id}
                className="text-xs px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground"
              >
                {cat.name}
              </span>
            ))}
            {tool.categories.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{tool.categories.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
