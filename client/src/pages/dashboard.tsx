import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Camera, CloudSun, BarChart3, Users, Bell, User, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import WeatherWidget from "@/components/weather-widget";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: recentReports = [] } = useQuery({
    queryKey: ["/api/disease-reports/recent"],
    enabled: !!user,
  });

  const quickActions = [
    {
      icon: Camera,
      title: t("dashboard.detectDisease"),
      href: "/crop-detect",
      color: "bg-primary/10 text-primary",
      testId: "action-detect-disease",
    },
    {
      icon: CloudSun,
      title: t("dashboard.weather"),
      href: "/weather",
      color: "bg-blue-500/10 text-blue-500",
      testId: "action-weather",
    },
    {
      icon: BarChart3,
      title: t("dashboard.mandiPrices"),
      href: "/mandi-prices",
      color: "bg-accent/10 text-accent",
      testId: "action-mandi-prices",
    },
    {
      icon: Users,
      title: t("dashboard.community"),
      href: "/community",
      color: "bg-purple-500/10 text-purple-500",
      testId: "action-community",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6" data-testid="dashboard-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="welcome-message">
              {t("dashboard.welcome")}, {user?.name || "Farmer"}
            </h1>
            <p className="text-muted-foreground" data-testid="user-location">
              {user?.location || "Farm Location"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-profile">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="quick-actions-title">
          {t("dashboard.quickActions")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" data-testid={action.testId}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <action.icon className="text-2xl" />
                    </div>
                    <h3 className="font-semibold text-center">{action.title}</h3>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="px-6 mb-6">
        <WeatherWidget />
      </div>

      {/* Recent Reports */}
      <div className="px-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="recent-reports-title">
          {t("dashboard.recentReports")}
        </h2>
        <div className="space-y-3">
          {Array.isArray(recentReports) && recentReports.length > 0 ? (
            recentReports.map((report: any) => (
              <Card key={report.id} data-testid={`report-${report.id}`}>
                <CardContent className="p-4 flex items-center">
                  <div className="w-16 h-16 bg-muted rounded-lg mr-4 flex items-center justify-center">
                    <Leaf className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground" data-testid={`report-disease-${report.id}`}>
                      {report.diseaseName}
                    </h4>
                    <p className="text-muted-foreground text-sm" data-testid={`report-details-${report.id}`}>
                      {report.cropType} • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={report.severity === "High" ? "destructive" : report.severity === "Medium" ? "default" : "secondary"}
                    data-testid={`report-severity-${report.id}`}
                  >
                    {report.severity}
                  </Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Leaf className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No disease reports yet. Start by detecting crops!</p>
                <Link href="/crop-detect">
                  <Button className="mt-4" data-testid="button-start-detecting">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Detecting
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
