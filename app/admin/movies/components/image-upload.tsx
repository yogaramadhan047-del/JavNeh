"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { uploadToSupabaseStorage, STORAGE_BUCKETS, StorageBucket } from "@/lib/supabase";
import { optimizeImageForUpload } from "@/lib/image-optimization";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  aspectRatio: "2/3" | "16/9";
  path: string;
  maxSizeMB: number;
  label: string;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  onError: (msg: string) => void;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  aspectRatio,
  path,
  maxSizeMB,
  label,
  onUploadStart,
  onUploadEnd,
  onError,
  disabled,
}: ImageUploadProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = localPreview || value;

  const determineBucket = (targetPath: string, aspect: "2/3" | "16/9"): StorageBucket => {
    const lower = targetPath.toLowerCase();
    if (aspect === "2/3" || lower.includes("poster")) return STORAGE_BUCKETS.POSTERS;
    if (aspect === "16/9" || lower.includes("banner")) return STORAGE_BUCKETS.BANNERS;
    if (lower.includes("thumb") || lower.includes("article")) return STORAGE_BUCKETS.THUMBNAILS;
    return STORAGE_BUCKETS.MEDIA;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("Hanya menerima file gambar.");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      onError(`Maksimal ukuran file adalah ${maxSizeMB} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setLocalPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    setProgress(20);
    onUploadStart();

    try {
      // Optimize, center-crop to 16:9 (if aspect ratio is 16/9 or default), and compress to WebP
      const optimizedFile = await optimizeImageForUpload(file, {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.82,
        force16x9: aspectRatio === "16/9",
      });

      const bucket = determineBucket(path, aspectRatio);
      const cleanFolder = path ? path.replace(/[^a-zA-Z0-9_-]/g, "") : "uploads";

      setProgress(50);
      const result = await uploadToSupabaseStorage(optimizedFile, bucket, cleanFolder);
      setProgress(95);

      if (result.error || !result.url) {
        console.error("Upload error:", result.error);
        onError(result.error || "Upload gambar gagal.");
        setLocalPreview(null);
      } else {
        setLocalPreview(null);
        onChange(result.url);
      }
    } catch (err) {
      console.error("Upload catch error:", err);
      onError("Terjadi kesalahan saat upload gambar.");
      setLocalPreview(null);
    } finally {
      setIsUploading(false);
      setProgress(0);
      onUploadEnd();
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />

      {preview ? (
        <div
          className={`relative rounded-xl overflow-hidden border border-border-dark group bg-background-dark/50 ${
            aspectRatio === "2/3" ? "aspect-[2/3] w-48" : "aspect-video w-full"
          }`}
        >
          <SafeImage
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            type={aspectRatio === "2/3" ? "poster" : "banner"}
            referrerPolicy="no-referrer"
          />

          {isUploading ? (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4">
              <Loader2 className="w-8 h-8 text-primary-blue animate-spin mb-2" />
              <div className="w-full max-w-[120px] h-1.5 bg-background-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-blue transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-white mt-2">{progress}%</span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium backdrop-blur-sm transition-colors cursor-pointer"
              >
                Ganti Gambar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalPreview(null);
                  onChange("");
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
                disabled={disabled}
                className="px-4 py-1.5 bg-danger/20 hover:bg-danger/40 text-danger rounded-lg text-xs font-medium backdrop-blur-sm transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Hapus
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
            aspectRatio === "2/3" ? "aspect-[2/3] w-48" : "aspect-video w-full"
          } ${
            disabled || isUploading
              ? "border-border-dark bg-background-dark/50 cursor-not-allowed"
              : "border-border-dark hover:border-primary-blue hover:bg-white/5 bg-background-dark"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
              <div className="w-24 h-1.5 bg-card-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-blue transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400 mt-2">{progress}%</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-400 p-4 text-center">
              <Upload className="w-8 h-8 mb-2" />
              <p className="text-xs font-medium text-white mb-1">Klik untuk upload</p>
              <p className="text-[10px]">Maksimal {maxSizeMB}MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
