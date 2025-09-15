import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Plus, 
  Package, 
  Gavel, 
  Truck, 
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  Eye,
  ArrowRight,
  Sun,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

export default function FarmerMarketplace() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showBidForm, setShowBidForm] = useState(false);

  // Form states
  const [listingForm, setListingForm] = useState({
    cropName: "",
    variety: "",
    quantity: "",
    quantityUnit: "quintal",
    quality: "A",
    expectedPrice: "",
    harvestDate: "",
    location: "",
    description: ""
  });

  const [bidForm, setBidForm] = useState({
    bidAmount: "",
    quantity: "",
    buyerType: "buyer",
    notes: "",
    validUntil: ""
  });

  const [solarForm, setSolarForm] = useState({
    fieldSize: "",
    fieldSizeUnit: "acre",
    currentCropIncome: "",
    solarPanelCapacity: "",
    sunlightHours: "",
    electricityRate: "",
    installationCost: "",
    governmentSubsidy: "",
    maintenanceCost: ""
  });

  const [solarCalculation, setSolarCalculation] = useState<any>(null);

  // Queries
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ["/api/produce-listings"],
  });

  const { data: userBids } = useQuery({
    queryKey: ["/api/bids/user"],
  });

  const { data: logisticsOrders } = useQuery({
    queryKey: ["/api/logistics-orders"],
  });

  // Mutations
  const createListingMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/produce-listings", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Produce listing created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/produce-listings"] });
      setListingForm({
        cropName: "",
        variety: "",
        quantity: "",
        quantityUnit: "quintal",
        quality: "A",
        expectedPrice: "",
        harvestDate: "",
        location: "",
        description: ""
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create listing", variant: "destructive" });
    }
  });

  const createBidMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/bids", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Bid placed successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/bids/user"] });
      setShowBidForm(false);
      setBidForm({
        bidAmount: "",
        quantity: "",
        buyerType: "buyer",
        notes: "",
        validUntil: ""
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to place bid", variant: "destructive" });
    }
  });

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    createListingMutation.mutate({
      ...listingForm,
      quantity: parseFloat(listingForm.quantity),
      expectedPrice: parseFloat(listingForm.expectedPrice),
      harvestDate: new Date(listingForm.harvestDate),
    });
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    
    createBidMutation.mutate({
      listingId: selectedListing.id,
      bidAmount: parseFloat(bidForm.bidAmount),
      quantity: parseFloat(bidForm.quantity),
      buyerType: bidForm.buyerType,
      notes: bidForm.notes,
      validUntil: new Date(bidForm.validUntil),
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "A": return "status-success";
      case "B": return "status-warning";
      case "C": return "status-info";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateSolarIncome = () => {
    const {
      fieldSize,
      fieldSizeUnit,
      currentCropIncome,
      solarPanelCapacity,
      sunlightHours,
      electricityRate,
      installationCost,
      governmentSubsidy,
      maintenanceCost
    } = solarForm;

    if (!fieldSize || !currentCropIncome || !solarPanelCapacity || !sunlightHours || !electricityRate) {
      toast({ 
        title: "Missing Information", 
        description: "Please fill in all required fields for accurate calculation", 
        variant: "destructive" 
      });
      return;
    }

    const fieldSizeInAcres = fieldSizeUnit === "hectare" ? parseFloat(fieldSize) * 2.47 : parseFloat(fieldSize);
    
    // Solar calculations
    const dailyEnergyProduction = parseFloat(solarPanelCapacity) * parseFloat(sunlightHours); // kWh per day
    const annualEnergyProduction = dailyEnergyProduction * 365; // kWh per year
    const annualSolarIncome = annualEnergyProduction * parseFloat(electricityRate); // Annual income from solar
    
    // Costs
    const totalInstallationCost = parseFloat(installationCost || "0");
    const subsidyAmount = parseFloat(governmentSubsidy || "0");
    const netInstallationCost = totalInstallationCost - subsidyAmount;
    const annualMaintenanceCost = parseFloat(maintenanceCost || "0");
    const netAnnualSolarIncome = annualSolarIncome - annualMaintenanceCost;
    
    // Additional income calculation
    const currentAnnualIncome = parseFloat(currentCropIncome);
    const totalAnnualIncome = currentAnnualIncome + netAnnualSolarIncome;
    const additionalIncomePercentage = ((netAnnualSolarIncome / currentAnnualIncome) * 100);
    
    // Payback period
    const paybackPeriodYears = netInstallationCost > 0 ? netInstallationCost / netAnnualSolarIncome : 0;
    
    const calculation = {
      fieldSizeInAcres: fieldSizeInAcres.toFixed(2),
      dailyEnergyProduction: dailyEnergyProduction.toFixed(2),
      annualEnergyProduction: annualEnergyProduction.toFixed(0),
      annualSolarIncome: annualSolarIncome.toFixed(0),
      annualMaintenanceCost: annualMaintenanceCost.toFixed(0),
      netAnnualSolarIncome: netAnnualSolarIncome.toFixed(0),
      currentAnnualIncome: currentAnnualIncome.toFixed(0),
      totalAnnualIncome: totalAnnualIncome.toFixed(0),
      additionalIncomePercentage: additionalIncomePercentage.toFixed(1),
      totalInstallationCost: totalInstallationCost.toFixed(0),
      subsidyAmount: subsidyAmount.toFixed(0),
      netInstallationCost: netInstallationCost.toFixed(0),
      paybackPeriodYears: paybackPeriodYears.toFixed(1)
    };

    setSolarCalculation(calculation);
    toast({ 
      title: "Calculation Complete", 
      description: "Your solar income projection has been calculated successfully!" 
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Clean Header */}
      <header className="bg-white border-b border-border px-6 py-4" data-testid="farmer-marketplace-header">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="mr-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">
            Farmer Marketplace
          </h1>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="listings" className="flex items-center gap-2" data-testid="tab-listings">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">My Produce</span>
            </TabsTrigger>
            <TabsTrigger value="bidding" className="flex items-center gap-2" data-testid="tab-bidding">
              <Gavel className="h-4 w-4" />
              <span className="hidden sm:inline">Bidding</span>
            </TabsTrigger>
            <TabsTrigger value="logistics" className="flex items-center gap-2" data-testid="tab-logistics">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Logistics</span>
            </TabsTrigger>
            <TabsTrigger value="solar" className="flex items-center gap-2" data-testid="tab-solar">
              <Sun className="h-4 w-4" />
              <span className="hidden sm:inline">Solar Income</span>
            </TabsTrigger>
          </TabsList>

          {/* Produce Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            {/* Create Listing Form */}
            <Card className="farm-card" data-testid="create-listing-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5" />
                  List Your Produce
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateListing} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cropName" className="text-sm font-medium">Crop Name</Label>
                      <Input
                        id="cropName"
                        className="input-farm"
                        value={listingForm.cropName}
                        onChange={(e) => setListingForm(prev => ({ ...prev, cropName: e.target.value }))}
                        placeholder="e.g., Rice, Wheat, Cotton"
                        required
                        data-testid="input-crop-name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="variety" className="text-sm font-medium">Variety</Label>
                      <Input
                        id="variety"
                        className="input-farm"
                        value={listingForm.variety}
                        onChange={(e) => setListingForm(prev => ({ ...prev, variety: e.target.value }))}
                        placeholder="e.g., Basmati, Lokvan"
                        data-testid="input-variety"
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        className="input-farm"
                        value={listingForm.quantity}
                        onChange={(e) => setListingForm(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="Enter quantity"
                        required
                        data-testid="input-quantity"
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantityUnit" className="text-sm font-medium">Unit</Label>
                      <Select value={listingForm.quantityUnit} onValueChange={(value) => setListingForm(prev => ({ ...prev, quantityUnit: value }))}>
                        <SelectTrigger className="input-farm" data-testid="select-quantity-unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quintal">Quintal</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="tons">Tons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quality" className="text-sm font-medium">Quality Grade</Label>
                      <Select value={listingForm.quality} onValueChange={(value) => setListingForm(prev => ({ ...prev, quality: value }))}>
                        <SelectTrigger className="input-farm" data-testid="select-quality">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Grade A (Premium)</SelectItem>
                          <SelectItem value="B">Grade B (Good)</SelectItem>
                          <SelectItem value="C">Grade C (Standard)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="expectedPrice" className="text-sm font-medium">
                        Expected Price (₹ per {listingForm.quantityUnit})
                      </Label>
                      <Input
                        id="expectedPrice"
                        type="number"
                        className="input-farm"
                        value={listingForm.expectedPrice}
                        onChange={(e) => setListingForm(prev => ({ ...prev, expectedPrice: e.target.value }))}
                        placeholder="Enter expected price"
                        required
                        data-testid="input-expected-price"
                      />
                    </div>

                    <div>
                      <Label htmlFor="harvestDate" className="text-sm font-medium">Harvest Date</Label>
                      <Input
                        id="harvestDate"
                        type="date"
                        className="input-farm"
                        value={listingForm.harvestDate}
                        onChange={(e) => setListingForm(prev => ({ ...prev, harvestDate: e.target.value }))}
                        required
                        data-testid="input-harvest-date"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                      <Input
                        id="location"
                        className="input-farm"
                        value={listingForm.location}
                        onChange={(e) => setListingForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, State"
                        required
                        data-testid="input-location"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      className="input-farm"
                      value={listingForm.description}
                      onChange={(e) => setListingForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Additional details about your produce..."
                      rows={3}
                      data-testid="textarea-description"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-farm-primary w-full" 
                    disabled={createListingMutation.isPending}
                    data-testid="button-create-listing"
                  >
                    {createListingMutation.isPending ? "Creating..." : "Create Listing"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Active Listings */}
            <div>
              <h3 className="section-header">
                <Eye className="h-5 w-5" />
                Your Active Listings
              </h3>
              <div className="space-y-4">
                {listingsLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="farm-card" data-testid={`listing-skeleton-${index}`}>
                      <CardContent className="p-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                          <div className="h-6 bg-muted rounded w-1/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : listings && listings.length > 0 ? (
                  listings.map((listing: any) => (
                    <Card key={listing.id} className="farm-card" data-testid={`listing-${listing.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground" data-testid={`listing-title-${listing.id}`}>
                              {listing.cropName} {listing.variety && `(${listing.variety})`}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getQualityColor(listing.quality)} data-testid={`listing-quality-${listing.id}`}>
                                Grade {listing.quality}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {listing.quantity} {listing.quantityUnit}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-semibold text-green-600" data-testid={`listing-price-${listing.id}`}>
                              {formatPrice(parseFloat(listing.expectedPrice))}
                            </div>
                            <div className="text-xs text-muted-foreground">per {listing.quantityUnit}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {listing.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(listing.harvestDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {listing.description && (
                          <p className="text-sm text-muted-foreground mt-3" data-testid={`listing-description-${listing.id}`}>
                            {listing.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="farm-card border-dashed" data-testid="no-listings">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">No Listings Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Create your first produce listing to start selling!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Real-time Bidding Tab */}
          <TabsContent value="bidding" className="space-y-6">
            <div className="space-y-6">
              {/* Available Listings for Bidding */}
              <div>
                <h3 className="section-header">
                  <Gavel className="h-5 w-5" />
                  Available for Bidding
                </h3>
                <div className="space-y-4">
                  {listings && listings.length > 0 ? (
                    listings.filter((listing: any) => listing.status === "active").map((listing: any) => (
                      <Card key={listing.id} className="farm-card" data-testid={`bidding-listing-${listing.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {listing.cropName} {listing.variety && `(${listing.variety})`}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getQualityColor(listing.quality)}>
                                  Grade {listing.quality}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {listing.quantity} {listing.quantityUnit} available
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-primary">
                                Starting at {formatPrice(parseFloat(listing.expectedPrice))}
                              </div>
                              <Button 
                                onClick={() => {
                                  setSelectedListing(listing);
                                  setShowBidForm(true);
                                }}
                                className="btn-farm-primary mt-2"
                                data-testid={`button-bid-${listing.id}`}
                              >
                                <Gavel className="h-4 w-4 mr-2" />
                                Place Bid
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {listing.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Listed {new Date(listing.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="farm-card border-dashed" data-testid="no-bidding-listings">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Gavel className="h-8 w-8 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No Active Listings</h3>
                        <p className="text-sm text-muted-foreground">
                          No produce available for bidding at the moment.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* My Bids */}
              <div>
                <h3 className="section-header">My Bids</h3>
                <div className="space-y-4">
                  {userBids && userBids.length > 0 ? (
                    userBids.map((bid: any) => (
                      <Card key={bid.id} className="farm-card" data-testid={`bid-${bid.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                Bid for Listing #{bid.listingId.slice(-8)}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Users className="h-3 w-3" />
                                <span className="text-sm text-muted-foreground capitalize">
                                  {bid.buyerType}
                                </span>
                                <Badge className={
                                  bid.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                                  bid.status === "accepted" ? "status-success" : "bg-red-100 text-red-800"
                                }>
                                  {bid.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-foreground">
                                {formatPrice(parseFloat(bid.bidAmount))}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                for {bid.quantity} units
                              </div>
                            </div>
                          </div>
                          
                          {bid.notes && (
                            <p className="text-sm text-muted-foreground mt-3">
                              Note: {bid.notes}
                            </p>
                          )}
                          
                          <div className="text-xs text-muted-foreground mt-2">
                            Valid until: {new Date(bid.validUntil).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="farm-card border-dashed" data-testid="no-bids">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <DollarSign className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No Bids Yet</h3>
                        <p className="text-sm text-muted-foreground">
                          You haven't placed any bids yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Bid Form Modal */}
            {showBidForm && selectedListing && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" data-testid="bid-form-modal">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Place Bid for {selectedListing.cropName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePlaceBid} className="space-y-4">
                      <div>
                        <Label htmlFor="bidAmount" className="text-sm font-medium">
                          Bid Amount (₹ per {selectedListing.quantityUnit})
                        </Label>
                        <Input
                          id="bidAmount"
                          type="number"
                          className="input-farm"
                          value={bidForm.bidAmount}
                          onChange={(e) => setBidForm(prev => ({ ...prev, bidAmount: e.target.value }))}
                          placeholder={`Minimum: ${selectedListing.expectedPrice}`}
                          min={selectedListing.expectedPrice}
                          required
                          data-testid="input-bid-amount"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bidQuantity" className="text-sm font-medium">
                          Quantity ({selectedListing.quantityUnit})
                        </Label>
                        <Input
                          id="bidQuantity"
                          type="number"
                          className="input-farm"
                          value={bidForm.quantity}
                          onChange={(e) => setBidForm(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder={`Available: ${selectedListing.quantity}`}
                          max={selectedListing.quantity}
                          required
                          data-testid="input-bid-quantity"
                        />
                      </div>

                      <div>
                        <Label htmlFor="buyerType" className="text-sm font-medium">Buyer Type</Label>
                        <Select value={bidForm.buyerType} onValueChange={(value) => setBidForm(prev => ({ ...prev, buyerType: value }))}>
                          <SelectTrigger className="input-farm" data-testid="select-buyer-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buyer">Individual Buyer</SelectItem>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                            <SelectItem value="transporter">Transporter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="validUntil" className="text-sm font-medium">Valid Until</Label>
                        <Input
                          id="validUntil"
                          type="datetime-local"
                          className="input-farm"
                          value={bidForm.validUntil}
                          onChange={(e) => setBidForm(prev => ({ ...prev, validUntil: e.target.value }))}
                          required
                          data-testid="input-valid-until"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bidNotes" className="text-sm font-medium">Notes (Optional)</Label>
                        <Textarea
                          id="bidNotes"
                          className="input-farm"
                          value={bidForm.notes}
                          onChange={(e) => setBidForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any additional information..."
                          rows={2}
                          data-testid="textarea-bid-notes"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowBidForm(false)}
                          data-testid="button-cancel-bid"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="btn-farm-primary flex-1"
                          disabled={createBidMutation.isPending}
                          data-testid="button-submit-bid"
                        >
                          {createBidMutation.isPending ? "Placing..." : "Place Bid"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Logistics & Payment Tab */}
          <TabsContent value="logistics" className="space-y-6">
            <div className="space-y-6">
              {/* Logistics Partners */}
              <Card className="farm-card" data-testid="logistics-partners">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Logistics Partners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Transport Partners */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Transport Services</h4>
                      <div className="space-y-3">
                        {[
                          { name: "FastTrack Logistics", price: "₹5-8/km", rating: "4.8", speciality: "Cold Storage" },
                          { name: "AgriMove Express", price: "₹6-10/km", rating: "4.6", speciality: "Bulk Transport" },
                          { name: "FarmLink Transport", price: "₹4-7/km", rating: "4.7", speciality: "Local Delivery" }
                        ].map((partner, index) => (
                          <Card key={index} className="farm-card p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-foreground">{partner.name}</h5>
                              <Badge className="status-info">★ {partner.rating}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div>{partner.price}</div>
                              <div>Speciality: {partner.speciality}</div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Storage Partners */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Storage Services</h4>
                      <div className="space-y-3">
                        {[
                          { name: "ColdChain Pro", price: "₹2-4/quintal/day", rating: "4.9", speciality: "Temperature Controlled" },
                          { name: "AgriStore Solutions", price: "₹1-3/quintal/day", rating: "4.5", speciality: "Dry Storage" },
                          { name: "FreshKeep Warehouses", price: "₹3-5/quintal/day", rating: "4.7", speciality: "Multi-commodity" }
                        ].map((partner, index) => (
                          <Card key={index} className="farm-card p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-foreground">{partner.name}</h5>
                              <Badge className="status-info">★ {partner.rating}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div>{partner.price}</div>
                              <div>Speciality: {partner.speciality}</div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Gateway */}
              <Card className="farm-card" data-testid="payment-gateway">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">Secure Payments</h4>
                      <p className="text-sm text-muted-foreground">
                        Bank-grade security with encryption
                      </p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">Quick Settlement</h4>
                      <p className="text-sm text-muted-foreground">
                        Funds within 24 hours of delivery
                      </p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">Multiple Methods</h4>
                      <p className="text-sm text-muted-foreground">
                        UPI, Cards, Net Banking
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Orders */}
              <Card className="farm-card" data-testid="active-orders">
                <CardHeader>
                  <CardTitle>Your Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {logisticsOrders && logisticsOrders.length > 0 ? (
                    <div className="space-y-4">
                      {logisticsOrders.map((order: any) => (
                        <Card key={order.id} className="farm-card p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground">Order #{order.id.slice(-8)}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={
                                  order.orderStatus === "completed" ? "status-success" : 
                                  order.orderStatus === "in_transit" ? "status-warning" : "status-info"
                                }>
                                  {order.orderStatus?.replace("_", " ") || "pending"}
                                </Badge>
                                <Badge className={order.paymentStatus === "paid" ? "status-success" : "status-warning"}>
                                  {order.paymentStatus}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-foreground text-lg">
                                {formatPrice(parseFloat(order.totalAmount))}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total Amount
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium text-foreground">Transport Partner</div>
                              <div className="text-muted-foreground">{order.transportPartner}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Delivery Location</div>
                              <div className="text-muted-foreground">{order.deliveryLocation}</div>
                            </div>
                          </div>
                          
                          {order.estimatedDelivery && (
                            <div className="mt-3 text-sm">
                              <span className="font-medium text-foreground">Estimated Delivery: </span>
                              <span className="text-muted-foreground">
                                {new Date(order.estimatedDelivery).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Truck className="h-8 w-8 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">No Orders Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Your logistics and delivery orders will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Solar Income Planner Tab */}
          <TabsContent value="solar" className="space-y-6">
            <div className="space-y-6">
              {/* Solar Calculator Form */}
              <Card className="farm-card" data-testid="solar-calculator">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    Solar Income Planner
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Calculate your additional income potential from solar panels on your farmland
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Field & Farming Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Field & Farming Information</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="fieldSize" className="text-sm font-medium">Field Size *</Label>
                          <Input
                            id="fieldSize"
                            type="number"
                            className="input-farm"
                            value={solarForm.fieldSize}
                            onChange={(e) => setSolarForm(prev => ({ ...prev, fieldSize: e.target.value }))}
                            placeholder="Enter field size"
                            required
                            data-testid="input-field-size"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fieldSizeUnit" className="text-sm font-medium">Unit</Label>
                          <Select value={solarForm.fieldSizeUnit} onValueChange={(value) => setSolarForm(prev => ({ ...prev, fieldSizeUnit: value }))}>
                            <SelectTrigger className="input-farm" data-testid="select-field-size-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="acre">Acre</SelectItem>
                              <SelectItem value="hectare">Hectare</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="currentCropIncome" className="text-sm font-medium">Current Annual Crop Income (₹) *</Label>
                        <Input
                          id="currentCropIncome"
                          type="number"
                          className="input-farm"
                          value={solarForm.currentCropIncome}
                          onChange={(e) => setSolarForm(prev => ({ ...prev, currentCropIncome: e.target.value }))}
                          placeholder="e.g., 150000"
                          required
                          data-testid="input-current-crop-income"
                        />
                      </div>
                    </div>

                    {/* Solar System Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Solar System Information</h4>
                      
                      <div>
                        <Label htmlFor="solarPanelCapacity" className="text-sm font-medium">Solar Panel Capacity (kW) *</Label>
                        <Input
                          id="solarPanelCapacity"
                          type="number"
                          className="input-farm"
                          value={solarForm.solarPanelCapacity}
                          onChange={(e) => setSolarForm(prev => ({ ...prev, solarPanelCapacity: e.target.value }))}
                          placeholder="e.g., 10"
                          required
                          data-testid="input-solar-capacity"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Typically 1-2 kW per acre for agri-solar systems
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="sunlightHours" className="text-sm font-medium">Daily Sunlight Hours *</Label>
                        <Input
                          id="sunlightHours"
                          type="number"
                          step="0.1"
                          className="input-farm"
                          value={solarForm.sunlightHours}
                          onChange={(e) => setSolarForm(prev => ({ ...prev, sunlightHours: e.target.value }))}
                          placeholder="e.g., 5.5"
                          required
                          data-testid="input-sunlight-hours"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Average peak sunlight hours in your region
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="electricityRate" className="text-sm font-medium">Electricity Rate (₹ per kWh) *</Label>
                        <Input
                          id="electricityRate"
                          type="number"
                          step="0.01"
                          className="input-farm"
                          value={solarForm.electricityRate}
                          onChange={(e) => setSolarForm(prev => ({ ...prev, electricityRate: e.target.value }))}
                          placeholder="e.g., 4.50"
                          required
                          data-testid="input-electricity-rate"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Grid tariff or selling price per unit
                        </p>
                      </div>
                    </div>

                    {/* Cost Information */}
                    <div className="space-y-4 md:col-span-2">
                      <h4 className="font-semibold text-foreground">Cost & Investment Information</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="installationCost" className="text-sm font-medium">Installation Cost (₹)</Label>
                          <Input
                            id="installationCost"
                            type="number"
                            className="input-farm"
                            value={solarForm.installationCost}
                            onChange={(e) => setSolarForm(prev => ({ ...prev, installationCost: e.target.value }))}
                            placeholder="e.g., 500000"
                            data-testid="input-installation-cost"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Total system installation cost
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="governmentSubsidy" className="text-sm font-medium">Government Subsidy (₹)</Label>
                          <Input
                            id="governmentSubsidy"
                            type="number"
                            className="input-farm"
                            value={solarForm.governmentSubsidy}
                            onChange={(e) => setSolarForm(prev => ({ ...prev, governmentSubsidy: e.target.value }))}
                            placeholder="e.g., 150000"
                            data-testid="input-government-subsidy"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Available subsidies and incentives
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="maintenanceCost" className="text-sm font-medium">Annual Maintenance (₹)</Label>
                          <Input
                            id="maintenanceCost"
                            type="number"
                            className="input-farm"
                            value={solarForm.maintenanceCost}
                            onChange={(e) => setSolarForm(prev => ({ ...prev, maintenanceCost: e.target.value }))}
                            placeholder="e.g., 15000"
                            data-testid="input-maintenance-cost"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Yearly maintenance expenses
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={calculateSolarIncome}
                    className="btn-farm-primary w-full mt-6" 
                    data-testid="button-calculate-solar"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Solar Income Potential
                  </Button>
                </CardContent>
              </Card>

              {/* Solar Income Results */}
              {solarCalculation && (
                <Card className="farm-card" data-testid="solar-results">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Your Solar Income Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* Key Metrics Cards */}
                      <Card className="farm-card bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-green-600" data-testid="text-additional-income">
                            +₹{solarCalculation.netAnnualSolarIncome}
                          </div>
                          <div className="text-sm text-green-700">Additional Annual Income</div>
                          <div className="text-xs text-green-600 mt-1">
                            +{solarCalculation.additionalIncomePercentage}% increase
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="farm-card bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-blue-600" data-testid="text-total-income">
                            ₹{solarCalculation.totalAnnualIncome}
                          </div>
                          <div className="text-sm text-blue-700">Total Annual Income</div>
                          <div className="text-xs text-blue-600 mt-1">
                            Farming + Solar combined
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="farm-card bg-orange-50 border-orange-200">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-orange-600" data-testid="text-payback-period">
                            {solarCalculation.paybackPeriodYears} years
                          </div>
                          <div className="text-sm text-orange-700">Payback Period</div>
                          <div className="text-xs text-orange-600 mt-1">
                            Return on investment time
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="farm-card bg-purple-50 border-purple-200">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-purple-600" data-testid="text-energy-production">
                            {solarCalculation.annualEnergyProduction}
                          </div>
                          <div className="text-sm text-purple-700">kWh per Year</div>
                          <div className="text-xs text-purple-600 mt-1">
                            Energy generation capacity
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Income Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Farming Income:</span>
                            <span className="font-medium">₹{solarCalculation.currentAnnualIncome}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Solar Revenue:</span>
                            <span className="font-medium">₹{solarCalculation.annualSolarIncome}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Maintenance Costs:</span>
                            <span className="font-medium text-red-600">-₹{solarCalculation.annualMaintenanceCost}</span>
                          </div>
                          <hr className="border-border" />
                          <div className="flex justify-between font-semibold">
                            <span>Net Additional Income:</span>
                            <span className="text-green-600">+₹{solarCalculation.netAnnualSolarIncome}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Investment Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Installation Cost:</span>
                            <span className="font-medium">₹{solarCalculation.totalInstallationCost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Government Subsidy:</span>
                            <span className="font-medium text-green-600">-₹{solarCalculation.subsidyAmount}</span>
                          </div>
                          <hr className="border-border" />
                          <div className="flex justify-between font-semibold">
                            <span>Net Investment:</span>
                            <span>₹{solarCalculation.netInstallationCost}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Field Size:</span>
                            <span>{solarCalculation.fieldSizeInAcres} acres</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Daily Production:</span>
                            <span>{solarCalculation.dailyEnergyProduction} kWh</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Benefits Note */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">Additional Benefits of Agri-Solar Systems:</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Provides shade for crops, reducing water evaporation</li>
                        <li>• Can improve crop yields for certain shade-tolerant crops</li>
                        <li>• Diversifies income sources and reduces farming risks</li>
                        <li>• Contributes to clean energy production</li>
                        <li>• May qualify for carbon credits and additional incentives</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Information Card */}
              <Card className="farm-card bg-yellow-50 border-yellow-200" data-testid="solar-info">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Sun className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Important Notes:</h4>
                      <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                        <li>• Calculations are estimates based on provided inputs</li>
                        <li>• Actual performance may vary based on weather and system efficiency</li>
                        <li>• Consult with certified solar installers for detailed assessments</li>
                        <li>• Check current government schemes and subsidies in your state</li>
                        <li>• Consider grid connectivity and net metering policies</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}