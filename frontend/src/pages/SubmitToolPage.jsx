import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react"; // Import useAuth to get the token
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

// I've added pt-24 here to fix your TODO
const SubmitToolPage = () => {
  // 1. State for the form fields
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  // 2. State for the categories
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // 3. State for form feedback
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 4. React Router and Clerk hooks
  const navigate = useNavigate();
  const { getToken } = useAuth(); // Clerk's hook to get the session token

  // 5. Fetch all categories on page load to show as checkboxes
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
    // Add or remove the category ID from the selectedCategories array
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

    const newTool = {
      name,
      description,
      link,
      category_ids: selectedCategories,
    };

    try {
      // Get the session token from Clerk
      const token = await getToken();

      // Send the POST request with the token in the header
      await api.post("/tools/", newTool, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(
        "Tool submitted successfully! It will be reviewed by our team."
      );
      // Redirect to homepage after 3 seconds
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

      {/* Show a success/error message after submission */}
      {message ? (
        <div className="p-4 bg-secondary rounded-md text-secondary-foreground">
          {message}
        </div>
      ) : (
        // Or show the form if no message
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Tool Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/*<div>
            <Label htmlFor="tagline">Tagline (Short Description)</Label>
            <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} required />
          </div>*/}
          <div>
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="link">Website Link (URL)</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Categories (select at least one)</Label>
            <div className="space-y-2 mt-2 p-4 border rounded-md max-h-48 overflow-y-auto">
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
                    <Label htmlFor={`category-${category.id}`}>
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

          {/* <Button type="submit" size="lg" disabled={isLoading || selectedCategories.length === 0}>
            {isLoading ? "Submitting..." : "Submit for Review"}
          </Button> */}
          <button
            type="submit" // ✅ key change
            disabled={isLoading || selectedCategories.length === 0}
            className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#370361] to-[#0b8793] hover:opacity-90 transition-opacity cursor-pointer"
          >
            {isLoading ? "Submitting..." : "Submit for Review"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SubmitToolPage;
