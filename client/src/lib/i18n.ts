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
        greetings: {
          morning: "Hello",
          afternoon: "Hello",
          evening: "Hello",
        },
        farmer: "Farmer",
        farmLocation: "Farm Location",
        todaysWeather: "Today's Weather",
        reports: "Reports",
        farmers: "Farmers",
        posts: "Posts",
        actions: {
          cropDetection: "Crop Detection",
          cropDetectionDesc: "Scan your crops for diseases",
          marketPrices: "Market Prices",
          marketPricesDesc: "Check live commodity prices",
          weatherTitle: "Weather",
          weatherDesc: "Get weather forecasts",
          communityTitle: "Community",
          communityDesc: "Connect with other farmers",
        },
        recentReportsTitle: "Recent Reports",
        viewAll: "View All",
        noReports: {
          title: "Start Crop Detection",
          description: "No disease reports yet. Scan your crops to get started!",
          scanButton: "Scan Crops",
        },
        marketplace: {
          title: "Farmer Marketplace",
          description: "List your produce, get bids, and arrange logistics",
          visit: "Visit",
        },
        severity: {
          high: "High",
          medium: "Medium",
          low: "Low",
        },
      },
      // Weather
      weather: {
        current: "Current Weather",
      },
      // Navigation
      nav: {
        home: "Home",
        detect: "Detect",
        mandi: "Mandi",
        marketplace: "Marketplace",
        solar: "Solar Income",
        profile: "Profile",
        ai: "AI Assistant",
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
      // Solar Income Calculator
      solar: {
        title: "Solar Income Calculator",
        calculateTitle: "Calculate Solar Income Potential",
        subtitle: "Enter your farm details to estimate additional income from solar panels",
        fieldInfo: "Farm & Income Information",
        fieldSize: "Field Size",
        unit: "Unit",
        acre: "Acre",
        hectare: "Hectare",
        currentIncome: "Current Annual Farm Income",
        solarInfo: "Solar Panel System Details",
        solarCapacity: "Solar Panel Capacity",
        sunlightHours: "Daily Sunlight Hours",
        electricityRate: "Electricity Rate",
        costInfo: "Cost & Investment Details",
        installationCost: "Installation Cost",
        subsidy: "Government Subsidy",
        maintenance: "Annual Maintenance Cost",
        calculate: "Calculate Solar Income",
        results: "Income Calculation Results",
        additionalIncome: "Additional Annual Income",
        totalIncome: "Total Annual Income",
        paybackPeriod: "Payback Period",
        energyProduction: "Annual Energy Production",
        incomeBreakdown: "Income Breakdown",
        currentFarming: "Current Farming Income",
        solarRevenue: "Solar Panel Revenue",
        maintenanceCosts: "Maintenance Costs",
        netAdditional: "Net Additional Income",
        investmentSummary: "Investment Summary",
        totalCost: "Total Installation Cost",
        subsidyAmount: "Subsidy Amount",
        netInvestment: "Net Investment",
        fieldSizeAcres: "Field Size",
        dailyProduction: "Daily Energy Production",
        benefits: "Benefits of Solar Farming",
        benefit1: "Generate additional income from unused land",
        benefit2: "Reduce electricity costs for farm operations",
        benefit3: "Contribute to clean and renewable energy",
        benefit4: "Government subsidies make it affordable",
        benefit5: "Long-term investment with 20-25 year returns",
        importantNotes: "Important Considerations",
        note1: "Solar panel installation requires proper permits and approvals",
        note2: "Actual energy production depends on weather and seasonal variations",
        note3: "Regular maintenance is essential for optimal performance",
        note4: "Government policies and subsidies may change over time",
        note5: "Consult with solar experts before making final decisions",
        errors: {
          missingFields: "Missing Required Information",
          fillRequired: "Please fill in all required fields to calculate solar income",
          calculation: "Calculation Complete",
          success: "Your solar income potential has been calculated successfully"
        },
        placeholders: {
          fieldSize: "Enter field size",
          currentIncome: "Enter annual income in ₹",
          solarCapacity: "Enter capacity in kW",
          sunlightHours: "e.g., 5.5 hours",
          electricityRate: "Rate per kWh in ₹",
          installationCost: "Total cost in ₹",
          subsidy: "Subsidy amount in ₹",
          maintenance: "Annual cost in ₹"
        },
        help: {
          solarCapacity: "Typical range: 1-10 kW for small farms",
          sunlightHours: "Average sunlight hours per day in your area",
          electricityRate: "Current electricity rate you pay or sell at",
          installationCost: "Include panels, inverters, installation charges",
          subsidy: "Check government solar subsidy schemes",
          maintenance: "Usually 2-5% of installation cost per year"
        },
        units: {
          increase: "increase",
          combined: "farming + solar",
          years: "years",
          roi: "return on investment",
          acres: "acres",
          kwh: "kWh/year",
          capacity: "kWh per year"
        }
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
        greetings: {
          morning: "सुप्रभात",
          afternoon: "नमस्ते",
          evening: "शुभ संध्या",
        },
        farmer: "किसान",
        farmLocation: "खेत का स्थान",
        todaysWeather: "आज का मौसम",
        reports: "रिपोर्ट",
        farmers: "किसान",
        posts: "पोस्ट",
        actions: {
          cropDetection: "फसल रोग पहचान",
          cropDetectionDesc: "अपनी फसलों में रोगों का पता लगाएं",
          marketPrices: "बाजार मूल्य",
          marketPricesDesc: "लाइव कमोडिटी कीमतें देखें",
          weatherTitle: "मौसम",
          weatherDesc: "मौसम पूर्वानुमान प्राप्त करें",
          communityTitle: "समुदाय",
          communityDesc: "अन्य किसानों से जुड़ें",
        },
        recentReportsTitle: "हाल की रिपोर्ट",
        viewAll: "सभी देखें",
        noReports: {
          title: "फसल जांच शुरू करें",
          description: "अभी तक कोई रोग रिपोर्ट नहीं। शुरू करने के लिए अपनी फसलों को स्कैन करें!",
          scanButton: "फसल स्कैन करें",
        },
        marketplace: {
          title: "किसान मार्केटप्लेस",
          description: "अपनी उपज सूचीबद्ध करें, बोलियां प्राप्त करें, और रसद की व्यवस्था करें",
          visit: "देखें",
        },
        severity: {
          high: "उच्च",
          medium: "मध्यम",
          low: "निम्न",
        },
      },
      // Weather
      weather: {
        current: "वर्तमान मौसम",
      },
      // Navigation
      nav: {
        home: "होम",
        detect: "पहचान",
        mandi: "मंडी",
        marketplace: "बाजार",
        solar: "सोलर आय",
        profile: "प्रोफाइल",
        ai: "AI सहायक",
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
      // Solar Income Calculator
      solar: {
        title: "सोलर आय कैलकुलेटर",
        calculateTitle: "सोलर आय की संभावना की गणना करें",
        subtitle: "सोलर पैनलों से अतिरिक्त आय का अनुमान लगाने के लिए अपने खेत का विवरण दर्ज करें",
        fieldInfo: "खेत और आय की जानकारी",
        fieldSize: "खेत का आकार",
        unit: "इकाई",
        acre: "एकड़",
        hectare: "हेक्टेयर",
        currentIncome: "वर्तमान वार्षिक खेती आय",
        solarInfo: "सोलर पैनल सिस्टम विवरण",
        solarCapacity: "सोलर पैनल क्षमता",
        sunlightHours: "दैनिक सूर्यप्रकाश घंटे",
        electricityRate: "बिजली दर",
        costInfo: "लागत और निवेश विवरण",
        installationCost: "स्थापना लागत",
        subsidy: "सरकारी सब्सिडी",
        maintenance: "वार्षिक रखरखाव लागत",
        calculate: "सोलर आय की गणना करें",
        results: "आय गणना परिणाम",
        additionalIncome: "अतिरिक्त वार्षिक आय",
        totalIncome: "कुल वार्षिक आय",
        paybackPeriod: "वापसी अवधि",
        energyProduction: "वार्षिक ऊर्जा उत्पादन",
        incomeBreakdown: "आय का विवरण",
        currentFarming: "वर्तमान खेती आय",
        solarRevenue: "सोलर पैनल राजस्व",
        maintenanceCosts: "रखरखाव लागत",
        netAdditional: "शुद्ध अतिरिक्त आय",
        investmentSummary: "निवेश सारांश",
        totalCost: "कुल स्थापना लागत",
        subsidyAmount: "सब्सिडी राशि",
        netInvestment: "शुद्ध निवेश",
        fieldSizeAcres: "खेत का आकार",
        dailyProduction: "दैनिक ऊर्जा उत्पादन",
        benefits: "सोलर खेती के फायदे",
        benefit1: "अप्रयुक्त भूमि से अतिरिक्त आय उत्पन्न करें",
        benefit2: "खेती संचालन के लिए बिजली लागत कम करें",
        benefit3: "स्वच्छ और नवीकरणीय ऊर्जा में योगदान दें",
        benefit4: "सरकारी सब्सिडी इसे किफायती बनाती है",
        benefit5: "20-25 साल रिटर्न के साथ दीर्घकालिक निवेश",
        importantNotes: "महत्वपूर्ण विचारणीय बातें",
        note1: "सोलर पैनल स्थापना के लिए उचित अनुमति और अनुमोदन आवश्यक है",
        note2: "वास्तविक ऊर्जा उत्पादन मौसम और मौसमी बदलाव पर निर्भर करता है",
        note3: "इष्टतम प्रदर्शन के लिए नियमित रखरखाव आवश्यक है",
        note4: "सरकारी नीतियां और सब्सिडी समय के साथ बदल सकती हैं",
        note5: "अंतिम निर्णय लेने से पहले सोलर विशेषज्ञों से सलाह लें",
        errors: {
          missingFields: "आवश्यक जानकारी अनुपस्थित",
          fillRequired: "सोलर आय की गणना के लिए कृपया सभी आवश्यक फील्ड भरें",
          calculation: "गणना पूर्ण",
          success: "आपकी सोलर आय की संभावना सफलतापूर्वक गणना की गई है"
        },
        placeholders: {
          fieldSize: "खेत का आकार दर्ज करें",
          currentIncome: "₹ में वार्षिक आय दर्ज करें",
          solarCapacity: "kW में क्षमता दर्ज करें",
          sunlightHours: "जैसे, 5.5 घंटे",
          electricityRate: "₹ में प्रति kWh दर",
          installationCost: "₹ में कुल लागत",
          subsidy: "₹ में सब्सिडी राशि",
          maintenance: "₹ में वार्षिक लागत"
        },
        help: {
          solarCapacity: "सामान्य रेंज: छोटे खेतों के लिए 1-10 kW",
          sunlightHours: "आपके क्षेत्र में प्रति दिन औसत सूर्यप्रकाश घंटे",
          electricityRate: "वर्तमान बिजली दर जो आप भुगतान करते हैं या बेचते हैं",
          installationCost: "पैनल, इन्वर्टर, स्थापना शुल्क शामिल करें",
          subsidy: "सरकारी सोलर सब्सिडी योजनाओं की जांच करें",
          maintenance: "आमतौर पर प्रति वर्ष स्थापना लागत का 2-5%"
        },
        units: {
          increase: "वृद्धि",
          combined: "खेती + सोलर",
          years: "साल",
          roi: "निवेश पर रिटर्न",
          acres: "एकड़",
          kwh: "kWh/वर्ष",
          capacity: "kWh प्रति वर्ष"
        }
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
