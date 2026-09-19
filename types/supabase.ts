export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Universal timestamp representation: string (Supabase ISO-8601) or Date
export type DbTimestamp = any;

export interface Database {
  public: {
    Tables: {
      movies: {
        Row: {
          id: string;
          category: string;
          title: string;
          slug: string;
          original_title: string;
          year: number;
          release_date: string;
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
          poster_url: string;
          banner_url: string;
          trailer_url: string;
          download_url: string | null;
          trap_download_url: string | null;
          real_download_url: string | null;
          servers: Json;
          synopsis: string;
          views: number;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["movies"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["movies"]["Row"]>;
      };
      series: {
        Row: {
          id: string;
          category: string;
          status: string;
          title: string;
          slug: string;
          original_title: string;
          year: number;
          release_date: string;
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
          poster_url: string;
          banner_url: string;
          trailer_url: string;
          download_url: string | null;
          trap_download_url: string | null;
          real_download_url: string | null;
          episodes: Json;
          total_seasons: number;
          total_episodes: number;
          synopsis: string;
          views: number;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["series"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["series"]["Row"]>;
      };
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          thumbnail_url: string;
          banner_url: string;
          category: string;
          tags: string[];
          author: string;
          status: "Draft" | "Published";
          featured: boolean;
          is_global_news: boolean;
          views: number;
          reading_time: number;
          seo_title: string;
          seo_description: string;
          seo_keywords: string;
          likes: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["articles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["articles"]["Row"]>;
      };
      genres: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          icon: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["genres"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["genres"]["Row"]>;
      };
      settings: {
        Row: {
          id: string;
          site_name: string;
          site_description: string;
          site_url: string;
          favicon_url: string;
          google_analytics_id: string;
          google_search_console: string;
          meta_keywords: string;
          banner_text: string;
          banner_active: boolean;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
      };
      advertisements: {
        Row: {
          id: string;
          ads_enabled: boolean;
          test_mode: boolean;
          popunder_script: string;
          social_bar_script: string;
          in_page_push_script: string;
          smartlink_url: string;
          header_banner1: string;
          header_banner2: string;
          sidebar_banner: string;
          article_banner: string;
          movie_detail_banner: string;
          footer_banner1: string;
          footer_banner2: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["advertisements"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["advertisements"]["Row"]>;
      };
    };
  };
}
