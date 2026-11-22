"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Upload, Search, Trash2, Copy, Check, File, ExternalLink, Sparkles } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/modal";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchMedia = () => {
    setLoading(true);
    fetch("/api/admin/media")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMedia(data.media || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "website-asset");
    formData.append("altText", file.name);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchMedia();
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {}
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/media?id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      fetchMedia();
    } catch {}
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filtered = media.filter((m) =>
    (m.originalName || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Asset Storage</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Media & Digital Assets
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Static assets, brand marks, project hero images, and document downloads.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)] cursor-pointer">
            <Upload size={14} className={uploading ? "animate-bounce" : ""} />
            <span>{uploading ? "Uploading..." : "Upload File"}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
            />
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl">
        <div className="relative">
          <Search size={15} className="absolute inset-y-0 left-3.5 my-auto text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media assets by filename or category..."
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-10 pr-3 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
          />
        </div>
      </div>

      {/* Media Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
              <span>Scanning media directory...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f111a]/90 p-12 text-center text-xs text-neutral-400">
            No media assets found matching search.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="group rounded-3xl border border-white/10 bg-[#0f111a]/90 overflow-hidden shadow-2xl backdrop-blur-xl hover:border-[#98f90d]/30 transition-all flex flex-col justify-between"
            >
              {/* Media Thumbnail */}
              <div className="h-32 bg-black/50 flex items-center justify-center p-3 relative overflow-hidden border-b border-white/5">
                {item.mimeType?.startsWith("image/") ? (
                  <img
                    src={item.path}
                    alt={item.altText || item.originalName}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <File size={36} className="text-neutral-500" />
                )}
              </div>

              {/* Asset Info */}
              <div className="p-3.5 text-xs">
                <div className="font-bold text-white truncate" title={item.originalName}>
                  {item.originalName}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono flex justify-between mt-1">
                  <span>{(item.size / 1024).toFixed(1)} KB</span>
                  <span className="uppercase text-[#98f90d]">{item.mimeType?.split("/")[1]}</span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.path, item.id)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-300 hover:text-[#98f90d] transition-colors"
                    title="Copy Public URL"
                  >
                    {copiedId === item.id ? <Check size={12} className="text-[#98f90d]" /> : <Copy size={12} />}
                    <span>{copiedId === item.id ? "Copied" : "Copy URL"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(item.id)}
                    className="text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition p-1.5 rounded-lg"
                    title="Delete file"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Media File"
        message="Are you sure you want to permanently delete this media asset?"
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
