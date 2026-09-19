-- ==============================================================================
-- XStream21 / Supabase Complete Database & Storage Security Schema
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. Movies Table (with strict category check)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.movies (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  category TEXT NOT NULL CHECK (category IN ('Anime', 'Drama Jepang')) DEFAULT 'Anime',
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  original_title TEXT DEFAULT '',
  year INTEGER DEFAULT 2024,
  release_date TEXT DEFAULT '',
  rating NUMERIC DEFAULT 0,
  imdb NUMERIC DEFAULT 0,
  genres TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  country TEXT DEFAULT '',
  language TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  subtitle TEXT DEFAULT 'Indonesia',
  studio TEXT DEFAULT '',
  resolution TEXT DEFAULT 'HD',
  badge TEXT DEFAULT 'CAM',
  poster_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  trailer_url TEXT DEFAULT '',
  trap_download_url TEXT DEFAULT '',
  real_download_url TEXT DEFAULT '',
  servers JSONB DEFAULT '[]'::JSONB,
  synopsis TEXT DEFAULT '',
  views INTEGER DEFAULT 0,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  seo_keywords TEXT DEFAULT '',
  status TEXT DEFAULT 'Published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure category column & constraint exist on existing movies table
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Anime';
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'movies_category_check'
  ) THEN
    ALTER TABLE public.movies
      ADD CONSTRAINT movies_category_check CHECK (category IN ('Anime', 'Drama Jepang'));
  END IF;
END $$;

-- ==============================================================================
-- 3. Series Table (with strict category and status check)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.series (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  category TEXT NOT NULL CHECK (category IN ('Anime', 'Drama Jepang')) DEFAULT 'Drama Jepang',
  status TEXT DEFAULT 'Ongoing',
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  original_title TEXT DEFAULT '',
  year INTEGER DEFAULT 2024,
  release_date TEXT DEFAULT '',
  rating NUMERIC DEFAULT 0,
  imdb NUMERIC DEFAULT 0,
  genres TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  country TEXT DEFAULT '',
  language TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  subtitle TEXT DEFAULT 'Indonesia',
  studio TEXT DEFAULT '',
  resolution TEXT DEFAULT 'HD',
  badge TEXT DEFAULT 'Ongoing',
  poster_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  trailer_url TEXT DEFAULT '',
  trap_download_url TEXT DEFAULT '',
  real_download_url TEXT DEFAULT '',
  episodes JSONB DEFAULT '[]'::JSONB,
  total_seasons INTEGER DEFAULT 1,
  total_episodes INTEGER DEFAULT 1,
  synopsis TEXT DEFAULT '',
  views INTEGER DEFAULT 0,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  seo_keywords TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure category and status columns & constraint exist on existing series table
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Drama Jepang';
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ongoing';
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS total_seasons INTEGER DEFAULT 1;
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS total_episodes INTEGER DEFAULT 1;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'series_category_check'
  ) THEN
    ALTER TABLE public.series
      ADD CONSTRAINT series_category_check CHECK (category IN ('Anime', 'Drama Jepang'));
  END IF;
END $$;

