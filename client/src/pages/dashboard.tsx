import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Camera, CloudSun, BarChart3, Users, Bell, User, Leaf, TrendingUp, Calendar, AlertTriangle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import WeatherWidget from "@/components/weather-widget";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 200], [0, -50]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  const { data: recentReports = [] } = useQuery({
    queryKey: ["/api/disease-reports/recent"],
    enabled: !!user,
  });

  const { data: communityStats } = useQuery({
    queryKey: ["/api/community/stats"],
    enabled: !!user,
  });

  const quickActions = [
    {
      icon: Camera,
      title: t("dashboard.detectDisease"),
      description: "AI-powered crop analysis",
      href: "/crop-detect",
      color: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-600",
      accent: "border-emerald-200",
      testId: "action-detect-disease",
    },
    {
      icon: CloudSun,
      title: t("dashboard.weather"),
      description: "Real-time weather updates",
      href: "/weather",
      color: "bg-gradient-to-br from-blue-500/20 to-sky-500/20",
      iconColor: "text-blue-600",
      accent: "border-blue-200",
      testId: "action-weather",
    },
    {
      icon: BarChart3,
      title: t("dashboard.mandiPrices"),
      description: "Live market prices",
      href: "/mandi-prices",
      color: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-600",
      accent: "border-amber-200",
      testId: "action-mandi-prices",
    },
    {
      icon: Users,
      title: t("dashboard.community"),
      description: "Connect with farmers",
      href: "/community",
      color: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-600",
      accent: "border-purple-200",
      testId: "action-community",
    },
  ];

  const stats = [
    {
      label: "Disease Reports",
      value: Array.isArray(recentReports) ? recentReports.length : 0,
      icon: Leaf,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Community Members",
      value: (communityStats as any)?.totalFarmers || "2.5K",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      label: "Active Posts",
      value: (communityStats as any)?.activePosts || "157",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
  ];

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pb-20">
      {/* Enhanced Header with Parallax */}
      <motion.header 
        className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-b border-border/50 backdrop-blur-sm"
        style={{ y: headerY, opacity: headerOpacity }}
        data-testid="dashboard-header"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Leaf className="text-white text-xl" />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent" 
                    data-testid="welcome-message"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {getGreeting()}, {user?.name || "Farmer"}!
                  </motion.h1>
                  <motion.p 
                    className="text-muted-foreground flex items-center" 
                    data-testid="user-location"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date().toLocaleDateString()} • {user?.location || "Farm Location"}
                  </motion.p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-primary/10 transition-colors"
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-primary/10 transition-colors"
                  data-testid="button-profile"
                >
                  <User className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Stats Cards */}
      <div className="p-6">
        <motion.div 
          className="grid grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className={`text-lg ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center" data-testid="quick-actions-title">
            <motion.div
              className="w-1 h-6 bg-gradient-to-b from-primary to-accent mr-3 rounded-full"
              animate={{ scaleY: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {t("dashboard.quickActions")}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 30, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1 + 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.03, 
                  y: -8,
                  rotate: 1,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href={action.href}>
                  <Card className={`group cursor-pointer border-2 ${action.accent} hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden relative`} data-testid={action.testId}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className={`p-6 text-center relative ${action.color}`}>
                      <motion.div 
                        className={`w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <action.icon className={`text-2xl ${action.iconColor}`} />
                      </motion.div>
                      <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{action.title}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80">{action.description}</p>
                      
                      {/* Hover sparkle effect */}
                      <motion.div
                        className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100"
                        animate={{ 
                          scale: [0, 1, 0],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                      />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Enhanced Weather Widget */}
      <motion.div 
        className="px-6 mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <WeatherWidget />
      </motion.div>

      {/* Enhanced Recent Reports */}
      <motion.div 
        className="px-6 mb-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center" data-testid="recent-reports-title">
          <motion.div
            className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 mr-3 rounded-full"
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          {t("dashboard.recentReports")}
        </h2>
        <div className="space-y-3">
          {Array.isArray(recentReports) && recentReports.length > 0 ? (
            recentReports.map((report: any, index: number) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500 bg-gradient-to-r from-card to-card/50" data-testid={`report-${report.id}`}>
                  <CardContent className="p-4 flex items-center">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl mr-4 flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <Leaf className="text-emerald-600 text-xl" />
                    </motion.div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground" data-testid={`report-disease-${report.id}`}>
                        {report.diseaseName}
                      </h4>
                      <p className="text-muted-foreground text-sm flex items-center" data-testid={`report-details-${report.id}`}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {report.cropType} • {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Badge 
                        variant={report.severity === "High" ? "destructive" : report.severity === "Medium" ? "default" : "secondary"}
                        className="shadow-sm"
                        data-testid={`report-severity-${report.id}`}
                      >
                        {report.severity}
                      </Badge>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-card/50 to-muted/10">
                <CardContent className="p-8 text-center">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Leaf className="mx-auto h-16 w-16 text-muted-foreground/60 mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to start farming smarter?</h3>
                  <p className="text-muted-foreground mb-6">No disease reports yet. Start by detecting crops and join thousands of farmers using AI!</p>
                  <Link href="/crop-detect">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                        data-testid="button-start-detecting"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Start Your First Detection
                        <Heart className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>

      
    </div>
  );
}