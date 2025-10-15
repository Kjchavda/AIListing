import { Link, useLocation } from "react-router-dom";

export default function Placeholder() {
  const location = useLocation();
  return (
    <div className="py-20">
      <div className="container text-center">
        <h2 className="text-3xl font-bold">Coming soon</h2>
        <p className="mt-3 text-muted-foreground">
          The page "{location.pathname}" is a placeholder. Tell me what you want here and I'll build it.
        </p>
        <Link className="inline-flex mt-6 px-5 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90" to="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
