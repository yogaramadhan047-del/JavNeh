"use client";

import { useState, useMemo } from "react";
import { PlayCircle, Download, ExternalLink, Tv, AlertTriangle, RefreshCw } from "lucide-react";
import { SafeImage } from "./safe-image";
import { UnifiedContent, UnifiedServer, UnifiedEpisode } from "@/types/content";
import { isDirectVideoUrl } from "@/lib/embed";

export interface ContentPlayerProps {
  content?: UnifiedContent;
  title?: string;
  posterUrl?: string;
  servers?: UnifiedServer[];
  episodes?: UnifiedEpisode[];
  trailerUrl?: string;
  downloadUrl?: string;
  trapDownloadUrl?: string;
  realDownloadUrl?: string;
  isSeries?: boolean;
}

export function ContentPlayer(props: ContentPlayerProps) {
  const content = props.content;

  const title = content?.title || props.title || "Video";
  const posterUrl = content?.imageUrl || content?.bannerUrl || content?.posterUrl || props.posterUrl;
  const trailerUrl = content?.trailerUrl || props.trailerUrl;
  const isSeries = content?.isSeries ?? (props.isSeries || (props.episodes && props.episodes.length > 0));

  const episodes: UnifiedEpisode[] = useMemo(() => {
    if (content?.episodes && content.episodes.length > 0) {
      return content.episodes;
    }
    return props.episodes || [];
  }, [content?.episodes, props.episodes]);

  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);
  const currentEpisode = episodes.length > 0 ? episodes[activeEpisodeIndex] : null;

  // Active servers list based on episode selection or direct servers
  const availableServers: UnifiedServer[] = useMemo(() => {
    if (isSeries && currentEpisode && currentEpisode.servers && currentEpisode.servers.length > 0) {
      return currentEpisode.servers;
    }
    if (content?.servers && content.servers.length > 0) {
      return content.servers;
    }
    return props.servers || [];
  }, [isSeries, currentEpisode, content?.servers, props.servers]);

  const [activeServer, setActiveServer] = useState<UnifiedServer | null>(() => {
    return availableServers.length > 0 ? availableServers[0] : null;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [showDirectNotice, setShowDirectNotice] = useState(false);

  // Synchronize active server when available servers change
  const currentActiveServer = activeServer || (availableServers.length > 0 ? availableServers[0] : null);

  const effectiveDownloadUrl =
    content?.downloadUrl ||
    props.downloadUrl ||
    content?.realDownloadUrl ||
    props.realDownloadUrl;

  const effectiveTrapDownloadUrl = content?.trapDownloadUrl || props.trapDownloadUrl;

  const handleSelectEpisode = (index: number) => {
    setActiveEpisodeIndex(index);
    const ep = episodes[index];
    if (ep && ep.servers && ep.servers.length > 0) {
      setActiveServer(ep.servers[0]);
    } else {
      setActiveServer(null);
    }
  };

  const handleSelectServer = (server: UnifiedServer) => {
    setActiveServer(server);
    setIsPlaying(true);
  };

  const activePlaybackUrl = currentActiveServer?.url || currentActiveServer?.embedUrl || trailerUrl || "";
  const isDirectVideo = isDirectVideoUrl(activePlaybackUrl);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* 16:9 Video Player Stage */}
      <div className="relative w-full aspect-video bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-border-dark group">
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {posterUrl && (
              <SafeImage
                src={posterUrl}
                alt={title}
                type="banner"
                fill
                className="object-cover opacity-35 blur-[1px]"
                referrerPolicy="no-referrer"
                sizes="100vw"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent" />

            <div className="relative z-10 flex flex-col items-center text-center p-4 max-w-lg">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-16 h-16 md:w-20 md:h-20 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-full flex items-center justify-center shadow-xl shadow-primary-blue/30 transform transition-transform duration-300 hover:scale-110 mb-4 cursor-pointer"
                aria-label={`Mulai putar ${title}`}
              >
                <PlayCircle className="w-10 h-10 md:w-12 md:h-12 fill-white text-primary-blue" />
              </button>
              <h3 className="text-white font-extrabold text-lg md:text-2xl drop-shadow-md">
                Putar: {title} {isSeries && currentEpisode ? `(Ep. ${currentEpisode.episodeNumber})` : ""}
              </h3>
              <p className="text-text-muted text-xs md:text-sm mt-1">
                {currentActiveServer
                  ? `Siap diputar via ${currentActiveServer.name} (${currentActiveServer.quality || "HD"})`
                  : trailerUrl
                  ? "Tonton Cuplikan Trailer"
                  : "Belum ada server video aktif"}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full bg-black">
            {activePlaybackUrl ? (
              isDirectVideo ? (
                <video
                  src={activePlaybackUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Browser Anda tidak mendukung tag video.
                </video>
              ) : (
                <iframe
                  src={activePlaybackUrl}
                  title={`Pemutar Video - ${title}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-text-muted p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
                <p className="text-sm md:text-base font-medium text-white">
                  Tautan video belum dikonfigurasi untuk server ini.
                </p>
                <p className="text-xs text-text-muted max-w-md">
                  Silakan pilih server lain di bawah atau tonton trailer jika tersedia.
                </p>
              </div>
            )}

            {/* Quick action bar for tricky providers */}
            {activePlaybackUrl && !isDirectVideo && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                <a
                  href={activePlaybackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-md border border-white/20 shadow-md transition-all cursor-pointer"
                  title="Buka player di tab baru jika video terblokir oleh provider"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-primary-blue" />
                  <span className="hidden sm:inline">Buka Player di Tab Baru</span>
                  <span className="sm:hidden">Tab Baru</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Episode Selection Matrix (if content is episodic with > 1 episode) */}
      {isSeries && episodes.length > 1 && (
        <div className="bg-card-dark border border-border-dark rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-primary-blue" />
              Daftar Episode ({episodes.length} Episode)
            </h4>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto pr-1">
            {episodes.map((ep, idx) => (
              <button
                key={ep.id || idx}
                onClick={() => handleSelectEpisode(idx)}
                className={`py-2 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeEpisodeIndex === idx
                    ? "bg-primary-blue text-white shadow-md shadow-primary-blue/30"
                    : "bg-background-dark border border-border-dark text-text-muted hover:text-white hover:bg-white/10"
                }`}
              >
                Ep. {ep.episodeNumber || idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Unified Server & Download Control Deck */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card-dark border border-border-dark p-4 md:p-5 rounded-xl shadow-md">
        {/* Servers */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted mr-1">
            Server:
          </span>
          {availableServers.length > 0 ? (
            availableServers.map((server, idx) => {
              const isSelected = currentActiveServer?.name === server.name && isPlaying;
              return (
                <button
                  key={server.name + idx}
                  onClick={() => handleSelectServer(server)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary-blue text-white shadow-md shadow-primary-blue/30"
                      : "bg-background-dark hover:bg-white/10 text-gray-300 border border-border-dark"
                  }`}
                >
                  {server.name}
                  {server.quality ? ` • ${server.quality}` : ""}
                </button>
              );
            })
          ) : (
            <span className="text-xs text-text-muted italic">Server Default</span>
          )}

          {trailerUrl && (
            <button
              onClick={() => {
                setActiveServer(null);
                setIsPlaying(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-background-dark hover:bg-white/10 text-yellow-500 border border-yellow-500/20 cursor-pointer"
            >
              Trailer
            </button>
          )}

          {isPlaying && (
            <button
              onClick={() => setShowDirectNotice((prev) => !prev)}
              className="text-text-muted hover:text-white p-1 rounded transition-colors text-xs flex items-center gap-1 cursor-pointer ml-auto sm:ml-2"
              title="Bantuan pemutaran"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden lg:inline text-[11px]">Bantuan Player</span>
            </button>
          )}
        </div>

        {/* Unified Download Section */}
        {(effectiveDownloadUrl || effectiveTrapDownloadUrl) && (
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border-dark">
            {effectiveDownloadUrl && (
              <a
                href={effectiveDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs md:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
            {effectiveTrapDownloadUrl && (
              <a
                href={effectiveTrapDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs md:text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Alt
              </a>
            )}
          </div>
        )}
      </div>

      {/* Provider embed advisory banner if toggled or if user encounters issues */}
      {showDirectNotice && (
        <div className="p-3.5 bg-card-dark border border-border-dark rounded-xl text-xs text-text-muted flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Tips Pemutaran Video:</p>
            <p>
              Jika video tidak berputar atau muncul layar hitam, server pihak ketiga mungkin membatasi iframe embedding (X-Frame-Options). Silakan coba beralih ke server streaming lain atau gunakan tombol{" "}
              <strong className="text-white">&quot;Buka Player di Tab Baru&quot;</strong> di sudut kanan atas pemutar video.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
