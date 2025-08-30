import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Leaf, Camera, CloudSun, BarChart3, Users, UserCheck, Tractor } from "lucide-react";
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

  return (
    <section className="relative min-h-screen overflow-hidden gradient-bg">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full blob" style={{ animationDelay: "-2s" }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full blob" style={{ animationDelay: "-4s" }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8" data-testid="main-navigation">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Leaf className="text-primary text-xl" />
          </div>
          <span className="text-white font-bold text-xl">FarmConnect</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 border border-white/30">
            <LanguageToggle />
          </div>
          <Link href="/auth">
            <Button variant="secondary" data-testid="button-login">
              {t("login")}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="text-white"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-shadow" data-testid="hero-title">
              {t("hero.title")}
              <br />
              <span className="gradient-text animate-sparkle">Made Simple</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90" data-testid="hero-subtitle">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 animate-glow border-2 border-primary/20" data-testid="button-get-started">
                  <Camera className="mr-2" />
                  {t("hero.getStarted")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            
            <motion.div 
              className="absolute -top-4 -right-4 w-24 h-24 bg-accent rounded-full flex items-center justify-center shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <BarChart3 className="text-white text-2xl" />
            </motion.div>
            <motion.div 
              className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: 2 }}
            >
              <CloudSun className="text-white text-xl" />
            </motion.div>
            
            {/* Animated Farmers */}
            <motion.div 
              className="absolute top-1/4 -left-12 w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg z-20"
              animate={{ 
                x: [0, 30, 0],
                rotate: [0, 10, -10, 0] 
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <UserCheck className="text-white text-lg" />
            </motion.div>
            
            <motion.div 
              className="absolute top-3/4 -right-12 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg z-20"
              animate={{ 
                x: [0, -25, 0],
                y: [0, -15, 0],
                rotate: [0, -15, 15, 0] 
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                delay: 1,
                ease: "easeInOut" 
              }}
            >
              <Tractor className="text-white text-sm" />
            </motion.div>
            
            <motion.div 
              className="absolute top-1/2 right-1/4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg z-20"
              animate={{ 
                scale: [1, 1.2, 1],
                y: [0, -20, 0] 
              }}
              transition={{ 
                duration: 7, 
                repeat: Infinity,
                delay: 3,
                ease: "easeInOut" 
              }}
            >
              <Users className="text-white text-xs" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass-morphism p-6 rounded-2xl text-white text-center hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              data-testid={`feature-card-${index}`}
            >
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-2xl" />
              </div>
              <h3 className="font-semibold mb-2" data-testid={`feature-title-${index}`}>{feature.title}</h3>
              <p className="text-sm text-white/80" data-testid={`feature-description-${index}`}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
