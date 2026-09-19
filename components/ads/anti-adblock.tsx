"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";

export function AntiAdBlock() {
  const [isAdBlockActive, setIsAdBlockActive] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't run in admin routes
    if (pathname?.startsWith("/admin")) return;

    const checkAdBlockers = async () => {
      let adBlockDetected = false;

      // Bait Element Check
      const bait = document.createElement("div");
      bait.className =
        "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links ad-text adSense adBlock adContent adBanner";
      bait.style.width = "1px";
      bait.style.height = "1px";
      bait.style.position = "absolute";
      bait.style.left = "-10000px";
      bait.style.top = "-1000px";
      document.body.appendChild(bait);

      await new Promise((resolve) => setTimeout(resolve, 150));
      const baitStyle = window.getComputedStyle(bait);
      if (
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        baitStyle.display === "none" ||
        baitStyle.visibility === "hidden"
      ) {
        adBlockDetected = true;
      }

      if (document.body.contains(bait)) {
        document.body.removeChild(bait);
      }

      // Script/Fetch Bait
      if (!adBlockDetected) {
        try {
          await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-store",
          });
        } catch {
          adBlockDetected = true;
        }
      }

      if (adBlockDetected) {
        setIsAdBlockActive(true);
        document.body.style.overflow = "hidden";
      } else {
        setIsAdBlockActive(false);
        document.body.style.overflow = "";
      }
    };

    checkAdBlockers();
    const interval = setInterval(checkAdBlockers, 5000);
    return () => {
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, [pathname]);

  if (!isAdBlockActive) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card-dark border border-border-dark rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">Ad-Block Detected!</h2>

          <p className="text-text-muted mb-8 text-sm leading-relaxed">
            Please disable your ad-blocker to support <strong className="text-white">XStream21</strong> and continue
            streaming. We rely on ads to keep the servers running and provide you with free HD anime & drama.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3.5 bg-primary-blue hover:bg-primary-blue/90 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            I have disabled my Ad-Block / Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
