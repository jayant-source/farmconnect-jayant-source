import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

// Initialize Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Storage bucket for disease detection images
const DISEASE_IMAGES_BUCKET = "disease-images";

export async function uploadToSupabase(file: Express.Multer.File, userId: string): Promise<string> {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase credentials not configured");
  }

  try {
    // Create unique filename
    const fileExt = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(DISEASE_IMAGES_BUCKET)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    return data.path;
  } catch (error) {
    console.error("Upload to Supabase failed:", error);
    throw error;
  }
}

export async function getImageUrl(path: string): Promise<string | null> {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials not configured");
    return null;
  }

  try {
    const { data } = supabase.storage
      .from(DISEASE_IMAGES_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  } catch (error) {
    console.error("Error getting image URL:", error);
    return null;
  }
}

export async function deleteImage(path: string): Promise<boolean> {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials not configured");
    return false;
  }

  try {
    const { error } = await supabase.storage
      .from(DISEASE_IMAGES_BUCKET)
      .remove([path]);

    if (error) {
      console.error("Error deleting image:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

// Initialize storage bucket if it doesn't exist
export async function initializeStorageBucket(): Promise<void> {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials not configured - skipping bucket initialization");
    return;
  }

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error listing buckets:", listError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === DISEASE_IMAGES_BUCKET);

    if (!bucketExists) {
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket(DISEASE_IMAGES_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760, // 10MB
      });

      if (createError) {
        console.error("Error creating bucket:", createError);
      } else {
        console.log(`Created storage bucket: ${DISEASE_IMAGES_BUCKET}`);
      }
    }
  } catch (error) {
    console.error("Error initializing storage bucket:", error);
  }
}

// Database connection test
export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials not configured");
    return false;
  }

  try {
    // Test connection by listing tables
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }

    console.log("Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return false;
  }
}
