"use client";

import { Episode, SeriesServer } from "@/types/series";
import { ContentPlayer } from "./content-player";
import { normalizeEmbedUrl } from "@/lib/embed";
import { UnifiedServer, UnifiedEpisode } from "@/types/content";

interface ServerItem {
  id?: string;
  name: string;
  url: string;
  quality?: string;
}

interface DramaPlayerProps {
  isSeries?: boolean;
  episodes?: Episode[];
  servers?: ServerItem[];
  trailerUrl?: string;
  posterUrl?: string;
  title: string;
  downloadUrl?: string;
  trapDownloadUrl?: string;
  realDownloadUrl?: string;
}

export function DramaPlayer({
  isSeries = false,
  episodes = [],
  servers = [],
  trailerUrl,
  posterUrl,
  title,
  downloadUrl,
  trapDownloadUrl,
  realDownloadUrl,
}: DramaPlayerProps) {
  const unifiedEpisodes: UnifiedEpisode[] = episodes.map((ep, epIdx) => ({
    id: ep.id || `ep-${epIdx + 1}`,
    title: ep.title || `Episode ${ep.episodeNumber || epIdx + 1}`,
    episodeNumber: ep.episodeNumber || epIdx + 1,
    servers: (ep.servers || []).map((s: SeriesServer, sIdx: number) => {
      const cleanUrl = normalizeEmbedUrl(s.url);
      return {
        id: s.id || `srv-${epIdx}-${sIdx}`,
        name: s.name || `Server ${sIdx + 1}`,
        url: cleanUrl,
        embedUrl: cleanUrl,
        quality: s.quality || "1080p",
        subtitle: s.subtitle || "Indonesia",
        isDefault: s.isDefault ?? sIdx === 0,
      };
    }),
  }));

  const unifiedServers: UnifiedServer[] = servers.map((s, idx) => {
    const cleanUrl = normalizeEmbedUrl(s.url);
    return {
      id: s.id || `srv-${idx}`,
      name: s.name || `Server ${idx + 1}`,
      url: cleanUrl,
      embedUrl: cleanUrl,
      quality: s.quality || "1080p",
      subtitle: "Indonesia",
      isDefault: idx === 0,
    };
  });

  return (
    <ContentPlayer
      title={title}
      posterUrl={posterUrl}
      trailerUrl={trailerUrl ? normalizeEmbedUrl(trailerUrl) : undefined}
      downloadUrl={downloadUrl}
      trapDownloadUrl={trapDownloadUrl}
      realDownloadUrl={realDownloadUrl}
      isSeries={isSeries}
      episodes={unifiedEpisodes}
      servers={unifiedServers}
    />
  );
}
