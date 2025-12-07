import { useEffect, useMemo, useState } from "react";
import { Link , useSearchParams} from 'react-router-dom';


export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");

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
              <br />
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

          
        </div>
      </section>
    </main>
  );
}