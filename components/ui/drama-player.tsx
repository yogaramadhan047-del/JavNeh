"use client";

import { useState } from "react";
import { PlayCircle, Download, Tv } from "lucide-react";
import { SafeImage } from "./safe-image";
import { Episode } from "@/types/series";

interface ServerItem {
  name: string;
  url: string;
}

interface DramaPlayerProps {
  isSeries?: boolean;
  episodes?: Episode[];
  servers?: ServerItem[];
  trailerUrl?: string;
  posterUrl?: string;
  title: string;
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
  trapDownloadUrl,
  realDownloadUrl,
}: DramaPlayerProps) {
  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);
  const currentEpisode = episodes.length > 0 ? episodes[activeEpisodeIndex] : null;

  const currentServers: ServerItem[] = isSeries
    ? currentEpisode?.servers && currentEpisode.servers.length > 0
      ? currentEpisode.servers
      : []
    : servers;

  const [activeServer, setActiveServer] = useState<ServerItem | null>(
    currentServers.length > 0 ? currentServers[0] : null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle episode change
  const handleSelectEpisode = (index: number) => {
    setActiveEpisodeIndex(index);
    const ep = episodes[index];
    if (ep && ep.servers && ep.servers.length > 0) {
      setActiveServer(ep.servers[0]);
    } else {
      setActiveServer(null);
    }
  };

  const handleStartPlay = () => {
    setIsPlaying(true);
  };

  const effectiveDownloadUrl = realDownloadUrl || trapDownloadUrl;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 16:9 Player Container */}
      <div className="relative w-full aspect-video bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-border-dark group">
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {posterUrl && (
              <SafeImage
                src={posterUrl}
                alt={title}
                type="banner"
                fill
                className="object-cover opacity-30 blur-[2px]"
                referrerPolicy="no-referrer"
                sizes="100vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />

            <div className="relative z-10 flex flex-col items-center text-center p-4">
              <button
                onClick={handleStartPlay}
                className="w-16 h-16 md:w-20 md:h-20 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 mb-4 cursor-pointer"
                aria-label={`Mulai putar ${title}`}
              >
                <PlayCircle className="w-10 h-10 md:w-12 md:h-12 fill-white text-primary-blue" />
              </button>
              <h3 className="text-white font-bold text-lg md:text-2xl drop-shadow-md">
                Putar: {title} {isSeries && currentEpisode ? `(Ep. ${currentEpisode.episodeNumber})` : ""}
              </h3>
              <p className="text-text-muted text-xs md:text-sm mt-1">
                Pilih server streaming berkualitas HD di bawah jika pemutaran terkendala.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            {activeServer ? (
              <iframe
                src={activeServer.url}
                title={`Pemutar Video ${title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : trailerUrl ? (
              <iframe
                src={trailerUrl}
                title={`Trailer ${title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                Tidak ada server video aktif yang tersedia.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Episode Selector for Series */}
      {isSeries && episodes.length > 0 && (
        <div className="bg-card-dark border border-border-dark rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-primary-blue" />
              Daftar Episode ({episodes.length} Episode)
            </h4>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {episodes.map((ep, idx) => (
              <button
                key={ep.id || idx}
                onClick={() => handleSelectEpisode(idx)}
                className={`py-2 px-3 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
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

      {/* Server Selection & Action Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card-dark border border-border-dark p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted mr-1 font-semibold uppercase tracking-wider">
            Server:
          </span>
          {currentServers.length > 0 ? (
            currentServers.map((server, idx) => (
              <button
                key={server.name + idx}
                onClick={() => {
                  setActiveServer(server);
                  setIsPlaying(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeServer?.name === server.name && isPlaying
                    ? "bg-primary-blue text-white shadow-sm"
                    : "bg-background-dark hover:bg-white/10 text-text-muted border border-border-dark"
                }`}
              >
                {server.name}
              </button>
            ))
          ) : (
            <span className="text-xs text-text-muted italic">Server Default</span>
          )}

          {trailerUrl && (
            <button
              onClick={() => {
                setActiveServer(null);
                setIsPlaying(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-background-dark hover:bg-white/10 text-yellow-500 border border-yellow-500/20 cursor-pointer"
            >
              Trailer
            </button>
          )}
        </div>

        {effectiveDownloadUrl && (
          <a
            href={effectiveDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-border-dark rounded-lg text-xs md:text-sm font-medium text-white transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-primary-blue" />
            Download Episode
          </a>
        )}
      </div>
    </div>
  );
}
