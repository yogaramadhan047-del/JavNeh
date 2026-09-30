import { DbTimestamp } from "./supabase";

export type ContentCategory = string;

export const BADGE_OPTIONS = ["New", "Top", "Hot"] as const;
export type BadgeType = (typeof BADGE_OPTIONS)[number];

export const RESOLUTION_OPTIONS = [
  "360p",
  "480p",
  "720p",
  "1080p",
  "1440p",
  "2160p / 4K",
] as const;
export type ResolutionType = (typeof RESOLUTION_OPTIONS)[number];

export interface MovieServer {
  id?: string;
  name: string;
  url: string;
  embedUrl?: string;
  quality?: string;
  subtitle?: string;
  isDefault?: boolean;
}

export interface Movie {
  id: string;
  category: ContentCategory;
  title: string;
  slug: string;
  originalTitle: string;
  year: number;
  releaseDate: string;
  rating: number;
  imdb: number;
  genres: string[];
  tags: string[];
  country: string;
  language: string;
  duration: string;
  subtitle: string;
  studio: string;
  resolution: string;
  badge: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  downloadUrl?: string;
  trapDownloadUrl?: string;
  realDownloadUrl?: string;
  servers: MovieServer[];
  synopsis: string;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  isSeries?: boolean;
  createdAt?: DbTimestamp;
  updatedAt?: DbTimestamp;
  status?: string;
}
