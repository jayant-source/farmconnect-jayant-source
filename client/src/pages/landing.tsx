import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Leaf, Camera, CloudSun, BarChart3, Users, ArrowRight, CheckCircle, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageToggle from "@/components/language-toggle";

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Camera,
      title: t("features.cropDetection"),
      description: t("features.cropDetectionDesc"),
    },
    {
      icon: CloudSun,
      title: t("features.weather"),
      description: t("features.weatherDesc"),
    },
    {
      icon: BarChart3,
      title: t("features.mandiPrices"),
      description: t("features.mandiPricesDesc"),
    },
    {
      icon: Users,
      title: t("features.community"),
      description: t("features.communityDesc"),
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Farmers" },
    { value: "98%", label: "Accuracy Rate" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border" data-testid="main-navigation">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Leaf className="text-white text-xl" />
              </div>
              <span className="text-foreground font-bold text-xl">FarmConnect</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <LanguageToggle />
              <Link href="/auth">
                <Button variant="outline" size="sm" data-testid="button-login">
                  {t("login")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                AI-Powered Smart Farming
              </motion.div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight" data-testid="hero-title">
                {t("hero.title")}
                <br />
                <span className="text-primary">Made Simple</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="hero-subtitle">
                {t("hero.subtitle")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/auth">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button size="lg" className="group shadow-lg" data-testid="button-get-started">
                      <Camera className="mr-2 w-5 h-5" />
                      {t("hero.getStarted")}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 backdrop-blur-sm">
                {/* Main Dashboard Preview */}
                <div className="bg-card rounded-2xl p-6 shadow-xl border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Camera className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-muted/50 rounded w-1/2"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                        <div className="h-2 bg-muted/50 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <BarChart3 className="text-white text-xl" />
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-4 -left-4 w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-xl"
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity,
                    delay: 2,
                    ease: "easeInOut"
                  }}
                >
                  <CloudSun className="text-white text-lg" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive farming tools powered by AI to help you grow better crops
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group bg-card rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-primary text-xl" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-center" data-testid={`feature-title-${index}`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground text-center" data-testid={`feature-description-${index}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of farmers already using FarmConnect to improve their yields
            </p>
            <Link href="/auth">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="group">
                  Get Started Today
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
