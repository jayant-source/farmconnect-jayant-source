import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Bell, Search, MapPin, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import PriceAlertsDialog from "@/components/price-alerts-dialog";

interface MandiPrice {
  id: string;
  market: string;
  state: string;
  commodity: string;
  variety?: string | null;
  grade: string;
  minPrice?: string | null;
  maxPrice?: string | null;
  modalPrice?: string | null;
  priceUnit: string;
  reportDate: Date;
  createdAt: Date;
}

export default function MandiPrices() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedMarket, setSelectedMarket] = useState<string>("mumbai");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { data: mandiPrices, isLoading, refetch } = useQuery<MandiPrice[]>({
    queryKey: ["/api/mandi/prices", selectedMarket, selectedDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedMarket) params.append('market', selectedMarket);
      if (selectedDate) params.append('date', selectedDate);
      
      const response = await fetch(`/api/mandi/prices?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mandi prices');
      }
      return response.json();
    },
  });

  const formatPrice = (price: string | number | null | undefined) => {
    if (!price) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const popularCrops = [
    "Rice", "Wheat", "Sugarcane", "Cotton", "Jowar", "Bajra", 
    "Maize", "Tur", "Gram", "Masoor", "Moong", "Urad",
    "Groundnut", "Sunflower", "Soybean", "Rapeseed", "Sesame",
    "Onion", "Potato", "Tomato", "Chilli", "Turmeric", "Coriander"
  ];

  const indianMarkets = [
    { value: "mumbai", label: "Mumbai APMC", state: "Maharashtra" },
    { value: "delhi", label: "Delhi Market", state: "Delhi" },
    { value: "pune", label: "Pune Market", state: "Maharashtra" },
    { value: "nashik", label: "Nashik Market", state: "Maharashtra" },
    { value: "sangli", label: "Sangli Market", state: "Maharashtra" },
    { value: "kolkata", label: "Kolkata Market", state: "West Bengal" },
    { value: "chennai", label: "Chennai Market", state: "Tamil Nadu" },
    { value: "bangalore", label: "Bangalore Market", state: "Karnataka" },
    { value: "hyderabad", label: "Hyderabad Market", state: "Telangana" },
    { value: "ahmedabad", label: "Ahmedabad Market", state: "Gujarat" },
  ];

  const getLocationBasedMarkets = () => {
    const userLocation = user?.location?.toLowerCase() || "";
    const nearbyMarkets = indianMarkets.filter(market => 
      userLocation.includes(market.state.toLowerCase()) ||
      userLocation.includes(market.label.toLowerCase().split(' ')[0])
    );
    return nearbyMarkets.length > 0 ? nearbyMarkets : indianMarkets;
  };

  const filteredPrices = mandiPrices?.filter(price => 
    searchQuery === "" || 
    price.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (price.variety && price.variety.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

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
          // Find nearest market based on coordinates (simplified logic)
          const nearestMarket = findNearestMarket(latitude, longitude);
          setSelectedMarket(nearestMarket);
          setIsGettingLocation(false);
          toast({
            title: "Location Updated",
            description: `Switched to nearest market: ${indianMarkets.find(m => m.value === nearestMarket)?.label}`,
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
        toast({
          title: "Location Error",
          description: "Failed to access location. Please select a market manually.",
          variant: "destructive",
        });
      }
    );
  };

  const findNearestMarket = (lat: number, lng: number): string => {
    // Simplified nearest market logic based on major city coordinates
    const marketCoords: { [key: string]: [number, number] } = {
      mumbai: [19.0760, 72.8777],
      delhi: [28.6139, 77.2090],
      pune: [18.5204, 73.8567],
      nashik: [19.9975, 73.7898],
      kolkata: [22.5726, 88.3639],
      chennai: [13.0827, 80.2707],
      bangalore: [12.9716, 77.5946],
      hyderabad: [17.3850, 78.4867],
    };

    let nearest = "mumbai";
    let minDistance = Infinity;

    Object.entries(marketCoords).forEach(([market, [mlat, mlng]]) => {
      const distance = Math.sqrt(Math.pow(lat - mlat, 2) + Math.pow(lng - mlng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearest = market;
      }
    });

    return nearest;
  };

  const getPriceIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getPriceColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pb-20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <motion.div className="absolute top-32 right-20 w-72 h-72 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.div className="absolute bottom-32 left-16 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} />
        <motion.div className="absolute top-1/3 left-1/4 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl" animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 5, repeat: Infinity, delay: 3 }} />
      </motion.div>

      {/* Header */}
      <motion.header 
        className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-b border-border/50 backdrop-blur-sm p-6 flex items-center relative z-10" 
        data-testid="mandi-prices-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
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
          {t("mandi.title", "Mandi Prices")}
        </h1>
      </motion.header>

      <div className="p-6 space-y-6">
        {/* Enhanced Filters */}
        <Card data-testid="filters-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Market & Crop Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location controls */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm font-medium">Current Market</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                data-testid="button-get-nearest-mandi"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {isGettingLocation ? "Finding..." : "Use Nearest Mandi"}
                </span>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Select Market
                </Label>
                <Select value={selectedMarket} onValueChange={setSelectedMarket} data-testid="select-market">
                  <SelectTrigger>
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    {getLocationBasedMarkets().map((market) => (
                      <SelectItem key={market.value} value={market.value}>
                        {market.label} ({market.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Select Date
                </Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  data-testid="input-date"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Search Crops
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search crops..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-crops"
                  />
                </div>
              </div>
            </div>

            {/* Quick crop filters */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Popular Crops
              </Label>
              <div className="flex flex-wrap gap-2">
                {popularCrops.slice(0, 8).map((crop) => (
                  <Button
                    key={crop}
                    variant={searchQuery.toLowerCase() === crop.toLowerCase() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchQuery(searchQuery === crop ? "" : crop)}
                    data-testid={`button-crop-${crop.toLowerCase()}`}
                  >
                    {crop}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing prices for {indianMarkets.find(m => m.value === selectedMarket)?.label || selectedMarket}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                data-testid="button-refresh-prices"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Price cards */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} data-testid={`price-skeleton-${index}`}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-muted rounded-xl mr-4"></div>
                        <div>
                          <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-16"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-6 bg-muted rounded w-20 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredPrices && filteredPrices.length > 0 ? (
            filteredPrices.map((price: MandiPrice, index: number) => (
              <motion.div
                key={price.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card data-testid={`price-card-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-2xl">🌾</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground" data-testid={`price-commodity-${index}`}>
                            {price.commodity} {price.variety && `(${price.variety})`}
                          </h3>
                          <p className="text-muted-foreground text-sm" data-testid={`price-grade-${index}`}>
                            {price.grade || "Grade A Quality"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground" data-testid={`price-amount-${index}`}>
                          {formatPrice(price.modalPrice || price.maxPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground" data-testid={`price-unit-${index}`}>
                          {price.priceUnit}
                        </div>
                        {price.minPrice && price.maxPrice && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Range: {formatPrice(price.minPrice)} - {formatPrice(price.maxPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className={`flex items-center ${getPriceColor(0)}`} data-testid={`price-change-${index}`}>
                        {getPriceIcon(0)}
                        <span className="text-sm font-medium ml-1">
                          No change today
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid={`price-updated-${index}`}>
                        Updated {new Date(price.reportDate).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            // Empty state
            <Card data-testid="empty-state">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? `No crops found for "${searchQuery}"` : "No Price Data Available"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try searching for different crops or clear the search to see all available prices."
                    : "Price data for the selected market and date is not available."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Search Results Summary */}
          {searchQuery && filteredPrices.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Found {filteredPrices.length} result(s) for "{searchQuery}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Price alerts and tips */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-accent/10 border-accent/20" data-testid="price-alerts-card">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Bell className="text-accent mr-3 h-5 w-5" />
                <h3 className="font-semibold text-foreground" data-testid="price-alerts-title">
                  Price Alerts
                </h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4" data-testid="price-alerts-description">
                Get notified when crop prices reach your target in nearby mandis.
              </p>
              <PriceAlertsDialog />
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="text-primary mr-3 h-5 w-5" />
                <h3 className="font-semibold text-foreground">
                  Market Tips
                </h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Check multiple markets for best prices</p>
                <p>• Morning rates are usually more stable</p>
                <p>• Consider transportation costs to nearby mandis</p>
                <p>• Weather affects price fluctuations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}