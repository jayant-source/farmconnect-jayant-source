import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Navigation
      login: "Login",
      // Hero Section
      hero: {
        title: "Smart Farming",
        subtitle: "Detect crop diseases, check weather, get market prices, and connect with fellow farmers - all in one place.",
        getStarted: "Get Started",
        watchDemo: "Watch Demo",
      },
      // Features
      features: {
        cropDetection: "Crop Detection",
        cropDetectionDesc: "AI-powered disease identification",
        weather: "Weather",
        weatherDesc: "Real-time weather updates",
        mandiPrices: "Mandi Prices",
        mandiPricesDesc: "Live market rates",
        community: "Community",
        communityDesc: "Connect with farmers",
      },
      // Authentication
      auth: {
        title: "Welcome to FarmConnect",
        subtitle: "Enter your phone number to get started",
        phoneLabel: "Phone Number",
        sendOTP: "Send OTP",
        otpSent: "We've sent an OTP to",
        otpLabel: "Enter OTP",
        verify: "Verify & Continue",
        resendOTP: "Resend OTP",
      },
      // Onboarding
      onboarding: {
        title: "Complete Your Profile",
        subtitle: "Help us personalize your farming experience",
        name: "Full Name",
        age: "Age",
        location: "Farm Location",
        farmSize: "Farm Size (acres)",
        crops: "Primary Crops",
        language: "Preferred Language",
        complete: "Complete Setup",
      },
      // Dashboard
      dashboard: {
        welcome: "Welcome",
        quickActions: "Quick Actions",
        detectDisease: "Detect Disease",
        weather: "Weather",
        mandiPrices: "Mandi Prices",
        community: "Community",
        recentReports: "Recent Disease Reports",
      },
      // Weather
      weather: {
        current: "Current Weather",
      },
      // Navigation
      nav: {
        home: "Home",
        detect: "Detect",
        market: "Market",
        community: "Community",
        profile: "Profile",
      },
      // Crop Detection
      cropDetect: {
        title: "Crop Disease Detection",
        cameraPlaceholder: "Camera feed will appear here",
        instructions: "Position the diseased leaf within the frame and capture",
        recentCaptures: "Recent Captures",
      },
      // Detection Results
      detection: {
        analyzing: "Analyzing Image...",
        symptoms: "Symptoms",
        treatment: "Recommended Treatment",
        confidence: "Confidence",
        saveReport: "Save Report",
        share: "Share",
      },
      // Mandi Prices
      mandi: {
        title: "Mandi Prices",
        selectLocation: "Select Market",
        selectDate: "Date",
        priceAlerts: "Price Alerts",
        alertDescription: "Set price alerts for your crops and get notified when prices reach your target.",
        setupAlerts: "Setup Alerts",
      },
      // Community
      community: {
        title: "Community",
        totalFarmers: "Farmers",
        activePosts: "Posts Today",
        helpRate: "Help Rate",
        share: "Share",
      },
      // Marketplace
      marketplace: {
        title: "Marketplace",
        all: "All",
        seeds: "Seeds",
        fertilizers: "Fertilizers",
        tools: "Tools",
        produce: "Produce",
        contact: "Contact",
      },
      // Assistant
      assistant: {
        title: "AI Farm Assistant",
        name: "FarmBot Assistant",
        status: "Online - Ready to help",
        quickHelp: "Quick Help",
        weatherAdvice: "Weather Advice",
        cropCare: "Crop Care",
        fertilizer: "Fertilizer Tips",
        pestControl: "Pest Control",
      },
    },
  },
  hi: {
    translation: {
      // Navigation
      login: "लॉगिन",
      // Hero Section
      hero: {
        title: "स्मार्ट फार्मिंग",
        subtitle: "फसल की बीमारियों का पता लगाएं, मौसम की जांच करें, बाजार की कीमतें पाएं, और साथी किसानों से जुड़ें - सब एक जगह।",
        getStarted: "शुरू करें",
        watchDemo: "डेमो देखें",
      },
      // Features
      features: {
        cropDetection: "फसल रोग पहचान",
        cropDetectionDesc: "AI द्वारा रोग की पहचान",
        weather: "मौसम",
        weatherDesc: "वास्तविक समय मौसम अपडेट",
        mandiPrices: "मंडी की कीमतें",
        mandiPricesDesc: "लाइव बाजार दरें",
        community: "समुदाय",
        communityDesc: "किसानों से जुड़ें",
      },
      // Authentication
      auth: {
        title: "FarmConnect में आपका स्वागत है",
        subtitle: "शुरू करने के लिए अपना फोन नंबर दर्ज करें",
        phoneLabel: "फोन नंबर",
        sendOTP: "OTP भेजें",
        otpSent: "हमने OTP भेजा है",
        otpLabel: "OTP दर्ज करें",
        verify: "सत्यापित करें और जारी रखें",
        resendOTP: "OTP फिर से भेजें",
      },
      // Onboarding
      onboarding: {
        title: "अपनी प्रोफाइल पूरी करें",
        subtitle: "अपने खेती के अनुभव को व्यक्तिगत बनाने में हमारी मदद करें",
        name: "पूरा नाम",
        age: "उम्र",
        location: "खेत का स्थान",
        farmSize: "खेत का आकार (एकड़)",
        crops: "मुख्य फसलें",
        language: "पसंदीदा भाषा",
        complete: "सेटअप पूरा करें",
      },
      // Dashboard
      dashboard: {
        welcome: "स्वागत है",
        quickActions: "त्वरित कार्य",
        detectDisease: "रोग की पहचान",
        weather: "मौसम",
        mandiPrices: "मंडी की कीमतें",
        community: "समुदाय",
        recentReports: "हाल की रोग रिपोर्ट",
      },
      // Weather
      weather: {
        current: "वर्तमान मौसम",
      },
      // Navigation
      nav: {
        home: "होम",
        detect: "पहचान",
        market: "बाजार",
        community: "समुदाय",
        profile: "प्रोफाइल",
      },
      // Crop Detection
      cropDetect: {
        title: "फसल रोग पहचान",
        cameraPlaceholder: "कैमरा फीड यहाँ दिखाई देगा",
        instructions: "रोगग्रस्त पत्ती को फ्रेम के भीतर रखें और कैप्चर करें",
        recentCaptures: "हाल की तस्वीरें",
      },
      // Detection Results
      detection: {
        analyzing: "तस्वीर का विश्लेषण कर रहे हैं...",
        symptoms: "लक्षण",
        treatment: "सुझावित उपचार",
        confidence: "विश्वास",
        saveReport: "रिपोर्ट सेव करें",
        share: "साझा करें",
      },
      // Mandi Prices
      mandi: {
        title: "मंडी की कीमतें",
        selectLocation: "बाजार चुनें",
        selectDate: "दिनांक",
        priceAlerts: "कीमत अलर्ट",
        alertDescription: "अपनी फसलों के लिए कीमत अलर्ट सेट करें और जब कीमतें आपके लक्ष्य तक पहुंचें तो सूचना पाएं।",
        setupAlerts: "अलर्ट सेट करें",
      },
      // Community
      community: {
        title: "समुदाय",
        totalFarmers: "किसान",
        activePosts: "आज के पोस्ट",
        helpRate: "सहायता दर",
        share: "साझा करें",
      },
      // Marketplace
      marketplace: {
        title: "बाजार",
        all: "सभी",
        seeds: "बीज",
        fertilizers: "उर्वरक",
        tools: "उपकरण",
        produce: "उत्पाद",
        contact: "संपर्क करें",
      },
      // Assistant
      assistant: {
        title: "AI कृषि सहायक",
        name: "FarmBot सहायक",
        status: "ऑनलाइन - सहायता के लिए तैयार",
        quickHelp: "त्वरित सहायता",
        weatherAdvice: "मौसम सलाह",
        cropCare: "फसल देखभाल",
        fertilizer: "उर्वरक सुझाव",
        pestControl: "कीट नियंत्रण",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
