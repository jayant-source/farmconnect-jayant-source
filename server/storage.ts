import { randomUUID } from "crypto";
import { eq, desc, count, and, like } from "drizzle-orm";
import { db } from "./db";
import { 
  users,
  diseaseReports,
  communityPosts,
  marketplaceItems,
  mandiPrices,
  type User, 
  type InsertUser, 
  type DiseaseReport, 
  type InsertDiseaseReport, 
  type CommunityPost, 
  type MarketplaceItem, 
  type MandiPrice 
} from "@shared/schema";

// Enhanced interface with FarmConnect specific methods
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Disease report methods
  createDiseaseReport(report: InsertDiseaseReport): Promise<DiseaseReport>;
  getRecentDiseaseReports(userId: string, limit: number): Promise<DiseaseReport[]>;
  getDiseaseReport(id: string): Promise<DiseaseReport | undefined>;
  
  // Community methods
  getCommunityPosts(limit?: number): Promise<CommunityPost[]>;
  getCommunityStats(): Promise<{
    totalFarmers: string;
    activePosts: string;
    helpRate: string;
  }>;
  
  // Marketplace methods
  getMarketplaceItems(category?: string): Promise<MarketplaceItem[]>;
  
  // Mandi prices methods
  getMandiPrices(market?: string, date?: string): Promise<MandiPrice[]>;
  saveMandiPrices(prices: MandiPrice[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private diseaseReports: Map<string, DiseaseReport>;
  private communityPosts: Map<string, CommunityPost>;
  private marketplaceItems: Map<string, MarketplaceItem>;
  private mandiPrices: Map<string, MandiPrice>;

  constructor() {
    this.users = new Map();
    this.diseaseReports = new Map();
    this.communityPosts = new Map();
    this.marketplaceItems = new Map();
    this.mandiPrices = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample community posts
    const samplePost1: CommunityPost = {
      id: randomUUID(),
      userId: "sample-user-1",
      title: "Rice Disease Help Needed",
      content: "My rice crop is showing yellow spots on leaves. Has anyone faced similar issue? Looking for advice on treatment.",
      images: [],
      likes: 24,
      comments: 12,
      tags: ["rice", "disease", "help"],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    };

    const samplePost2: CommunityPost = {
      id: randomUUID(),
      userId: "sample-user-2",
      title: "Cotton Harvest Success",
      content: "Great cotton harvest this season! Used organic fertilizers and the yield increased by 30%. Happy to share my experience with fellow farmers.",
      images: [],
      likes: 18,
      comments: 8,
      tags: ["cotton", "organic", "success"],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    };

    this.communityPosts.set(samplePost1.id, samplePost1);
    this.communityPosts.set(samplePost2.id, samplePost2);

    // Sample marketplace items
    const sampleItem1: MarketplaceItem = {
      id: randomUUID(),
      sellerId: "sample-user-1",
      title: "Premium Rice Seeds",
      description: "High-yield Basmati rice seeds, disease-resistant variety. Perfect for Maharashtra climate.",
      category: "seeds",
      price: "800",
      priceUnit: "per kg",
      quantity: "50",
      quantityUnit: "kg",
      images: [],
      location: "Sangli, MH",
      contactInfo: "+91-9876543210",
      isActive: true,
      createdAt: new Date(),
    };

    const sampleItem2: MarketplaceItem = {
      id: randomUUID(),
      sellerId: "sample-user-2",
      title: "Organic Fertilizer",
      description: "100% organic cow dung fertilizer, perfect for all crops. Improves soil health naturally.",
      category: "fertilizers",
      price: "15",
      priceUnit: "per kg",
      quantity: "500",
      quantityUnit: "kg",
      images: [],
      location: "Kolhapur, MH",
      contactInfo: "+91-9876543211",
      isActive: true,
      createdAt: new Date(),
    };

    this.marketplaceItems.set(sampleItem1.id, sampleItem1);
    this.marketplaceItems.set(sampleItem2.id, sampleItem2);

    // Sample mandi prices
    const samplePrice1: MandiPrice = {
      id: randomUUID(),
      market: "Sangli Market",
      state: "Maharashtra",
      commodity: "Rice",
      variety: "Basmati",
      grade: "Grade A",
      minPrice: "3000",
      maxPrice: "3400",
      modalPrice: "3200",
      priceUnit: "per quintal",
      reportDate: new Date(),
      createdAt: new Date(),
    };

    const samplePrice2: MandiPrice = {
      id: randomUUID(),
      market: "Sangli Market",
      state: "Maharashtra",
      commodity: "Wheat",
      variety: "Lokvan",
      grade: "Grade A",
      minPrice: "2700",
      maxPrice: "3000",
      modalPrice: "2850",
      priceUnit: "per quintal",
      reportDate: new Date(),
      createdAt: new Date(),
    };

    this.mandiPrices.set(samplePrice1.id, samplePrice1);
    this.mandiPrices.set(samplePrice2.id, samplePrice2);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      name: null,
      age: null,
      location: null,
      farmSize: null,
      primaryCrops: null,
      isOnboarded: false,
      createdAt: new Date(),
      ...insertUser,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Disease report methods
  async createDiseaseReport(report: InsertDiseaseReport): Promise<DiseaseReport> {
    const id = randomUUID();
    const diseaseReport: DiseaseReport = {
      id,
      createdAt: new Date(),
      ...report,
    };
    this.diseaseReports.set(id, diseaseReport);
    return diseaseReport;
  }

  async getRecentDiseaseReports(userId: string, limit: number): Promise<DiseaseReport[]> {
    const userReports = Array.from(this.diseaseReports.values())
      .filter(report => report.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return userReports;
  }

  async getDiseaseReport(id: string): Promise<DiseaseReport | undefined> {
    return this.diseaseReports.get(id);
  }

  // Community methods
  async getCommunityPosts(limit: number = 20): Promise<CommunityPost[]> {
    const posts = Array.from(this.communityPosts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    // Add mock user data for display
    return posts.map(post => ({
      ...post,
      user: {
        name: post.userId.includes("1") ? "Rajesh Kumar" : "Suresh Patil",
        location: post.userId.includes("1") ? "Pune" : "Sangli",
      }
    })) as any;
  }

  async getCommunityStats(): Promise<{
    totalFarmers: string;
    activePosts: string;
    helpRate: string;
  }> {
    return {
      totalFarmers: "2.5K",
      activePosts: "450",
      helpRate: "95%",
    };
  }

  // Marketplace methods
  async getMarketplaceItems(category?: string): Promise<MarketplaceItem[]> {
    let items = Array.from(this.marketplaceItems.values())
      .filter(item => item.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (category && category !== "all") {
      items = items.filter(item => item.category === category);
    }
    
    return items;
  }

  // Mandi prices methods
  async getMandiPrices(market?: string, date?: string): Promise<MandiPrice[]> {
    let prices = Array.from(this.mandiPrices.values())
      .sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime());
    
    if (market) {
      prices = prices.filter(price => 
        price.market.toLowerCase().includes(market.toLowerCase())
      );
    }
    
    if (date) {
      const filterDate = new Date(date);
      prices = prices.filter(price => 
        price.reportDate.toDateString() === filterDate.toDateString()
      );
    }
    
    return prices;
  }

  async saveMandiPrices(prices: MandiPrice[]): Promise<void> {
    prices.forEach(price => {
      this.mandiPrices.set(price.id, price);
    });
  }
}

class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by phone:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
      if (!result[0]) {
        throw new Error("User not found");
      }
      return result[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Disease report methods
  async createDiseaseReport(report: InsertDiseaseReport): Promise<DiseaseReport> {
    try {
      const result = await db.insert(diseaseReports).values(report).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating disease report:", error);
      throw error;
    }
  }

  async getRecentDiseaseReports(userId: string, limit: number): Promise<DiseaseReport[]> {
    try {
      const result = await db
        .select()
        .from(diseaseReports)
        .where(eq(diseaseReports.userId, userId))
        .orderBy(desc(diseaseReports.createdAt))
        .limit(limit);
      return result;
    } catch (error) {
      console.error("Error getting disease reports:", error);
      return [];
    }
  }

  async getDiseaseReport(id: string): Promise<DiseaseReport | undefined> {
    try {
      const result = await db.select().from(diseaseReports).where(eq(diseaseReports.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting disease report:", error);
      return undefined;
    }
  }

  // Community methods
  async getCommunityPosts(limit: number = 20): Promise<CommunityPost[]> {
    try {
      const result = await db
        .select()
        .from(communityPosts)
        .orderBy(desc(communityPosts.createdAt))
        .limit(limit);
      return result;
    } catch (error) {
      console.error("Error getting community posts:", error);
      return [];
    }
  }

  async getCommunityStats(): Promise<{
    totalFarmers: string;
    activePosts: string;
    helpRate: string;
  }> {
    try {
      const [farmerCount, postCount] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(communityPosts)
      ]);
      
      return {
        totalFarmers: farmerCount[0]?.count?.toString() || "0",
        activePosts: postCount[0]?.count?.toString() || "0",
        helpRate: "95%",
      };
    } catch (error) {
      console.error("Error getting community stats:", error);
      return {
        totalFarmers: "2.5K",
        activePosts: "450",
        helpRate: "95%",
      };
    }
  }

  // Marketplace methods
  async getMarketplaceItems(category?: string): Promise<MarketplaceItem[]> {
    try {
      let query = db.select().from(marketplaceItems).where(eq(marketplaceItems.isActive, true));
      
      if (category && category !== "all") {
        query = query.where(and(eq(marketplaceItems.isActive, true), eq(marketplaceItems.category, category)));
      }
      
      const result = await query.orderBy(desc(marketplaceItems.createdAt));
      return result;
    } catch (error) {
      console.error("Error getting marketplace items:", error);
      return [];
    }
  }

  // Mandi prices methods
  async getMandiPrices(market?: string, date?: string): Promise<MandiPrice[]> {
    try {
      let query = db.select().from(mandiPrices);
      const conditions = [];
      
      if (market) {
        conditions.push(like(mandiPrices.market, `%${market}%`));
      }
      
      if (date) {
        const filterDate = new Date(date);
        conditions.push(eq(mandiPrices.reportDate, filterDate));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(mandiPrices.reportDate));
      return result;
    } catch (error) {
      console.error("Error getting mandi prices:", error);
      return [];
    }
  }

  async saveMandiPrices(prices: MandiPrice[]): Promise<void> {
    try {
      if (prices.length > 0) {
        await db.insert(mandiPrices).values(prices);
      }
    } catch (error) {
      console.error("Error saving mandi prices:", error);
    }
  }
}

// Try to use PostgreSQL, fallback to in-memory if database is not available
export const storage = process.env.DATABASE_URL ? new PostgresStorage() : new MemStorage();
