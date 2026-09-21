"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAdvertisement } from "@/components/providers/advertisement-provider";
import { AdvertisementSettings } from "@/types/advertisement";

interface RawAdUnitProps {
  placementKey: keyof AdvertisementSettings;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  className?: string;
}

export function RawAdUnit({
  placementKey,
  mobileOnly = false,
  desktopOnly = false,
  className = "",
}: RawAdUnitProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const { settings, loading } = useAdvertisement();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdmin || loading || !settings?.adsEnabled) return;
    const rawHtml = settings[placementKey] as string;
    if (!rawHtml || settings.testMode) return;
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      try {
        const fragment = document.createRange().createContextualFragment(rawHtml);
        containerRef.current.appendChild(fragment);
      } catch (e) {
        console.error("Failed to inject ad script:", e);
      }
    }
  }, [settings, loading, placementKey, isAdmin]);

  if (isAdmin) return null;

  let visibilityClass = "";
  if (mobileOnly) visibilityClass = "block md:hidden";
  else if (desktopOnly) visibilityClass = "hidden md:block";
  else visibilityClass = "block";

  if (loading) {
    return (
      <div
        className={`w-full mx-auto bg-card-dark border border-border-dark flex items-center justify-center rounded-xl animate-pulse my-4 h-[90px] ${visibilityClass} ${className}`}
      >
        <span className="text-gray-600 text-xs">Loading Ad...</span>
      </div>
    );
  }

  if (!settings || !settings.adsEnabled) return null;

  const rawHtml = settings[placementKey] as string;
  if (!rawHtml) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          className={`w-full mx-auto p-4 bg-card-dark border border-border-dark border-dashed flex flex-col items-center justify-center rounded-xl overflow-hidden my-4 opacity-50 min-h-[90px] ${visibilityClass} ${className}`}
        >
          <span className="text-text-muted text-[10px] font-medium tracking-widest">ADVERTISEMENT PLACEHOLDER</span>
          <span className="text-gray-600 text-[9px]">Missing Script for {placementKey}</span>
        </div>
      );
    }
    return null;
  }

  if (settings.testMode) {
    return (
      <div
        className={`w-full mx-auto p-4 bg-card-dark border border-border-dark border-dashed flex flex-col items-center justify-center rounded-xl overflow-hidden my-4 opacity-50 min-h-[90px] ${visibilityClass} ${className}`}
      >
        <span className="text-text-muted text-[10px] font-medium tracking-widest">ADVERTISEMENT PLACEHOLDER</span>
        <span className="text-gray-600 text-[9px]">Ad Ready (Slot: {placementKey})</span>
      </div>
    );
  }

  return (
    <div
      className={`w-full overflow-hidden my-4 flex justify-center min-h-[90px] ${visibilityClass} ${className}`}
      ref={containerRef}
    />
  );
}
