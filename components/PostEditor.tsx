'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostData, PostType, PostStatus } from '@/lib/db/types';
import {
  Save,
  Eye,
  ArrowLeft,
  FileText,
  Play,
  Headphones,
  Camera,
  Calendar,
  Image as ImageIcon,
  Check,
  Globe,
  Sparkles,
  X,
} from 'lucide-react';

interface PostEditorProps {
  initialData?: Partial<PostData>;
  isEditing?: boolean;
}

export default function PostEditor({ initialData, isEditing = false }: PostEditorProps) {
  const router = useRouter();

  const [type, setType] = useState<PostType>(initialData?.type || 'ARTICLE');
  const [status, setStatus] = useState<PostStatus>(initialData?.status || 'DRAFT');
  const [category, setCategory] = useState(initialData?.category || 'BREAKING');
  const [leagueTag, setLeagueTag] = useState(initialData?.leagueTag || 'BPL');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [scheduledPublishAt, setScheduledPublishAt] = useState(initialData?.scheduledPublishAt || '');

  // Video fields
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [videoTranscript, setVideoTranscript] = useState(initialData?.videoTranscript || '');

  // Audio fields
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl || '');
  const [audioShowNotes, setAudioShowNotes] = useState(initialData?.audioShowNotes || '');

  // Gallery fields
  const [galleryImages, setGalleryImages] = useState(
    initialData?.galleryImages || [
      { url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', captionBn: '', captionEn: '' },
    ]
  );

  // Active language tab in editor: 'bn' or 'en'
  const [langTab, setLangTab] = useState<'bn' | 'en'>('bn');

  // Bengali fields
  const [titleBn, setTitleBn] = useState(initialData?.translations?.bn?.title || '');
  const [excerptBn, setExcerptBn] = useState(initialData?.translations?.bn?.excerpt || '');
  const [contentBn, setContentBn] = useState(initialData?.translations?.bn?.content || '');
  const [seoTitleBn, setSeoTitleBn] = useState(initialData?.translations?.bn?.seoTitle || '');
  const [seoDescBn, setSeoDescBn] = useState(initialData?.translations?.bn?.seoDescription || '');
  const [tagsBn, setTagsBn] = useState((initialData?.translations?.bn?.tags || []).join(', '));

  // English fields
  const [titleEn, setTitleEn] = useState(initialData?.translations?.en?.title || '');
  const [excerptEn, setExcerptEn] = useState(initialData?.translations?.en?.excerpt || '');
  const [contentEn, setContentEn] = useState(initialData?.translations?.en?.content || '');
  const [seoTitleEn, setSeoTitleEn] = useState(initialData?.translations?.en?.seoTitle || '');
  const [seoDescEn, setSeoDescEn] = useState(initialData?.translations?.en?.seoDescription || '');
  const [tagsEn, setTagsEn] = useState((initialData?.translations?.en?.tags || []).join(', '));

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-generate slug from English title or Bengali title
  const handleTitleChange = (val: string, lang: 'bn' | 'en') => {
    if (lang === 'bn') {
      setTitleBn(val);
      if (!slug && !isEditing) {
        setSlug(val.trim().toLowerCase().replace(/[^a-zA-Z0-9\u0980-\u09FF]+/g, '-').slice(0, 50));
      }
    } else {
      setTitleEn(val);
      if (!isEditing) {
        setSlug(val.trim().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 50));
      }
    }
  };

  const handleSave = async () => {
    if (!titleBn && !titleEn) {
      alert('Please enter a headline in Bengali or English');
      return;
    }
    if (!slug) {
      alert('Slug is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slug: slug.trim().toLowerCase(),
        type,
        status,
        category,
        leagueTag,
        featuredImage,
        videoUrl,
        videoTranscript,
        audioUrl,
        audioShowNotes,
        galleryImages,
        scheduledPublishAt: status === 'SCHEDULED' ? scheduledPublishAt : undefined,
        translations: {
          bn: {
            language: 'bn',
            title: titleBn || titleEn,
            excerpt: excerptBn,
            content: contentBn,
            seoTitle: seoTitleBn,
            seoDescription: seoDescBn,
            tags: tagsBn.split(',').map((t) => t.trim()).filter(Boolean),
          },
          en: {
            language: 'en',
            title: titleEn || titleBn,
            excerpt: excerptEn,
            content: contentEn,
            seoTitle: seoTitleEn,
            seoDescription: seoDescEn,
            tags: tagsEn.split(',').map((t) => t.trim()).filter(Boolean),
          },
        },
      };

      const url = isEditing ? `/api/posts/${initialData?.id}` : '/api/posts';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/posts');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save post');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/posts')}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-headline font-black text-2xl uppercase tracking-tight text-white">
              {isEditing ? 'Edit Post (পোস্ট সম্পাদনা)' : 'Create New Post (নতুন পোস্ট রচনা)'}
            </h1>
            <p className="text-xs text-zinc-400">
              Unified content model: Article, Video, Audio, and Photo Gallery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-200 transition-colors"
          >
            <Eye className="w-4 h-4 text-brand-400" />
            <span>Live Preview</span>
          </button>

          {/* Save / Publish Button */}
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : status === 'PUBLISHED' ? 'Publish Now' : 'Save Draft'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Type Selector Pills */}
          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl flex items-center gap-2 text-xs font-bold">
            {[
              { id: 'ARTICLE', label: 'Article (নিবন্ধ)', icon: FileText },
              { id: 'VIDEO', label: 'Video (ভিডিও)', icon: Play },
              { id: 'AUDIO', label: 'Audio / Podcast (অডিও)', icon: Headphones },
              { id: 'GALLERY', label: 'Photo Gallery (ছবি)', icon: Camera },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as PostType)}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    type === t.id
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Bilingual Language Switcher Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-900 rounded-t-xl px-4 pt-2">
            <button
              type="button"
              onClick={() => setLangTab('bn')}
              className={`py-2 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                langTab === 'bn'
                  ? 'border-brand-500 text-brand-400 bg-zinc-950/60'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>বাংলা কনটেন্ট (Bengali)</span>
            </button>
            <button
              type="button"
              onClick={() => setLangTab('en')}
              className={`py-2 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                langTab === 'en'
                  ? 'border-brand-500 text-brand-400 bg-zinc-950/60'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>English Content</span>
            </button>
          </div>

          {/* Bilingual Tab 1: Bengali */}
          {langTab === 'bn' && (
            <div className="bg-zinc-900 border border-t-0 border-zinc-800 rounded-b-xl p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  বাংলা প্রধান শিরোনাম (Bengali Headline) *
                </label>
                <input
                  type="text"
                  value={titleBn}
                  onChange={(e) => handleTitleChange(e.target.value, 'bn')}
                  placeholder="যেমন: ইতিহাদে আর্সেনালের বিরুদ্ধে সিটির রোমাঞ্চকর জয়..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-base text-white font-bold placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  সংক্ষেপ বা ভূমিকা (Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={excerptBn}
                  onChange={(e) => setExcerptBn(e.target.value)}
                  placeholder="খবরের প্রথম ২ লাইনের সংক্ষিপ্ত সারসংক্ষেপ..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  মূল বিবরণ ও নিবন্ধ (Full Body Markdown)
                </label>
                <textarea
                  rows={12}
                  value={contentBn}
                  onChange={(e) => setContentBn(e.target.value)}
                  placeholder="## শিরোনাম\n\nম্যাচের পুঙ্খানুপুঙ্খ বিবরণ...\n\n> উদ্ধৃতি\n\n* পয়েন্ট ১\n* পয়েন্ট ২"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 font-mono placeholder-zinc-600 focus:outline-none focus:border-brand-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitleBn}
                    onChange={(e) => setSeoTitleBn(e.target.value)}
                    placeholder="সার্চ ইঞ্জিনে দেখানোর শিরোনাম"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">ট্যাগ সমূহ (কমা দিয়ে আলাদা করুন)</label>
                  <input
                    type="text"
                    value={tagsBn}
                    onChange={(e) => setTagsBn(e.target.value)}
                    placeholder="ম্যান সিটি, আর্সেনাল, প্রিমিয়ার লিগ"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bilingual Tab 2: English */}
          {langTab === 'en' && (
            <div className="bg-zinc-900 border border-t-0 border-zinc-800 rounded-b-xl p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  English Headline *
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => handleTitleChange(e.target.value, 'en')}
                  placeholder="e.g. Manchester City Edge Arsenal in Etihad Thriller..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-base text-white font-bold placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={excerptEn}
                  onChange={(e) => setExcerptEn(e.target.value)}
                  placeholder="A concise 2-sentence story summary..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Article Body (Markdown)
                </label>
                <textarea
                  rows={12}
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  placeholder="## Heading\n\nFull match reporting and tactical breakdown...\n\n> Quote\n\n* Key Stat 1"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 font-mono placeholder-zinc-600 focus:outline-none focus:border-brand-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitleEn}
                    onChange={(e) => setSeoTitleEn(e.target.value)}
                    placeholder="Search engine optimized headline"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={tagsEn}
                    onChange={(e) => setTagsEn(e.target.value)}
                    placeholder="Premier League, Man City, Arsenal"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Type-Specific Fields: Video / Audio / Gallery */}
          {type === 'VIDEO' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-brand-400 uppercase tracking-wider flex items-center gap-2">
                <Play className="w-4 h-4 fill-brand-400" />
                <span>Video Post Configuration</span>
              </h3>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Video URL (YouTube, Vimeo, Facebook or direct .mp4)
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Video Transcript (for SEO & Accessibility)
                </label>
                <textarea
                  rows={3}
                  value={videoTranscript}
                  onChange={(e) => setVideoTranscript(e.target.value)}
                  placeholder="Transcript of the match highlights or commentary..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200"
                />
              </div>
            </div>
          )}

          {type === 'AUDIO' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-brand-400 uppercase tracking-wider flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                <span>Audio / Podcast Configuration</span>
              </h3>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Audio Stream URL (.mp3 / podcast feed)
                </label>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://cdn.domain.com/podcast-ep1.mp3"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Show Notes & Guest Bios
                </label>
                <textarea
                  rows={3}
                  value={audioShowNotes}
                  onChange={(e) => setAudioShowNotes(e.target.value)}
                  placeholder="Topic timestamps, guest panelists, and reference links..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200"
                />
              </div>
            </div>
          )}

          {type === 'GALLERY' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-brand-400 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Photo Album Images</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setGalleryImages([
                      ...galleryImages,
                      { url: '', captionBn: '', captionEn: '' },
                    ])
                  }
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded text-zinc-200"
                >
                  + Add Another Image
                </button>
              </div>

              {galleryImages.map((img, i) => (
                <div key={i} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-400">Image #{i + 1}</span>
                    {galleryImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                        className="text-rose-400 hover:underline text-[11px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={img.url}
                    onChange={(e) => {
                      const updated = [...galleryImages];
                      updated[i].url = e.target.value;
                      setGalleryImages(updated);
                    }}
                    placeholder="Image URL (e.g. https://...)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                  />
                  <input
                    type="text"
                    value={img.captionBn || ''}
                    onChange={(e) => {
                      const updated = [...galleryImages];
                      updated[i].captionBn = e.target.value;
                      setGalleryImages(updated);
                    }}
                    placeholder="ছবি ক্যাপশন (বাংলা)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Settings (Right 1 col) */}
        <div className="space-y-6">
          {/* Publishing State Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider">
              Publishing Workflow (স্ট্যাটাস)
            </h3>

            <div className="space-y-2">
              {[
                { id: 'DRAFT', label: 'Draft (খসড়া)', desc: 'Saved privately' },
                { id: 'IN_REVIEW', label: 'In Review (পর্যালোচনাধীন)', desc: 'Ready for senior editor' },
                { id: 'SCHEDULED', label: 'Scheduled (শিডিউল্ড)', desc: 'Publish at future date' },
                { id: 'PUBLISHED', label: 'Published (প্রকাশিত)', desc: 'Live immediately' },
              ].map((s) => (
                <label
                  key={s.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    status === s.id
                      ? 'bg-brand-950/60 border-brand-500 text-white'
                      : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={status === s.id}
                    onChange={() => setStatus(s.id as PostStatus)}
                    className="mt-0.5 accent-brand-600"
                  />
                  <div>
                    <span className="font-bold text-xs block text-zinc-200">{s.label}</span>
                    <span className="text-[10px] text-zinc-500">{s.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* If Scheduled */}
            {status === 'SCHEDULED' && (
              <div className="pt-2 border-t border-zinc-800">
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledPublishAt}
                  onChange={(e) => setScheduledPublishAt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-zinc-200"
                />
              </div>
            )}
          </div>

          {/* Taxonomies Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider">
              Category & League Tag
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200"
              >
                <option value="BREAKING">Breaking News (ব্রেকিং)</option>
                <option value="TRANSFERS">Transfers (দলবদল)</option>
                <option value="MATCH_REPORTS">Match Reports (ম্যাচ রিপোর্ট)</option>
                <option value="OPINION">Opinion (কলাম ও মতামত)</option>
                <option value="TACTICS">Tactical Analysis (কৌশলগত)</option>
                <option value="INTERVIEWS">Interviews (সাক্ষাৎকার)</option>
                <option value="INJURIES">Injury Updates (ইনজুরি)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                League Tag
              </label>
              <select
                value={leagueTag}
                onChange={(e) => setLeagueTag(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200"
              >
                <option value="BPL">Bangladesh Premier League (BPL)</option>
                <option value="PREMIER_LEAGUE">Premier League (ইংল্যান্ড)</option>
                <option value="LA_LIGA">La Liga (স্পেন)</option>
                <option value="SERIE_A">Serie A (ইতালি)</option>
                <option value="BUNDESLIGA">Bundesliga (জার্মানি)</option>
                <option value="UCL">UEFA Champions League</option>
                <option value="INTERNATIONAL">International (আন্তর্জাতিক)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-url-slug"
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs font-mono text-zinc-200"
              />
            </div>
          </div>

          {/* Featured Image URL Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
              <span>Featured Cover Image</span>
            </h3>

            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-zinc-200"
            />

            {featuredImage && (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-700">
                <img src={featuredImage} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-white space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">
                Live Article Preview
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="inline-block px-2.5 py-0.5 rounded bg-brand-600 text-white font-extrabold text-[11px] uppercase">
                {category}
              </div>

              <h1 className="font-headline font-black text-3xl sm:text-4xl text-white leading-tight">
                {titleBn || titleEn || 'Untitled Headline'}
              </h1>

              {(excerptBn || excerptEn) && (
                <p className="text-zinc-300 text-base italic border-l-4 border-brand-500 pl-3">
                  {excerptBn || excerptEn}
                </p>
              )}

              {featuredImage && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden">
                  <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
                {contentBn || contentEn || 'No body content entered yet.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}