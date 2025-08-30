import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { ArrowLeft, CloudSun, Thermometer, Wind, Droplets, Eye, MapPin, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

interface WeatherAlert {
  type: "info" | "warning" | "danger";
  message: string;
}

export default function Weather() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>(
    user?.location || "Mumbai, Maharashtra"
  );

  const { data: weather, isLoading, error, refetch } = useQuery<WeatherData>({
    queryKey: ["/api/weather/current", currentLocation],
    enabled: !!currentLocation,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationName = `${latitude},${longitude}`;
          setCurrentLocation(locationName);
          setIsGettingLocation(false);
          toast({
            title: "Location Updated",
            description: "Weather data updated for your current location.",
          });
        } catch (error) {
          setIsGettingLocation(false);
          toast({
            title: "Location Error",
            description: "Failed to get your location. Please try again.",
            variant: "destructive",
          });
        }
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Failed to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please allow location access and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 10) return "text-blue-600";
    if (temp <= 25) return "text-green-600";
    if (temp <= 35) return "text-yellow-600";
    return "text-red-600";
  };

  const getWeatherAlerts = (weather: WeatherData): WeatherAlert[] => {
    const alerts: WeatherAlert[] = [];
    
    if (weather.temperature > 35) {
      alerts.push({
        type: "warning",
        message: "High temperature warning. Ensure adequate water supply for crops and livestock.",
      });
    }
    
    if (weather.temperature < 10) {
      alerts.push({
        type: "warning",
        message: "Cold weather alert. Protect sensitive crops from frost damage.",
      });
    }
    
    if (weather.humidity > 80) {
      alerts.push({
        type: "info",
        message: "High humidity detected. Monitor crops for fungal diseases.",
      });
    }
    
    if (weather.windSpeed > 30) {
      alerts.push({
        type: "warning",
        message: "Strong winds expected. Secure loose structures and protect young plants.",
      });
    }
    
    if (weather.condition.toLowerCase().includes("rain")) {
      alerts.push({
        type: "info",
        message: "Rain expected. Good for water-stressed crops but ensure proper drainage.",
      });
    }
    
    return alerts;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card border-b border-border p-6 flex items-center" data-testid="weather-header">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="mr-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold" data-testid="page-title">
            {t("weather.title", "Weather")}
          </h1>
        </header>
        
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Card className="text-center">
            <CardContent className="p-6">
              <CloudSun className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unable to load weather data</h3>
              <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
              <Button onClick={() => refetch()} data-testid="button-retry">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6 flex items-center" data-testid="weather-header">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          className="mr-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold" data-testid="page-title">
          {t("weather.title", "Weather")}
        </h1>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Location Controls */}
        <Card data-testid="location-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                <div>
                  <p className="font-medium" data-testid="current-location">
                    {weather?.location || currentLocation}
                  </p>
                  <p className="text-sm text-muted-foreground">Current location</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                data-testid="button-get-location"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {isGettingLocation ? "Getting..." : "Use Current Location"}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Weather Card */}
        {isLoading ? (
          <Card data-testid="weather-loading">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-muted rounded-full mr-6"></div>
                    <div>
                      <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-12 bg-muted rounded w-20 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : weather ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card data-testid="weather-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-6">
                      <CloudSun className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold" data-testid="weather-condition">
                        {weather.condition}
                      </h2>
                      <p className="text-muted-foreground" data-testid="weather-description">
                        {weather.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-4xl font-bold ${getTemperatureColor(weather.temperature)}`} data-testid="weather-temperature">
                      {weather.temperature}°C
                    </p>
                    <p className="text-muted-foreground text-sm">Temperature</p>
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center" data-testid="weather-humidity">
                    <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-semibold">{weather.humidity}%</p>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                  </div>
                  <div className="text-center" data-testid="weather-wind">
                    <Wind className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-semibold">{weather.windSpeed} km/h</p>
                    <p className="text-sm text-muted-foreground">Wind Speed</p>
                  </div>
                  <div className="text-center" data-testid="weather-visibility">
                    <Eye className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-semibold">Good</p>
                    <p className="text-sm text-muted-foreground">Visibility</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {/* Weather Alerts */}
        {weather && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold" data-testid="alerts-title">
              Farming Alerts
            </h3>
            {getWeatherAlerts(weather).map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card data-testid={`alert-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Badge
                        variant={alert.type === "danger" ? "destructive" : alert.type === "warning" ? "default" : "secondary"}
                        className="mr-3 mt-0.5"
                      >
                        {alert.type}
                      </Badge>
                      <p className="text-sm text-foreground flex-1">{alert.message}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {getWeatherAlerts(weather).length === 0 && (
              <Card data-testid="no-alerts">
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground">No weather alerts for your area.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Farming Recommendations */}
        {weather && (
          <Card data-testid="recommendations-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Thermometer className="h-5 w-5 mr-2" />
                Today's Farming Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Watering</h4>
                  <p className="text-sm text-muted-foreground">
                    {weather.humidity > 70 
                      ? "High humidity - reduce watering frequency"
                      : weather.temperature > 30
                      ? "Hot weather - increase watering, preferably early morning or evening"
                      : "Normal watering schedule recommended"}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Field Work</h4>
                  <p className="text-sm text-muted-foreground">
                    {weather.condition.toLowerCase().includes("rain")
                      ? "Avoid field operations due to wet conditions"
                      : weather.windSpeed > 25
                      ? "Windy conditions - postpone spraying activities"
                      : "Good conditions for normal farm operations"}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-1">Pest Management</h4>
                  <p className="text-sm text-muted-foreground">
                    {weather.humidity > 80
                      ? "High humidity may increase fungal disease risk - monitor crops closely"
                      : weather.temperature > 35
                      ? "Hot weather may stress plants - watch for heat-related pest activity"
                      : "Normal pest monitoring recommended"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}