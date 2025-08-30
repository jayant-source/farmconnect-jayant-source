import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Globe, 
  MapPin, 
  Camera, 
  Edit, 
  Save,
  LogOut,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, updateUser, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    farmSize: user?.farmSize || "",
    location: user?.location || "",
    primaryCrops: user?.primaryCrops || [],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: (data) => {
      updateUser(data.user);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-center flex-1" data-testid="profile-title">
          {t("profile.title", "Profile")}
        </h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          data-testid="button-edit"
        >
          {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto space-y-6"
      >
        {/* Profile Avatar & Basic Info */}
        <Card className="glass-enhanced shadow-lg border border-white/20" data-testid="profile-card">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 mx-auto mb-4" data-testid="profile-avatar">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl">
                    {user.name?.charAt(0).toUpperCase() || user.phone?.charAt(-2) || "F"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2"
                    data-testid="button-change-avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                      data-testid="input-name"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="profile-name">
                    {user.name || "Farmer"}
                  </h2>
                  <Badge variant="secondary" className="mb-2" data-testid="user-type">
                    <User className="w-3 h-3 mr-1" />
                    Farmer
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="glass-enhanced shadow-lg border border-white/20" data-testid="contact-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span data-testid="profile-phone">{user.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span data-testid="profile-language">
                {user.language === 'hi' ? 'हिंदी' : 'English'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Farm Information */}
        <Card className="glass-enhanced shadow-lg border border-white/20" data-testid="farm-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Farm Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium">Farm Location</Label>
                  <Input
                    id="location"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter farm location"
                    data-testid="input-farm-location"
                  />
                </div>
                <div>
                  <Label htmlFor="farmSize" className="text-sm font-medium">Farm Size</Label>
                  <Input
                    id="farmSize"
                    value={editForm.farmSize}
                    onChange={(e) => setEditForm(prev => ({ ...prev, farmSize: e.target.value }))}
                    placeholder="e.g., 2 acres"
                    data-testid="input-farm-size"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="farm-location">
                    {user.location || "Not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="farm-size">
                    {user.farmSize || "Not specified"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Primary Crops:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.primaryCrops && user.primaryCrops.length > 0 ? (
                      user.primaryCrops.map((crop, index) => (
                        <Badge key={index} variant="outline" data-testid={`crop-${index}`}>
                          {crop}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isEditing && (
            <Button 
              className="w-full font-bold text-lg py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
          
          <Separator />
          
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </motion.div>
    </div>
  );
}