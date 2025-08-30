import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Trash2, Edit, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const createAlertSchema = z.object({
  commodity: z.string().min(1, "Commodity is required"),
  market: z.string().min(1, "Market is required"),
  targetPrice: z.number().positive("Target price must be positive"),
  priceUnit: z.string().optional(),
  alertType: z.enum(["above", "below"], { required_error: "Alert type is required" }),
});

type CreateAlertForm = z.infer<typeof createAlertSchema>;

interface PriceAlert {
  id: string;
  commodity: string;
  market: string;
  targetPrice: string;
  priceUnit: string;
  alertType: "above" | "below";
  isActive: boolean;
  createdAt: string;
}

const popularCrops = [
  "Rice", "Wheat", "Sugarcane", "Cotton", "Jowar", "Bajra", 
  "Maize", "Tur", "Gram", "Masoor", "Moong", "Urad",
  "Groundnut", "Sunflower", "Soybean", "Onion", "Potato", "Tomato"
];

const indianMarkets = [
  "Mumbai APMC", "Delhi Market", "Pune Market", "Nashik Market", 
  "Sangli Market", "Kolkata Market", "Chennai Market", "Bangalore Market", 
  "Hyderabad Market", "Ahmedabad Market"
];

interface PriceAlertsDialogProps {
  trigger?: React.ReactNode;
}

export default function PriceAlertsDialog({ trigger }: PriceAlertsDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<CreateAlertForm>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: {
      commodity: "",
      market: "",
      targetPrice: 0,
      priceUnit: "per quintal",
      alertType: "above",
    },
  });

  // Fetch user's price alerts
  const { data: alerts = [], isLoading } = useQuery<PriceAlert[]>({
    queryKey: ["/api/price-alerts"],
    enabled: isOpen,
  });

  // Create price alert mutation
  const createAlertMutation = useMutation({
    mutationFn: (data: CreateAlertForm) => apiRequest("POST", "/api/price-alerts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-alerts"] });
      form.reset();
      setIsCreating(false);
      toast({
        title: "Alert Created",
        description: "Your price alert has been set up successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create price alert",
        variant: "destructive",
      });
    },
  });

  // Delete price alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest("DELETE", `/api/price-alerts/${alertId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-alerts"] });
      toast({
        title: "Alert Deleted",
        description: "Price alert has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete price alert",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateAlertForm) => {
    createAlertMutation.mutate(data);
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const defaultTrigger = (
    <Button className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-setup-alerts">
      <Bell className="h-4 w-4 mr-2" />
      Setup Price Alerts
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="price-alerts-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-accent" />
            Price Alerts Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Alerts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Active Alerts</h3>
              <Button
                onClick={() => setIsCreating(!isCreating)}
                size="sm"
                data-testid="button-create-alert"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-muted rounded-lg"></div>
                          <div>
                            <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-24"></div>
                          </div>
                        </div>
                        <div className="h-8 bg-muted rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} data-testid={`alert-card-${alert.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            {alert.alertType === "above" ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium" data-testid={`alert-commodity-${alert.id}`}>
                              {alert.commodity} - {alert.market}
                            </h4>
                            <p className="text-sm text-muted-foreground" data-testid={`alert-details-${alert.id}`}>
                              Alert when price goes {alert.alertType} {formatPrice(alert.targetPrice)} {alert.priceUnit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            alert.isActive 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                          }`}>
                            {alert.isActive ? "Active" : "Paused"}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAlertMutation.mutate(alert.id)}
                            disabled={deleteAlertMutation.isPending}
                            data-testid={`button-delete-${alert.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Price Alerts Set</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first price alert to get notified when crop prices reach your target.
                  </p>
                  <Button onClick={() => setIsCreating(true)} data-testid="button-create-first-alert">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Alert
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Create New Alert Form */}
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Price Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="create-alert-form">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="commodity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Crop/Commodity</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-commodity">
                                  <SelectValue placeholder="Select commodity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {popularCrops.map((crop) => (
                                  <SelectItem key={crop} value={crop}>
                                    {crop}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="market"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Market</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-market">
                                  <SelectValue placeholder="Select market" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {indianMarkets.map((market) => (
                                  <SelectItem key={market} value={market}>
                                    {market}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="targetPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Price (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="3000"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-target-price"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priceUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price Unit</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-price-unit">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="per quintal">per quintal</SelectItem>
                                <SelectItem value="per kg">per kg</SelectItem>
                                <SelectItem value="per ton">per ton</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="alertType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alert When Price Goes</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-alert-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="above">Above target price</SelectItem>
                                <SelectItem value="below">Below target price</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreating(false)}
                        data-testid="button-cancel-alert"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createAlertMutation.isPending}
                        data-testid="button-submit-alert"
                      >
                        {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    How Price Alerts Work
                  </h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <p>• Get SMS notifications when prices reach your target</p>
                    <p>• Alerts check prices multiple times daily from nearby markets</p>
                    <p>• You can pause or delete alerts anytime</p>
                    <p>• Set both upper and lower price thresholds for better trading decisions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}