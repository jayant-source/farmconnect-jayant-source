import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Home, Camera, Users, User, BarChart3, Shield, MessageCircle, Sparkles, Gavel } from "lucide-react";
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
  special: true,
};

export default function BottomNavigation() {
  const { t } = useTranslation();
  const [location] = useLocation();

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-50 shadow-lg" 
      data-testid="bottom-navigation"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="relative">
        {/* Main Navigation */}
        <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
          {navigationItems.map((item, index) => {
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.button
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl transition-all duration-300 relative group",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                  data-testid={item.testId}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                      layoutId="activeIndicator"
                      initial={{ opacity: 0, scale: 0, width: 4 }}
                      animate={{ opacity: 1, scale: 1, width: 32 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  )}
                  
                  {/* Icon with enhanced animation */}
                  <motion.div
                    className="mb-1 relative"
                    animate={isActive ? { 
                      scale: [1, 1.15, 1],
                      rotateY: [0, 360]
                    } : { scale: 1 }}
                    transition={{ 
                      duration: isActive ? 0.6 : 0.2,
                      ease: "easeInOut"
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    {/* Subtle glow effect for active icon */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-primary/20 rounded-full blur-sm"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  
                  {/* Label with enhanced styling */}
                  <motion.span 
                    className={cn(
                      "text-xs font-medium transition-all duration-300",
                      isActive ? "font-semibold" : "group-hover:font-medium"
                    )}
                    data-testid={`${item.testId}-label`}
                    animate={isActive ? { y: [0, -2, 0] } : { y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {t(item.labelKey)}
                  </motion.span>
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
    </motion.nav>
  );
}
