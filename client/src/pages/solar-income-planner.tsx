import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Sun,
  Calculator,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { solarCalculatorSchema, type SolarCalculatorForm } from "@shared/schema";

interface SolarCalculation {
  fieldSizeInAcres: string;
  dailyEnergyProduction: string;
  annualEnergyProduction: string;
  annualSolarIncome: string;
  annualMaintenanceCost: string;
  netAnnualSolarIncome: string;
  currentAnnualIncome: string;
  totalAnnualIncome: string;
  additionalIncomePercentage: string;
  totalInstallationCost: string;
  subsidyAmount: string;
  netInstallationCost: string;
  paybackPeriodYears: string;
}

export default function SolarIncomePlanner() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [solarCalculation, setSolarCalculation] = useState<SolarCalculation | null>(null);

  const form = useForm<SolarCalculatorForm>({
    resolver: zodResolver(solarCalculatorSchema),
    defaultValues: {
      fieldSize: "",
      fieldSizeUnit: "acre",
      currentCropIncome: "",
      solarPanelCapacity: "",
      sunlightHours: "",
      electricityRate: "",
      installationCost: "",
      governmentSubsidy: "",
      maintenanceCost: ""
    }
  });

  const calculateSolarIncome = (data: SolarCalculatorForm) => {
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
    } = data;

    // Convert to numbers with safety checks
    const fieldSizeNum = parseFloat(fieldSize);
    const currentAnnualIncomeNum = parseFloat(currentCropIncome);
    const solarCapacityNum = parseFloat(solarPanelCapacity);
    const sunlightHoursNum = parseFloat(sunlightHours);
    const electricityRateNum = parseFloat(electricityRate);
    const installationCostNum = parseFloat(installationCost || "0");
    const subsidyAmountNum = parseFloat(governmentSubsidy || "0");
    const maintenanceCostNum = parseFloat(maintenanceCost || "0");

    // Check for invalid inputs
    if (isNaN(fieldSizeNum) || fieldSizeNum <= 0 ||
        isNaN(currentAnnualIncomeNum) || currentAnnualIncomeNum <= 0 ||
        isNaN(solarCapacityNum) || solarCapacityNum <= 0 ||
        isNaN(sunlightHoursNum) || sunlightHoursNum <= 0 ||
        isNaN(electricityRateNum) || electricityRateNum <= 0) {
      toast({ 
        title: t("solar.errors.missingFields"), 
        description: t("solar.errors.fillRequired"), 
        variant: "destructive" 
      });
      return;
    }

    // Field size conversion
    const fieldSizeInAcres = fieldSizeUnit === "hectare" ? fieldSizeNum * 2.47 : fieldSizeNum;
    
    // Solar calculations with safety checks
    const dailyEnergyProduction = solarCapacityNum * sunlightHoursNum; // kWh per day
    const annualEnergyProduction = dailyEnergyProduction * 365; // kWh per year
    const annualSolarIncome = annualEnergyProduction * electricityRateNum; // Annual income from solar
    
    // Costs
    const totalInstallationCost = installationCostNum;
    const subsidyAmount = subsidyAmountNum;
    const netInstallationCost = Math.max(0, totalInstallationCost - subsidyAmount);
    const annualMaintenanceCost = maintenanceCostNum;
    const netAnnualSolarIncome = Math.max(0, annualSolarIncome - annualMaintenanceCost);
    
    // Additional income calculation with safety checks
    const totalAnnualIncome = currentAnnualIncomeNum + netAnnualSolarIncome;
    
    // Safe percentage calculation - prevent division by zero
    let additionalIncomePercentage = 0;
    if (currentAnnualIncomeNum > 0) {
      additionalIncomePercentage = (netAnnualSolarIncome / currentAnnualIncomeNum) * 100;
    }
    
    // Safe payback period calculation - prevent division by zero
    let paybackPeriodYears = 0;
    if (netInstallationCost > 0 && netAnnualSolarIncome > 0) {
      paybackPeriodYears = netInstallationCost / netAnnualSolarIncome;
    } else if (netInstallationCost <= 0) {
      // If there's no net cost (subsidies cover everything or more), payback is immediate
      paybackPeriodYears = 0;
    } else {
      // If net annual solar income is zero or negative, payback is infinite (show as "N/A")
      paybackPeriodYears = Infinity;
    }
    
    // Format results with safety checks for Infinity/NaN
    const calculation: SolarCalculation = {
      fieldSizeInAcres: fieldSizeInAcres.toFixed(2),
      dailyEnergyProduction: dailyEnergyProduction.toFixed(2),
      annualEnergyProduction: annualEnergyProduction.toFixed(0),
      annualSolarIncome: annualSolarIncome.toFixed(0),
      annualMaintenanceCost: annualMaintenanceCost.toFixed(0),
      netAnnualSolarIncome: netAnnualSolarIncome.toFixed(0),
      currentAnnualIncome: currentAnnualIncomeNum.toFixed(0),
      totalAnnualIncome: totalAnnualIncome.toFixed(0),
      additionalIncomePercentage: isFinite(additionalIncomePercentage) ? additionalIncomePercentage.toFixed(1) : "0.0",
      totalInstallationCost: totalInstallationCost.toFixed(0),
      subsidyAmount: subsidyAmount.toFixed(0),
      netInstallationCost: netInstallationCost.toFixed(0),
      paybackPeriodYears: isFinite(paybackPeriodYears) ? paybackPeriodYears.toFixed(1) : "N/A"
    };

    setSolarCalculation(calculation);
    toast({ 
      title: t("solar.errors.calculation"), 
      description: t("solar.errors.success") 
    });
  };

  const onSubmit = (data: SolarCalculatorForm) => {
    calculateSolarIncome(data);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-border px-6 py-4" data-testid="solar-planner-header">
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
            {t("solar.title")}
          </h1>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Solar Calculator Form */}
        <Card className="farm-card" data-testid="solar-calculator">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              {t("solar.calculateTitle")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("solar.subtitle")}
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Field & Farming Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">{t("solar.fieldInfo")}</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="fieldSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("solar.fieldSize")} *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="input-farm"
                                placeholder={t("solar.placeholders.fieldSize")}
                                data-testid="input-field-size"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="fieldSizeUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("solar.unit")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="input-farm" data-testid="select-field-size-unit">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="acre">{t("solar.acre")}</SelectItem>
                                <SelectItem value="hectare">{t("solar.hectare")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="currentCropIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("solar.currentIncome")} *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="input-farm"
                              placeholder={t("solar.placeholders.currentIncome")}
                              data-testid="input-current-crop-income"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Solar System Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">{t("solar.solarInfo")}</h4>
                    
                    <FormField
                      control={form.control}
                      name="solarPanelCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("solar.solarCapacity")} *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="input-farm"
                              placeholder={t("solar.placeholders.solarCapacity")}
                              data-testid="input-solar-capacity"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            {t("solar.help.solarCapacity")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sunlightHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("solar.sunlightHours")} *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              className="input-farm"
                              placeholder={t("solar.placeholders.sunlightHours")}
                              data-testid="input-sunlight-hours"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            {t("solar.help.sunlightHours")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="electricityRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("solar.electricityRate")} *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              className="input-farm"
                              placeholder={t("solar.placeholders.electricityRate")}
                              data-testid="input-electricity-rate"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            {t("solar.help.electricityRate")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Cost Information */}
                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-semibold text-foreground">{t("solar.costInfo")}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="installationCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("solar.installationCost")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="input-farm"
                                placeholder={t("solar.placeholders.installationCost")}
                                data-testid="input-installation-cost"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground">
                              {t("solar.help.installationCost")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="governmentSubsidy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("solar.subsidy")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="input-farm"
                                placeholder={t("solar.placeholders.subsidy")}
                                data-testid="input-government-subsidy"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground">
                              {t("solar.help.subsidy")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maintenanceCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("solar.maintenance")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="input-farm"
                                placeholder={t("solar.placeholders.maintenance")}
                                data-testid="input-maintenance-cost"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground">
                              {t("solar.help.maintenance")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="btn-farm-primary w-full mt-6" 
                  disabled={form.formState.isSubmitting}
                  data-testid="button-calculate-solar"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {t("solar.calculate")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Solar Income Results */}
        {solarCalculation && (
          <Card className="farm-card" data-testid="solar-results">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t("solar.results")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Key Metrics Cards */}
                <Card className="farm-card bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-additional-income">
                      +₹{solarCalculation.netAnnualSolarIncome}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">{t("solar.additionalIncome")}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      +{solarCalculation.additionalIncomePercentage}% {t("solar.units.increase")}
                    </div>
                  </CardContent>
                </Card>

                <Card className="farm-card bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-total-income">
                      ₹{solarCalculation.totalAnnualIncome}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{t("solar.totalIncome")}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {t("solar.units.combined")}
                    </div>
                  </CardContent>
                </Card>

                <Card className="farm-card bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-payback-period">
                      {solarCalculation.paybackPeriodYears} {solarCalculation.paybackPeriodYears !== "N/A" ? t("solar.units.years") : ""}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">{t("solar.paybackPeriod")}</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      {t("solar.units.roi")}
                    </div>
                  </CardContent>
                </Card>

                <Card className="farm-card bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-energy-production">
                      {solarCalculation.annualEnergyProduction}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">{t("solar.energyProduction")}</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {t("solar.units.capacity")}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">{t("solar.incomeBreakdown")}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("solar.currentFarming")}</span>
                      <span className="font-medium">₹{solarCalculation.currentAnnualIncome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("solar.solarRevenue")}</span>
                      <span className="font-medium">₹{solarCalculation.annualSolarIncome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("solar.maintenanceCosts")}</span>
                      <span className="font-medium text-red-600 dark:text-red-400">-₹{solarCalculation.annualMaintenanceCost}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between font-semibold">
                      <span>{t("solar.netAdditional")}</span>
                      <span className="text-green-600 dark:text-green-400">+₹{solarCalculation.netAnnualSolarIncome}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">{t("solar.investmentSummary")}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("solar.totalCost")}</span>
                      <span className="font-medium">₹{solarCalculation.totalInstallationCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("solar.subsidyAmount")}</span>
                      <span className="font-medium text-green-600 dark:text-green-400">-₹{solarCalculation.subsidyAmount}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between font-semibold">
                      <span>{t("solar.netInvestment")}</span>
                      <span>₹{solarCalculation.netInstallationCost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("solar.fieldSizeAcres")}</span>
                      <span>{solarCalculation.fieldSizeInAcres} {t("solar.units.acres")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("solar.dailyProduction")}</span>
                      <span>{solarCalculation.dailyEnergyProduction} {t("solar.units.kwh")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Note */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{t("solar.benefits")}</h5>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>{t("solar.benefit1")}</li>
                  <li>{t("solar.benefit2")}</li>
                  <li>{t("solar.benefit3")}</li>
                  <li>{t("solar.benefit4")}</li>
                  <li>{t("solar.benefit5")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="farm-card bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800" data-testid="solar-info">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">{t("solar.importantNotes")}</h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 space-y-1">
                  <li>{t("solar.note1")}</li>
                  <li>{t("solar.note2")}</li>
                  <li>{t("solar.note3")}</li>
                  <li>{t("solar.note4")}</li>
                  <li>{t("solar.note5")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}