import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toolsAPI } from '../services/api';
import { ArrowLeft, ExternalLink, Tag, DollarSign, Calendar, Share2 } from 'lucide-react';

export default function ToolDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTool() {
      setLoading(true);
      try {
        const response = await toolsAPI.getById(id);
        setTool(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tool:', err);
        setError('Tool not found');
      } finally {
        setLoading(false);
      }
    }

    fetchTool();
  }, [id]);

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tool.name,
          text: tool.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <main className="pt-24 pb-16">
        <div className="container max-w-5xl">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-muted/20 rounded mb-8" />
            <div className="rounded-3xl border border-white/5 bg-card/60 overflow-hidden">
              <div className="h-64 bg-muted/20" />
              <div className="p-8 space-y-4">
                <div className="h-8 bg-muted/20 rounded w-1/2" />
                <div className="h-4 bg-muted/20 rounded w-3/4" />
                <div className="h-4 bg-muted/20 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !tool) {
    return (
      <main className="pt-24 pb-16">
        <div className="container max-w-5xl text-center">
          <h1 className="text-3xl font-bold mb-4">Tool Not Found</h1>
          <p className="text-muted-foreground mb-8">The tool you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/tools')}
            className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#370361] to-[#0b8793] hover:opacity-90 transition-opacity"
          >
            Browse All Tools
          </button>
        </div>
      </main>
    );
  }

  const gradientColor = pricingColors[tool.pricing_type] || "from-gray-500 to-gray-700";

  return (
    <main className="pt-24 pb-16">
      <div className="container max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Main Card */}
        <div className="rounded-3xl border border-white/5 bg-card/60 backdrop-blur-sm shadow-2xl overflow-hidden">
          {/* Hero Section with Logo */}
          <div className={`relative h-64 bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
            {tool.logo_url ? (
              <img
                src={tool.logo_url}
                alt={`${tool.name} logo`}
                className="w-32 h-32 object-contain rounded-2xl bg-white/10 p-4 shadow-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-6xl font-bold text-white/90">{tool.name[0]}</span>
            )}
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight mb-2">{tool.name}</h1>
                <p className="text-lg text-muted-foreground">{tool.description}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-card/60 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#370361] to-[#0b8793] hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Pricing */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-card/40">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pricing</p>
                  <p className="font-semibold">{pricingDisplay[tool.pricing_type]}</p>
                </div>
              </div>

              {/* Categories */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-card/40">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="font-semibold">{tool.categories?.length || 0}</p>
                </div>
              </div>

              {/* Date Added */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-card/40">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Added</p>
                  <p className="font-semibold">
                    {new Date(tool.date_added).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Categories List */}
            {tool.categories && tool.categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/tools?category=${cat.id}`}
                      className="px-4 py-2 rounded-full border border-white/10 bg-card/40 hover:bg-card/60 text-sm transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder sections for future features */}
            <div className="space-y-8">
              {/* Features Section - Placeholder */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Key Features</h2>
                <div className="p-6 rounded-xl border border-white/5 bg-card/40">
                  <p className="text-muted-foreground text-sm">
                    Feature comparisons coming soon! This will show detailed features, pros/cons, and use cases.
                  </p>
                </div>
              </div>

              {/* Reviews Section - Placeholder */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Reviews & Ratings</h2>
                <div className="p-6 rounded-xl border border-white/5 bg-card/40">
                  <p className="text-muted-foreground text-sm">
                    User reviews and ratings coming in Phase 3! Help the community by sharing your experience.
                  </p>
                </div>
              </div>

              {/* Related Tools - Placeholder */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Similar Tools</h2>
                <div className="p-6 rounded-xl border border-white/5 bg-card/40">
                  <p className="text-muted-foreground text-sm">
                    Related tools recommendations coming soon! We'll suggest similar AI tools based on categories and features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}