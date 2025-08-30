import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Initialize database connection with error handling
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (db) return db;
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("DATABASE_URL not found, database operations will be handled by fallback storage");
    throw new Error("No database connection available");
  }
  
  try {
    const sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
    return db;
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    throw error;
  }
}

// Export db for backward compatibility, but it will throw if not properly initialized
export { db };