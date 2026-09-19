import { DbTimestamp } from "./supabase";

export interface AdvertisementSettings {
  // Global Settings
  adsEnabled: boolean;
  testMode: boolean;
  // Global Scripts
  popunderScript: string;
  socialBarScript: string;
  inPagePushScript: string;
  // Direct Link / Smartlink
  smartlinkUrl: string;
  // Banner Placements
  headerBanner1: string;
  headerBanner2: string;
  sidebarBanner: string;
  articleBanner: string;
  movieDetailBanner: string;
  footerBanner1: string;
  footerBanner2: string;
  updatedAt?: DbTimestamp;
}
