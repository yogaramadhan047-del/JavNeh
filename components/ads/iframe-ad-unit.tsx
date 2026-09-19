"use client";

import { useAdvertisement } from "@/components/providers/advertisement-provider";
import { AdvertisementSettings } from "@/types/advertisement";

interface IframeAdUnitProps {
  placementKey: keyof AdvertisementSettings;
  className?: string;
  width?: number;
  height?: number;
}

export function IframeAdUnit({
  placementKey,
  className = "",
  width = 728,
  height = 90,
}: IframeAdUnitProps) {
  const { settings, loading } = useAdvertisement();

  if (loading) {
    return (
      <div
        className={`w-full max-w-[${width}px] h-[${height}px] mx-auto bg-card-dark border border-border-dark flex items-center justify-center rounded-xl animate-pulse ${className}`}
        style={{ width: "100%", maxWidth: width, height }}
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
          className={`w-full max-w-[${width}px] h-[${height}px] mx-auto bg-card-dark border border-border-dark border-dashed flex flex-col items-center justify-center rounded-xl overflow-hidden opacity-50 ${className}`}
          style={{ width: "100%", maxWidth: width, height }}
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
        className={`w-full max-w-[${width}px] h-[${height}px] mx-auto bg-card-dark border border-border-dark border-dashed flex flex-col items-center justify-center rounded-xl overflow-hidden opacity-50 ${className}`}
        style={{ width: "100%", maxWidth: width, height }}
      >
        <span className="text-text-muted text-[10px] font-medium tracking-widest">ADVERTISEMENT PLACEHOLDER</span>
        <span className="text-gray-600 text-[9px]">Ad Ready (Slot: {placementKey})</span>
      </div>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; overflow: hidden; background: transparent; }
        </style>
      </head>
      <body>
        ${rawHtml}
      </body>
    </html>
  `;

  return (
    <div className={`flex justify-center w-full ${className}`}>
      <div
        className="relative bg-card-dark border border-border-dark flex items-center justify-center overflow-hidden"
        style={{ width: "100%", maxWidth: width, height, minHeight: height }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 z-0 opacity-40">
          <span className="text-text-muted text-[10px] font-medium tracking-widest uppercase">Advertisement</span>
        </div>

        <iframe
          srcDoc={htmlContent}
          width={width}
          height={height}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          className={`w-full max-w-[${width}px] h-[${height}px] border-none relative z-10`}
          style={{ width: "100%", maxWidth: width, height, border: "none" }}
          scrolling="no"
          title={`Ad Placement ${placementKey}`}
        />
      </div>
    </div>
  );
}
