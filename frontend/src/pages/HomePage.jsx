import { useEffect, useMemo, useState } from "react";
import { categoriesAPI, toolsAPI } from "../services/api";

import { Link , useSearchParams} from 'react-router-dom';
import { CategoryPill } from "../components/CategoryPill";
import { ToolCard } from "../components/ToolCard";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(()=>{
    const catIdfromParams = searchParams.get('category_id');
    if(!catIdfromParams){
      return null;
    }
    const initialCat = parseInt(catIdfromParams, 10);
    return !isNaN(initialCat) ? initialCat : null;
  });

  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //handling URL param changes
  const handleCategoryChange = (newCatId) => {
    // 1. Update the state (this triggers the useEffect to re-fetch tools)
    setActiveCat(newCatId);

    // 2. Update the URL
    if (newCatId === null) {
      // If "All" is clicked, remove the 'category_id' param
      setSearchParams(prev => {
        prev.delete('category_id');
        return prev;
      });
    } else {
      // If a specific category is clicked, set the param
      setSearchParams(prev => {
        prev.set('category_id', newCatId);
        return prev;
      });
    }
  };

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    }
    fetchCategories();
  }, []);

  // Fetch tools whenever category or search changes
  useEffect(() => {
    async function fetchTools() {
      setLoading(true);
      try {
        const params = {};
        if (activeCat) {
          params.category_id = activeCat;
        }
        if (query.trim()) {
          params.search = query.trim();
        }

        const response = await toolsAPI.getAll(params);
        setTools(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching tools:", err);
        setError("Failed to load tools");
      } finally {
        setLoading(false);
      }
    }

    // Debounce search
    const timeoutId = setTimeout(fetchTools, 300);
    return () => clearTimeout(timeoutId);
  }, [activeCat, query]);

  return (
    <main className="relative">
      <section className="pt-24 md:pt-28 pb-10 md:pb-12">
        <div className="container">
          <div className="text-center mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Discover the best AI tools to
              <br className="hidden md:block" /> boost your creativity and
              productivity.
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Explore hundreds of curated AI tools organized by category.
            </p>

            <div className="mt-8 mx-auto max-w-2xl">
              <div className="flex items-stretch gap-2 rounded-full border border-white/10 bg-card/60 p-2 backdrop-blur-sm">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for tools like 'video editing' or 'ChatGPT'"
                  className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => {}}
                  className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#370361] to-[#0b8793] hover:opacity-90 transition-opacity"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="mt-10 md:mt-12">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar rounded-2xl border border-white/10 bg-card/40 p-2">
              <CategoryPill
                label="All"
                active={activeCat === null}
                onClick={() => handleCategoryChange(null)}
              />
              {categories.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  label={cat.name}
                  active={cat.id === activeCat}
                  onClick={() => handleCategoryChange(cat.id)}
                  count={cat.tool_count}
                />
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mt-8 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-card/60 overflow-hidden animate-pulse"
                >
                  <div className="h-40 w-full bg-muted/20" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted/20 rounded w-3/4" />
                    <div className="h-3 bg-muted/20 rounded w-full" />
                    <div className="h-3 bg-muted/20 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tools Grid */}
          {!loading && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
              {tools.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">No tools found.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try a different search or category.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}