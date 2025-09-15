import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone", { length: 15 }).notNull().unique(),
  name: text("name"),
  age: integer("age"),
  location: text("location"),
  farmSize: decimal("farm_size", { precision: 10, scale: 2 }),
  primaryCrops: jsonb("primary_crops").$type<string[]>(),
  language: varchar("language", { length: 5 }).default("en"),
  isOnboarded: boolean("is_onboarded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const diseaseReports = pgTable("disease_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  imagePath: text("image_path").notNull(),
  cropType: text("crop_type"),
  diseaseName: text("disease_name").notNull(),
  severity: text("severity"), // Low, Medium, High
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  symptoms: text("symptoms"),
  treatment: text("treatment"),
  isMockResult: boolean("is_mock_result").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mandiPrices = pgTable("mandi_prices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  market: text("market").notNull(),
  state: text("state").notNull(),
  commodity: text("commodity").notNull(),
  variety: text("variety"),
  grade: text("grade"),
  minPrice: decimal("min_price", { precision: 10, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  modalPrice: decimal("modal_price", { precision: 10, scale: 2 }),
  priceUnit: text("price_unit").default("per quintal"),
  reportDate: timestamp("report_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityPosts = pgTable("community_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  title: text("title"),
  content: text("content").notNull(),
  images: jsonb("images").$type<string[]>(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  tags: jsonb("tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketplaceItems = pgTable("marketplace_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: uuid("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // seeds, fertilizers, tools, produce
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceUnit: text("price_unit").default("per unit"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  quantityUnit: text("quantity_unit"),
  images: jsonb("images").$type<string[]>(),
  location: text("location"),
  contactInfo: text("contact_info"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weatherCache = pgTable("weather_cache", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  location: text("location").notNull(),
  weatherData: jsonb("weather_data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const priceAlerts = pgTable("price_alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  commodity: text("commodity").notNull(),
  market: text("market").notNull(),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }).notNull(),
  priceUnit: text("price_unit").default("per quintal"),
  alertType: text("alert_type").notNull(), // 'above', 'below'
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const produceListings = pgTable("produce_listings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: uuid("farmer_id").notNull().references(() => users.id),
  cropName: text("crop_name").notNull(),
  variety: text("variety"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  quantityUnit: text("quantity_unit").notNull().default("quintal"),
  quality: text("quality").notNull(), // A, B, C grade
  expectedPrice: decimal("expected_price", { precision: 10, scale: 2 }).notNull(),
  priceUnit: text("price_unit").default("per quintal"),
  harvestDate: timestamp("harvest_date").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  images: jsonb("images").$type<string[]>(),
  status: text("status").default("active"), // active, sold, expired
  createdAt: timestamp("created_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid("listing_id").notNull().references(() => produceListings.id),
  buyerId: uuid("buyer_id").notNull().references(() => users.id),
  buyerType: text("buyer_type").notNull(), // buyer, warehouse, transporter
  bidAmount: decimal("bid_amount", { precision: 10, scale: 2 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  status: text("status").default("pending"), // pending, accepted, rejected, expired
  validUntil: timestamp("valid_until").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logisticsOrders = pgTable("logistics_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid("listing_id").notNull().references(() => produceListings.id),
  buyerId: uuid("buyer_id").notNull().references(() => users.id),
  farmerId: uuid("farmer_id").notNull().references(() => users.id),
  bidId: uuid("bid_id").references(() => bids.id),
  pickupLocation: text("pickup_location").notNull(),
  deliveryLocation: text("delivery_location").notNull(),
  transportPartner: text("transport_partner").notNull(),
  storagePartner: text("storage_partner"),
  transportCost: decimal("transport_cost", { precision: 10, scale: 2 }),
  storageCost: decimal("storage_cost", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, failed
  orderStatus: text("order_status").default("created"), // created, pickup_scheduled, in_transit, delivered, completed
  scheduledPickup: timestamp("scheduled_pickup"),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDiseaseReportSchema = createInsertSchema(diseaseReports).omit({
  id: true,
  createdAt: true,
});

export const insertMandiPriceSchema = createInsertSchema(mandiPrices).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  createdAt: true,
  likes: true,
  comments: true,
});

export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({
  id: true,
  createdAt: true,
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({
  id: true,
  createdAt: true,
  lastTriggered: true,
});

export const insertProduceListingSchema = createInsertSchema(produceListings).omit({
  id: true,
  createdAt: true,
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
});

export const insertLogisticsOrderSchema = createInsertSchema(logisticsOrders).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DiseaseReport = typeof diseaseReports.$inferSelect;
export type InsertDiseaseReport = z.infer<typeof insertDiseaseReportSchema>;
export type MandiPrice = typeof mandiPrices.$inferSelect;
export type InsertMandiPrice = z.infer<typeof insertMandiPriceSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type WeatherCache = typeof weatherCache.$inferSelect;
export type ProduceListing = typeof produceListings.$inferSelect;
export type InsertProduceListing = z.infer<typeof insertProduceListingSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type LogisticsOrder = typeof logisticsOrders.$inferSelect;
export type InsertLogisticsOrder = z.infer<typeof insertLogisticsOrderSchema>;

// Solar Income Calculator Schema
export const solarCalculatorSchema = z.object({
  fieldSize: z.string()
    .min(1, "Field size is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Field size must be a positive number"),
  fieldSizeUnit: z.enum(["acre", "hectare"]).default("acre"),
  currentCropIncome: z.string()
    .min(1, "Current crop income is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Current crop income must be a positive number"),
  solarPanelCapacity: z.string()
    .min(1, "Solar panel capacity is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Solar panel capacity must be a positive number"),
  sunlightHours: z.string()
    .min(1, "Sunlight hours is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 24, "Sunlight hours must be between 0 and 24"),
  electricityRate: z.string()
    .min(1, "Electricity rate is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Electricity rate must be a positive number"),
  installationCost: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Installation cost must be a positive number or zero"),
  governmentSubsidy: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Government subsidy must be a positive number or zero"),
  maintenanceCost: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Maintenance cost must be a positive number or zero")
});

export type SolarCalculatorForm = z.infer<typeof solarCalculatorSchema>;
