import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CloudSun, Eye, Wind, Droplets, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export default function WeatherWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: weather, isLoading, error } = useQuery<WeatherData>({
    queryKey: ["/api/weather/current", user?.location],
    enabled: !!user?.location,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600" data-testid="weather-loading">
        <CardContent className="p-6 text-white">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-blue-400 rounded w-32 mb-2"></div>
                <div className="h-3 bg-blue-400 rounded w-24"></div>
              </div>
              <div className="text-right">
                <div className="h-8 bg-blue-400 rounded w-16 mb-1"></div>
                <div className="h-3 bg-blue-400 rounded w-12"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="bg-gradient-to-r from-gray-500 to-gray-600" data-testid="weather-error">
        <CardContent className="p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1" data-testid="weather-error-title">
                Weather Unavailable
              </h3>
              <p className="text-gray-200 text-sm">
                {user?.location || "Set your location in profile"}
              </p>
            </div>
            <div className="text-right">
              <CloudSun className="h-8 w-8 text-gray-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
      case "clear":
        return "☀️";
      case "partly cloudy":
        return "⛅";
      case "cloudy":
      case "overcast":
        return "☁️";
      case "rainy":
      case "rain":
        return "🌧️";
      case "stormy":
      case "thunderstorm":
        return "⛈️";
      case "snowy":
      case "snow":
        return "❄️";
      case "foggy":
      case "mist":
        return "🌫️";
      default:
        return "🌤️";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white" data-testid="weather-widget">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1" data-testid="weather-title">
                {t("weather.current")}
              </h3>
              <p className="text-blue-100 text-sm" data-testid="weather-location">
                {weather.location}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1" data-testid="weather-temperature">
                {weather.temperature}°C
              </div>
              <div className="flex items-center text-blue-100" data-testid="weather-condition">
                <span className="text-lg mr-2">{getWeatherIcon(weather.condition)}</span>
                <span className="text-sm">{weather.condition}</span>
              </div>
            </div>
          </div>

          {/* Weather details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-blue-100" data-testid="weather-humidity">
              <Droplets className="h-4 w-4 mr-2" />
              <span className="text-sm">{weather.humidity}% Humidity</span>
            </div>
            <div className="flex items-center text-blue-100" data-testid="weather-wind">
              <Wind className="h-4 w-4 mr-2" />
              <span className="text-sm">{weather.windSpeed} km/h</span>
            </div>
          </div>

          {/* Weather advice */}
          {weather.description && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm" data-testid="weather-advice">
              <p className="text-sm text-blue-50">
                <span className="font-medium">Farming Tip:</span> {weather.description}
              </p>
            </div>
          )}

          {/* Last updated */}
          <div className="mt-3 text-xs text-blue-200 text-right" data-testid="weather-updated">
            Updated {new Date().toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
