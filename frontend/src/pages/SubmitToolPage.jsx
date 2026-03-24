// frontend/src/pages/SubmitToolPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const SubmitToolPage = () => {
  // 1. State for the form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [pricingType, setPricingType] = useState("free");

  // 2. State for the categories
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // 3. State for form feedback
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 4. React Router and Clerk hooks
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // 5. Fetch all categories on page load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories/");
        setAllCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // 6. Handler for category checkbox changes
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 7. Handler for the main form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Matches the Pydantic ToolCreate schema precisely
    const newTool = {
      name,
      description,
      link,
      logo_url: logoUrl || null,
      pricing_type: pricingType,
      category_ids: selectedCategories,
    };

    try {
      const token = await getToken();

      await api.post("/tools/", newTool, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(
        "Tool submitted successfully! It will be reviewed by our team."
      );
      
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Failed to submit tool:", error);
      setMessage("Failed to submit tool. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl pt-24">
      <Button asChild variant="outline" className="mb-8">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all tools
        </Link>
      </Button>

      <h1 className="text-4xl font-bold mb-8">Submit a New Tool</h1>

      {message ? (
        <div className="p-4 bg-secondary rounded-md text-secondary-foreground font-medium border border-border">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div>
            <Label htmlFor="name">Tool Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Midjourney"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="What does this AI tool do?"
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="link">Website Link (URL)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://.../logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pricing_type">Pricing Model</Label>
            <select
              id="pricing_type"
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
              <option value="contact_us">Contact Us</option>
            </select>
          </div>

          <div>
            <Label>Categories (select at least one)</Label>
            <div className="space-y-2 mt-2 p-4 border border-input rounded-md max-h-48 overflow-y-auto bg-background/50">
              {allCategories.length > 0 ? (
                allCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      onCheckedChange={() => handleCategoryChange(category.id)}
                    />
                    <Label htmlFor={`category-${category.id}`} className="cursor-pointer font-normal">
                      {category.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Loading categories...
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || selectedCategories.length === 0}
              className="w-full md:w-auto px-8 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#370361] to-[#0b8793] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SubmitToolPage;