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

export const OFFICIAL_ADSTERRA_POPUNDER_URL =
  "https://cowardrainbowactual.com/f0/9b/f6/f09bf6d358c6da2677e46c32a14ee25c.js";
export const OFFICIAL_ADSTERRA_POPUNDER_SCRIPT = `<script src="${OFFICIAL_ADSTERRA_POPUNDER_URL}"></script>`;

export const DEFAULT_AD_SETTINGS: AdvertisementSettings = {
  adsEnabled: true,
  testMode: false,
  popunderScript: OFFICIAL_ADSTERRA_POPUNDER_SCRIPT,
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

/**
 * Normalizes database rows from Supabase into application SiteSettings (camelCase).
 * Handles both public.settings schema (with snake_case columns) and JSON value payloads.
 */
export function mapSettingsFromDb(row: Record<string, unknown> | null | undefined): SiteSettings {
  if (!row) return DEFAULT_SITE_SETTINGS;

  // If stored as JSON in `value`
  if (row.value && typeof row.value === "object" && !Array.isArray(row.value)) {
    const val = row.value as Record<string, unknown>;
    return {
      siteName: (val.siteName as string) ?? (val.site_name as string) ?? DEFAULT_SITE_SETTINGS.siteName,
      siteDescription: (val.siteDescription as string) ?? (val.site_description as string) ?? DEFAULT_SITE_SETTINGS.siteDescription,
      siteUrl: (val.siteUrl as string) ?? (val.site_url as string) ?? DEFAULT_SITE_SETTINGS.siteUrl,
      faviconUrl: (val.faviconUrl as string) ?? (val.favicon_url as string) ?? "",
      googleAnalyticsId: (val.googleAnalyticsId as string) ?? (val.google_analytics_id as string) ?? "",
      googleSearchConsole: (val.googleSearchConsole as string) ?? (val.google_search_console as string) ?? "",
      metaKeywords: (val.metaKeywords as string) ?? (val.meta_keywords as string) ?? DEFAULT_SITE_SETTINGS.metaKeywords,
      bannerText: (val.bannerText as string) ?? (val.banner_text as string) ?? "",
      bannerActive: Boolean(val.bannerActive ?? val.banner_active ?? false),
      updatedAt: (row.updated_at as string) ?? (val.updatedAt as string) ?? new Date().toISOString(),
    };
  }

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

/**
 * Normalizes application SiteSettings (camelCase) to database payload (strict snake_case).
 * NEVER includes camelCase keys to avoid PostgREST "Could not find column in schema cache" errors.
 */
export function mapSettingsToDb(settings: Partial<SiteSettings>, primaryKey: string = "general") {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    id: primaryKey,
    updated_at: now,
  };

  if (settings.siteName !== undefined) {
    payload.site_name = settings.siteName;
  }
  if (settings.siteDescription !== undefined) {
    payload.site_description = settings.siteDescription;
  }
  if (settings.siteUrl !== undefined) {
    payload.site_url = settings.siteUrl;
  }
  if (settings.faviconUrl !== undefined) {
    payload.favicon_url = settings.faviconUrl;
  }
  if (settings.googleAnalyticsId !== undefined) {
    payload.google_analytics_id = settings.googleAnalyticsId;
  }
  if (settings.googleSearchConsole !== undefined) {
    payload.google_search_console = settings.googleSearchConsole;
  }
  if (settings.metaKeywords !== undefined) {
    payload.meta_keywords = settings.metaKeywords;
  }
  if (settings.bannerText !== undefined) {
    payload.banner_text = settings.bannerText;
  }
  if (settings.bannerActive !== undefined) {
    payload.banner_active = Boolean(settings.bannerActive);
  }

  return payload;
}

/**
 * Normalizes database rows from Supabase into application AdvertisementSettings (camelCase).
 * Handles both public.advertisements schema (with snake_case columns) and legacy JSON value payloads.
 */
export function mapAdSettingsFromDb(row: Record<string, unknown> | null | undefined): AdvertisementSettings {
  if (!row) return DEFAULT_AD_SETTINGS;

  // If stored in JSON `value`
  if (row.value && typeof row.value === "object" && !Array.isArray(row.value)) {
    const val = row.value as Record<string, unknown>;
    const rawPopunder = (val.popunderScript as string) ?? (val.popunder_script as string) ?? "";
    return {
      adsEnabled: Boolean(val.adsEnabled ?? val.ads_enabled ?? true),
      testMode: Boolean(val.testMode ?? val.test_mode ?? false),
      popunderScript: rawPopunder.trim() ? rawPopunder : OFFICIAL_ADSTERRA_POPUNDER_SCRIPT,
      socialBarScript: (val.socialBarScript as string) ?? (val.social_bar_script as string) ?? "",
      inPagePushScript: (val.inPagePushScript as string) ?? (val.in_page_push_script as string) ?? "",
      smartlinkUrl: (val.smartlinkUrl as string) ?? (val.smartlink_url as string) ?? "",
      headerBanner1: (val.headerBanner1 as string) ?? (val.header_banner1 as string) ?? (val.header_banner_1 as string) ?? "",
      headerBanner2: (val.headerBanner2 as string) ?? (val.header_banner2 as string) ?? (val.header_banner_2 as string) ?? "",
      sidebarBanner: (val.sidebarBanner as string) ?? (val.sidebar_banner as string) ?? "",
      articleBanner: (val.articleBanner as string) ?? (val.article_banner as string) ?? "",
      movieDetailBanner: (val.movieDetailBanner as string) ?? (val.movie_detail_banner as string) ?? "",
      footerBanner1: (val.footerBanner1 as string) ?? (val.footer_banner1 as string) ?? (val.footer_banner_1 as string) ?? "",
      footerBanner2: (val.footerBanner2 as string) ?? (val.footer_banner2 as string) ?? (val.footer_banner_2 as string) ?? "",
      updatedAt: (row.updated_at as string) ?? (val.updatedAt as string) ?? new Date().toISOString(),
    };
  }

  const rawPopunder = (row.popunder_script as string) ?? (row.popunderScript as string) ?? "";
  return {
    adsEnabled: Boolean(row.ads_enabled ?? row.adsEnabled ?? true),
    testMode: Boolean(row.test_mode ?? row.testMode ?? false),
    popunderScript: rawPopunder.trim() ? rawPopunder : OFFICIAL_ADSTERRA_POPUNDER_SCRIPT,
    socialBarScript: (row.social_bar_script as string) ?? (row.socialBarScript as string) ?? "",
    inPagePushScript: (row.in_page_push_script as string) ?? (row.inPagePushScript as string) ?? "",
    smartlinkUrl: (row.smartlink_url as string) ?? (row.smartlinkUrl as string) ?? "",
    headerBanner1: (row.header_banner1 as string) ?? (row.headerBanner1 as string) ?? (row.header_banner_1 as string) ?? "",
    headerBanner2: (row.header_banner2 as string) ?? (row.headerBanner2 as string) ?? (row.header_banner_2 as string) ?? "",
    sidebarBanner: (row.sidebar_banner as string) ?? (row.sidebarBanner as string) ?? "",
    articleBanner: (row.article_banner as string) ?? (row.articleBanner as string) ?? "",
    movieDetailBanner: (row.movie_detail_banner as string) ?? (row.movieDetailBanner as string) ?? "",
    footerBanner1: (row.footer_banner1 as string) ?? (row.footerBanner1 as string) ?? (row.footer_banner_1 as string) ?? "",
    footerBanner2: (row.footer_banner2 as string) ?? (row.footerBanner2 as string) ?? (row.footer_banner_2 as string) ?? "",
    updatedAt: (row.updated_at as string) ?? (row.updatedAt as string) ?? new Date().toISOString(),
  };
}

/**
 * Normalizes application AdvertisementSettings (camelCase) to database payload (strict snake_case).
 * NEVER includes camelCase keys to avoid PostgREST "Could not find column in schema cache" errors.
 */
export function mapAdSettingsToDb(settings: Partial<AdvertisementSettings>, primaryKey: string = "advertisement") {
  const now = new Date().toISOString();
  return {
    id: primaryKey,
    ads_enabled: Boolean(settings.adsEnabled ?? true),
    test_mode: Boolean(settings.testMode ?? false),
    popunder_script: settings.popunderScript ?? "",
    social_bar_script: settings.socialBarScript ?? "",
    in_page_push_script: settings.inPagePushScript ?? "",
    smartlink_url: settings.smartlinkUrl ?? "",
    header_banner1: settings.headerBanner1 ?? "",
    header_banner2: settings.headerBanner2 ?? "",
    sidebar_banner: settings.sidebarBanner ?? "",
    article_banner: settings.articleBanner ?? "",
    movie_detail_banner: settings.movieDetailBanner ?? "",
    footer_banner1: settings.footerBanner1 ?? "",
    footer_banner2: settings.footerBanner2 ?? "",
    updated_at: now,
  };
}

/**
 * Fetch current website settings from public.settings table
 */
export async function getSiteSettings(key: string = "general"): Promise<SiteSettings> {
  try {
    // 1. Try querying by id = key
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", key)
      .maybeSingle();

    if (!error && data) {
      return mapSettingsFromDb(data);
    }

    // 2. Fallback: try querying first available row in settings table
    const { data: firstRow, error: firstRowError } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!firstRowError && firstRow) {
      return mapSettingsFromDb(firstRow);
    }

    // 3. Fallback: check if legacy key column exists
    const { data: keyRow } = await supabase
      .from("settings")
      .select("*")
      .filter("key", "eq", key)
      .maybeSingle();

    if (keyRow) {
      return mapSettingsFromDb(keyRow);
    }

    return DEFAULT_SITE_SETTINGS;
  } catch (err) {
    console.error("Error fetching site settings:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Update or insert site settings into public.settings table
 */
export async function saveSiteSettings(
  settings: SiteSettings,
  key: string = "general"
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = mapSettingsToDb(settings, key);

    // Primary save: upsert by id into public.settings
    const { error } = await supabase
      .from("settings")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert settings by id warning/error:", error.message);
      // Fallback: If table uses 'key' as primary key column instead of 'id'
      const legacyPayload: Record<string, unknown> = { ...payload, key };
      delete legacyPayload.id;
      const { error: keyError } = await supabase
        .from("settings")
        .upsert(legacyPayload, { onConflict: "key" });

      if (keyError) {
        console.error("Supabase upsert settings fallback error:", keyError);
        return { success: false, error: error.message || keyError.message };
      }
    }

    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan pengaturan";
    return { success: false, error: errorMsg };
  }
}

/**
 * Fetch advertisement settings
 * Queries dedicated public.advertisements table first, with fallback to public.settings
 */
export async function getAdSettings(key: string = "advertisement"): Promise<AdvertisementSettings> {
  try {
    // 1. Try dedicated public.advertisements table (as defined in supabase-schema.sql)
    const { data: adData, error: adError } = await supabase
      .from("advertisements")
      .select("*")
      .eq("id", key)
      .maybeSingle();

    if (!adError && adData) {
      return mapAdSettingsFromDb(adData);
    }

    // Fallback: first row of advertisements table
    const { data: firstAdRow, error: firstAdError } = await supabase
      .from("advertisements")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!firstAdError && firstAdRow) {
      return mapAdSettingsFromDb(firstAdRow);
    }

    // 2. Fallback: check if advertisements are saved inside public.settings table
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("id", key)
      .maybeSingle();

    if (!settingsError && settingsData) {
      return mapAdSettingsFromDb(settingsData);
    }

    // Check legacy 'key' column on settings table
    const { data: legacyData } = await supabase
      .from("settings")
      .select("*")
      .filter("key", "eq", key)
      .maybeSingle();

    if (legacyData) {
      return mapAdSettingsFromDb(legacyData);
    }

    return DEFAULT_AD_SETTINGS;
  } catch (err) {
    console.error("Error fetching ad settings:", err);
    return DEFAULT_AD_SETTINGS;
  }
}

