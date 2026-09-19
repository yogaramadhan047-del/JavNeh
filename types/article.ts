import { DbTimestamp } from "./supabase";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnailUrl: string;
  bannerUrl: string;
  category: string;
  tags: string[];
  author: string;
  status: "Draft" | "Published";
  featured: boolean;
  isGlobalNews?: boolean;
  views: number;
  readingTime: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  createdAt?: DbTimestamp;
  updatedAt?: DbTimestamp;
  publishedAt?: DbTimestamp;
  likes?: number;
  commentCount?: number;
}
