import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Some features may not work properly.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket for disease detection images
export const DISEASE_IMAGES_BUCKET = "disease-images";

export async function uploadDiseaseImage(file: File, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(DISEASE_IMAGES_BUCKET)
      .upload(fileName, file);

    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }

    return fileName;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

export async function getImageUrl(path: string): Promise<string | null> {
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
