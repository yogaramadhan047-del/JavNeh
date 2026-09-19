import { DbTimestamp } from "./supabase";
import { ContentCategory } from "./movie";

export type { ContentCategory };

export interface SeriesServer {
  id: string;
  name: string;
  url: string;
  quality: string;
  subtitle: string;
  isDefault: boolean;
}

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  servers: SeriesServer[];
}

export interface Series {
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
  episodes?: Episode[];
  totalSeasons?: number;
  totalEpisodes?: number;
  status?: string;
  synopsis: string;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt?: DbTimestamp;
  updatedAt?: DbTimestamp;
}
