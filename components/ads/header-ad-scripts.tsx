"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAdvertisement } from "@/components/providers/advertisement-provider";
import { OFFICIAL_ADSTERRA_POPUNDER_URL } from "@/lib/settings";

const POPUNDER_SCRIPT_ID = "adsterra-anti-adblock-popunder";

/**
 * Helper to extract script src from an HTML string or return the string if it's already a URL
 */
function extractScriptSrc(htmlOrUrl: string): string | null {
  if (!htmlOrUrl) return null;
  const trimmed = htmlOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export function HeaderAdScripts() {
  const pathname = usePathname();
  const { settings, loading } = useAdvertisement();
  const injectedContainerRef = useRef<HTMLDivElement>(null);

  // Strictly block any execution on admin routes
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  // 1. POPUNDER SCRIPT: Singleton lifecycle (loaded once per browser page lifecycle, immune to pathname changes)
  useEffect(() => {
    // If on admin or ads disabled or loading, do not inject and remove if present
    if (isAdmin || loading || !settings?.adsEnabled) {
      const existingScript = document.getElementById(POPUNDER_SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }
      return;
    }

    // Determine target popunder URL (strictly using official Adsterra Anti-AdBlock Popunder)
    const configuredSrc = extractScriptSrc(settings.popunderScript || "");
    const targetSrc = configuredSrc && configuredSrc.includes("cowardrainbowactual.com")
      ? configuredSrc
      : OFFICIAL_ADSTERRA_POPUNDER_URL;

    // Check if script already exists by stable ID or by exact source URL
    const existingById = document.getElementById(POPUNDER_SCRIPT_ID);
    const existingBySrc = document.querySelector(`script[src="${targetSrc}"]`);

    if (existingById || existingBySrc) {
      // Script is already active and running; do not duplicate
      return;
    }

    // Clean up any stale or conflicting popunder scripts before mounting new one
    const stalePopunders = document.querySelectorAll(
      `script[id="${POPUNDER_SCRIPT_ID}"], script[src*="cowardrainbowactual.com"]`
    );
    stalePopunders.forEach((el) => el.remove());

    try {
      const script = document.createElement("script");
      script.id = POPUNDER_SCRIPT_ID;
      script.src = targetSrc;
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      document.head.appendChild(script);
    } catch (e) {
      console.error("Failed to inject Adsterra Anti-AdBlock Popunder:", e);
    }
  }, [settings?.adsEnabled, settings?.popunderScript, loading, isAdmin]);

  // 2. SOCIAL BAR & IN-PAGE PUSH: Handled separately in the container, re-evaluates safely on route changes
  useEffect(() => {
    if (isAdmin || loading || !settings?.adsEnabled) {
      if (injectedContainerRef.current) {
        injectedContainerRef.current.innerHTML = "";
      }
      return;
    }

    if (injectedContainerRef.current) {
      injectedContainerRef.current.innerHTML = "";

      // Only inject Social Bar and In-Page Push here (Popunder is strictly handled above)
      const scripts = [
        settings.socialBarScript,
        settings.inPagePushScript,
      ].filter(Boolean) as string[];

      for (const scriptContent of scripts) {
        try {
          const fragment = document.createRange().createContextualFragment(scriptContent);
          injectedContainerRef.current.appendChild(fragment);
        } catch (e) {
          console.error("Failed to inject header ad script:", e);
        }
      }
    }
  }, [settings?.socialBarScript, settings?.inPagePushScript, settings?.adsEnabled, loading, isAdmin, pathname]);

  // NEVER render on admin routes
  if (isAdmin) return null;

  return (
    <div
      ref={injectedContainerRef}
      id="xstream-header-ad-scripts-container"
      className="xstream-header-ad-scripts"
    />
  );
}
