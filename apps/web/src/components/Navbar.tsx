import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MagneticElement } from "@/components/animations/MagneticElement";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useActiveAccount } from "thirdweb/react";
import { useAuth } from "@/hooks/use-auth";

const NAV_LINKS = [
  { label: "Explore", to: "/explore" },
  { label: "List a Service", to: "/dashboard/new" },
  { label: "Docs", to: "/docs" },
  { label: "Dashboard", to: "/dashboard" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const account = useActiveAccount();
  const { user } = useAuth();
  const isAuthenticated = !!account || !!user;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Pages with split layouts (green left, white right) need a solid navbar background
  const isSplitLayoutPage = ["/login", "/connect/developer", "/connect/user"].some(
    (path) => location.pathname === path
  );

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex h-[72px] items-center justify-between px-6 md:px-12 transition-all duration-300",
          isSplitLayoutPage
            ? "bg-background/95 backdrop-blur-xl border-b border-border/50"
            : "bg-background/60 backdrop-blur-md border-b border-border/20"
        )}
      >
        {/* Wordmark */}
        <Link to="/" className="font-display text-2xl font-bold text-foreground">
          STOA
        </Link>

        {/* Center Nav (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = link.to === "/dashboard/new"
              ? location.pathname === "/dashboard/new"
              : link.to === "/dashboard"
                ? location.pathname.startsWith("/dashboard") && location.pathname !== "/dashboard/new"
                : location.pathname.startsWith(link.to);
            const isListService = link.to === "/dashboard/new";

            return (
              <MagneticElement key={link.to} strength={0.1}>
                <Link
                  to={link.to}
                  className={cn(
                    "relative font-body text-body-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "text-foreground",
                    isListService && "flex items-center gap-1"
                  )}
                >
                  {isListService && <Plus className="h-3.5 w-3.5" />}
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary"
                    />
                  )}
                </Link>
              </MagneticElement>
            );
          })}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="default" size="sm" className="bg-primary/60 backdrop-blur-xl border border-primary/30 shadow-lg">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/connect">
              <Button variant="default" size="sm" className="bg-primary/60 backdrop-blur-xl border border-primary/30 shadow-lg">
                Get Started
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
          <button
            onClick={() => setMobileOpen(true)}
            className="text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-overlay)] bg-ink flex flex-col items-center justify-center gap-8"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 text-white"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>

            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={link.to}
                  className={cn(
                    "font-display text-4xl font-bold text-white hover:text-primary transition-colors",
                    link.to === "/dashboard/new" && "flex items-center gap-3"
                  )}
                >
                  {link.to === "/dashboard/new" && <Plus className="h-8 w-8" />}
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button variant="default" size="lg" className="bg-primary/60 backdrop-blur-xl border border-primary/30 shadow-lg">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/connect">
                  <Button variant="default" size="lg" className="bg-primary/60 backdrop-blur-xl border border-primary/30 shadow-lg">
                    Get Started
                  </Button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
