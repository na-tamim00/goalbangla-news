'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  UploadCloud,
  Loader2,
  FileText,
  Play,
  Headphones,
  Link as LinkIcon,
} from 'lucide-react';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Uploader modal state
  const [isAdding, setIsAdding] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // URL mode form state
  const [newUrl, setNewUrl] = useState('');
  const [newFilename, setNewFilename] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((p) => (p >= 85 ? p : p + 20));
    }, 120);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (res.ok) {
        const data = await res.json();
        setMedia([data.media, ...media]);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setIsAdding(false);
        }, 400);
      } else {
        const err = await res.json();
        alert(err.error || 'Upload failed');
        setIsUploading(false);
      }
    } catch (err) {
      clearInterval(interval);
      setIsUploading(false);
      alert('Upload error');
    }
  };

  const handleAddUrlMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newFilename.trim()) return;

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl.trim(),
          filename: newFilename.trim(),
          mimeType: newUrl.includes('.mp3') ? 'audio/mpeg' : newUrl.includes('.mp4') ? 'video/mp4' : 'image/jpeg',
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
      alert('Registration failed');
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
          <h1 className="font-headline font-black text-3xl uppercase tracking-tight text-white flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-brand-500" />
            <span>Central Media Library</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Optimized storage for match photography, podcast audio files, and video assets
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>{isAdding ? 'Close Uploader' : 'Upload or Register Media'}</span>
        </button>
      </div>

      {/* Upload / Register Modal */}
      {isAdding && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-brand-500/50 shadow-2xl space-y-4 animate-fadeIn">
          {/* Mode Switcher */}
          <div className="flex border-b border-zinc-800 pb-3 gap-3">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                uploadMode === 'file'
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload New File</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                uploadMode === 'url'
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Register External URL</span>
            </button>
          </div>

          {/* Mode 1: Drag & Drop File Upload */}
          {uploadMode === 'file' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-brand-500 bg-brand-950/40'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {isUploading ? (
                <div className="space-y-3">
                  <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
                  <span className="text-xs font-bold text-white block">
                    Processing and uploading ({uploadProgress}%)...
                  </span>
                  <div className="w-48 h-1.5 bg-zinc-800 rounded-full mx-auto overflow-hidden">
                    <div
                      className="h-full bg-brand-600 transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 text-brand-400 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Click to browse or drop media file here
                    </span>
                    <span className="text-xs text-zinc-500">
                      Images (JPEG/PNG/WebP), Videos (MP4), Audios (MP3) up to 25MB
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: External URL Registration */}
          {uploadMode === 'url' && (
            <form onSubmit={handleAddUrlMedia} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Asset Label / Filename *
                  </label>
                  <input
                    type="text"
                    value={newFilename}
                    onChange={(e) => setNewFilename(e.target.value)}
                    placeholder="e.g. champions-trophy-celebration.jpg"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Direct URL *
                  </label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://..."
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Register to Media Library
              </button>
            </form>
          )}
        </div>
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
              <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                {item.mimeType.startsWith('image') ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : item.mimeType.startsWith('audio') ? (
                  <div className="flex flex-col items-center gap-1 text-brand-400">
                    <Headphones className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase">Audio Track</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-brand-400">
                    <Play className="w-8 h-8 fill-brand-400" />
                    <span className="text-[10px] font-bold uppercase">Video File</span>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <h4 className="font-bold text-xs text-zinc-200 truncate" title={item.filename}>
                  {item.filename}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>{(item.sizeBytes / 1024).toFixed(0)} KB</span>
                  <span className="uppercase font-mono">{item.mimeType.split('/')[1] || item.mimeType}</span>
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.url)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-bold transition-colors ${
                      copiedId === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}