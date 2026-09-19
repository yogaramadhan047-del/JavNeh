import { DbTimestamp } from "./supabase";

export interface WebsiteSettings {
  websiteName: string;
  websiteDescription: string;
  copyright: string;
  contactEmail: string;
  logoUrl: string;
  faviconUrl: string;
  googleAnalyticsId: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultKeywords: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    telegram: string;
    discord: string;
    youtube: string;
  };
  maintenanceMode: boolean;
  updatedAt?: DbTimestamp;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  faviconUrl: string;
  googleAnalyticsId: string;
  googleSearchConsole: string;
  metaKeywords: string;
  bannerText: string;
  bannerActive: boolean;
  updatedAt?: DbTimestamp;
}
