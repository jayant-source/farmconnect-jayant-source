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
