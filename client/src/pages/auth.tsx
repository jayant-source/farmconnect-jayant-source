import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Smartphone, Loader2, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

type AuthStep = "combined";

const crops = [
  { id: "rice", name: "Rice" },
  { id: "wheat", name: "Wheat" },
  { id: "cotton", name: "Cotton" },
  { id: "sugarcane", name: "Sugarcane" },
  { id: "maize", name: "Maize" },
  { id: "others", name: "Others" },
];

export default function Auth() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, setPhone, updateUser } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  
  // Profile form data
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "",
    farmSize: "",
    primaryCrops: [] as string[],
    language: "en",
  });

  const sendOTPMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest("POST", "/api/auth/send-otp", { phone });
      return response.json();
    },
    onSuccess: () => {
      setPhone(phoneNumber);
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: t("auth.otpSent") + " " + phoneNumber,
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

  const verifyOTPMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", { phone, otp });
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      setOtpVerified(true);
      if (data.user.isOnboarded) {
        updateUser(data.user);
        i18n.changeLanguage(data.user.language);
        setLocation("/dashboard");
      } else {
        toast({
          title: "Phone Verified!",
          description: "Please complete your profile to continue.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Invalid OTP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await apiRequest("PUT", "/api/user/profile", userData);
      return response.json();
    },
    onSuccess: (data) => {
      updateUser(data.user);
      i18n.changeLanguage(data.user.language);
      setLocation("/dashboard");
      toast({
        title: "Welcome to FarmConnect!",
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

  const handleSendOTP = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    sendOTPMutation.mutate(phoneNumber);
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 4) {
      toast({
        title: "Error",
        description: "Please enter the 4-digit OTP",
        variant: "destructive",
      });
      return;
    }
    verifyOTPMutation.mutate({ phone: phoneNumber, otp });
  };

  const handleCropToggle = (cropId: string) => {
    setFormData(prev => ({
      ...prev,
      primaryCrops: prev.primaryCrops.includes(cropId)
        ? prev.primaryCrops.filter(id => id !== cropId)
        : [...prev.primaryCrops, cropId]
    }));
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpVerified) {
      toast({
        title: "Error",
        description: "Please verify your phone number first",
        variant: "destructive",
      });
      return;
    }
    
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

  return (
    <section className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-enhanced shadow-2xl border border-white/20 backdrop-blur-xl" data-testid="auth-card">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Smartphone className="text-white text-4xl" />
              </motion.div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3" data-testid="auth-title">
                Join FarmConnect
              </h2>
              <p className="text-lg text-muted-foreground font-medium" data-testid="auth-subtitle">
                Complete your registration in one simple form
              </p>
            </div>

            <form onSubmit={handleCompleteOnboarding} className="space-y-6">
              {/* Phone Number Section */}
              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Phone Verification</h3>
                  {otpVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      {t("auth.phoneLabel")}
                    </Label>
                    <div className="relative">
                      <select className="absolute left-3 top-3 bg-transparent border-none text-muted-foreground text-sm">
                        <option>+91</option>
                      </select>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        className="pl-16"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={otpVerified}
                        data-testid="input-phone"
                      />
                    </div>
                    {!otpSent && (
                      <Button 
                        type="button"
                        className="w-full mt-2" 
                        onClick={handleSendOTP}
                        disabled={sendOTPMutation.isPending || otpVerified}
                        data-testid="button-send-otp"
                      >
                        {sendOTPMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    )}
                  </div>

                  {otpSent && !otpVerified && (
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">
                        Enter OTP
                      </Label>
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-lg mb-3 text-center">
                        <div className="font-semibold text-sm mb-1">🚀 Demo Mode</div>
                        <div className="text-xs opacity-90">Enter OTP: <span className="font-bold">0000</span></div>
                      </div>
                      <div className="flex justify-center mb-2">
                        <InputOTP 
                          maxLength={4} 
                          value={otp} 
                          onChange={setOtp}
                          data-testid="input-otp"
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <Button 
                        type="button"
                        className="w-full" 
                        onClick={handleVerifyOTP}
                        disabled={verifyOTPMutation.isPending}
                        data-testid="button-verify-otp"
                      >
                        {verifyOTPMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Information Section */}
              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="25"
                      data-testid="input-age"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Village, District, State"
                    data-testid="input-location"
                  />
                </div>

                <div>
                  <Label htmlFor="farmSize">Farm Size (acres)</Label>
                  <Input
                    id="farmSize"
                    type="number"
                    step="0.1"
                    value={formData.farmSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, farmSize: e.target.value }))}
                    placeholder="5.0"
                    data-testid="input-farm-size"
                  />
                </div>

                <div>
                  <Label>Primary Crops</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {crops.map((crop) => (
                      <div key={crop.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={crop.id}
                          checked={formData.primaryCrops.includes(crop.id)}
                          onCheckedChange={() => handleCropToggle(crop.id)}
                          data-testid={`checkbox-crop-${crop.id}`}
                        />
                        <Label htmlFor={crop.id} className="text-sm">{crop.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger data-testid="select-language">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full font-bold text-lg py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300" 
                disabled={updateUserMutation.isPending || !otpVerified}
                data-testid="button-complete-onboarding"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Complete Registration & Get Started"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
