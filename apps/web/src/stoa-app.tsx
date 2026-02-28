"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GrainOverlay } from "@/components/GrainOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipToContent } from "@/components/SkipToContent";
import Index from "@/stoa-pages/Index";
import Explore from "@/stoa-pages/Explore";
import AgentDetail from "@/stoa-pages/AgentDetail";
import ConnectPage from "@/stoa-pages/Connect";
import DeveloperOnboarding from "@/stoa-pages/DeveloperOnboarding";
import UserOnboarding from "@/stoa-pages/UserOnboarding";
import Dashboard from "@/stoa-pages/Dashboard";
import RegisterService from "@/stoa-pages/RegisterService";
import ActivityPage from "@/stoa-pages/Activity";
import Docs from "@/stoa-pages/Docs";
import Login from "@/stoa-pages/Login";
import Pricing from "@/stoa-pages/Pricing";
import About from "@/stoa-pages/About";
import Blog, { BlogPost } from "@/stoa-pages/Blog";
import Careers from "@/stoa-pages/Careers";
import Contact from "@/stoa-pages/Contact";
import Privacy from "@/stoa-pages/Privacy";
import Terms from "@/stoa-pages/Terms";
import Cookies from "@/stoa-pages/Cookies";
import NotFound from "@/stoa-pages/NotFound";

const queryClient = new QueryClient();

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:id" element={<AgentDetail />} />
          <Route path="/service/:id" element={<AgentDetail />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/connect" element={<ConnectPage />} />
          <Route path="/connect/developer" element={<DeveloperOnboarding />} />
          <Route path="/connect/user" element={<UserOnboarding />} />
          <Route path="/dashboard/new" element={<RegisterService />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<main id="main-content" className="bg-background pt-[72px]"><BlogPost /></main>} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SkipToContent />
            <ScrollToTop />
            <GrainOverlay />
            <Navbar />
            <AnimatedRoutes />
            <Footer />
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
