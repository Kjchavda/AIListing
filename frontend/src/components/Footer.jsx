import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="container py-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-sm text-muted-foreground">
        <div className="flex gap-4">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
        </div>
        <p>© 2024 AI Toolkit. All rights reserved.</p>
      </div>
    </footer>
  );
}