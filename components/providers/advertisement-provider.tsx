"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdvertisementSettings } from "@/types/advertisement";
import { getAdSettings, DEFAULT_AD_SETTINGS } from "@/lib/settings";
import { supabase } from "@/lib/supabase";

const AdvertisementContext = createContext<{ settings: AdvertisementSettings | null; loading: boolean }>({
  settings: null,
  loading: true,
});

export function AdvertisementProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: AdvertisementSettings | null;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  const [settings, setSettings] = useState<AdvertisementSettings | null>(initialSettings || null);
  const [loading, setLoading] = useState(!initialSettings);

  useEffect(() => {
    let isMounted = true;

    // If on admin route, we don't need to fetch ad settings from network or subscribe
    if (isAdmin) {
      return;
    }

    // Always fetch fresh advertisement settings from Supabase for public pages
    getAdSettings("advertisement")
      .then((data) => {
        if (isMounted && data) {
          setSettings(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load advertisement settings:", error);
        if (isMounted) {
          setSettings((prev) => prev || DEFAULT_AD_SETTINGS);
          setLoading(false);
        }
      });

    const channel = supabase
      .channel("public-ad-settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "advertisements" },
        () => {
          getAdSettings("advertisement").then((data) => {
            if (isMounted && data) {
              setSettings(data);
            }
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => {
          getAdSettings("advertisement").then((data) => {
            if (isMounted && data) {
              setSettings(data);
            }
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // If on admin routes, dynamically inject ad-disabled settings to context
  const activeSettings = isAdmin
    ? {
        ...(settings || DEFAULT_AD_SETTINGS),
        adsEnabled: false,
        popunderScript: "",
        socialBarScript: "",
        inPagePushScript: "",
        headerBanner1: "",
        headerBanner2: "",
        footerBanner1: "",
        footerBanner2: "",
        sidebarBanner: "",
        movieDetailBanner: "",
        articleBanner: "",
        directLink1: "",
        directLink2: "",
      }
    : settings;

  return (
    <AdvertisementContext.Provider value={{ settings: activeSettings, loading: isAdmin ? false : loading }}>
      {children}
    </AdvertisementContext.Provider>
  );
}

export const useAdvertisement = () => useContext(AdvertisementContext);
