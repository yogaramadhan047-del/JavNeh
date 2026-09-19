"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error instanceof Error ? error.message : String(error));
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="w-24 h-24 text-danger mb-6" />
      <h1 className="text-3xl font-bold mb-4 text-text-main">Terjadi Kesalahan</h1>
      <p className="text-text-muted mb-8 max-w-md">
        Maaf, sistem kami mengalami kendala teknis. Silakan coba beberapa saat lagi.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center justify-center bg-card-dark text-text-main border border-border-dark px-8 py-3 rounded-full font-medium hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue cursor-pointer"
      >
        Coba Lagi
      </button>
    </div>
  );
}