-- ==============================================================================
-- 4. Articles Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  category TEXT DEFAULT 'Berita',
  tags TEXT[] DEFAULT '{}',
  author TEXT DEFAULT 'Admin',
  status TEXT DEFAULT 'Published',
  featured BOOLEAN DEFAULT false,
  is_global_news BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 3,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  seo_keywords TEXT DEFAULT '',
  likes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. Genres Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.genres (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. Settings Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  site_name TEXT DEFAULT 'XStream21',
  site_description TEXT DEFAULT '',
  site_url TEXT DEFAULT 'https://xstream21.my.id',
  favicon_url TEXT DEFAULT '',
  google_analytics_id TEXT DEFAULT '',
  google_search_console TEXT DEFAULT '',
  meta_keywords TEXT DEFAULT '',
  banner_text TEXT DEFAULT '',
  banner_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. Advertisements Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.advertisements (
  id TEXT PRIMARY KEY,
  ads_enabled BOOLEAN DEFAULT true,
  test_mode BOOLEAN DEFAULT false,
  popunder_script TEXT DEFAULT '',
  social_bar_script TEXT DEFAULT '',
  in_page_push_script TEXT DEFAULT '',
  smartlink_url TEXT DEFAULT '',
  header_banner1 TEXT DEFAULT '',
  header_banner2 TEXT DEFAULT '',
  sidebar_banner TEXT DEFAULT '',
  article_banner TEXT DEFAULT '',
  movie_detail_banner TEXT DEFAULT '',
  footer_banner1 TEXT DEFAULT '',
  footer_banner2 TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. Comments Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT DEFAULT '',
  movie_id TEXT REFERENCES public.movies(id) ON DELETE CASCADE,
  article_id TEXT REFERENCES public.articles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. Analytics Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.analytics (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  page_path TEXT NOT NULL,
  views INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_movies_category ON public.movies(category);
CREATE INDEX IF NOT EXISTS idx_movies_slug ON public.movies(slug);
CREATE INDEX IF NOT EXISTS idx_movies_created_at ON public.movies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movies_status ON public.movies(status);

CREATE INDEX IF NOT EXISTS idx_series_category ON public.series(category);
CREATE INDEX IF NOT EXISTS idx_series_slug ON public.series(slug);
CREATE INDEX IF NOT EXISTS idx_series_created_at ON public.series(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_series_status ON public.series(status);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);

CREATE INDEX IF NOT EXISTS idx_genres_slug ON public.genres(slug);

-- ==============================================================================
-- 11. Storage Buckets Creation
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('posters', 'posters', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('favicons', 'favicons', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 12. Storage Security Policies
-- DROP ANY LEGACY PUBLIC WRITE POLICIES FIRST
-- ==============================================================================
DROP POLICY IF EXISTS "Public Insert Access on posters" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access on banners" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access on thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access on favicons" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access on media" ON storage.objects;

DROP POLICY IF EXISTS "Public Update Access on posters" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access on banners" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access on thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access on favicons" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access on media" ON storage.objects;

DROP POLICY IF EXISTS "Public Delete Access on posters" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access on banners" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access on thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access on favicons" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access on media" ON storage.objects;

-- 12.1 Enforce Public READ (SELECT) only on all media buckets
DROP POLICY IF EXISTS "Public Read Access on posters" ON storage.objects;
CREATE POLICY "Public Read Access on posters" ON storage.objects FOR SELECT USING (bucket_id = 'posters');

DROP POLICY IF EXISTS "Public Read Access on banners" ON storage.objects;
CREATE POLICY "Public Read Access on banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Public Read Access on thumbnails" ON storage.objects;
CREATE POLICY "Public Read Access on thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');

DROP POLICY IF EXISTS "Public Read Access on favicons" ON storage.objects;
CREATE POLICY "Public Read Access on favicons" ON storage.objects FOR SELECT USING (bucket_id = 'favicons');

DROP POLICY IF EXISTS "Public Read Access on media" ON storage.objects;
CREATE POLICY "Public Read Access on media" ON storage.objects FOR SELECT USING (bucket_id = 'media');

-- 12.2 Enforce Authenticated / Admin ONLY for INSERT, UPDATE, and DELETE
DROP POLICY IF EXISTS "Authenticated Insert on posters" ON storage.objects;
CREATE POLICY "Authenticated Insert on posters" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'posters');

DROP POLICY IF EXISTS "Authenticated Update on posters" ON storage.objects;
CREATE POLICY "Authenticated Update on posters" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'posters') WITH CHECK (bucket_id = 'posters');

DROP POLICY IF EXISTS "Authenticated Delete on posters" ON storage.objects;
CREATE POLICY "Authenticated Delete on posters" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'posters');

DROP POLICY IF EXISTS "Authenticated Insert on banners" ON storage.objects;
CREATE POLICY "Authenticated Insert on banners" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');

DROP POLICY IF EXISTS "Authenticated Update on banners" ON storage.objects;
CREATE POLICY "Authenticated Update on banners" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'banners') WITH CHECK (bucket_id = 'banners');

DROP POLICY IF EXISTS "Authenticated Delete on banners" ON storage.objects;
CREATE POLICY "Authenticated Delete on banners" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Authenticated Insert on thumbnails" ON storage.objects;
CREATE POLICY "Authenticated Insert on thumbnails" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'thumbnails');

DROP POLICY IF EXISTS "Authenticated Update on thumbnails" ON storage.objects;
CREATE POLICY "Authenticated Update on thumbnails" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'thumbnails') WITH CHECK (bucket_id = 'thumbnails');

DROP POLICY IF EXISTS "Authenticated Delete on thumbnails" ON storage.objects;
CREATE POLICY "Authenticated Delete on thumbnails" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'thumbnails');

DROP POLICY IF EXISTS "Authenticated Insert on favicons" ON storage.objects;
CREATE POLICY "Authenticated Insert on favicons" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'favicons');

DROP POLICY IF EXISTS "Authenticated Update on favicons" ON storage.objects;
CREATE POLICY "Authenticated Update on favicons" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'favicons') WITH CHECK (bucket_id = 'favicons');

DROP POLICY IF EXISTS "Authenticated Delete on favicons" ON storage.objects;
CREATE POLICY "Authenticated Delete on favicons" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'favicons');

DROP POLICY IF EXISTS "Authenticated Insert on media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated Update on media" ON storage.objects;
CREATE POLICY "Authenticated Update on media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated Delete on media" ON storage.objects;
CREATE POLICY "Authenticated Delete on media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');
