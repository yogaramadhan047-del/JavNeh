"use client";

import { Plus, Trash2, Video } from "lucide-react";
import { Episode, SeriesServer } from "@/types/series";

interface EpisodeManagerProps {
  episodes: Episode[];
  onChange: (episodes: Episode[]) => void;
  disabled?: boolean;
}

export function EpisodeManager({ episodes = [], onChange, disabled }: EpisodeManagerProps) {
  const handleAddEpisode = () => {
    const nextNum = episodes.length + 1;
    const newEp: Episode = {
      id: String(Date.now()),
      title: `Episode ${nextNum}`,
      episodeNumber: nextNum,
      servers: [
        {
          id: String(Date.now() + 1),
          name: "Server 1",
          url: "",
          quality: "1080p",
          subtitle: "Indonesia",
          isDefault: true,
        },
      ],
    };
    onChange([...episodes, newEp]);
  };

  const handleRemoveEpisode = (index: number) => {
    const updated = episodes.filter((_, i) => i !== index);
    // Auto re-sequence episode numbers
    const reindexed = updated.map((ep, i) => ({
      ...ep,
      episodeNumber: i + 1,
    }));
    onChange(reindexed);
  };

  const handleEpisodeChange = (index: number, field: keyof Episode, value: any) => {
    const updated = [...episodes];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAddServer = (epIndex: number) => {
    const updated = [...episodes];
    const ep = updated[epIndex];
    const newServer: SeriesServer = {
      id: String(Date.now()),
      name: `Server ${(ep.servers?.length || 0) + 1}`,
      url: "",
      quality: "1080p",
      subtitle: "Indonesia",
      isDefault: false,
    };
    ep.servers = [...(ep.servers || []), newServer];
    onChange(updated);
  };

  const handleRemoveServer = (epIndex: number, serverIndex: number) => {
    const updated = [...episodes];
    const ep = updated[epIndex];
    ep.servers = (ep.servers || []).filter((_, sIndex) => sIndex !== serverIndex);
    onChange(updated);
  };

  const handleServerChange = (
    epIndex: number,
    serverIndex: number,
    field: keyof SeriesServer,
    value: any
  ) => {
    const updated = [...episodes];
    const ep = updated[epIndex];
    const servers = [...(ep.servers || [])];
    servers[serverIndex] = { ...servers[serverIndex], [field]: value };
    ep.servers = servers;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Daftar Episode & Server Streaming</p>
          <p className="text-xs text-text-muted">Tambahkan episode dan link embed streaming untuk tiap episode.</p>
        </div>
        <button
          type="button"
          onClick={handleAddEpisode}
          disabled={disabled}
          className="px-3 py-1.5 bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Tambah Episode
        </button>
      </div>

      {episodes.length === 0 ? (
        <div className="p-8 border border-dashed border-border-dark rounded-xl text-center bg-background-dark/30">
          <Video className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm text-text-muted mb-3">Belum ada episode yang ditambahkan.</p>
          <button
            type="button"
            onClick={handleAddEpisode}
            disabled={disabled}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat Episode Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {episodes.map((ep, epIndex) => (
            <div
              key={ep.id || epIndex}
              className="p-4 bg-background-dark border border-border-dark rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {ep.episodeNumber}
                  </span>
                  <input
                    type="text"
                    value={ep.title}
                    onChange={(e) => handleEpisodeChange(epIndex, "title", e.target.value)}
                    disabled={disabled}
                    placeholder={`Episode ${ep.episodeNumber}`}
                    className="bg-card-dark border border-border-dark rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary-blue flex-1 max-w-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEpisode(epIndex)}
                  disabled={disabled}
                  className="text-text-muted hover:text-danger p-1.5 rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
                  title="Hapus Episode"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Episode Servers */}
              <div className="pl-10 space-y-2 border-l border-border-dark ml-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-muted">Server Video</span>
                  <button
                    type="button"
                    onClick={() => handleAddServer(epIndex)}
                    disabled={disabled}
                    className="text-primary-blue hover:underline text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Tambah Server
                  </button>
                </div>

                {(ep.servers || []).map((srv, sIndex) => (
                  <div key={srv.id || sIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={srv.name}
                      onChange={(e) => handleServerChange(epIndex, sIndex, "name", e.target.value)}
                      disabled={disabled}
                      placeholder="Nama Server (cth: Server 1)"
                      className="w-28 bg-card-dark border border-border-dark rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-primary-blue"
                    />
                    <input
                      type="text"
                      value={srv.url}
                      onChange={(e) => handleServerChange(epIndex, sIndex, "url", e.target.value)}
                      disabled={disabled}
                      placeholder="Embed URL / Stream URL (https://...)"
                      className="flex-1 bg-card-dark border border-border-dark rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-primary-blue font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveServer(epIndex, sIndex)}
                      disabled={disabled}
                      className="text-text-muted hover:text-danger p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
