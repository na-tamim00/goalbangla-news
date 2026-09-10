'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PostData, PostType, PostStatus } from '@/lib/db/types';
import { useAdminUser } from '@/components/AdminUserContext';
import MediaPicker from '@/components/MediaPicker';
import GalleryEditor from '@/components/GalleryEditor';
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
  User,
  Send,
  Lock,
} from 'lucide-react';

interface PostEditorProps {
  initialData?: Partial<PostData>;
  isEditing?: boolean;
}

export default function PostEditor({ initialData, isEditing = false }: PostEditorProps) {
  const router = useRouter();
  const currentUser = useAdminUser();

  const [type, setType] = useState<PostType>(initialData?.type || 'ARTICLE');
  const [status, setStatus] = useState<PostStatus>(
    currentUser.role === 'CONTRIBUTOR' && initialData?.status === 'PUBLISHED'
      ? 'IN_REVIEW'
      : initialData?.status || 'DRAFT'
  );
  const [category, setCategory] = useState(initialData?.category || 'BREAKING');
  const [leagueTag, setLeagueTag] = useState(initialData?.leagueTag || 'BPL');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [scheduledPublishAt, setScheduledPublishAt] = useState(initialData?.scheduledPublishAt || '');

  // Author Reassignment & Attribution
  const [authorId, setAuthorId] = useState(initialData?.authorId || currentUser.id);
  const [authorName, setAuthorName] = useState(initialData?.authorName || currentUser.name);
  const [authorsList, setAuthorsList] = useState<{ id: string; name: string; email: string; role: string }[]>([]);

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

  // Fetch registered authors for Admin / Editor dropdown
  useEffect(() => {
    if (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR') {
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => {
          if (data.users) {
            setAuthorsList(data.users);
          }
        })
        .catch((err) => console.error('Error fetching authors:', err));
    }
  }, [currentUser.role]);

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

  const handleAuthorChange = (newAuthorId: string) => {
    setAuthorId(newAuthorId);
    const selected = authorsList.find((u) => u.id === newAuthorId);
    if (selected) {
      setAuthorName(selected.name);
    }
  };

  const handleSave = async (overrideStatus?: PostStatus) => {
    if (!titleBn && !titleEn) {
      alert('Please enter a headline in Bengali or English');
      return;
    }
    if (!slug) {
      alert('Slug is required');
      return;
    }

    const finalStatus = overrideStatus || status;

    // Contributor safety check
    if (currentUser.role === 'CONTRIBUTOR' && finalStatus === 'PUBLISHED') {
      alert('Contributors cannot publish directly. Submitting for editorial review instead.');
      setStatus('IN_REVIEW');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slug: slug.trim().toLowerCase(),
        type,
        status: finalStatus,
        category,
        leagueTag,
        featuredImage,
        videoUrl,
        videoTranscript,
        audioUrl,
        audioShowNotes,
        galleryImages,
        authorId: currentUser.role === 'CONTRIBUTOR' ? currentUser.id : authorId,
        authorName: currentUser.role === 'CONTRIBUTOR' ? currentUser.name : authorName,
        scheduledPublishAt: finalStatus === 'SCHEDULED' ? scheduledPublishAt : undefined,
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

  const isContributor = currentUser.role === 'CONTRIBUTOR';

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
              Ghost-inspired single-column editor with bilingual Bengali/English inputs
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>

          {isContributor ? (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('DRAFT')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('IN_REVIEW')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit for Review</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save ({status})</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('PUBLISHED')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Publish Immediately</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: 2 Columns (Editor 2/3, Metadata 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Content Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Type Selector */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex gap-2">
            {[
              { id: 'ARTICLE', label: 'Article', icon: FileText },
              { id: 'VIDEO', label: 'Video Post', icon: Play },
              { id: 'AUDIO', label: 'Audio Podcast', icon: Headphones },
              { id: 'GALLERY', label: 'Photo Gallery', icon: Camera },
            ].map((t) => {
              const Icon = t.icon;
              const active = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as PostType)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow'
                      : 'bg-zinc-950/60 text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bilingual Language Switcher Bar */}
          <div className="flex border-b border-zinc-800">
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
              <span>বাংলা সামগ্রী (Bengali)</span>
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

          {/* Type-Specific Media Components */}
          {type === 'VIDEO' && (
            <div className="space-y-4">
              <MediaPicker
                label="Video Asset or Embed URL"
                value={videoUrl}
                onChange={setVideoUrl}
                accept="video/*"
                type="video"
                placeholder="https://www.youtube.com/watch?v=... or upload .mp4"
                description="Upload direct MP4 video file or paste YouTube / Vimeo / Facebook embed link"
              />

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Video Transcript (ভিডিও বিবরণ ও সাবটাইটেল)
                </label>
                <textarea
                  rows={3}
                  value={videoTranscript}
                  onChange={(e) => setVideoTranscript(e.target.value)}
                  placeholder="Transcript of match highlights, player reactions, or post-match press conference..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200"
                />
              </div>
            </div>
          )}

          {type === 'AUDIO' && (
            <div className="space-y-4">
              <MediaPicker
                label="Audio / Podcast Audio Stream (.mp3)"
                value={audioUrl}
                onChange={setAudioUrl}
                accept="audio/*"
                type="audio"
                placeholder="Upload podcast .mp3 or paste audio feed URL..."
                description="Upload match commentary podcast or post-match reaction audio"
              />

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Audio Show Notes (শো নোট ও টাইমস্ট্যাম্প)
                </label>
                <textarea
                  rows={3}
                  value={audioShowNotes}
                  onChange={(e) => setAudioShowNotes(e.target.value)}
                  placeholder="00:00 - Introduction\n04:15 - Tactical Discussion\n12:30 - Player Ratings"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200 font-mono"
                />
              </div>
            </div>
          )}

          {type === 'GALLERY' && (
            <GalleryEditor images={galleryImages} onChange={setGalleryImages} />
          )}
        </div>

        {/* Sidebar Settings (Right 1 col) */}
        <div className="space-y-6">
          {/* Author / Publisher Widget (PART D) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-500" />
              <span>Author / Publisher Attribution</span>
            </h3>

            {isContributor ? (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-white block truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                    <Lock className="w-3 h-3 text-zinc-500" /> Locked to your account
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={authorId}
                  onChange={(e) => handleAuthorChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white font-bold focus:outline-none focus:border-brand-500"
                >
                  {authorsList.length > 0 ? (
                    authorsList.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name} ({author.role})
                      </option>
                    ))
                  ) : (
                    <option value={authorId}>{authorName || 'Current Author'}</option>
                  )}
                </select>
                <p className="text-[10px] text-zinc-500">
                  Reassign article attribution to any registered newsroom reporter or contributor.
                </p>
              </div>
            )}
          </div>

          {/* Publishing State Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider">
              Publishing Workflow (স্ট্যাটাস)
            </h3>

            <div className="space-y-2">
              {(isContributor
                ? [
                    { id: 'DRAFT', label: 'Draft (খসড়া)', desc: 'Saved privately' },
                    { id: 'IN_REVIEW', label: 'In Review (পর্যালোচনাধীন)', desc: 'Ready for senior editor' },
                  ]
                : [
                    { id: 'DRAFT', label: 'Draft (খসড়া)', desc: 'Saved privately' },
                    { id: 'IN_REVIEW', label: 'In Review (পর্যালোচনাধীন)', desc: 'Ready for senior editor' },
                    { id: 'SCHEDULED', label: 'Scheduled (শিডিউল্ড)', desc: 'Publish at future date' },
                    { id: 'PUBLISHED', label: 'Published (প্রকাশিত)', desc: 'Live immediately' },
                  ]
              ).map((s) => (
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

            {/* If Scheduled (Admin & Editor only) */}
            {!isContributor && status === 'SCHEDULED' && (
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
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200 font-bold"
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
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200 font-bold"
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

          {/* Featured Cover Image Widget with MediaPicker */}
          <MediaPicker
            label="Featured Cover Image"
            value={featuredImage}
            onChange={setFeaturedImage}
            accept="image/*"
            type="image"
            placeholder="Upload or choose photo..."
            description="Hero banner photo used for article cover and social share cards"
          />
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
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded bg-brand-600 text-white font-extrabold text-[11px] uppercase">
                  {category}
                </span>
                <span className="text-xs text-zinc-400 font-bold uppercase">{leagueTag}</span>
              </div>

              <h1 className="font-headline font-black text-3xl sm:text-4xl text-white leading-tight">
                {titleBn || titleEn || 'Untitled Headline'}
              </h1>

              <div className="text-xs text-zinc-400 flex items-center gap-2 py-1 border-y border-zinc-800">
                <User className="w-3.5 h-3.5 text-brand-500" />
                <span>লেখক / Author: <strong className="text-white">{authorName}</strong></span>
              </div>

              {(excerptBn || excerptEn) && (
                <p className="text-zinc-300 text-base italic border-l-4 border-brand-500 pl-3">
                  {excerptBn || excerptEn}
                </p>
              )}

              {featuredImage && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800">
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