import express, { type Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from "multer";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { storage } from "./storage";
import { analyzeImage } from "./services/gemini";
import { getCurrentWeather } from "./services/weather";
import { getMandiPrices } from "./services/mandi";
import { saveImageLocally } from "./services/fileUpload";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Validation schemas
const sendOTPSchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
  }),
});

const verifyOTPSchema = z.object({
  body: z.object({
    phone: z.string(),
    otp: z.string().length(4, "OTP must be 4 digits"),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    age: z.string().optional(),
    location: z.string().optional(),
    farmSize: z.string().optional(),
    primaryCrops: z.array(z.string()).optional(),
    language: z.string().optional(),
  }),
});

const chatMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message cannot be empty"),
    context: z.string().optional(),
  }),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'farmconnect-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Authentication routes
  app.post("/api/auth/send-otp", validateRequest(sendOTPSchema), async (req, res) => {
    try {
      const { phone } = req.body;
      
      // TODO: In production, integrate with SMS service
      // For now, we'll accept any phone number and return success
      
      // Store the phone in session for verification
      req.session.phone = phone;
      req.session.otpSent = true;
      
      res.json({ 
        success: true, 
        message: "OTP sent successfully",
        // In demo mode, always show that OTP was sent
        phone: phone 
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", validateRequest(verifyOTPSchema), async (req, res) => {
    try {
      const { phone, otp } = req.body;
      
      // Check if OTP was sent for this phone
      if (req.session.phone !== phone || !req.session.otpSent) {
        return res.status(400).json({ message: "Invalid request. Please request OTP first." });
      }
      
      // For demo purposes, accept OTP "0000"
      if (otp !== "0000") {
        return res.status(400).json({ message: "Invalid OTP. Use 0000 for demo." });
      }
      
      // Check if user exists
      let user = await storage.getUserByPhone(phone);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          phone,
          isOnboarded: false,
          language: "en",
        });
      }
      
      // Set user session
      req.session.userId = user.id;
      req.session.authenticated = true;
      
      res.json({
        success: true,
        user,
        message: "Authentication successful",
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // User routes
  app.get("/api/user/profile", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/user/profile", validateRequest(updateProfileSchema), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const updateData = { ...req.body };
      
      // Convert age and farmSize to numbers if provided
      if (updateData.age) updateData.age = parseInt(updateData.age);
      if (updateData.farmSize) updateData.farmSize = parseFloat(updateData.farmSize);
      
      // Mark user as onboarded if they're updating their profile
      updateData.isOnboarded = true;
      
      const user = await storage.updateUser(req.session.userId, updateData);
      
      res.json({ user, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Disease detection route
  app.post("/api/detect", upload.single('image'), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      const cropType = req.body.cropType || "Unknown";
      let imagePath = "";
      
      // Upload image to local storage
      try {
        imagePath = await saveImageLocally(req.file, req.session.userId);
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        // Continue with local processing, use a placeholder path
        imagePath = `local/${Date.now()}_${req.file.originalname}`;
      }
      
      let detectionResult;
      const hasGeminiKey = !!process.env.GEMINI_API_KEY;
      
      if (hasGeminiKey) {
        try {
          // Use Gemini for real detection
          detectionResult = await analyzeImage(req.file.buffer);
        } catch (geminiError) {
          console.error("Gemini analysis failed:", geminiError);
          // Fallback to mock result
          detectionResult = getMockDetectionResult();
        }
      } else {
        // Use mock detection result
        detectionResult = getMockDetectionResult();
      }
      
      // Save detection report to database
      const report = await storage.createDiseaseReport({
        userId: req.session.userId,
        imagePath,
        cropType,
        diseaseName: detectionResult.diseaseName,
        severity: detectionResult.severity,
        confidence: detectionResult.confidence,
        symptoms: detectionResult.symptoms,
        treatment: detectionResult.treatment,
        isMockResult: !hasGeminiKey,
      });
      
      res.json({
        success: true,
        result: {
          ...detectionResult,
          isMockResult: !hasGeminiKey,
        },
        reportId: report.id,
      });
    } catch (error) {
      console.error("Detection error:", error);
      res.status(500).json({ message: "Disease detection failed" });
    }
  });

  // Weather routes
  app.get("/api/weather/current", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user?.location) {
        return res.status(400).json({ message: "User location not set" });
      }
      
      const weatherData = await getCurrentWeather(user.location);
      res.json(weatherData);
    } catch (error) {
      console.error("Weather error:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Weather route with location parameter (for geolocation coordinates)
  app.get("/api/weather/current/:location", async (req, res) => {
    try {
      const location = decodeURIComponent(req.params.location);
      
      if (!location) {
        return res.status(400).json({ message: "Location parameter is required" });
      }
      
      const weatherData = await getCurrentWeather(location);
      res.json(weatherData);
    } catch (error) {
      console.error("Weather error:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Mandi prices routes
  app.get("/api/mandi/prices", async (req, res) => {
    try {
      const market = req.query.market as string;
      const date = req.query.date as string;
      
      const prices = await getMandiPrices(market, date);
      res.json(prices);
    } catch (error) {
      console.error("Mandi prices error:", error);
      res.status(500).json({ message: "Failed to fetch mandi prices" });
    }
  });

  // Disease reports routes
  app.get("/api/disease-reports/recent", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const reports = await storage.getRecentDiseaseReports(req.session.userId, 10);
      res.json(reports);
    } catch (error) {
      console.error("Recent reports error:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/disease-reports", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const reportData = {
        ...req.body,
        userId: req.session.userId,
      };
      
      const report = await storage.createDiseaseReport(reportData);
      res.json({ report, message: "Report saved successfully" });
    } catch (error) {
      console.error("Save report error:", error);
      res.status(500).json({ message: "Failed to save report" });
    }
  });

  // Community routes
  app.get("/api/community/posts", async (req, res) => {
    try {
      const posts = await storage.getCommunityPosts();
      res.json(posts);
    } catch (error) {
      console.error("Community posts error:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post("/api/community/posts", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      const postData = {
        ...req.body,
        userId: req.session.userId,
        authorName: user?.name || "Anonymous",
        authorAvatar: user?.avatar || null,
      };
      
      const post = await storage.createCommunityPost(postData);
      res.json({ post, message: "Post created successfully" });
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post("/api/community/posts/:postId/like", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { postId } = req.params;
      await storage.likeCommunityPost(postId, req.session.userId);
      res.json({ message: "Post liked successfully" });
    } catch (error) {
      console.error("Like post error:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.get("/api/community/stats", async (req, res) => {
    try {
      const stats = await storage.getCommunityStats();
      res.json(stats);
    } catch (error) {
      console.error("Community stats error:", error);
      res.status(500).json({ message: "Failed to fetch community stats" });
    }
  });

  // Marketplace routes
  app.get("/api/marketplace/items", async (req, res) => {
    try {
      const category = req.query.category as string;
      const items = await storage.getMarketplaceItems(category);
      res.json(items);
    } catch (error) {
      console.error("Marketplace items error:", error);
      res.status(500).json({ message: "Failed to fetch marketplace items" });
    }
  });

  // AI Assistant routes
  app.post("/api/assistant/chat", validateRequest(chatMessageSchema), async (req, res) => {
    try {
      const { message, context } = req.body;
      
      // TODO: Integrate with Gemini for real AI responses
      // For now, provide helpful farming responses based on keywords
      const response = generateFarmingResponse(message);
      
      res.json({
        response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Assistant chat error:", error);
      res.status(500).json({ message: "Assistant is temporarily unavailable" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function for mock detection result
function getMockDetectionResult() {
  const mockResults = [
    {
      diseaseName: "Leaf Blight",
      severity: "High",
      confidence: 87,
      symptoms: "Brown spots with yellow halos on leaves, progressive leaf yellowing and wilting.",
      treatment: "Remove affected leaves immediately. Apply copper-based fungicide spray. Improve field drainage. Monitor surrounding crops."
    },
    {
      diseaseName: "Powdery Mildew",
      severity: "Medium",
      confidence: 92,
      symptoms: "White powdery coating on leaves and stems, stunted growth.",
      treatment: "Apply sulfur-based fungicide. Improve air circulation. Avoid overhead watering. Remove infected plant parts."
    },
    {
      diseaseName: "Bacterial Wilt",
      severity: "High",
      confidence: 78,
      symptoms: "Sudden wilting of plants, yellowing of leaves, dark streaks in stem.",
      treatment: "Remove and destroy affected plants. Avoid overwatering. Use disease-free seeds. Crop rotation recommended."
    }
  ];
  
  return mockResults[Math.floor(Math.random() * mockResults.length)];
}

// Helper function for farming assistant responses
function generateFarmingResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("weather")) {
    return "Weather plays a crucial role in farming. During monsoon, ensure proper drainage to prevent waterlogging. In dry seasons, implement efficient irrigation methods like drip irrigation. Always check weather forecasts before applying pesticides or fertilizers.";
  }
  
  if (lowerMessage.includes("fertilizer") || lowerMessage.includes("nutrient")) {
    return "For optimal crop nutrition, use a balanced NPK fertilizer during the growing season. Organic options like compost and vermicompost improve soil health. Soil testing helps determine specific nutrient needs. Apply fertilizers early morning or evening for better absorption.";
  }
  
  if (lowerMessage.includes("pest") || lowerMessage.includes("insect")) {
    return "Integrated Pest Management (IPM) is key for sustainable farming. Use neem-based pesticides, maintain beneficial insects, practice crop rotation, and monitor regularly. Yellow sticky traps help catch flying pests early.";
  }
  
  if (lowerMessage.includes("disease") || lowerMessage.includes("fungus")) {
    return "Early detection is crucial for disease management. Maintain proper plant spacing for air circulation, avoid overhead watering, and use disease-resistant varieties when possible. Copper and sulfur-based fungicides are effective organic options.";
  }
  
  if (lowerMessage.includes("water") || lowerMessage.includes("irrigation")) {
    return "Efficient water management is essential. Use drip irrigation to reduce water waste, mulch around plants to retain moisture, and water early morning or late evening to minimize evaporation. Monitor soil moisture regularly.";
  }
  
  if (lowerMessage.includes("seed") || lowerMessage.includes("planting")) {
    return "Choose certified, disease-resistant seeds suited to your climate. Proper seed treatment with fungicides prevents early diseases. Follow recommended spacing and depth for optimal germination and growth.";
  }
  
  return "I'm here to help with all your farming questions! You can ask me about crop care, weather advice, pest control, fertilizers, irrigation, or any other agricultural topics. What specific farming challenge are you facing?";
}
