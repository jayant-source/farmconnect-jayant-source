import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import i18n from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";

// Pages
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import CropDetect from "@/pages/crop-detect";
import MandiPrices from "@/pages/mandi-prices";
import Weather from "@/pages/weather";
import Community from "@/pages/community";
import Marketplace from "@/pages/marketplace";
import HelpAssistant from "@/pages/help-assistant";
import Profile from "@/pages/profile";
import GovernmentSchemes from "@/pages/government-schemes";
import NotFound from "@/pages/not-found";

// Components
import BottomNavigation from "@/components/bottom-navigation";

function PageWrapper({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Router() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  // Update i18n language when user language changes
  useEffect(() => {
    if (user?.language) {
      i18n.changeLanguage(user.language);
    }
  }, [user?.language]);

  const showBottomNav = isAuthenticated && !["/", "/auth", "/onboarding"].includes(location);

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/">
          <PageWrapper>
            <Landing />
          </PageWrapper>
        </Route>
        
        <Route path="/auth">
          <PageWrapper>
            <Auth />
          </PageWrapper>
        </Route>
        
        <Route path="/onboarding">
          <PageWrapper>
            {isAuthenticated ? <Onboarding /> : <Auth />}
          </PageWrapper>
        </Route>
        
        <Route path="/dashboard">
          <PageWrapper>
            {isAuthenticated ? <Dashboard /> : <Auth />}
          </PageWrapper>
        </Route>
        
        <Route path="/crop-detect">
          <PageWrapper>
            {isAuthenticated ? <CropDetect /> : <Auth />}
          </PageWrapper>
        </Route>
        
        <Route path="/mandi-prices">
          <PageWrapper>
            {isAuthenticated ? <MandiPrices /> : <Auth />}
          </PageWrapper>
        </Route>
        
        <Route path="/weather">
          <PageWrapper>
            {isAuthenticated ? <Weather /> : <Auth />}
          </PageWrapper>
        </Route>
        
        <Route path="/community">
          <PageWrapper>
            {isAuthenticated ? <Community /> : <Auth />}
          </PageWrapper>
        </Route>
        
        <Route path="/marketplace">
          <PageWrapper>
            {isAuthenticated ? <Marketplace /> : <Auth />}
          </PageWrapper>
        </Route>
        
        <Route path="/help-assistant">
          <PageWrapper>
            {isAuthenticated ? <HelpAssistant /> : <Auth />}
          </PageWrapper>
        </Route>
        
        <Route path="/profile">
          <PageWrapper>
            {isAuthenticated ? <Profile /> : <Auth />}
          </PageWrapper>
        </Route>
        
        <Route path="/government-schemes">
          <PageWrapper>
            {isAuthenticated ? <GovernmentSchemes /> : <Auth />}
          </PageWrapper>
        </Route>
        
        <Route>
          <PageWrapper>
            <NotFound />
          </PageWrapper>
        </Route>
      </Switch>
      
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
