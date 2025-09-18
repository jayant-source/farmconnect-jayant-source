import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { 
  Camera, 
  CloudSun, 
  BarChart3, 
  Users, 
  Bell,
  Leaf, 
  TrendingUp, 
  Calendar,
  MapPin,
  Plus,
  Eye,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: recentReports = [] } = useQuery({
    queryKey: ["/api/disease-reports/recent"],
    enabled: !!user,
  });

  const { data: communityStats } = useQuery({
    queryKey: ["/api/community/stats"],
    enabled: !!user,
  });

  const { data: weatherData } = useQuery({
    queryKey: ["/api/weather/current", user?.location || "alwar"],
    enabled: !!user,
  });

  const quickActions = [
    {
      icon: Camera,
      title: t("dashboard.actions.cropDetection"),
      description: t("dashboard.actions.cropDetectionDesc"),
      href: "/crop-detect",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      testId: "action-detect-disease",
    },
    {
      icon: BarChart3,
      title: t("dashboard.actions.marketPrices"),
      description: t("dashboard.actions.marketPricesDesc"),
      href: "/mandi-prices",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      testId: "action-mandi-prices",
    },
    {
      icon: CloudSun,
      title: t("dashboard.actions.weatherTitle"),
      description: t("dashboard.actions.weatherDesc"),
      href: "/weather",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      testId: "action-weather",
    },
    {
      icon: Users,
      title: t("dashboard.actions.communityTitle"),
      description: t("dashboard.actions.communityDesc"),
      href: "/community",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      testId: "action-community",
    },
  ];

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return t("dashboard.greetings.morning");
    if (currentHour < 17) return t("dashboard.greetings.afternoon");
    return t("dashboard.greetings.evening");
  };

  const getWeatherIcon = (temp: number) => {
    if (temp > 30) return "☀️";
    if (temp > 20) return "⛅";
    return "🌤️";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Clean Header */}
      <header className="bg-white border-b border-border px-6 py-4" data-testid="dashboard-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="welcome-message">
              {getGreeting()}, {user?.name || t("dashboard.farmer")}!
            </h1>
            <div className="flex items-center text-muted-foreground text-sm mt-1" data-testid="user-location">
              <MapPin className="w-4 h-4 mr-1" />
              {user?.location || t("dashboard.farmLocation")} • {new Date().toLocaleDateString()}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Weather Card */}
        {weatherData && (
          <Card className="farm-card" data-testid="weather-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("dashboard.todaysWeather")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {weatherData.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl mb-1">
                    {getWeatherIcon(weatherData.temperature)}
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {weatherData.temperature}°C
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {weatherData.condition}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="farm-card text-center" data-testid="stats-reports">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-xl font-semibold text-foreground">
                {Array.isArray(recentReports) ? recentReports.length : 0}
              </div>
              <div className="text-xs text-muted-foreground">{t("dashboard.reports")}</div>
            </CardContent>
          </Card>

          <Card className="farm-card text-center" data-testid="stats-community">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-xl font-semibold text-foreground">
                {(communityStats as any)?.totalFarmers || "2.5K"}
              </div>
              <div className="text-xs text-muted-foreground">{t("dashboard.farmers")}</div>
            </CardContent>
          </Card>

          <Card className="farm-card text-center" data-testid="stats-posts">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-xl font-semibold text-foreground">
                {(communityStats as any)?.activePosts || "157"}
              </div>
              <div className="text-xs text-muted-foreground">{t("dashboard.posts")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="section-header" data-testid="quick-actions-title">
            <Plus className="h-5 w-5" />
            {t("dashboard.quickActions")}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card 
                  className="farm-card cursor-pointer h-full" 
                  data-testid={action.testId}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Disease Reports */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header" data-testid="recent-reports-title">
              <Eye className="h-5 w-5" />
              {t("dashboard.recentReportsTitle")}
            </h2>
            {Array.isArray(recentReports) && recentReports.length > 0 && (
              <Link href="/crop-detect">
                <Button variant="ghost" size="sm" className="text-xs">
                  {t("dashboard.viewAll")} <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          {Array.isArray(recentReports) && recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.slice(0, 3).map((report: any) => (
                <Card key={report.id} className="farm-card" data-testid={`report-${report.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Leaf className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm" data-testid={`report-disease-${report.id}`}>
                            {report.diseaseName}
                          </h4>
                          <p className="text-xs text-muted-foreground" data-testid={`report-details-${report.id}`}>
                            {report.cropType} • {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={report.severity === "High" ? "destructive" : 
                                report.severity === "Medium" ? "default" : "secondary"}
                        className="text-xs"
                        data-testid={`report-severity-${report.id}`}
                      >
                        {report.severity === "High" ? t("dashboard.severity.high") :
                         report.severity === "Medium" ? t("dashboard.severity.medium") :
                         t("dashboard.severity.low")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="farm-card border-dashed" data-testid="no-reports">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t("dashboard.noReports.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("dashboard.noReports.description")}
                </p>
                <Link href="/crop-detect">
                  <Button className="btn-farm-primary" data-testid="button-start-detecting">
                    <Camera className="mr-2 h-4 w-4" />
                    {t("dashboard.noReports.scanButton")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Farmer Marketplace Quick Access */}
        <Card className="farm-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t("dashboard.marketplace.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.marketplace.description")}
                </p>
              </div>
              <Link href="/farmer-marketplace">
                <Button className="btn-farm-primary">
                  {t("dashboard.marketplace.visit")} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}