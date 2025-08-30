import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Home, Camera, Users, User, BarChart3, Shield, MessageCircle, Sparkles } from "lucide-react";
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
    icon: Shield,
    href: "/government-schemes",
    labelKey: "nav.schemes",
    testId: "nav-schemes",
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
  special: true,
};

export default function BottomNavigation() {
  const { t } = useTranslation();
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" data-testid="bottom-navigation">
      <div className="relative">
        {/* Main Navigation */}
        <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.button
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg transition-colors relative",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid={item.testId}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      layoutId="activeIndicator"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  
                  {/* Icon with morphing animation */}
                  <motion.div
                    className="mb-1"
                    animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.div>
                  
                  {/* Label */}
                  <span className="text-xs font-medium" data-testid={`${item.testId}-label`}>
                    {t(item.labelKey)}
                  </span>
                </motion.button>
              </Link>
            );
          })}
        </div>

        {/* AI Assistant Floating Button */}
        <motion.div
          className="absolute -top-8 right-4"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        >
          <Link href={aiAssistantItem.href}>
            <motion.button
              className={cn(
                "relative p-4 rounded-full shadow-lg transition-all duration-300",
                location === aiAssistantItem.href
                  ? "bg-gradient-to-r from-primary to-primary/80 text-white"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
              )}
              whileHover={{ 
                scale: 1.1,
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
              }}
              whileTap={{ scale: 0.95 }}
              data-testid={aiAssistantItem.testId}
            >
              {/* Sparkle animation */}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  rotate: [0, 180, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-3 w-3 text-yellow-300" />
              </motion.div>
              
              {/* Main AI icon */}
              <motion.div
                animate={{
                  scale: location === aiAssistantItem.href ? [1, 1.1, 1] : 1
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <aiAssistantItem.icon className="h-6 w-6" />
              </motion.div>
              
              {/* Pulse effect */}
              {location !== aiAssistantItem.href && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </nav>
  );
}
