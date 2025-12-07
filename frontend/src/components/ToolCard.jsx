import { Link } from "react-router-dom";

export function ToolCard({ tool }) {
    const pricingColors = {
      free: "from-green-500 to-emerald-500",
      freemium: "from-blue-500 to-cyan-500",
      paid: "from-purple-500 to-pink-500",
      contact_us: "from-orange-500 to-red-500",
    };
  
    const gradientColor = pricingColors[tool.pricing_type] || "from-gray-500 to-gray-700";
  
    const pricingDisplay = {
      free: "Free",
      freemium: "Freemium",
      paid: "Paid",
      contact_us: "Contact Us",
    };
  
    return (
      <Link
        to={`/tools/${tool.id}`}
        className="group block rounded-2xl border border-white/5 bg-card/60 backdrop-blur-sm shadow-xl shadow-black/20 hover:shadow-black/30 transition-all hover:scale-[1.02] overflow-hidden"
      >
        {/* Logo/Header section */}
        <div className={`h-40 w-full bg-gradient-to-br ${gradientColor} opacity-90 flex items-center justify-center`}>
          {tool.logo_url ? (
            <img 
              src={tool.logo_url} 
              alt={`${tool.name} logo`}
              className="w-20 h-20 object-contain rounded-xl bg-white/10 p-2"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-4xl font-bold text-white/90">{tool.name[0]}</span>
          )}
        </div>
  
        {/* Content section */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold tracking-tight flex-1">{tool.name}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary whitespace-nowrap">
              {pricingDisplay[tool.pricing_type]}
            </span>
          </div>
          
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {tool.description}
          </p>
  
          {/* Categories */}
          {tool.categories && tool.categories.length > 0 && (
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
                <span className="text-xs px-2 py-0.5 text-muted-foreground">
                  +{tool.categories.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    );
}