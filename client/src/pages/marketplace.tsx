import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

const categories = [
  { id: "all", label: "marketplace.all" },
  { id: "seeds", label: "marketplace.seeds" },
  { id: "fertilizers", label: "marketplace.fertilizers" },
  { id: "tools", label: "marketplace.tools" },
  { id: "produce", label: "marketplace.produce" },
];

export default function Marketplace() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: marketplaceItems, isLoading } = useQuery({
    queryKey: ["/api/marketplace/items", selectedCategory],
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "seeds": return "bg-primary/10 text-primary";
      case "fertilizers": return "bg-accent/10 text-accent";
      case "tools": return "bg-blue-500/10 text-blue-500";
      case "produce": return "bg-green-500/10 text-green-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6 flex items-center" data-testid="marketplace-header">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          className="mr-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold flex-1" data-testid="page-title">
          {t("marketplace.title")}
        </h1>
        <Button size="icon" data-testid="button-sell-product">
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <div className="p-6">
        {/* Category tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto" data-testid="category-tabs">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="whitespace-nowrap"
              onClick={() => setSelectedCategory(category.id)}
              data-testid={`category-${category.id}`}
            >
              {t(category.label)}
            </Button>
          ))}
        </div>

        {/* Marketplace listings */}
        <div className="grid md:grid-cols-2 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} data-testid={`item-skeleton-${index}`}>
                <div className="animate-pulse">
                  <div className="w-full h-48 bg-muted"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </CardContent>
                </div>
              </Card>
            ))
          ) : marketplaceItems && marketplaceItems.length > 0 ? (
            marketplaceItems.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`item-${item.id}`}>
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      data-testid={`item-image-${item.id}`}
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground" data-testid={`item-title-${item.id}`}>
                        {item.title}
                      </h3>
                      <Badge className={getCategoryColor(item.category)} data-testid={`item-category-${item.id}`}>
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4" data-testid={`item-description-${item.id}`}>
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-foreground" data-testid={`item-price-${item.id}`}>
                        {formatPrice(parseFloat(item.price))}
                        {item.priceUnit && item.priceUnit !== "per unit" && (
                          <span className="text-sm font-normal text-muted-foreground">
                            /{item.priceUnit.replace("per ", "")}
                          </span>
                        )}
                      </div>
                      {item.quantity && (
                        <div className="text-sm text-muted-foreground" data-testid={`item-quantity-${item.id}`}>
                          {item.quantity} {item.quantityUnit} available
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-muted-foreground text-sm" data-testid={`item-location-${item.id}`}>
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{item.location || "Location not specified"}</span>
                      </div>
                      <Button data-testid={`button-contact-${item.id}`}>
                        {t("marketplace.contact")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            // Empty state
            <div className="col-span-full">
              <Card data-testid="empty-state">
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">🏪</div>
                  <h3 className="text-lg font-semibold mb-2">No Items Available</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedCategory === "all" 
                      ? "No items are currently listed in the marketplace."
                      : `No items available in the ${selectedCategory} category.`
                    }
                  </p>
                  <Button data-testid="button-sell-first-item">
                    <Plus className="mr-2 h-4 w-4" />
                    List Your First Item
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
