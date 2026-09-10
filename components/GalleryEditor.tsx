'use client';

import React, { useState } from 'react';
import { GalleryImage } from '@/lib/db/types';
import MediaPicker from '@/components/MediaPicker';
import {
  Camera,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface GalleryEditorProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}

export default function GalleryEditor({ images, onChange }: GalleryEditorProps) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showAddPicker, setShowAddPicker] = useState(images.length === 0);

  const handleAddImage = (url: string) => {
    if (!url) return;
    const updated = [...images, { url, captionBn: '', captionEn: '' }];
    onChange(updated);
    setNewImageUrl('');
    setShowAddPicker(false);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const updated = [...images];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateCaption = (index: number, field: 'captionBn' | 'captionEn', value: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h3 className="font-bold text-sm text-brand-400 uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Match Photo Gallery Manager ({images.length} Photos)</span>
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Upload photos, organize sequence with Move Up/Down, and add bilingual captions
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddPicker(!showAddPicker)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Photo</span>
        </button>
      </div>

      {/* Add Photo Picker Section */}
      {showAddPicker && (
        <div className="p-4 bg-zinc-950 border border-brand-500/40 rounded-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase">Upload or Select Photo for Gallery</span>
            <button
              type="button"
              onClick={() => setShowAddPicker(false)}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <MediaPicker
            label="Gallery Photo Source"
            value={newImageUrl}
            onChange={(url) => {
              if (url) handleAddImage(url);
            }}
            accept="image/*"
            type="image"
            description="Drag & drop, choose from library, or paste image URL to append to gallery"
          />
        </div>
      )}

      {/* Gallery Items List */}
      {images.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 text-xs border-2 border-dashed border-zinc-800 rounded-xl">
          No photos in this gallery yet. Click "Add Photo" above to start building the photo story.
        </div>
      ) : (
        <div className="space-y-4">
          {images.map((img, index) => (
            <div
              key={`${img.url}-${index}`}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex flex-col md:flex-row gap-4 items-start group hover:border-zinc-700 transition-colors"
            >
              {/* Photo Thumbnail */}
              <div className="relative w-full md:w-36 aspect-video bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                <img src={img.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                  #{index + 1}
                </span>
              </div>

              {/* Captions Inputs */}
              <div className="flex-1 w-full space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                    ছবি বিবরণ / ক্যাপশন (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={img.captionBn || ''}
                    onChange={(e) => handleUpdateCaption(index, 'captionBn', e.target.value)}
                    placeholder="যেমন: ৯০তম মিনিটে উইনিং গোল উদযাপনে কিংসের ফুটবলাররা..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                    Photo Caption (English)
                  </label>
                  <input
                    type="text"
                    value={img.captionEn || ''}
                    onChange={(e) => handleUpdateCaption(index, 'captionEn', e.target.value)}
                    placeholder="e.g. Bashundhara Kings celebrate 90th-minute winner at Kings Arena..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Controls: Reorder & Delete */}
              <div className="flex md:flex-col gap-1 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveUp(index)}
                  title="Move Photo Earlier"
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-zinc-900 transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => handleMoveDown(index)}
                  title="Move Photo Later"
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-zinc-900 transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  title="Remove from Gallery"
                  className="p-1.5 rounded bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
