import { supabase } from "@/lib/supabase";
import { SiteSettings } from "@/types/settings";
import { AdvertisementSettings } from "@/types/advertisement";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "XStream21",
  siteDescription: "Nonton anime dan drama Jepang gratis subtitle Indonesia",
  siteUrl: "https://xstream21.my.id",
  faviconUrl: "",
  googleAnalyticsId: "",
  googleSearchConsole: "",
  metaKeywords: "xstream21, nonton anime, drama jepang, dorama, anime sub indo",
  bannerText: "",
  bannerActive: false,
};

export const DEFAULT_AD_SETTINGS: AdvertisementSettings = {
  adsEnabled: true,
  testMode: false,
  popunderScript: "",
  socialBarScript: "",
  inPagePushScript: "",
  smartlinkUrl: "",
  headerBanner1: "",
  headerBanner2: "",
  sidebarBanner: "",
  articleBanner: "",
  movieDetailBanner: "",
  footerBanner1: "",
  footerBanner2: "",
};

export function mapSettingsFromDb(row: Record<string, unknown> | null | undefined): SiteSettings {
  if (!row) return DEFAULT_SITE_SETTINGS;

  return {
    siteName: (row.site_name as string) ?? (row.siteName as string) ?? DEFAULT_SITE_SETTINGS.siteName,
    siteDescription: (row.site_description as string) ?? (row.siteDescription as string) ?? DEFAULT_SITE_SETTINGS.siteDescription,
    siteUrl: (row.site_url as string) ?? (row.siteUrl as string) ?? DEFAULT_SITE_SETTINGS.siteUrl,
    faviconUrl: (row.favicon_url as string) ?? (row.faviconUrl as string) ?? "",
    googleAnalyticsId: (row.google_analytics_id as string) ?? (row.googleAnalyticsId as string) ?? "",
    googleSearchConsole: (row.google_search_console as string) ?? (row.googleSearchConsole as string) ?? "",
    metaKeywords: (row.meta_keywords as string) ?? (row.metaKeywords as string) ?? DEFAULT_SITE_SETTINGS.metaKeywords,
    bannerText: (row.banner_text as string) ?? (row.bannerText as string) ?? "",
    bannerActive: Boolean(row.banner_active ?? row.bannerActive ?? false),
    updatedAt: (row.updated_at as string) ?? (row.updatedAt as string) ?? new Date().toISOString(),
  };
}

export function mapSettingsToDb(settings: Partial<SiteSettings>, key: string = "general") {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    key,
    updated_at: now,
    updatedAt: now,
  };

  if (settings.siteName !== undefined) {
    payload.site_name = settings.siteName;
    payload.siteName = settings.siteName;
  }
  if (settings.siteDescription !== undefined) {
    payload.site_description = settings.siteDescription;
    payload.siteDescription = settings.siteDescription;
  }
  if (settings.siteUrl !== undefined) {
    payload.site_url = settings.siteUrl;
    payload.siteUrl = settings.siteUrl;
  }
  if (settings.faviconUrl !== undefined) {
    payload.favicon_url = settings.faviconUrl;
    payload.faviconUrl = settings.faviconUrl;
  }
  if (settings.googleAnalyticsId !== undefined) {
    payload.google_analytics_id = settings.googleAnalyticsId;
    payload.googleAnalyticsId = settings.googleAnalyticsId;
  }
  if (settings.googleSearchConsole !== undefined) {
    payload.google_search_console = settings.googleSearchConsole;
    payload.googleSearchConsole = settings.googleSearchConsole;
  }
  if (settings.metaKeywords !== undefined) {
    payload.meta_keywords = settings.metaKeywords;
    payload.metaKeywords = settings.metaKeywords;
  }
  if (settings.bannerText !== undefined) {
    payload.banner_text = settings.bannerText;
    payload.bannerText = settings.bannerText;
  }
  if (settings.bannerActive !== undefined) {
    payload.banner_active = settings.bannerActive;
    payload.bannerActive = settings.bannerActive;
  }

  // Also store raw JSON for maximum compatibility with any key-value schemas
  payload.value = settings;

  return payload;
}