/**
 * Save advertisement settings
 * Saves to dedicated public.advertisements table, with graceful fallback to public.settings
 */
export async function saveAdSettings(
  settings: AdvertisementSettings,
  key: string = "advertisement"
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = mapAdSettingsToDb(settings, key);

    // 1. Try upserting to public.advertisements table (defined in supabase-schema.sql)
    const { error: adError } = await supabase
      .from("advertisements")
      .upsert(payload, { onConflict: "id" });

    if (!adError) {
      return { success: true };
    }

    console.warn("Supabase upsert to advertisements table returned:", adError.message);

    // 2. Fallback: If advertisements table does not exist or schema differs, save to public.settings table
    // Only send valid columns or json to settings table
    const now = new Date().toISOString();
    const settingsPayload: Record<string, unknown> = {
      id: key,
      updated_at: now,
      value: settings,
    };

    const { error: settingsError } = await supabase
      .from("settings")
      .upsert(settingsPayload, { onConflict: "id" });

    if (settingsError) {
      // Legacy settings table with key column
      const legacyPayload = { key, updated_at: now, value: settings };
      const { error: legacyError } = await supabase
        .from("settings")
        .upsert(legacyPayload, { onConflict: "key" });

      if (legacyError) {
        console.error("Supabase upsert ad settings fallback error:", legacyError);
        return { success: false, error: adError.message || legacyError.message };
      }
    }

    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan pengaturan iklan";
    return { success: false, error: errorMsg };
  }
}
