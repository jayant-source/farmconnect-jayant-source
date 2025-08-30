import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CloudSun, Eye, Wind, Droplets, Thermometer, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function WeatherWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>(
    user?.location || "Mumbai, Maharashtra" // Default location for weather
  );

  const { data: weather, isLoading, error } = useQuery<WeatherData>({
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
          // Use reverse geocoding to get location name
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1" data-testid="weather-error-title">
                Weather Unavailable
              </h3>
              <p className="text-gray-200 text-sm">
                {currentLocation || "Location not set"}
              </p>
            </div>
            <div className="text-right">
              <CloudSun className="h-8 w-8 text-gray-300" />
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full"
            data-testid="button-get-location"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Use Current Location
              </>
            )}
          </Button>
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

          {/* Location and update controls */}
          <div className="mt-4 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="text-blue-100 hover:text-white hover:bg-white/10"
              data-testid="button-update-location"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </Button>
            <div className="text-xs text-blue-200" data-testid="weather-updated">
              Updated {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
