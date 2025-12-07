import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useUser } from '@clerk/clerk-react';
import { Link, NavLink } from "react-router-dom";

const ADMIN_ID = "user_358uhfB0Qi2yobJpykzod0H7SaK";

export function Header() {
  const linkBase = "px-3 py-2 rounded-full text-sm transition-colors";
  const inactive = "text-muted-foreground hover:text-foreground";
  const active = "text-foreground bg-card/90";

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