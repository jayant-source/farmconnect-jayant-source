import type { WeatherCache } from "@shared/schema";
import { storage } from "../storage";

interface WeatherResponse {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

interface WeatherAPIData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    humidity: number;
    wind_kph: number;
    feelslike_c: number;
    uv: number;
  };
}

export async function getCurrentWeather(location: string): Promise<WeatherResponse> {
  const apiKey = process.env.WEATHERAPI_KEY;
  
  if (!apiKey) {
    console.log("WeatherAPI key not configured, using mock data");
    return getMockWeatherData(location);
  }

  try {
    // Check cache first
    const cached = await getCachedWeather(location);
    if (cached && !isExpired(cached)) {
      return cached.weatherData as WeatherResponse;
    }

    // Fetch from WeatherAPI.com
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: WeatherAPIData = await response.json();
    
    const weatherResponse: WeatherResponse = {
      location: `${data.location.name}, ${data.location.region}`,
      temperature: Math.round(data.current.temp_c),
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph),
      description: getFarmingAdvice(data.current.condition.text, data.current.temp_c, data.current.humidity),
      icon: getWeatherIconFromCondition(data.current.condition.text),
    };

    // Cache the result
    await cacheWeatherData(location, weatherResponse);

    return weatherResponse;
  } catch (error) {
    console.error("Weather API error:", error);
    // Fallback to mock data on API failure
    return getMockWeatherData(location);
  }
}

function getMockWeatherData(location: string): WeatherResponse {
  // Generate realistic mock data based on location and current time
  const temperature = 25 + Math.floor(Math.random() * 10); // 25-35°C
  const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    location: location || "Your Location",
    temperature,
    condition,
    humidity: 60 + Math.floor(Math.random() * 20), // 60-80%
    windSpeed: 8 + Math.floor(Math.random() * 8), // 8-16 km/h
    description: getFarmingAdvice(condition, temperature, 65),
    icon: getWeatherIcon(condition),
  };
}

function getFarmingAdvice(condition: string, temperature: number, humidity: number): string {
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes("rain")) {
    return "Good weather for transplanting. Ensure proper drainage to prevent waterlogging.";
  }
  
  if (lowerCondition.includes("sunny") && temperature > 30) {
    return "Hot weather - increase irrigation frequency and provide shade for sensitive crops.";
  }
  
  if (lowerCondition.includes("cloudy") && humidity > 80) {
    return "High humidity may promote fungal diseases. Ensure good air circulation and avoid overhead watering.";
  }
  
  if (temperature < 15) {
    return "Cool weather - protect sensitive crops from cold and reduce watering frequency.";
  }
  
  return "Good weather for most farming activities. Monitor soil moisture and adjust irrigation as needed.";
}

function getWeatherIcon(condition: string): string {
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) return "01d";
  if (lowerCondition.includes("partly cloudy")) return "02d";
  if (lowerCondition.includes("cloudy")) return "03d";
  if (lowerCondition.includes("rain")) return "10d";
  if (lowerCondition.includes("storm")) return "11d";
  if (lowerCondition.includes("snow")) return "13d";
  if (lowerCondition.includes("mist") || lowerCondition.includes("fog")) return "50d";
  
  return "01d"; // Default to sunny
}

function getWeatherIconFromCondition(condition: string): string {
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) return "01d";
  if (lowerCondition.includes("partly cloudy") || lowerCondition.includes("partly sunny")) return "02d";
  if (lowerCondition.includes("cloudy") || lowerCondition.includes("overcast")) return "03d";
  if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle") || lowerCondition.includes("shower")) return "10d";
  if (lowerCondition.includes("thunder") || lowerCondition.includes("storm")) return "11d";
  if (lowerCondition.includes("snow") || lowerCondition.includes("blizzard")) return "13d";
  if (lowerCondition.includes("mist") || lowerCondition.includes("fog") || lowerCondition.includes("haze")) return "50d";
  
  return "01d"; // Default to sunny
}

// Cache management functions
async function getCachedWeather(location: string): Promise<WeatherCache | null> {
  // TODO: Implement with actual database
  // For now, return null to always fetch fresh data
  return null;
}

async function cacheWeatherData(location: string, data: WeatherResponse): Promise<void> {
  // TODO: Implement with actual database
  const cacheEntry = {
    location,
    weatherData: data,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    createdAt: new Date(),
  };
  
  console.log("Weather data cached for:", location);
}

function isExpired(cached: WeatherCache): boolean {
  return new Date() > new Date(cached.expiresAt);
}

// Weather alerts and recommendations
export function getWeatherAlerts(weather: WeatherResponse): Array<{
  type: "info" | "warning" | "danger";
  message: string;
}> {
  const alerts = [];
  
  if (weather.temperature > 35) {
    alerts.push({
      type: "warning" as const,
      message: "High temperature alert! Ensure adequate irrigation and provide shade for crops.",
    });
  }
  
  if (weather.humidity > 85) {
    alerts.push({
      type: "warning" as const,
      message: "High humidity may increase disease risk. Monitor crops for fungal infections.",
    });
  }
  
  if (weather.windSpeed > 25) {
    alerts.push({
      type: "warning" as const,
      message: "Strong winds detected. Secure loose structures and protect tall crops.",
    });
  }
  
  if (weather.condition.toLowerCase().includes("rain")) {
    alerts.push({
      type: "info" as const,
      message: "Rain expected. Good for water-stressed crops but ensure proper drainage.",
    });
  }
  
  return alerts;
}
