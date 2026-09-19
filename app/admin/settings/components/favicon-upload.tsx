"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadToSupabaseStorage, STORAGE_BUCKETS } from "@/lib/supabase";

interface FaviconUploadProps {
  value: string;
  onChange: (url: string) => void;
  path: string;
  maxSizeMB: number;
  label: string;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  onError: (msg: string) => void;
  disabled?: boolean;
}

export function FaviconUpload({
  value,
  onChange,
  path,
  maxSizeMB,
  label,
  onUploadStart,
  onUploadEnd,
  onError,
  disabled,
}: FaviconUploadProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = localPreview || value;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      onError("Hanya menerima file png, ico, svg.");
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
      const cleanFolder = path ? path.replace(/[^a-zA-Z0-9_-]/g, "") : "favicons";
      setProgress(50);
      const result = await uploadToSupabaseStorage(file, STORAGE_BUCKETS.FAVICONS, cleanFolder);
      setProgress(95);

      if (result.error || !result.url) {
        console.error("Upload error:", result.error);
        onError(result.error || "Upload favicon gagal.");
        setLocalPreview(null);
      } else {
        setLocalPreview(null);
        onChange(result.url);
      }
    } catch (err) {
      console.error(err);
      onError("Terjadi kesalahan saat upload favicon.");
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
        accept=".png,.ico,.svg,image/png,image/x-icon,image/svg+xml"
        onChange={handleFileChange}
      />

      {preview ? (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border-dark group bg-background-dark/50">
          <Image src={preview} alt="Preview" fill className="object-contain p-2" referrerPolicy="no-referrer" />

          {isUploading ? (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2">
              <Loader2 className="w-6 h-6 text-primary-blue animate-spin mb-2" />
              <div className="w-full h-1 bg-background-dark rounded-full overflow-hidden">
                <div className="h-full bg-primary-blue transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className="w-full h-1/2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-medium backdrop-blur-sm transition-colors cursor-pointer"
              >
                Replace
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
                className="w-full h-1/2 bg-danger/20 hover:bg-danger/40 text-danger text-[10px] font-medium backdrop-blur-sm transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
            disabled || isUploading
              ? "border-border-dark bg-background-dark/50 cursor-not-allowed"
              : "border-border-dark hover:border-primary-blue hover:bg-white/5 bg-background-dark"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin mb-2" />
              <div className="w-16 h-1 bg-card-dark rounded-full overflow-hidden">
                <div className="h-full bg-primary-blue transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-400 p-2 text-center">
              <Upload className="w-6 h-6 mb-1" />
              <p className="text-[10px] font-medium text-white mb-0.5">Upload</p>
              <p className="text-[9px]">Max {maxSizeMB}MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
