"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  const [settings, setSettings] = useState<AdvertisementSettings | null>(initialSettings || null);
  const [loading, setLoading] = useState(!initialSettings);

  useEffect(() => {
    let isMounted = true;

    if (!initialSettings) {
      getAdSettings("advertisement")
        .then((data) => {
          if (isMounted) {
            setSettings(data);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("Failed to load advertisement settings:", error);
          if (isMounted) {
            setSettings(DEFAULT_AD_SETTINGS);
            setLoading(false);
          }
        });
    }

    const channel = supabase
      .channel("public-ad-settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "advertisements" },
        () => {
          getAdSettings("advertisement").then((data) => {
            if (isMounted) {
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
            if (isMounted) {
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
  }, [initialSettings]);

  return (
    <AdvertisementContext.Provider value={{ settings, loading }}>
      {children}
    </AdvertisementContext.Provider>
  );
}

export const useAdvertisement = () => useContext(AdvertisementContext);
