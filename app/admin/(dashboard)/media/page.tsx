'use client';

import React, { useState, useEffect } from 'react';
import { MediaRecord } from '@/lib/db/types';
import {
  FolderOpen,
  Upload,
  Copy,
  Check,
  Search,
  Image as ImageIcon,
  Plus,
  ExternalLink,
} from 'lucide-react';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Media Form state
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newFilename, setNewFilename] = useState('');

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      // fallback
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newFilename.trim()) return;

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl.trim(),
          filename: newFilename.trim(),
          mimeType: 'image/jpeg',
          sizeBytes: 350000,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMedia([data.item, ...media]);
        setNewUrl('');
        setNewFilename('');
        setIsAdding(false);
      }
    } catch (err) {
      alert('Upload failed');
    }
  };

  const filteredMedia = media.filter((m) =>
    m.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="font-headline font-black text-3xl uppercase tracking-tight text-white">
            Central Media Library
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Optimized storage for match photos, podcast reaction audios, and video thumbnails
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>{isAdding ? 'Close Uploader' : 'Add Media Asset'}</span>
        </button>
      </div>

      {/* Add Media Modal / Form */}
      {isAdding && (
        <form
          onSubmit={handleAddMedia}
          className="p-5 rounded-xl bg-zinc-900 border border-brand-500/50 shadow-xl space-y-4 animate-fadeIn"
        >
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            Register Media Asset (Cloudinary / Supabase Storage URL)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Asset Name / Label
              </label>
              <input
                type="text"
                value={newFilename}
                onChange={(e) => setNewFilename(e.target.value)}
                placeholder="e.g. derby-celebration-goal.jpg"
                required
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Direct URL
              </label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or cloudinary url"
                required
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            Save to Media Library
          </button>
        </form>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter media files by filename..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
        />
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500 font-bold">Loading media items...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 text-xs">No media files found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:border-brand-500/50 transition-colors flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-3 space-y-2">
                <h4 className="font-bold text-xs text-zinc-200 truncate">{item.filename}</h4>
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>{(item.sizeBytes / 1024).toFixed(0)} KB</span>
                  <span className="uppercase">{item.mimeType.split('/')[1]}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.url)}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-bold transition-colors ${
                    copiedId === item.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}