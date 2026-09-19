"use client";

import { useState } from "react";
import { PlayCircle, Download } from "lucide-react";
import { SafeImage } from "./safe-image";
import { Movie, MovieServer } from "@/types/movie";

interface MoviePlayerProps {
  movie?: Movie;
  servers?: MovieServer[];
  trailerUrl?: string;
  posterUrl?: string;
  title?: string;
  trapDownloadUrl?: string;
  realDownloadUrl?: string;
}

export function MoviePlayer(props: MoviePlayerProps) {
  const title = props.movie ? props.movie.title : (props.title || "");
  const servers = props.movie ? props.movie.servers : props.servers;
  const trailerUrl = props.movie ? props.movie.trailerUrl : props.trailerUrl;
  const posterUrl = props.movie ? (props.movie.bannerUrl || props.movie.posterUrl) : props.posterUrl;
  const trapDownloadUrl = props.movie ? props.movie.trapDownloadUrl : props.trapDownloadUrl;
  const realDownloadUrl = props.movie ? props.movie.realDownloadUrl : props.realDownloadUrl;
  const [activeServer, setActiveServer] = useState<MovieServer | null>(
    servers && servers.length > 0 ? servers[0] : null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 16:9 Player Container */}
      <div className="relative w-full aspect-video bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-border-dark group">
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Backdrop for player placeholder */}
            {posterUrl && (
              <SafeImage
                src={posterUrl}
                alt={title}
                type="backdrop"
                fill
                className="object-cover opacity-40"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <button
              onClick={() => setIsPlaying(true)}
              className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary-blue/80 hover:bg-primary-blue flex items-center justify-center transition-transform hover:scale-110 shadow-lg shadow-primary-blue/30 cursor-pointer"
            >
              <PlayCircle className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" />
            </button>
            <p className="relative z-10 mt-6 text-white font-medium text-base md:text-lg">
              {activeServer
                ? `Tonton via Server ${activeServer.name}`
                : trailerUrl
                ? "Tonton Trailer"
                : "Belum ada server tersedia"}
            </p>
          </div>
        ) : (
          <iframe
            src={activeServer?.url || trailerUrl || ""}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen"
            title={title}
          />
        )}
      </div>
      {/* Action Buttons (Servers & Download) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card-dark p-4 md:p-6 rounded-xl md:rounded-2xl border border-border-dark shadow-md">
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-text-muted font-medium mr-2">Pilih Server:</span>
            {servers?.map((server, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveServer(server);
                  setIsPlaying(true);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeServer?.name === server.name
                    ? "bg-primary-blue text-white shadow-md"
                    : "bg-background-dark hover:bg-white/10 text-gray-300 border border-border-dark"
                }`}
              >
                Server {server.name}
              </button>
            ))}
            {(!servers || servers.length === 0) && (
              <span className="text-sm text-gray-500 italic">Belum ada server</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border-dark">
          {realDownloadUrl && (
            <a
              href={realDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors w-full md:w-auto shadow-lg shadow-green-600/20"
            >
              <Download className="w-5 h-5" />
              Download
            </a>
          )}
          {trapDownloadUrl && (
            <a
              href={trapDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors w-full md:w-auto shadow-lg shadow-blue-600/20"
            >
              <Download className="w-5 h-5" />
              Download Alt
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
