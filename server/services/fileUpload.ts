import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

// Simple local file storage for images
const UPLOAD_DIR = "uploads/disease-images";

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function saveImageLocally(file: Express.Multer.File, userId: string): Promise<string> {
  try {
    // Create unique filename
    const fileExt = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Save file to local storage
    fs.writeFileSync(filePath, file.buffer);
    
    // Return relative path for storage
    return `disease-images/${fileName}`;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

export function getImageUrl(imagePath: string): string {
  // For local development, serve images from uploads directory
  return `/uploads/${imagePath}`;
}