"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Heart, X } from "lucide-react";

const subscribe = () => () => {};

export function ApologyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    const hasSeen = typeof window !== "undefined" ? sessionStorage.getItem("xstream21_apology_dismissed") : null;
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("xstream21_apology_dismissed", "true");
    }
  };

  if (!isMounted) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-md bg-card-dark border border-white/10 rounded-2xl p-6 shadow-2xl relative z-50 overflow-hidden transform transition-all">
        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-blue/20 rounded-full blur-3xl pointer-events-none" />
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center text-center mt-2 relative z-10">
          <div className="w-12 h-12 bg-primary-blue/10 border border-primary-blue/20 rounded-full flex items-center justify-center mb-4 text-primary-blue">
            <Heart className="w-6 h-6 fill-primary-blue/20" />
          </div>

          <h2 className="text-xl font-bold text-white mb-4">Catatan dari Tim XStream21</h2>

          <div className="space-y-3 text-sm text-text-muted leading-relaxed mb-8">
            <p>Selamat datang di XStream21!</p>
            <p>
              Kami segenap tim XStream21 ingin menyampaikan permohonan maaf yang sebesar-besarnya apabila
              banyaknya iklan yang tampil sempat mengganggu kenyamanan Anda saat menikmati hiburan.
            </p>
            <p>
              Namun, dukungan dari iklan-iklan inilah yang membuat website ini dapat terus bertahan,
              berkembang, dan konsisten memberikan layanan streaming Movie & TV Series berkualitas untuk Anda semua.
            </p>
            <p className="text-white font-medium">
              Terima kasih banyak atas pengertian, dukungan, dan kesetiaan Anda!
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium rounded-xl transition-all active:scale-[0.98] cursor-pointer"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
