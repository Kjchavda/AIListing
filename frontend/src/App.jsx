import "./index.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function Header() {
  const linkBase = "px-3 py-2 rounded-full text-sm transition-colors";
  const inactive = "text-muted-foreground hover:text-foreground";
  const active = "text-foreground bg-card/90";
  return (
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-background/50 backdrop-blur-sm">
      <div className="container flex items-center justify-between gap-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[rgba(7,7,9,1) 6.5%] to-[rgba(27,24,113,1) 93.2%] text-black font-extrabold shadow"
            aria-label="AI Toolkit logo"
          >
            AI
          </span>
          <span className="font-semibold tracking-tight">AI Toolkit</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/", label: "Home" },
            { to: "/categories", label: "Categories" },
            { to: "/pricing", label: "Pricing" },
            { to: "/blog", label: "Blog" },
          ].map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/get-started"
          className="hidden md:inline-flex items-center rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#370361] to-[#0b8793] hover:opacity-90 transition-opacity px-6 py-3"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="container py-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-sm text-muted-foreground">
        <div className="flex gap-4">
          <Link to="/about" className="hover:text-foreground">
            About
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
        </div>
        <p>© 2024 AI Toolkit. All rights reserved.</p>
      </div>
    </footer>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="relative min-h-screen">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[ radial-gradient( 111.4deg,  rgba(7,7,9,1) 6.5%, rgba(27,24,113,1) 93.2% )]" />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<Placeholder />} />
            <Route path="/pricing" element={<Placeholder />} />
            <Route path="/blog" element={<Placeholder />} />
            <Route path="/get-started" element={<Placeholder />} />
            <Route path="/about" element={<Placeholder />} />
            <Route path="/contact" element={<Placeholder />} />
            <Route path="/privacy" element={<Placeholder />} />
            <Route path="/terms" element={<Placeholder />} />
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
}
