"use client";

import { useState, useRef } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadToSupabaseStorage, STORAGE_BUCKETS, StorageBucket } from "@/lib/supabase";
import { optimizeImageForUpload } from "@/lib/image-optimization";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  path: string;
  maxSizeMB?: number;
  aspectRatio?: string;
  disabled?: boolean;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onError?: (msg: string) => void;
}

export function ImageUpload({
  label,
  value,
  onChange,
  path,
  maxSizeMB = 5,
  aspectRatio = "aspect-video",
  disabled,
  onUploadStart,
  onUploadEnd,
  onError,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Map ratio prop if passed as "16:9" or "2/3" or standard tailwind
  const getAspectClass = (ratio: string) => {
    if (ratio === "2/3" || ratio === "2:3") return "aspect-[2/3]";
    if (ratio === "16/9" || ratio === "16:9" || ratio === "aspect-video") return "aspect-video";
    return ratio.startsWith("aspect-") ? ratio : "aspect-video";
  };

  const aspectClass = getAspectClass(aspectRatio);

  const determineBucket = (targetPath: string): StorageBucket => {
    const lower = targetPath.toLowerCase();
    if (lower.includes("banner")) return STORAGE_BUCKETS.BANNERS;
    if (lower.includes("poster")) return STORAGE_BUCKETS.POSTERS;
    if (lower.includes("thumb") || lower.includes("article")) return STORAGE_BUCKETS.THUMBNAILS;
    if (lower.includes("favicon")) return STORAGE_BUCKETS.FAVICONS;
    return STORAGE_BUCKETS.MEDIA;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict client-side validation for file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`Ukuran file maksimal ${maxSizeMB}MB.`);
      return;
    }

    // Strict client-side validation for file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validTypes.includes(file.type)) {
      onError?.("Format file tidak didukung. Harap upload gambar JPEG, PNG, atau WEBP.");
      return;
    }

    try {
      setIsUploading(true);
      setProgress(20);
      onUploadStart?.();

      // Optimize, compress, and ensure 16:9 aspect ratio before uploading
      const optimizedFile = await optimizeImageForUpload(file, {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.82,
        force16x9: true,
      });

      const bucket = determineBucket(path);
      const cleanFolder = path ? path.replace(/[^a-zA-Z0-9_-]/g, "") : "uploads";

      setProgress(50);
      const result = await uploadToSupabaseStorage(optimizedFile, bucket, cleanFolder);
      setProgress(90);

      if (result.error || !result.url) {
        console.error("Upload error:", result.error);
        onError?.(result.error || "Upload gambar gagal.");
      } else {
        setProgress(100);
        onChange(result.url);
      }
    } catch (err) {
      console.error(err);
      onError?.("Terjadi kesalahan saat upload gambar.");
    } finally {
      setIsUploading(false);
      setProgress(0);
      onUploadEnd?.();
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        {value ? (
          <div className={`relative ${aspectClass} w-full rounded-xl overflow-hidden bg-background-dark border border-border-dark group`}>
            <Image
              src={value}
              alt="Uploaded preview"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || isUploading}
                className="px-4 py-2 bg-primary-blue text-white rounded-lg text-sm font-medium hover:bg-primary-blue-hover transition-colors cursor-pointer"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={disabled || isUploading}
                className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/80 transition-colors cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className={`w-full ${aspectClass} rounded-xl border-2 border-dashed border-border-dark hover:border-primary-blue hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-2 group bg-background-dark cursor-pointer`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary-blue animate-spin mb-2" />
                <span className="text-sm font-medium text-white">Uploading {Math.round(progress)}%...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary-blue/10 transition-colors">
                  <ImagePlus className="w-6 h-6 text-gray-400 group-hover:text-primary-blue transition-colors" />
                </div>
                <div className="text-center px-4">
                  <span className="text-sm font-medium text-white block">Klik untuk upload gambar</span>
                  <span className="text-xs text-gray-500 mt-1 block">JPG, PNG, WEBP (Max {maxSizeMB}MB)</span>
                </div>
              </>
            )}
          </button>
        )}
      </div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />
    </div>
  );
}
