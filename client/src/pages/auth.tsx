import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Smartphone, Loader2, User, CheckCircle, Leaf, Sparkles, Zap, Star, ArrowRight } from "lucide-react";
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

    if (!formData.age.trim()) {
      toast({
        title: "Error",
        description: "Please enter your age",
        variant: "destructive",
      });
      return;
    }

    if (!formData.location.trim()) {
      toast({
        title: "Error",
        description: "Please enter your location",
        variant: "destructive",
      });
      return;
    }

    updateUserMutation.mutate(formData);
  };

  // Create floating particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 3,
  }));

  return (
    <section className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Floating Particles Background */}
      <div className="floating-particles">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, -10, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Background Effects */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-morphing"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-morphing"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
      />

      <motion.div
        className="w-full max-w-3xl relative z-10"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <div className="premium-card rounded-3xl p-8 hover-glow relative overflow-hidden" data-testid="auth-card">
          {/* Card Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <motion.div 
                className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-8 premium-glow shadow-2xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1,
                  rotate: 0,
                }}
                transition={{ 
                  duration: 1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Leaf className="text-black text-5xl" />
              </motion.div>
              
              <motion.h2 
                className="text-5xl lg:text-6xl font-bold gradient-text-primary mb-4 text-shadow-glow" 
                data-testid="auth-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Join FarmConnect
              </motion.h2>
              
              <motion.p 
                className="text-xl text-muted-foreground mb-2" 
                data-testid="auth-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Complete your farming journey in one seamless form
              </motion.p>
              
              <motion.div
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Star className="w-4 h-4 text-primary animate-twinkle" />
                <span>AI-Powered Smart Farming Revolution</span>
                <Star className="w-4 h-4 text-accent animate-twinkle" />
              </motion.div>
            </div>

            <motion.form 
              onSubmit={handleCompleteOnboarding} 
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {/* Phone Number Section */}
              <motion.div 
                className="premium-card rounded-2xl p-6 space-y-6 hover-glow group relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Smartphone className="h-6 w-6 text-primary" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">Phone Verification</h3>
                      <p className="text-sm text-muted-foreground">Secure your farming account</p>
                    </div>
                    {otpVerified && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                      </motion.div>
                    )}
                  </motion.div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="block text-sm font-medium text-foreground mb-3">
                        {t("auth.phoneLabel")}
                      </Label>
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <select className="absolute left-3 top-3 bg-transparent border-none text-muted-foreground text-sm">
                          <option>+91</option>
                        </select>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          className="pl-16 h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          disabled={otpVerified}
                          data-testid="input-phone"
                        />
                      </motion.div>
                      {!otpSent && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="button"
                            className="w-full mt-3 h-12 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg hover:shadow-xl premium-glow" 
                            onClick={handleSendOTP}
                            disabled={sendOTPMutation.isPending || otpVerified}
                            data-testid="button-send-otp"
                          >
                            {sendOTPMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending Magic Code...
                              </>
                            ) : (
                              <>
                                <Zap className="mr-2 h-4 w-4" />
                                Send Verification Code
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {otpSent && !otpVerified && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Label className="block text-sm font-medium text-foreground mb-3">
                          Enter Verification Code
                        </Label>
                        <motion.div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-black p-4 rounded-xl mb-4 text-center premium-glow"
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <div className="font-bold text-lg mb-1 flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Demo Mode
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div className="text-sm opacity-90">Enter Code: <span className="font-bold text-lg">0000</span></div>
                        </motion.div>
                        <div className="flex justify-center mb-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
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
                          </motion.div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="button"
                            className="w-full h-12 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg hover:shadow-xl premium-glow" 
                            onClick={handleVerifyOTP}
                            disabled={verifyOTPMutation.isPending}
                            data-testid="button-verify-otp"
                          >
                            {verifyOTPMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Verifying Code...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Verify & Continue
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Profile Information Section */}
              <motion.div 
                className="premium-card rounded-2xl p-6 space-y-6 hover-glow group relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -4 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <User className="h-6 w-6 text-purple-400" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">Profile Information</h3>
                      <p className="text-sm text-muted-foreground">Tell us about your farm</p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6 text-accent/50" />
                    </motion.div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your name"
                        className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                        data-testid="input-name"
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="age" className="block text-sm font-medium text-foreground mb-2">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="25"
                        className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                        data-testid="input-age"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Village, District, State"
                      className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                      data-testid="input-location"
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="farmSize" className="block text-sm font-medium text-foreground mb-2">Farm Size (acres)</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      step="0.1"
                      value={formData.farmSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, farmSize: e.target.value }))}
                      placeholder="5.0"
                      className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                      data-testid="input-farm-size"
                    />
                  </motion.div>

                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-4">Primary Crops</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {crops.map((crop, index) => (
                        <motion.div 
                          key={crop.id} 
                          className="flex items-center space-x-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 transition-all duration-300"
                          whileHover={{ scale: 1.05, y: -2 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.2 }}
                        >
                          <Checkbox
                            id={crop.id}
                            checked={formData.primaryCrops.includes(crop.id)}
                            onCheckedChange={() => handleCropToggle(crop.id)}
                            data-testid={`checkbox-crop-${crop.id}`}
                          />
                          <Label htmlFor={crop.id} className="text-sm font-medium cursor-pointer">{crop.name}</Label>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="language" className="block text-sm font-medium text-foreground mb-2">Preferred Language</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300" data-testid="select-language">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिन्दी</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  type="submit"
                  className="w-full font-bold text-xl py-8 bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 shadow-2xl hover:shadow-primary/25 premium-glow group relative overflow-hidden" 
                  disabled={updateUserMutation.isPending || !otpVerified}
                  data-testid="button-complete-onboarding"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex items-center justify-center">
                    {updateUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        <span className="mr-2">Creating Your Smart Farm...</span>
                        <Sparkles className="h-5 w-5 animate-pulse" />
                      </>
                    ) : (
                      <>
                        <Zap className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                        <span className="mr-2">Start Your Smart Farming Journey</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </Button>
              </motion.div>
            </motion.form>
          </div>
        </div>
      </motion.div>
    </section>
  );
}