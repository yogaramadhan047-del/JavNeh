import { ContentCategory } from "./movie";

export type { ContentCategory };

export interface UnifiedServer {
  id?: string;
  name: string;
  url: string;
  embedUrl?: string;
  quality?: string;
  subtitle?: string;
  isDefault?: boolean;
}

export interface UnifiedEpisode {
  id: string;
  title: string;
  episodeNumber: number;
  servers: UnifiedServer[];
}

export interface UnifiedContent {
  id: string;
  category: ContentCategory;
  title: string;
  originalTitle?: string;
  slug: string;
  synopsis: string;
  year: number;
  releaseDate?: string;
  rating: number;
  imdb?: number;
  genres: string[];
  tags?: string[];
  country?: string;
  language?: string;
  duration?: string;
  subtitle?: string;
  studio?: string;
  imageUrl: string;
  posterUrl?: string;
  bannerUrl?: string;
  badge?: string;
  resolution?: string;
  status?: string;
  views: number;
  streamingUrl?: string;
  downloadUrl?: string;
  trapDownloadUrl?: string;
  realDownloadUrl?: string;
  trailerUrl?: string;
  servers: UnifiedServer[];
  episodes?: UnifiedEpisode[];
  totalEpisodes?: number;
  totalSeasons?: number;
  isSeries?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
