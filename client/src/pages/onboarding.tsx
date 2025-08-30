import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

const crops = [
  { id: "rice", name: "Rice" },
  { id: "wheat", name: "Wheat" },
  { id: "cotton", name: "Cotton" },
  { id: "sugarcane", name: "Sugarcane" },
  { id: "maize", name: "Maize" },
  { id: "others", name: "Others" },
];

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: user?.age || "",
    location: user?.location || "",
    farmSize: user?.farmSize || "",
    primaryCrops: user?.primaryCrops || [],
    language: user?.language || "en",
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await apiRequest("PUT", "/api/user/profile", userData);
      return response.json();
    },
    onSuccess: (data) => {
      updateUser(data.user);
      // Update language immediately
      i18n.changeLanguage(data.user.language);
      setLocation("/dashboard");
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully completed!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    updateUserMutation.mutate(formData);
  };

  const handleCropToggle = (cropId: string) => {
    setFormData(prev => ({
      ...prev,
      primaryCrops: prev.primaryCrops.includes(cropId)
        ? prev.primaryCrops.filter(id => id !== cropId)
        : [...prev.primaryCrops, cropId]
    }));
  };

  return (
    <section className="min-h-screen bg-background p-6">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-xl border border-border" data-testid="onboarding-card">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="onboarding-title">
                {t("onboarding.title")}
              </h2>
              <p className="text-muted-foreground" data-testid="onboarding-subtitle">
                {t("onboarding.subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="onboarding-form">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    {t("onboarding.name")}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="block text-sm font-medium text-foreground mb-2">
                    {t("onboarding.age")}
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    data-testid="input-age"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  {t("onboarding.location")}
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Village, District, State"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  data-testid="input-location"
                />
              </div>

              <div>
                <Label htmlFor="farmSize" className="block text-sm font-medium text-foreground mb-2">
                  {t("onboarding.farmSize")}
                </Label>
                <Input
                  id="farmSize"
                  type="number"
                  placeholder="5"
                  value={formData.farmSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, farmSize: e.target.value }))}
                  data-testid="input-farm-size"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  {t("onboarding.crops")}
                </Label>
                <div className="grid grid-cols-3 gap-3" data-testid="crops-selection">
                  {crops.map((crop) => (
                    <label 
                      key={crop.id}
                      className="flex items-center p-3 border border-input rounded-lg hover:bg-muted cursor-pointer"
                      data-testid={`crop-option-${crop.id}`}
                    >
                      <Checkbox
                        checked={formData.primaryCrops.includes(crop.id)}
                        onCheckedChange={() => handleCropToggle(crop.id)}
                        className="mr-3"
                      />
                      <span className="text-sm">{crop.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  {t("onboarding.language")}
                </Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  data-testid="select-language"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full py-4 text-lg font-semibold"
                disabled={updateUserMutation.isPending}
                data-testid="button-complete-setup"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  t("onboarding.complete")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
