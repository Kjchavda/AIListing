import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react';
import { StrictMode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Pages
import HomePage from "./pages/HomePage";
import ToolDetailPage from "./pages/ToolDetailPage";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import SubmitToolPage from "./pages/SubmitToolPage";
import AdminPage from "./pages/AdminPage";
import { CategoryPage } from "./pages/CategoryPage";

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

const MainLayout = () => (
  <>
    <Header />
    <main className="pt-20"> 
        <Outlet />
    </main>
    {/* <Footer /> */}
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
              <Route path="/categories" element={<CategoryPage />} />
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