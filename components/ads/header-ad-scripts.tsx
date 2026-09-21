"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAdvertisement } from "@/components/providers/advertisement-provider";

export function HeaderAdScripts() {
  const pathname = usePathname();
  const { settings, loading } = useAdvertisement();
  const injectedContainerRef = useRef<HTMLDivElement>(null);

  // Strictly block any execution on admin routes
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    // If on admin or ads disabled or loading, clean up any previously injected scripts
    if (isAdmin || loading || !settings?.adsEnabled) {
      if (injectedContainerRef.current) {
        injectedContainerRef.current.innerHTML = "";
      }
      return;
    }

    if (injectedContainerRef.current) {
      injectedContainerRef.current.innerHTML = "";

      const scripts = [
        settings.popunderScript,
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
  }, [settings, loading, isAdmin, pathname]);

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
