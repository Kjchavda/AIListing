import "./index.css";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, NavLink, Outlet } from "react-router-dom";
import { ClerkProvider, useUser } from '@clerk/clerk-react'; // Consolidated import
import { StrictMode } from "react";

// Pages
import HomePage from "./pages/HomePage";
import ToolDetailPage from "./pages/ToolDetailPage";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import SubmitToolPage from "./pages/SubmitToolPage";
import AdminPage from "./pages/AdminPage";

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

// --- CONFIGURATION ---
// Ideally, put this in a config file or .env variable so it's shared with AdminPage.jsx
const ADMIN_ID = "user_358uhfB0Qi2yobJpykzod0H7SaK"; 

function Header() {
  const linkBase = "px-3 py-2 rounded-full text-sm transition-colors";
  const inactive = "text-muted-foreground hover:text-foreground";
  const active = "text-foreground bg-card/90";

  // Use isLoaded to prevent flickering or incorrect checks during loading
  const { user, isLoaded } = useUser();

  const publicNavLinks = [
    { to: "/", label: "Home" },
    { to: "/categories", label: "Categories" },
    { to: "/blog", label: "Blog" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-background/50 backdrop-blur-sm">
      <div className="container flex items-center justify-between gap-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[rgba(7,7,9,1)_6.5%] to-[rgba(27,24,113,1)_93.2%] text-white font-extrabold shadow"
            aria-label="AI Toolkit logo"
          >
            AI
          </span>
          <span className="font-semibold tracking-tight">AI Toolkit</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
          {/* Public Links */}
          {publicNavLinks.map((l) => (
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

          {/* "Add Tool" Logic */}
          <SignedOut>
            <Link
              to="/sign-in"
              className={`${linkBase} ${inactive}`}
            >
              Add Tool
            </Link>
          </SignedOut>
          <SignedIn>
            <NavLink
              to="/submit-tool"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              Add Tool
            </NavLink>
          </SignedIn>

          {/* Admin Link Logic */}
          {/* Only show if loaded, user exists, and ID matches */}
          {isLoaded && user?.id === ADMIN_ID && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4">
            <SignedOut>
            <Link
                to={"/sign-in"}
                className="hidden md:inline-flex items-center rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#370361] to-[#0b8793] hover:opacity-90 transition-opacity px-6 py-3"
            >
                Get Started
            </Link>
            </SignedOut>

            <SignedIn>
            <UserButton />
            </SignedIn>
        </div>
      </div>
    </header>
  );
}

function Footer() {
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

const MainLayout = () => (
  <>
    <Header />
    {/* Added padding-top to avoid content hiding behind fixed header */}
    <main className="pt-20"> 
        <Outlet />
    </main>
    <Footer />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <div className="relative min-h-screen text-foreground">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(111.4deg,_rgba(7,7,9,1)_6.5%,_rgba(27,24,113,1)_93.2%)]" />

        <BrowserRouter>
          <Routes>
            {/* Routes with Header/Footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/tools/:id" element={<ToolDetailPage />} />
              <Route path="/categories" element={<Placeholder />} />
              <Route path="/submit-tool" element={<SubmitToolPage />} />
              <Route path="/admin" element={<AdminPage />} />

              <Route path="/pricing" element={<Placeholder />} />
              <Route path="/blog" element={<Placeholder />} />
              <Route path="/get-started" element={<Placeholder />} />
              <Route path="/about" element={<Placeholder />} />
              <Route path="/contact" element={<Placeholder />} />
              <Route path="/privacy" element={<Placeholder />} />
              <Route path="/terms" element={<Placeholder />} />
            </Route>

            {/* Auth pages WITHOUT layout */}
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />

            {/* catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY} 
        appearance={{ cssLayerName: 'clerk' }}
      >
        <App />
      </ClerkProvider>
    </StrictMode>
  );
}