'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PostData, PostStatus } from '@/lib/db/types';
import { useAdminUser } from '@/components/AdminUserContext';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  Play,
  Headphones,
  Camera,
  CheckCircle,
  Clock,
  AlertCircle,
  Facebook,
  Send,
  RotateCcw,
  Check,
  User,
} from 'lucide-react';

export default function AdminPostsPage() {
  const currentUser = useAdminUser();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [contributorTab, setContributorTab] = useState<'MINE' | 'ALL'>('MINE');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?admin=true');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Quick Action: Submit for review (Contributor)
  const handleSubmitForReview = async (post: PostData) => {
    setActionLoadingId(post.id);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_REVIEW' }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, status: 'IN_REVIEW' as PostStatus } : p))
        );
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit for review');
      }
    } catch (err) {
      alert('Network error submitting for review');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Action: Publish post (Editor & Admin)
  const handlePublish = async (post: PostData) => {
    setActionLoadingId(post.id);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      if (res.ok) {
        const now = new Date().toISOString();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id ? { ...p, status: 'PUBLISHED' as PostStatus, publishedAt: now } : p
          )
        );
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to publish post');
      }
    } catch (err) {
      alert('Network error publishing post');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Action: Unpublish / Revert to Draft (Editor & Admin)
  const handleUnpublish = async (post: PostData) => {
    setActionLoadingId(post.id);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, status: 'DRAFT' as PostStatus } : p))
        );
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to unpublish');
      }
    } catch (err) {
      alert('Network error unpublishing');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Action: Delete post (Editor & Admin only)
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Delete failed');
      }
    } catch (err) {
      alert('Network error deleting post');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleShareFacebook = (slug: string) => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const postUrl = `${siteUrl}/bn/news/${slug}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    // Contributor tab filter
    if (currentUser.role === 'CONTRIBUTOR') {
      if (contributorTab === 'MINE' && p.authorId !== currentUser.id) {
        return false;
      }
    }

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      p.translations.bn?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.translations.en?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.authorName && p.authorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const isEditorOrAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUB_ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="font-headline font-black text-3xl uppercase tracking-tight text-white flex items-center gap-2.5">
            <span>Editorial Post Manager</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                currentUser.role === 'ADMIN'
                  ? 'bg-rose-600 text-white'
                  : currentUser.role === 'SUB_ADMIN'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {currentUser.role}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {currentUser.role === 'CONTRIBUTOR'
              ? 'Draft articles, submit pieces for editorial review, and track publishing status'
              : 'Review submissions, assign authors, approve & publish articles, and manage newsroom output'}
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write New Post (নতুন পোস্ট)</span>
        </Link>
      </div>

      {/* Contributor Role Tab Switcher */}
      {currentUser.role === 'CONTRIBUTOR' && (
        <div className="flex border-b border-zinc-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setContributorTab('MINE')}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              contributorTab === 'MINE'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Articles ({posts.filter((p) => p.authorId === currentUser.id).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setContributorTab('ALL')}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              contributorTab === 'ALL'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Newsroom Wire ({posts.length})</span>
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by headline, author, or slug..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-bold text-zinc-400 uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published (প্রকাশিত)</option>
            <option value="IN_REVIEW">In Review (পর্যালোচনাধীন)</option>
            <option value="DRAFT">Draft (খসড়া)</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-bold text-zinc-400 uppercase">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Content Types</option>
            <option value="ARTICLE">Article</option>
            <option value="VIDEO">Video Post</option>
            <option value="AUDIO">Podcast / Audio</option>
            <option value="GALLERY">Photo Gallery</option>
          </select>
        </div>
      </div>

      {/* Post Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-zinc-400 font-bold text-sm">
            Loading newsroom articles...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm">
            No matching posts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Headline & Slug</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Author / Byline</th>
                  <th className="px-4 py-3 text-right">Workflow & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {filteredPosts.map((post) => {
                  const titleBn = post.translations.bn?.title || '';
                  const titleEn = post.translations.en?.title || '';
                  const isOwnPost = post.authorId === currentUser.id;
                  const canEdit = isEditorOrAdmin || isOwnPost;
                  const canPublish = isEditorOrAdmin;
                  const canDelete = isEditorOrAdmin;
                  const isActionLoading = actionLoadingId === post.id;

                  return (
                    <tr key={post.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Type Icon */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="p-1.5 rounded-lg bg-zinc-800 text-brand-400 inline-flex items-center justify-center">
                          {post.type === 'ARTICLE' && <FileText className="w-4 h-4" />}
                          {post.type === 'VIDEO' && <Play className="w-4 h-4 fill-current" />}
                          {post.type === 'AUDIO' && <Headphones className="w-4 h-4" />}
                          {post.type === 'GALLERY' && <Camera className="w-4 h-4" />}
                        </span>
                      </td>

                      {/* Title & Slug */}
                      <td className="px-4 py-3 max-w-md">
                        <div className="font-bold text-sm text-zinc-100 line-clamp-1 mb-0.5">
                          {titleBn}
                        </div>
                        {titleEn && (
                          <div className="text-[11px] text-zinc-400 line-clamp-1 italic mb-1">
                            {titleEn}
                          </div>
                        )}
                        <span className="font-mono text-[10px] text-zinc-500 block truncate">
                          /{post.slug}
                        </span>
                      </td>

                      {/* Category & League */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase block mb-1">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">
                          {post.leagueTag}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {post.status === 'PUBLISHED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>PUBLISHED</span>
                          </span>
                        )}
                        {post.status === 'DRAFT' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            <span>DRAFT</span>
                          </span>
                        )}
                        {post.status === 'IN_REVIEW' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            <span>IN REVIEW</span>
                          </span>
                        )}
                        {post.status === 'SCHEDULED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-950 text-blue-400 border border-blue-800">
                            <Clock className="w-3 h-3" />
                            <span>SCHEDULED</span>
                          </span>
                        )}
                      </td>

                      {/* Author */}
                      <td className="px-3 py-3 whitespace-nowrap text-zinc-300 text-xs">
                        <span className="font-bold block">{post.authorName || 'Newsroom'}</span>
                        {isOwnPost && (
                          <span className="text-[10px] text-amber-400 font-normal">
                            (Your article)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Contributor: Submit for Review (if Draft & own post) */}
                          {!isEditorOrAdmin && isOwnPost && post.status === 'DRAFT' && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleSubmitForReview(post)}
                              title="Submit for Senior Editor Review"
                              className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit Review</span>
                            </button>
                          )}

                          {/* Editor / Admin: Quick Approve & Publish */}
                          {canPublish && (post.status === 'IN_REVIEW' || post.status === 'DRAFT') && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handlePublish(post)}
                              title="Approve and Publish Post Immediately"
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Publish</span>
                            </button>
                          )}

                          {/* Editor / Admin: Revert to Draft */}
                          {canPublish && post.status === 'PUBLISHED' && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleUnpublish(post)}
                              title="Unpublish / Revert to Draft"
                              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Facebook Share Button */}
                          <button
                            type="button"
                            onClick={() => handleShareFacebook(post.slug)}
                            title="Share to Facebook"
                            className="p-1.5 rounded bg-zinc-800 hover:bg-[#1877F2] text-zinc-400 hover:text-white transition-colors"
                          >
                            <Facebook className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Public Preview */}
                          <Link
                            href={`/bn/news/${post.slug}`}
                            target="_blank"
                            title="View Live Article"
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white inline-block transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit (Available if Admin/Editor OR Contributor's own post) */}
                          {canEdit && (
                            <Link
                              href={`/admin/posts/${post.id}/edit`}
                              title="Edit Article"
                              className="p-1.5 rounded bg-zinc-800 hover:bg-brand-600 text-zinc-400 hover:text-white inline-block transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Delete (Admin & Editor only) */}
                          {canDelete && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleDelete(post.id, titleBn || titleEn || post.slug)}
                              title="Permanently Delete Article"
                              className="p-1.5 rounded bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}