"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push("/");
        }
      }}
      className="inline-flex items-center text-sm font-medium text-text-muted hover:text-text-main mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5"
      aria-label="Kembali"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Kembali
    </button>
  );
}
