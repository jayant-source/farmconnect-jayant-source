import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Leaf, Camera, CloudSun, BarChart3, Users, ArrowRight, Sparkles, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageToggle from "@/components/language-toggle";

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Camera,
      title: t("features.cropDetection"),
      description: t("features.cropDetectionDesc"),
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
    },
    {
      icon: CloudSun,
      title: t("features.weather"),
      description: t("features.weatherDesc"),
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: BarChart3,
      title: t("features.mandiPrices"),
      description: t("features.mandiPricesDesc"),
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
    {
      icon: Users,
      title: t("features.community"),
      description: t("features.communityDesc"),
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
    },
  ];

  // Create floating particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  }));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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
              y: [0, -30, 0],
              x: [0, 15, -15, 0],
              opacity: [0.3, 1, 0.3],
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

      {/* Minimal Navigation */}
      <nav className="absolute top-6 right-6 z-50">
        <motion.div
          className="glass-dark rounded-2xl p-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <LanguageToggle />
        </motion.div>
      </nav>

      {/* Centered Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-morphing"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-morphing"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
        />

        <div className="text-center z-10 max-w-4xl mx-auto px-6">
          {/* Company Logo & Name */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 premium-glow"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Leaf className="text-black text-4xl" />
            </motion.div>
            
            <motion.h1 
              className="text-7xl lg:text-8xl font-bold text-glow gradient-text-primary mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              FarmConnect
            </motion.h1>
            
            <motion.p
              className="text-xl text-muted-foreground mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              AI-Powered Smart Farming Revolution
            </motion.p>
          </motion.div>

          {/* Auth Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Link href="/auth">
              <motion.div
                className="premium-card rounded-2xl p-8 hover-glow magnetic-hover group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                data-testid="button-signup"
              >
                <Sparkles className="w-8 h-8 text-primary mb-4 mx-auto group-hover:animate-spin" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Sign Up</h3>
                <p className="text-muted-foreground">Start your farming journey</p>
              </motion.div>
            </Link>

            <Link href="/auth">
              <motion.div
                className="premium-card rounded-2xl p-8 hover-glow magnetic-hover group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                data-testid="button-login"
              >
                <Zap className="w-8 h-8 text-accent mb-4 mx-auto group-hover:animate-pulse" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Log In</h3>
                <p className="text-muted-foreground">Continue your progress</p>
              </motion.div>
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            {[
              { value: "50K+", label: "Active Farmers" },
              { value: "98%", label: "AI Accuracy" },
              { value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-3xl lg:text-4xl font-bold gradient-text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-20 h-20 bg-primary/30 rounded-full flex items-center justify-center"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Camera className="text-primary text-2xl" />
        </motion.div>

        <motion.div
          className="absolute top-32 right-20 w-16 h-16 bg-accent/30 rounded-full flex items-center justify-center"
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2, ease: "easeInOut" }}
        >
          <CloudSun className="text-accent text-xl" />
        </motion.div>

        <motion.div
          className="absolute bottom-32 left-32 w-18 h-18 bg-blue-500/30 rounded-full flex items-center justify-center"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1, ease: "easeInOut" }}
        >
          <BarChart3 className="text-blue-400 text-lg" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold gradient-text-primary mb-6">
              Premium Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of farming with our AI-powered tools designed for modern farmers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="premium-card rounded-3xl p-8 hover-glow group relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                data-testid={`feature-card-${index}`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50`} />
                
                <div className="relative z-10">
                  <motion.div
                    className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 15 }}
                  >
                    <feature.icon className={`${feature.iconColor} text-2xl`} />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4" data-testid={`feature-title-${index}`}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-lg leading-relaxed" data-testid={`feature-description-${index}`}>
                    {feature.description}
                  </p>

                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="w-6 h-6 text-primary/30" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
