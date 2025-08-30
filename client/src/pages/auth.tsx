import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

type AuthStep = "phone" | "otp";

export default function Auth() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, setPhone } = useAuth();
  
  const [authStep, setAuthStep] = useState<AuthStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const sendOTPMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest("POST", "/api/auth/send-otp", { phone });
      return response.json();
    },
    onSuccess: () => {
      setPhone(phoneNumber);
      setAuthStep("otp");
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
      if (data.user.isOnboarded) {
        setLocation("/dashboard");
      } else {
        setLocation("/onboarding");
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

  return (
    <section className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-2xl border border-border" data-testid="auth-card">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-white text-3xl" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="auth-title">
                {t("auth.title")}
              </h2>
              <p className="text-muted-foreground" data-testid="auth-subtitle">
                {authStep === "phone" ? t("auth.subtitle") : t("auth.otpSent") + " " + phoneNumber}
              </p>
            </div>

            {authStep === "phone" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
                data-testid="phone-step"
              >
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
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSendOTP}
                  disabled={sendOTPMutation.isPending}
                  data-testid="button-send-otp"
                >
                  {sendOTPMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    t("auth.sendOTP")
                  )}
                </Button>
              </motion.div>
            )}

            {authStep === "otp" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
                data-testid="otp-step"
              >
                <div className="text-center">
                  <div className="text-xs text-accent bg-accent/10 p-2 rounded-lg mb-4">
                    Demo: Use OTP 0000
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    {t("auth.otpLabel")}
                  </Label>
                  <div className="flex justify-center">
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
                </div>

                <Button 
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
                    t("auth.verify")
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setAuthStep("phone")}
                  data-testid="button-back-to-phone"
                >
                  {t("auth.resendOTP")}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
