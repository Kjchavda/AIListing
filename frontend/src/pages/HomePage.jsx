import { useMemo, useState } from "react";

const categories = ["All", "Writing", "Design", "Marketing", "Productivity", "Research"];

const seedTools = [
  {
    title: "AI Writer",
    description: "Generate high-quality content effortlessly.",
    category: "Writing",
    color: "from-emerald-400 to-teal-700",
  },
  {
    title: "AI Image Generator",
    description: "Create stunning visuals with AI.",
    category: "Design",
    color: "from-cyan-300 to-sky-700",
  },
  {
    title: "AI Social Media Manager",
    description: "Automate your social media tasks.",
    category: "Marketing",
    color: "from-indigo-300 to-violet-700",
  },
  {
    title: "AI Research Assistant",
    description: "Streamline your research process.",
    category: "Research",
    color: "from-teal-400 to-emerald-800",
  },
  {
    title: "AI Presentation Tool",
    description: "Design impactful presentations.",
    category: "Productivity",
    color: "from-amber-300 to-yellow-700",
  },
  {
    title: "AI Code Generator",
    description: "Write code faster and smarter.",
    category: "Productivity",
    color: "from-rose-300 to-pink-700",
  },
  {
    title: "AI Meeting Summarizer",
    description: "Summarize meetings efficiently.",
    category: "Productivity",
    color: "from-fuchsia-300 to-purple-700",
  },
  {
    title: "AI Email Assistant",
    description: "Manage your inbox with AI.",
    category: "Writing",
    color: "from-green-300 to-emerald-700",
  },
];

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm transition-colors whitespace-nowrap ${
        active
          ? "bg-primary text-primary-foreground shadow-[0_0_0_1px_hsla(0,0%,100%,0.08)_inset]"
          : "bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card"
      }`}
    >
      {label}
    </button>
  );
}

function ToolCard({ tool }) {
  return (
    <div className="group rounded-2xl border border-white/5 bg-card/60 backdrop-blur-sm shadow-xl shadow-black/20 hover:shadow-black/30 transition-shadow overflow-hidden">
      <div className={`h-40 w-full bg-gradient-to-br ${tool.color} opacity-90`} />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">{tool.title}</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">{tool.category}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  const tools = seedTools;

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const inCat = activeCat === "All" || t.category === activeCat;
      const matches = `${t.title} ${t.description}`.toLowerCase().includes(query.toLowerCase());
      return inCat && matches;
    });
  }, [query, activeCat, tools]);

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
                  placeholder="Search for tools like 'Image Generation'"
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

          <div className="mt-10 md:mt-12">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar rounded-2xl border border-white/10 bg-card/40 p-2">
              {categories.map((c) => (
                <CategoryPill key={c} label={c} active={c === activeCat} onClick={() => setActiveCat(c)} />
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool) => (
              <ToolCard key={`${tool.title}-${tool.category}`} tool={tool} />)
            )}
            {filtered.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-12">No tools found. Try a different search.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
