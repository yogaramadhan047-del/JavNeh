import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-project.supabase.co";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "dummy-publishable-key";

// Client-side / public Supabase client (used for queries, real-time, auth, and storage uploads)
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Supabase Storage Bucket Names
export const STORAGE_BUCKETS = {
  POSTERS: "posters",
  BANNERS: "banners",
  THUMBNAILS: "thumbnails",
  FAVICONS: "favicons",
  MEDIA: "media",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/**
 * Upload a file directly to Supabase Storage
 */
export async function uploadToSupabaseStorage(
  file: File | Blob,
  bucket: StorageBucket | string,
  folder: string = "uploads"
): Promise<{ url: string; path: string; error?: string }> {
  try {
    const fileExt = file instanceof File && file.name ? file.name.split(".").pop() : "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return { url: "", path: "", error: uploadError.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      path: filePath,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Failed to upload file";
    console.error("uploadToSupabaseStorage caught error:", err);
    return { url: "", path: "", error: errorMsg };
  }
}

/**
 * Delete a file from Supabase Storage by its public URL or path
 */
export async function deleteFromSupabaseStorage(
  bucket: StorageBucket | string,
  filePathOrUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let filePath = filePathOrUrl;
    if (filePathOrUrl.startsWith("http")) {
      const parts = filePathOrUrl.split(`/storage/v1/object/public/${bucket}/`);
      if (parts.length > 1) {
        filePath = parts[1];
      }
    }

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      console.error("Supabase storage delete error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete file";
    return { success: false, error: errorMsg };
  }
}
