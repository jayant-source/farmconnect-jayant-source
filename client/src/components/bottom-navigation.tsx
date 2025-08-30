import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Home, Camera, Store, Users, User } from "lucide-react";
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
    icon: Store,
    href: "/marketplace",
    labelKey: "nav.market",
    testId: "nav-market",
  },
  {
    icon: Users,
    href: "/community",
    labelKey: "nav.community",
    testId: "nav-community",
  },
  {
    icon: User,
    href: "/profile",
    labelKey: "nav.profile",
    testId: "nav-profile",
  },
];

export default function BottomNavigation() {
  const { t } = useTranslation();
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" data-testid="bottom-navigation">
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
    </nav>
  );
}
