import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";

export default function MandiPrices() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const { data: mandiPrices, isLoading } = useQuery({
    queryKey: ["/api/mandi/prices"],
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6 flex items-center" data-testid="mandi-prices-header">
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
          {t("mandi.title")}
        </h1>
      </header>

      <div className="p-6">
        {/* Location and date selector */}
        <Card className="mb-6" data-testid="filters-card">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  {t("mandi.selectLocation")}
                </Label>
                <Select defaultValue="sangli" data-testid="select-market">
                  <SelectTrigger>
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sangli">Sangli Market</SelectItem>
                    <SelectItem value="mumbai">Mumbai APMC</SelectItem>
                    <SelectItem value="pune">Pune Market</SelectItem>
                    <SelectItem value="nashik">Nashik Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  {t("mandi.selectDate")}
                </Label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  data-testid="input-date"
                />
              </div>
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
          ) : mandiPrices && mandiPrices.length > 0 ? (
            mandiPrices.map((price: any, index: number) => (
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
                          {formatPrice(price.modalPrice || price.maxPrice || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground" data-testid={`price-unit-${index}`}>
                          {price.priceUnit}
                        </div>
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
                <h3 className="text-lg font-semibold mb-2">No Price Data Available</h3>
                <p className="text-muted-foreground">
                  Price data for the selected market and date is not available.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Price alerts */}
        <Card className="mt-8 bg-accent/10 border-accent/20" data-testid="price-alerts-card">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Bell className="text-accent mr-3 h-5 w-5" />
              <h3 className="font-semibold text-foreground" data-testid="price-alerts-title">
                {t("mandi.priceAlerts")}
              </h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4" data-testid="price-alerts-description">
              {t("mandi.alertDescription")}
            </p>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-setup-alerts">
              {t("mandi.setupAlerts")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
