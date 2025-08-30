import { randomUUID } from "crypto";
import { eq, desc, count, and, like, sql, or } from "drizzle-orm";
import { getDb } from "./db";
import { 
  users,
  diseaseReports,
  communityPosts,
  marketplaceItems,
  mandiPrices,
  priceAlerts,
  produceListings,
  bids,
  logisticsOrders,
  type User, 
  type InsertUser, 
  type DiseaseReport, 
  type InsertDiseaseReport, 
  type CommunityPost, 
  type MarketplaceItem, 
  type MandiPrice,
  type PriceAlert,
  type InsertPriceAlert,
  type ProduceListing,
  type InsertProduceListing,
  type Bid,
  type InsertBid,
  type LogisticsOrder,
  type InsertLogisticsOrder
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
  createCommunityPost(post: any): Promise<CommunityPost>;
  likeCommunityPost(postId: string, userId: string): Promise<void>;
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
  
  // Price alerts methods
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  getUserPriceAlerts(userId: string): Promise<PriceAlert[]>;
  updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert>;
  deletePriceAlert(id: string): Promise<void>;
  getActivePriceAlerts(): Promise<PriceAlert[]>;
  
  // Produce listings methods
  createProduceListing(listing: InsertProduceListing): Promise<ProduceListing>;
  getProduceListings(status?: string): Promise<ProduceListing[]>;
  getProduceListingById(id: string): Promise<ProduceListing | undefined>;
  updateProduceListing(id: string, updates: Partial<ProduceListing>): Promise<ProduceListing>;
  
  // Bidding methods
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsForListing(listingId: string): Promise<Bid[]>;
  getUserBids(userId: string): Promise<Bid[]>;
  updateBidStatus(bidId: string, status: string): Promise<Bid>;
  
  // Logistics methods
  createLogisticsOrder(order: InsertLogisticsOrder): Promise<LogisticsOrder>;
  getLogisticsOrders(userId: string): Promise<LogisticsOrder[]>;
  updateLogisticsOrder(id: string, updates: Partial<LogisticsOrder>): Promise<LogisticsOrder>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private diseaseReports: Map<string, DiseaseReport>;
  private communityPosts: Map<string, CommunityPost>;
  private marketplaceItems: Map<string, MarketplaceItem>;
  private mandiPrices: Map<string, MandiPrice>;
  private priceAlerts: Map<string, PriceAlert>;
  private produceListings: Map<string, ProduceListing>;
  private bids: Map<string, Bid>;
  private logisticsOrders: Map<string, LogisticsOrder>;

  constructor() {
    this.users = new Map();
    this.diseaseReports = new Map();
    this.communityPosts = new Map();
    this.marketplaceItems = new Map();
    this.mandiPrices = new Map();
    this.priceAlerts = new Map();
    this.produceListings = new Map();
    this.bids = new Map();
    this.logisticsOrders = new Map();
    
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
      userId: report.userId,
      imagePath: report.imagePath,
      cropType: report.cropType || null,
      diseaseName: report.diseaseName,
      severity: report.severity || null,
      confidence: report.confidence || null,
      symptoms: report.symptoms || null,
      treatment: report.treatment || null,
      isMockResult: report.isMockResult || null,
      createdAt: new Date(),
    };
    this.diseaseReports.set(id, diseaseReport);
    return diseaseReport;
  }

  async getRecentDiseaseReports(userId: string, limit: number): Promise<DiseaseReport[]> {
    const userReports = Array.from(this.diseaseReports.values())
      .filter(report => report.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
    
    return userReports;
  }

  async getDiseaseReport(id: string): Promise<DiseaseReport | undefined> {
    return this.diseaseReports.get(id);
  }

  // Community methods
  async getCommunityPosts(limit: number = 20): Promise<CommunityPost[]> {
    const posts = Array.from(this.communityPosts.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
    
    // Add real user data for display
    return posts.map(post => {
      const user = this.users.get(post.userId);
      return {
        ...post,
        user: {
          name: user?.name || "Anonymous Farmer",
          location: user?.location || "Farm Location",
        }
      };
    }) as any;
  }

  async createCommunityPost(postData: any): Promise<CommunityPost> {
    const id = randomUUID();
    const post: CommunityPost = {
      id,
      userId: postData.userId,
      title: postData.title,
      content: postData.content,
      images: postData.images || null,
      likes: 0,
      comments: 0,
      tags: postData.tags || null,
      createdAt: new Date(),
    };
    
    this.communityPosts.set(id, post);
    return post;
  }

  async likeCommunityPost(postId: string, userId: string): Promise<void> {
    const post = this.communityPosts.get(postId);
    if (post) {
      post.likes = (post.likes || 0) + 1;
    }
  }

  async getCommunityStats(): Promise<{
    totalFarmers: string;
    activePosts: string;
    helpRate: string;
  }> {
    return {
      totalFarmers: "2.5K",
      activePosts: this.communityPosts.size.toString(),
      helpRate: "95%",
    };
  }

  // Marketplace methods
  async getMarketplaceItems(category?: string): Promise<MarketplaceItem[]> {
    let items = Array.from(this.marketplaceItems.values())
      .filter(item => item.isActive)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
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

  // Price alerts methods
  async createPriceAlert(insertAlert: InsertPriceAlert): Promise<PriceAlert> {
    const id = randomUUID();
    const alert: PriceAlert = {
      id,
      userId: insertAlert.userId,
      market: insertAlert.market,
      commodity: insertAlert.commodity,
      priceUnit: insertAlert.priceUnit || null,
      isActive: insertAlert.isActive || null,
      targetPrice: insertAlert.targetPrice,
      alertType: insertAlert.alertType,
      lastTriggered: null,
      createdAt: new Date(),
    };
    this.priceAlerts.set(id, alert);
    return alert;
  }

  async getUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return Array.from(this.priceAlerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
    const alert = this.priceAlerts.get(id);
    if (!alert) {
      throw new Error("Price alert not found");
    }
    
    const updatedAlert = { ...alert, ...updates };
    this.priceAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async deletePriceAlert(id: string): Promise<void> {
    this.priceAlerts.delete(id);
  }

  async getActivePriceAlerts(): Promise<PriceAlert[]> {
    return Array.from(this.priceAlerts.values())
      .filter(alert => alert.isActive);
  }

  // Produce listings methods
  async createProduceListing(listing: InsertProduceListing): Promise<ProduceListing> {
    const id = randomUUID();
    const produceListing: ProduceListing = {
      id,
      farmerId: listing.farmerId,
      cropName: listing.cropName,
      variety: listing.variety || null,
      quantity: listing.quantity,
      quantityUnit: listing.quantityUnit,
      quality: listing.quality,
      expectedPrice: listing.expectedPrice,
      priceUnit: listing.priceUnit || null,
      harvestDate: listing.harvestDate,
      location: listing.location,
      description: listing.description || null,
      images: listing.images || null,
      status: listing.status || null,
      createdAt: new Date(),
    };
    this.produceListings.set(id, produceListing);
    return produceListing;
  }

  async getProduceListings(status?: string): Promise<ProduceListing[]> {
    let listings = Array.from(this.produceListings.values());
    if (status) {
      listings = listings.filter(listing => listing.status === status);
    }
    return listings.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getProduceListingById(id: string): Promise<ProduceListing | undefined> {
    return this.produceListings.get(id);
  }

  async updateProduceListing(id: string, updates: Partial<ProduceListing>): Promise<ProduceListing> {
    const listing = this.produceListings.get(id);
    if (!listing) {
      throw new Error("Produce listing not found");
    }
    const updatedListing = { ...listing, ...updates };
    this.produceListings.set(id, updatedListing);
    return updatedListing;
  }

  // Bidding methods
  async createBid(bid: InsertBid): Promise<Bid> {
    const id = randomUUID();
    const bidData: Bid = {
      id,
      listingId: bid.listingId,
      buyerId: bid.buyerId,
      buyerType: bid.buyerType,
      bidAmount: bid.bidAmount,
      quantity: bid.quantity,
      notes: bid.notes || null,
      status: bid.status || null,
      validUntil: bid.validUntil,
      createdAt: new Date(),
    };
    this.bids.set(id, bidData);
    return bidData;
  }

  async getBidsForListing(listingId: string): Promise<Bid[]> {
    return Array.from(this.bids.values())
      .filter(bid => bid.listingId === listingId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUserBids(userId: string): Promise<Bid[]> {
    return Array.from(this.bids.values())
      .filter(bid => bid.buyerId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateBidStatus(bidId: string, status: string): Promise<Bid> {
    const bid = this.bids.get(bidId);
    if (!bid) {
      throw new Error("Bid not found");
    }
    const updatedBid = { ...bid, status };
    this.bids.set(bidId, updatedBid);
    return updatedBid;
  }

  // Logistics methods
  async createLogisticsOrder(order: InsertLogisticsOrder): Promise<LogisticsOrder> {
    const id = randomUUID();
    const logisticsOrder: LogisticsOrder = {
      id,
      listingId: order.listingId,
      buyerId: order.buyerId,
      farmerId: order.farmerId,
      bidId: order.bidId || null,
      pickupLocation: order.pickupLocation,
      deliveryLocation: order.deliveryLocation,
      transportPartner: order.transportPartner,
      storagePartner: order.storagePartner || null,
      transportCost: order.transportCost || null,
      storageCost: order.storageCost || null,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus || null,
      orderStatus: order.orderStatus || null,
      scheduledPickup: order.scheduledPickup || null,
      estimatedDelivery: order.estimatedDelivery || null,
      actualDelivery: order.actualDelivery || null,
      createdAt: new Date(),
    };
    this.logisticsOrders.set(id, logisticsOrder);
    return logisticsOrder;
  }

  async getLogisticsOrders(userId: string): Promise<LogisticsOrder[]> {
    return Array.from(this.logisticsOrders.values())
      .filter(order => order.farmerId === userId || order.buyerId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateLogisticsOrder(id: string, updates: Partial<LogisticsOrder>): Promise<LogisticsOrder> {
    const order = this.logisticsOrders.get(id);
    if (!order) {
      throw new Error("Logistics order not found");
    }
    const updatedOrder = { ...order, ...updates };
    this.logisticsOrders.set(id, updatedOrder);
    return updatedOrder;
  }
}

class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by phone:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const db = getDb();
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const db = getDb();
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
      const db = getDb();
      const result = await db.insert(diseaseReports).values(report).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating disease report:", error);
      throw error;
    }
  }

  async getRecentDiseaseReports(userId: string, limit: number): Promise<DiseaseReport[]> {
    try {
      const db = getDb();
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
      const db = getDb();
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
      const db = getDb();
      const result = await db
        .select({
          id: communityPosts.id,
          userId: communityPosts.userId,
          title: communityPosts.title,
          content: communityPosts.content,
          images: communityPosts.images,
          likes: communityPosts.likes,
          comments: communityPosts.comments,
          tags: communityPosts.tags,
          createdAt: communityPosts.createdAt,
          user: {
            name: users.name,
            location: users.location,
          }
        })
        .from(communityPosts)
        .leftJoin(users, eq(communityPosts.userId, users.id))
        .orderBy(desc(communityPosts.createdAt))
        .limit(limit);
      return result as any;
    } catch (error) {
      console.error("Error getting community posts:", error);
      return [];
    }
  }

  async createCommunityPost(postData: any): Promise<CommunityPost> {
    try {
      const db = getDb();
      const [post] = await db
        .insert(communityPosts)
        .values({
          userId: postData.userId,
          title: postData.title,
          content: postData.content,
          images: postData.images || null,
          tags: postData.tags || null,
        })
        .returning();
      return post;
    } catch (error) {
      console.error("Error creating community post:", error);
      throw new Error("Failed to create post");
    }
  }

  async likeCommunityPost(postId: string, userId: string): Promise<void> {
    try {
      const db = getDb();
      await db
        .update(communityPosts)
        .set({ likes: sql`${communityPosts.likes} + 1` })
        .where(eq(communityPosts.id, postId));
    } catch (error) {
      console.error("Error liking post:", error);
      throw new Error("Failed to like post");
    }
  }

  async getCommunityStats(): Promise<{
    totalFarmers: string;
    activePosts: string;
    helpRate: string;
  }> {
    try {
      const db = getDb();
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
      const db = getDb();
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
      const db = getDb();
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
      const db = getDb();
      if (prices.length > 0) {
        await db.insert(mandiPrices).values(prices);
      }
    } catch (error) {
      console.error("Error saving mandi prices:", error);
    }
  }

  // Price alerts methods
  async createPriceAlert(insertAlert: InsertPriceAlert): Promise<PriceAlert> {
    try {
      const db = getDb();
      const result = await db.insert(priceAlerts).values(insertAlert).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating price alert:", error);
      throw error;
    }
  }

  async getUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
    try {
      const db = getDb();
      const result = await db
        .select()
        .from(priceAlerts)
        .where(eq(priceAlerts.userId, userId))
        .orderBy(desc(priceAlerts.createdAt));
      return result;
    } catch (error) {
      console.error("Error getting user price alerts:", error);
      return [];
    }
  }

  async updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
    try {
      const db = getDb();
      const result = await db.update(priceAlerts).set(updates).where(eq(priceAlerts.id, id)).returning();
      if (!result[0]) {
        throw new Error("Price alert not found");
      }
      return result[0];
    } catch (error) {
      console.error("Error updating price alert:", error);
      throw error;
    }
  }

  async deletePriceAlert(id: string): Promise<void> {
    try {
      const db = getDb();
      await db.delete(priceAlerts).where(eq(priceAlerts.id, id));
    } catch (error) {
      console.error("Error deleting price alert:", error);
      throw error;
    }
  }

  async getActivePriceAlerts(): Promise<PriceAlert[]> {
    try {
      const db = getDb();
      const result = await db
        .select()
        .from(priceAlerts)
        .where(eq(priceAlerts.isActive, true))
        .orderBy(desc(priceAlerts.createdAt));
      return result;
    } catch (error) {
      console.error("Error getting active price alerts:", error);
      return [];
    }
  }

  // Produce listings methods
  async createProduceListing(listing: InsertProduceListing): Promise<ProduceListing> {
    try {
      const db = getDb();
      const result = await db.insert(produceListings).values(listing).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating produce listing:", error);
      throw error;
    }
  }

  async getProduceListings(status?: string): Promise<ProduceListing[]> {
    try {
      const db = getDb();
      let query = db.select().from(produceListings);
      if (status) {
        query = query.where(eq(produceListings.status, status));
      }
      const result = await query.orderBy(desc(produceListings.createdAt));
      return result;
    } catch (error) {
      console.error("Error getting produce listings:", error);
      return [];
    }
  }

  async getProduceListingById(id: string): Promise<ProduceListing | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(produceListings).where(eq(produceListings.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting produce listing:", error);
      return undefined;
    }
  }

  async updateProduceListing(id: string, updates: Partial<ProduceListing>): Promise<ProduceListing> {
    try {
      const db = getDb();
      const result = await db.update(produceListings).set(updates).where(eq(produceListings.id, id)).returning();
      if (!result[0]) {
        throw new Error("Produce listing not found");
      }
      return result[0];
    } catch (error) {
      console.error("Error updating produce listing:", error);
      throw error;
    }
  }

  // Bidding methods
  async createBid(bid: InsertBid): Promise<Bid> {
    try {
      const db = getDb();
      const result = await db.insert(bids).values(bid).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating bid:", error);
      throw error;
    }
  }

  async getBidsForListing(listingId: string): Promise<Bid[]> {
    try {
      const db = getDb();
      const result = await db
        .select()
        .from(bids)
        .where(eq(bids.listingId, listingId))
        .orderBy(desc(bids.createdAt));
      return result;
    } catch (error) {
      console.error("Error getting bids for listing:", error);
      return [];
    }
  }

  async getUserBids(userId: string): Promise<Bid[]> {
    try {
      const db = getDb();
      const result = await db
        .select()
        .from(bids)
        .where(eq(bids.buyerId, userId))
        .orderBy(desc(bids.createdAt));
      return result;
    } catch (error) {
      console.error("Error getting user bids:", error);
      return [];
    }
  }

  async updateBidStatus(bidId: string, status: string): Promise<Bid> {
    try {
      const db = getDb();
      const result = await db.update(bids).set({ status }).where(eq(bids.id, bidId)).returning();
      if (!result[0]) {
        throw new Error("Bid not found");
      }
      return result[0];
    } catch (error) {
      console.error("Error updating bid status:", error);
      throw error;
    }
  }

  // Logistics methods
  async createLogisticsOrder(order: InsertLogisticsOrder): Promise<LogisticsOrder> {
    try {
      const db = getDb();
      const result = await db.insert(logisticsOrders).values(order).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating logistics order:", error);
      throw error;
    }
  }

  async getLogisticsOrders(userId: string): Promise<LogisticsOrder[]> {
    try {
      const db = getDb();
      const result = await db
        .select()
        .from(logisticsOrders)
        .where(or(eq(logisticsOrders.farmerId, userId), eq(logisticsOrders.buyerId, userId)))
        .orderBy(desc(logisticsOrders.createdAt));
      return result;
    } catch (error) {
      console.error("Error getting logistics orders:", error);
      return [];
    }
  }

  async updateLogisticsOrder(id: string, updates: Partial<LogisticsOrder>): Promise<LogisticsOrder> {
    try {
      const db = getDb();
      const result = await db.update(logisticsOrders).set(updates).where(eq(logisticsOrders.id, id)).returning();
      if (!result[0]) {
        throw new Error("Logistics order not found");
      }
      return result[0];
    } catch (error) {
      console.error("Error updating logistics order:", error);
      throw error;
    }
  }
}

// Create a hybrid storage that falls back to in-memory when database fails
class HybridStorage implements IStorage {
  private postgres: PostgresStorage;
  private memory: MemStorage;
  private useDatabase: boolean = true;

  constructor() {
    this.postgres = new PostgresStorage();
    this.memory = new MemStorage();
  }

  private async safeDbOperation<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (!this.useDatabase) {
      return fallback();
    }

    try {
      return await operation();
    } catch (error) {
      console.warn("Database operation failed, falling back to in-memory storage:", error);
      this.useDatabase = false; // Disable database for this session
      return fallback();
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.safeDbOperation(
      () => this.postgres.getUser(id),
      () => this.memory.getUser(id)
    );
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return this.safeDbOperation(
      () => this.postgres.getUserByPhone(phone),
      () => this.memory.getUserByPhone(phone)
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.safeDbOperation(
      () => this.postgres.createUser(insertUser),
      () => this.memory.createUser(insertUser)
    );
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return this.safeDbOperation(
      () => this.postgres.updateUser(id, updates),
      () => this.memory.updateUser(id, updates)
    );
  }

  async createDiseaseReport(report: InsertDiseaseReport): Promise<DiseaseReport> {
    return this.safeDbOperation(
      () => this.postgres.createDiseaseReport(report),
      () => this.memory.createDiseaseReport(report)
    );
  }

  async getRecentDiseaseReports(userId: string, limit: number): Promise<DiseaseReport[]> {
    return this.safeDbOperation(
      () => this.postgres.getRecentDiseaseReports(userId, limit),
      () => this.memory.getRecentDiseaseReports(userId, limit)
    );
  }

  async getDiseaseReport(id: string): Promise<DiseaseReport | undefined> {
    return this.safeDbOperation(
      () => this.postgres.getDiseaseReport(id),
      () => this.memory.getDiseaseReport(id)
    );
  }

  async getCommunityPosts(limit: number = 20): Promise<CommunityPost[]> {
    return this.safeDbOperation(
      () => this.postgres.getCommunityPosts(limit),
      () => this.memory.getCommunityPosts(limit)
    );
  }

  async createCommunityPost(postData: any): Promise<CommunityPost> {
    return this.safeDbOperation(
      () => this.postgres.createCommunityPost(postData),
      () => this.memory.createCommunityPost(postData)
    );
  }

  async likeCommunityPost(postId: string, userId: string): Promise<void> {
    return this.safeDbOperation(
      () => this.postgres.likeCommunityPost(postId, userId),
      () => this.memory.likeCommunityPost(postId, userId)
    );
  }

  async getCommunityStats(): Promise<{ totalFarmers: string; activePosts: string; helpRate: string; }> {
    return this.safeDbOperation(
      () => this.postgres.getCommunityStats(),
      () => this.memory.getCommunityStats()
    );
  }

  async getMarketplaceItems(category?: string): Promise<MarketplaceItem[]> {
    return this.safeDbOperation(
      () => this.postgres.getMarketplaceItems(category),
      () => this.memory.getMarketplaceItems(category)
    );
  }

  async getMandiPrices(market?: string, date?: string): Promise<MandiPrice[]> {
    return this.safeDbOperation(
      () => this.postgres.getMandiPrices(market, date),
      () => this.memory.getMandiPrices(market, date)
    );
  }

  async saveMandiPrices(prices: MandiPrice[]): Promise<void> {
    return this.safeDbOperation(
      () => this.postgres.saveMandiPrices(prices),
      () => this.memory.saveMandiPrices(prices)
    );
  }

  async createPriceAlert(insertAlert: InsertPriceAlert): Promise<PriceAlert> {
    return this.safeDbOperation(
      () => this.postgres.createPriceAlert(insertAlert),
      () => this.memory.createPriceAlert(insertAlert)
    );
  }

  async getUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return this.safeDbOperation(
      () => this.postgres.getUserPriceAlerts(userId),
      () => this.memory.getUserPriceAlerts(userId)
    );
  }

  async updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
    return this.safeDbOperation(
      () => this.postgres.updatePriceAlert(id, updates),
      () => this.memory.updatePriceAlert(id, updates)
    );
  }

  async deletePriceAlert(id: string): Promise<void> {
    return this.safeDbOperation(
      () => this.postgres.deletePriceAlert(id),
      () => this.memory.deletePriceAlert(id)
    );
  }

  async getActivePriceAlerts(): Promise<PriceAlert[]> {
    return this.safeDbOperation(
      () => this.postgres.getActivePriceAlerts(),
      () => this.memory.getActivePriceAlerts()
    );
  }

  // Produce listings methods
  async createProduceListing(listing: InsertProduceListing): Promise<ProduceListing> {
    return this.safeDbOperation(
      () => this.postgres.createProduceListing(listing),
      () => this.memory.createProduceListing(listing)
    );
  }

  async getProduceListings(status?: string): Promise<ProduceListing[]> {
    return this.safeDbOperation(
      () => this.postgres.getProduceListings(status),
      () => this.memory.getProduceListings(status)
    );
  }

  async getProduceListingById(id: string): Promise<ProduceListing | undefined> {
    return this.safeDbOperation(
      () => this.postgres.getProduceListingById(id),
      () => this.memory.getProduceListingById(id)
    );
  }

  async updateProduceListing(id: string, updates: Partial<ProduceListing>): Promise<ProduceListing> {
    return this.safeDbOperation(
      () => this.postgres.updateProduceListing(id, updates),
      () => this.memory.updateProduceListing(id, updates)
    );
  }

  // Bidding methods
  async createBid(bid: InsertBid): Promise<Bid> {
    return this.safeDbOperation(
      () => this.postgres.createBid(bid),
      () => this.memory.createBid(bid)
    );
  }

  async getBidsForListing(listingId: string): Promise<Bid[]> {
    return this.safeDbOperation(
      () => this.postgres.getBidsForListing(listingId),
      () => this.memory.getBidsForListing(listingId)
    );
  }

  async getUserBids(userId: string): Promise<Bid[]> {
    return this.safeDbOperation(
      () => this.postgres.getUserBids(userId),
      () => this.memory.getUserBids(userId)
    );
  }

  async updateBidStatus(bidId: string, status: string): Promise<Bid> {
    return this.safeDbOperation(
      () => this.postgres.updateBidStatus(bidId, status),
      () => this.memory.updateBidStatus(bidId, status)
    );
  }

  // Logistics methods
  async createLogisticsOrder(order: InsertLogisticsOrder): Promise<LogisticsOrder> {
    return this.safeDbOperation(
      () => this.postgres.createLogisticsOrder(order),
      () => this.memory.createLogisticsOrder(order)
    );
  }

  async getLogisticsOrders(userId: string): Promise<LogisticsOrder[]> {
    return this.safeDbOperation(
      () => this.postgres.getLogisticsOrders(userId),
      () => this.memory.getLogisticsOrders(userId)
    );
  }

  async updateLogisticsOrder(id: string, updates: Partial<LogisticsOrder>): Promise<LogisticsOrder> {
    return this.safeDbOperation(
      () => this.postgres.updateLogisticsOrder(id, updates),
      () => this.memory.updateLogisticsOrder(id, updates)
    );
  }
}

export const storage = new HybridStorage();
