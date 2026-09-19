"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { MovieServer } from "@/types/movie";

interface StreamingServersProps {
  servers: MovieServer[];
  onChange: (servers: MovieServer[]) => void;
  disabled?: boolean;
}

export function StreamingServers({
  servers = [],
  onChange,
  disabled,
}: StreamingServersProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddServer = () => {
    onChange([...servers, { name: "", url: "", embedUrl: "", quality: "1080p" }]);
  };

  const handleRemoveServer = (index: number) => {
    onChange(servers.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof MovieServer,
    value: string
  ) => {
    const newServers = [...servers];
    newServers[index] = { ...newServers[index], [field]: value };
    onChange(newServers);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newServers = [...servers];
    const draggedItem = newServers[draggedIndex];
    newServers.splice(draggedIndex, 1);
    newServers.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    onChange(newServers);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-400">
          Server Streaming (Embed Video)
        </label>
        <button
          type="button"
          onClick={handleAddServer}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-xs text-primary-blue hover:text-primary-blue-hover font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Server
        </button>
      </div>

      {servers.length === 0 ? (
        <div className="p-4 border border-dashed border-border-dark rounded-xl text-center text-sm text-gray-500">
          Belum ada server streaming yang ditambahkan.
        </div>
      ) : (
        <div className="space-y-3">
          {servers.map((server, index) => (
            <div
              key={index}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 bg-background-dark border rounded-xl transition-all ${
                draggedIndex === index
                  ? "border-primary-blue opacity-50"
                  : "border-border-dark"
              }`}
            >
              <button
                type="button"
                className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
                <div className="md:col-span-3">
                  <input
                    type="text"
                    placeholder="Nama Server (cth: VIP 1)"
                    value={server.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    disabled={disabled}
                    className="w-full px-3 py-1.5 bg-card-dark border border-border-dark rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-blue"
                  />
                </div>
                <div className="md:col-span-7">
                  <input
                    type="text"
                    placeholder="URL Embed (https://...)"
                    value={server.url || server.embedUrl || ""}
                    onChange={(e) => {
                      handleChange(index, "url", e.target.value);
                      handleChange(index, "embedUrl", e.target.value);
                    }}
                    disabled={disabled}
                    className="w-full px-3 py-1.5 bg-card-dark border border-border-dark rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <select
                    value={server.quality || "1080p"}
                    onChange={(e) =>
                      handleChange(index, "quality", e.target.value)
                    }
                    disabled={disabled}
                    className="w-full px-3 py-1.5 bg-card-dark border border-border-dark rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-blue"
                  >
                    <option value="4K">4K</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                    <option value="360p">360p</option>
                    <option value="CAM">CAM</option>
                    <option value="HD">HD</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveServer(index)}
                disabled={disabled}
                className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
