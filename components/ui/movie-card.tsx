import Link from "next/link";
import { Star, Play } from "lucide-react";
import { SafeImage } from "./safe-image";
import { Movie } from "@/types/movie";

export interface MovieCardItem {
  id: string;
  title: string;
  slug?: string;
  posterUrl?: string;
  bannerUrl?: string;
  thumbnailUrl?: string;
  year?: number;
  rating?: number;
  imdb?: number;
  genres?: string[];
  duration?: string;
  resolution?: string;
  badge?: string;
  category?: string;
  country?: string;
  isSeries?: boolean;
  createdAt?: string | Date;
}

interface MovieCardProps {
  movie: MovieCardItem | Movie;
  baseUrl?: string;
  basePath?: string;
  priority?: boolean;
}

export function MovieCard({ movie, baseUrl, basePath, priority = false }: MovieCardProps) {
  const ratingVal = movie.imdb || movie.rating;
  const displayRating = ratingVal && ratingVal > 0 ? Number(ratingVal).toFixed(1) : null;

  const isJapaneseDrama = movie.category === "Drama Jepang";

  const targetPrefix = baseUrl || basePath || (isJapaneseDrama ? "/drama-jepang" : "/anime");
  const href = `${targetPrefix}/${movie.slug || movie.id}`;

  // Image source priority: bannerUrl first for landscape format, falling back to thumbnailUrl or posterUrl
  const imageUrl = movie.bannerUrl || movie.posterUrl || (movie as any).thumbnailUrl || "";

  // Badge text determination (New / Top / Hot)
  const rawBadge = movie.badge?.trim();
  const hasBadge = Boolean(rawBadge);
  const normalizedBadge = rawBadge?.toLowerCase();

  let badgeColorClass = "bg-primary-blue/95";
  if (normalizedBadge === "hot") {
    badgeColorClass = "bg-red-600/95";
  } else if (normalizedBadge === "new") {
    badgeColorClass = "bg-emerald-600/95";
  } else if (normalizedBadge === "top") {
    badgeColorClass = "bg-amber-600/95";
  }

  // Resolution text (e.g., 360p, 480p, 720p, 1080p, 1440p, 2160p / 4K)
  const resolutionText = movie.resolution?.trim();
  const hasResolution = Boolean(resolutionText);

  return (
    <Link
      prefetch={false}
      href={href}
      className="group flex flex-col bg-card-dark rounded-xl overflow-hidden border border-border-dark hover:border-primary-blue transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-primary-blue/20"
    >
      {/* Landscape Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-900/60 shrink-0">
        <SafeImage
          src={imageUrl}
          alt={movie.title}
          type="banner"
          fill
          priority={priority}
          className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
          referrerPolicy="no-referrer"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary-blue/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.6)] text-white">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Top Left Badge: New / Top / Hot */}
        {hasBadge && (
          <div className="absolute top-2 left-2 z-10">
            <span className={`${badgeColorClass} backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-wider`}>
              {rawBadge}
            </span>
          </div>
        )}

        {/* Top Right: Rating / IMDb */}
        {displayRating && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-accent-gold text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-md border border-accent-gold/20 z-10">
            <Star className="w-3 h-3 fill-accent-gold" />
            <span>{displayRating}</span>
          </div>
        )}

        {/* Bottom Right: Resolution Badge */}
        {hasResolution && (
          <div className="absolute bottom-2 right-2 z-10">
            <span className="bg-black/80 backdrop-blur-md text-gray-200 text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded border border-white/20 shadow-md">
              {resolutionText}
            </span>
          </div>
        )}
      </div>

      {/* Content & Metadata */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-text-main group-hover:text-primary-blue transition-colors duration-200 line-clamp-1">
            {movie.title}
          </h3>
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[11px] sm:text-xs text-text-muted">
          <div className="flex items-center gap-1.5 shrink-0">
            <span>{movie.year || "-"}</span>
            {movie.duration && (
              <>
                <span className="text-gray-600">•</span>
                <span>{movie.duration}</span>
              </>
            )}
          </div>
          <span className="truncate max-w-[50%] text-right font-medium text-gray-400">
            {movie.genres?.[0] || ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
