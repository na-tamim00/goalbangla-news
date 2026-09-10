'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MediaRecord } from '@/lib/db/types';
import {
  UploadCloud,
  FolderOpen,
  Link as LinkIcon,
  Check,
  X,
  Image as ImageIcon,
  Play,
  Headphones,
  Search,
  Loader2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface MediaPickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  type?: 'image' | 'video' | 'audio';
  placeholder?: string;
  description?: string;
}

export default function MediaPicker({
  label,
  value,
  onChange,
  accept = 'image/*',
  type = 'image',
  placeholder = 'https://...',
  description,
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(!value);
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [libraryMedia, setLibraryMedia] = useState<MediaRecord[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync urlInput when value changes
  useEffect(() => {
    setUrlInput(value);
  }, [value]);

  const fetchLibrary = async () => {
    setLibraryLoading(true);
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setLibraryMedia(data.media || []);
      }
    } catch (err) {
      console.error('Error fetching media library:', err);
    } finally {
      setLibraryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'library') {
      fetchLibrary();
    }
  }, [activeTab]);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(15);

    // Simulated progressive feedback
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return prev;
        }
        return prev + 15;
      });
    }, 150);

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
        onChange(data.url);
        setUrlInput(data.url);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setIsOpen(false);
        }, 400);
      } else {
        const err = await res.json();
        setError(err.error || 'File upload failed');
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
      setError(err.message || 'Network error during upload');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setIsOpen(false);
    }
  };

  const filteredLibrary = libraryMedia.filter((m) => {
    const matchesSearch = m.filename.toLowerCase().includes(librarySearch.toLowerCase());
    if (type === 'image') return matchesSearch && m.mimeType.startsWith('image');
    if (type === 'audio') return matchesSearch && m.mimeType.startsWith('audio');
    if (type === 'video') return matchesSearch && (m.mimeType.startsWith('video') || m.mimeType.startsWith('image'));
    return matchesSearch;
  });

  return (
    <div className="space-y-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      {/* Label and Status */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            {type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-brand-500" />}
            {type === 'video' && <Play className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />}
            {type === 'audio' && <Headphones className="w-3.5 h-3.5 text-brand-500" />}
            <span>{label}</span>
          </label>
          {description && <p className="text-[10px] text-zinc-500 mt-0.5">{description}</p>}
        </div>

        {value && !isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-[11px] font-bold text-brand-400 hover:text-brand-300 underline"
          >
            Change / Replace
          </button>
        )}
      </div>

      {/* Active Value Preview Card (when value is set and picker is collapsed) */}
      {value && !isOpen && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
          {/* Visual Thumbnail */}
          {type === 'image' && (
            <div className="relative w-16 h-12 bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          {type === 'audio' && (
            <div className="flex-1">
              <audio controls src={value} className="w-full h-8" />
            </div>
          )}

          {type === 'video' && (
            <div className="relative w-16 h-12 bg-black rounded-lg overflow-hidden shrink-0 border border-zinc-800 flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <span className="text-xs text-zinc-300 font-mono truncate block">{value}</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-bold">
              <Check className="w-3 h-3" /> Attached successfully
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              title="Open asset in new tab"
              className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setUrlInput('');
                setIsOpen(true);
              }}
              title="Remove asset"
              className="p-1.5 rounded bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Picker Controls (Upload / Library / URL Tabs) */}
      {isOpen && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-900/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-brand-500 text-brand-400 bg-zinc-950'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload New File</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'library'
                  ? 'border-brand-500 text-brand-400 bg-zinc-950'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Media Library</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'url'
                  ? 'border-brand-500 text-brand-400 bg-zinc-950'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paste External URL</span>
            </button>
          </div>

          <div className="p-4">
            {error && (
              <div className="mb-3 p-2 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center justify-between">
                <span>{error}</span>
                <button type="button" onClick={() => setError(null)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TAB 1: Upload New File */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    dragOver
                      ? 'border-brand-500 bg-brand-950/30'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  {isUploading ? (
                    <div className="space-y-3 py-2">
                      <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block">
                          Uploading to Media Storage ({uploadProgress}%)...
                        </span>
                        <div className="w-48 h-1.5 bg-zinc-800 rounded-full mx-auto overflow-hidden">
                          <div
                            className="h-full bg-brand-600 transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 text-brand-400 flex items-center justify-center mx-auto border border-zinc-700">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-200 block">
                          Click to browse or drag and drop file here
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase font-mono">
                          Supports {accept} (Max 25MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Media Library */}
            {activeTab === 'library' && (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Search media library by filename..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {libraryLoading ? (
                  <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                    <span>Loading library assets...</span>
                  </div>
                ) : filteredLibrary.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    No matching assets in media library.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {filteredLibrary.map((item) => {
                      const isSelected = value === item.url;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onChange(item.url);
                            setUrlInput(item.url);
                            setIsOpen(false);
                          }}
                          className={`group relative rounded-lg border text-left overflow-hidden transition-all ${
                            isSelected
                              ? 'border-brand-500 ring-2 ring-brand-500/50'
                              : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900'
                          }`}
                        >
                          <div className="aspect-video w-full bg-zinc-950 overflow-hidden relative">
                            {item.mimeType.startsWith('image') ? (
                              <img
                                src={item.url}
                                alt={item.filename}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                {item.mimeType.startsWith('audio') ? (
                                  <Headphones className="w-6 h-6" />
                                ) : (
                                  <Play className="w-6 h-6" />
                                )}
                              </div>
                            )}

                            {isSelected && (
                              <div className="absolute inset-0 bg-brand-600/30 flex items-center justify-center">
                                <span className="p-1 bg-brand-600 text-white rounded-full">
                                  <Check className="w-3 h-3" />
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-1.5 bg-zinc-900">
                            <span className="text-[10px] font-bold text-zinc-300 truncate block">
                              {item.filename}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Paste External URL */}
            {activeTab === 'url' && (
              <form onSubmit={handleUrlSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Ideal for YouTube embeds, Vimeo links, Facebook videos, or external CDN URLs.
                  </span>
                </div>

                <div className="flex justify-end gap-2">
                  {value && (
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold uppercase rounded-lg shadow"
                  >
                    Apply URL
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