/**
 * Fetch current website settings
 */
export async function getSiteSettings(key: string = "general"): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) {
      // Also try fetching the first row if key query doesn't match
      const { data: firstRow } = await supabase.from("settings").select("*").limit(1).maybeSingle();
      if (firstRow) {
        if (firstRow.value && typeof firstRow.value === "object") {
          return { ...DEFAULT_SITE_SETTINGS, ...(firstRow.value as Partial<SiteSettings>) };
        }
        return mapSettingsFromDb(firstRow);
      }
      return DEFAULT_SITE_SETTINGS;
    }

    if (data.value && typeof data.value === "object") {
      return { ...DEFAULT_SITE_SETTINGS, ...(data.value as Partial<SiteSettings>) };
    }

    return mapSettingsFromDb(data);
  } catch (err) {
    console.error("Error fetching site settings:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Update or insert site settings
 */
export async function saveSiteSettings(
  settings: SiteSettings,
  key: string = "general"
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = mapSettingsToDb(settings, key);

    const { error } = await supabase
      .from("settings")
      .upsert(payload, { onConflict: "key" });

    if (error) {
      console.error("Supabase upsert settings error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan pengaturan";
    return { success: false, error: errorMsg };
  }
}

/**
 * Fetch advertisement settings
 */
export async function getAdSettings(key: string = "advertisement"): Promise<AdvertisementSettings> {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_AD_SETTINGS;
    }

    if (data.value && typeof data.value === "object") {
      return { ...DEFAULT_AD_SETTINGS, ...(data.value as Partial<AdvertisementSettings>) };
    }

    return {
      adsEnabled: Boolean(data.ads_enabled ?? data.adsEnabled ?? true),
      testMode: Boolean(data.test_mode ?? data.testMode ?? false),
      popunderScript: (data.popunder_script as string) ?? (data.popunderScript as string) ?? "",
      socialBarScript: (data.social_bar_script as string) ?? (data.socialBarScript as string) ?? "",
      inPagePushScript: (data.in_page_push_script as string) ?? (data.inPagePushScript as string) ?? "",
      smartlinkUrl: (data.smartlink_url as string) ?? (data.smartlinkUrl as string) ?? "",
      headerBanner1: (data.header_banner_1 as string) ?? (data.headerBanner1 as string) ?? "",
      headerBanner2: (data.header_banner_2 as string) ?? (data.headerBanner2 as string) ?? "",
      sidebarBanner: (data.sidebar_banner as string) ?? (data.sidebarBanner as string) ?? "",
      articleBanner: (data.article_banner as string) ?? (data.articleBanner as string) ?? "",
      movieDetailBanner: (data.movie_detail_banner as string) ?? (data.movieDetailBanner as string) ?? "",
      footerBanner1: (data.footer_banner_1 as string) ?? (data.footerBanner1 as string) ?? "",
      footerBanner2: (data.footer_banner_2 as string) ?? (data.footerBanner2 as string) ?? "",
      updatedAt: (data.updated_at as string) ?? (data.updatedAt as string) ?? new Date().toISOString(),
    };
  } catch (err) {
    console.error("Error fetching ad settings:", err);
    return DEFAULT_AD_SETTINGS;
  }
}

/**
 * Save advertisement settings
 */
export async function saveAdSettings(
  settings: AdvertisementSettings,
  key: string = "advertisement"
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const payload = {
      key,
      value: settings,
      ads_enabled: settings.adsEnabled,
      test_mode: settings.testMode,
      updated_at: now,
      updatedAt: now,
    };

    const { error } = await supabase
      .from("settings")
      .upsert(payload, { onConflict: "key" });

    if (error) {
      console.error("Supabase upsert ad settings error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan pengaturan iklan";
    return { success: false, error: errorMsg };
  }
}
