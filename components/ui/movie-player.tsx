"use client";

import { Movie, MovieServer } from "@/types/movie";
import { ContentPlayer } from "./content-player";
import { normalizeEmbedUrl } from "@/lib/embed";

interface MoviePlayerProps {
  movie?: Movie;
  servers?: MovieServer[];
  trailerUrl?: string;
  posterUrl?: string;
  title?: string;
  downloadUrl?: string;
  trapDownloadUrl?: string;
  realDownloadUrl?: string;
}

export function MoviePlayer(props: MoviePlayerProps) {
  const servers = (props.movie ? props.movie.servers : props.servers || []).map((s, idx) => {
    const rawUrl = s.url || s.embedUrl || "";
    const cleanUrl = normalizeEmbedUrl(rawUrl);
    return {
      id: s.id || `srv-${idx}`,
      name: s.name || `Server ${idx + 1}`,
      url: cleanUrl,
      embedUrl: cleanUrl,
      quality: s.quality || "1080p",
      subtitle: s.subtitle || "Indonesia",
      isDefault: s.isDefault ?? idx === 0,
    };
  });

  return (
    <ContentPlayer
      title={props.movie?.title || props.title}
      posterUrl={props.movie?.bannerUrl || props.movie?.posterUrl || props.posterUrl}
      trailerUrl={props.movie?.trailerUrl ? normalizeEmbedUrl(props.movie.trailerUrl) : props.trailerUrl}
      downloadUrl={props.movie?.downloadUrl || props.downloadUrl}
      trapDownloadUrl={props.movie?.trapDownloadUrl || props.trapDownloadUrl}
      realDownloadUrl={props.movie?.realDownloadUrl || props.realDownloadUrl}
      servers={servers}
      isSeries={false}
    />
  );
}
