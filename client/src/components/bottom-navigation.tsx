import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Home, Camera, BarChart3, Gavel, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    icon: Home,
    href: "/dashboard",
    labelKey: "nav.home",
    testId: "nav-home",
  },
  {
    icon: Camera,
    href: "/crop-detect",
    labelKey: "nav.detect",
    testId: "nav-detect",
  },
  {
    icon: BarChart3,
    href: "/mandi-prices",
    labelKey: "nav.mandi",
    testId: "nav-mandi",
  },
  {
    icon: Gavel,
    href: "/farmer-marketplace",
    labelKey: "nav.marketplace",
    testId: "nav-marketplace",
  },
  {
    icon: User,
    href: "/profile",
    labelKey: "nav.profile",
    testId: "nav-profile",
  },
];

const aiAssistantItem = {
  icon: MessageCircle,
  href: "/ai-assistant",
  labelKey: "nav.ai",
  testId: "nav-ai",
};

export default function BottomNavigation() {
  const { t } = useTranslation();
  const [location] = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 shadow-lg" 
      data-testid="bottom-navigation"
    >
      <div className="relative">
        {/* Main Navigation */}
        <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg transition-all duration-200 min-w-[60px]",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                  data-testid={item.testId}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-primary rounded-full" />
                  )}
                  
                  {/* Icon */}
                  <item.icon className="h-5 w-5 mb-1" />
                  
                  {/* Label */}
                  <span 
                    className={cn(
                      "text-xs font-medium",
                      isActive ? "font-semibold" : ""
                    )}
                    data-testid={`${item.testId}-label`}
                  >
                    {t(item.labelKey)}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>

        {/* AI Assistant Floating Button */}
        <div className="absolute -top-6 right-4">
          <Link href={aiAssistantItem.href}>
            <button
              className={cn(
                "relative p-3 rounded-full shadow-lg transition-all duration-200",
                location === aiAssistantItem.href
                  ? "bg-primary text-white"
                  : "bg-green-500 text-white hover:bg-green-600"
              )}
              data-testid={aiAssistantItem.testId}
            >
              <aiAssistantItem.icon className="h-5 w-5" />
              
              {/* Pulse effect for non-active state */}
              {location !== aiAssistantItem.href && (
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
              )}
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}