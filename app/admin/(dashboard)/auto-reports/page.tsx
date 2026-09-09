'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Fixture } from '@/lib/football/types';
import { PostData } from '@/lib/db/types';
import {
  Activity,
  Bot,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  FileEdit,
  ShieldCheck,
} from 'lucide-react';

export default function AutoReportsAdminPage() {
  const [finishedMatches, setFinishedMatches] = useState<Fixture[]>([]);
  const [drafts, setDrafts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesRes, postsRes] = await Promise.all([
        fetch('/api/matches?status=FINISHED'),
        fetch('/api/posts?admin=true'),
      ]);

      if (matchesRes.ok) {
        const mData = await matchesRes.json();
        setFinishedMatches(mData.matches || []);
      }

      if (postsRes.ok) {
        const pData = await postsRes.json();
        const autoDrafts = (pData.posts || []).filter(
          (p: PostData) =>
            p.category === 'MATCH_REPORTS' &&
            (p.status === 'DRAFT' || p.status === 'IN_REVIEW')
        );
        setDrafts(autoDrafts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateDraft = async (matchId: string) => {
    setGenerating(matchId);
    try {
      const res = await fetch('/api/matches/auto-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      });

      if (res.ok) {
        const data = await res.json();
        setDrafts([data.post, ...drafts]);
        alert('Match report draft generated successfully! Ready for editorial review.');
      } else {
        alert('Failed to generate report draft');
      }
    } catch (err) {
      alert('Error generating draft');
    } finally {
      setGenerating(null);
    }
  };

  const handleApprovePublish = async (post: PostData) => {
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });

      if (res.ok) {
        alert('Article approved and published to the live site!');
        setDrafts(drafts.filter((d) => d.id !== post.id));
      }
    } catch (err) {
      alert('Publishing failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-5 h-5 text-brand-500" />
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
            Hybrid Automation + Human Control
          </span>
        </div>
        <h1 className="font-headline font-black text-3xl uppercase tracking-tight text-white">
          Auto Match Report Desk
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
          Pull real-time scores and statistics right after a match finishes to auto-generate
          bilingual article drafts. Review, adjust, and approve before public release.
        </p>
      </div>

      {/* Section 1: Finished Matches Ready for Report Generation */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="font-headline font-black text-lg uppercase tracking-wider text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>Finished Games Available for AI Match Report</span>
          </h3>
          <span className="text-xs font-bold text-zinc-500">
            {finishedMatches.length} Matches Found
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {finishedMatches.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block mb-1">
                  {m.competition}
                </span>
                <div className="flex items-center justify-between font-bold text-sm text-zinc-100">
                  <span>{m.homeTeam.name}</span>
                  <span className="font-headline font-black text-lg text-brand-500 px-2 py-0.5 bg-zinc-900 rounded">
                    {m.homeScore} - {m.awayScore}
                  </span>
                  <span>{m.awayTeam.name}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={generating === m.id}
                onClick={() => handleGenerateDraft(m.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-600/20 hover:bg-brand-600 border border-brand-500/40 text-brand-300 hover:text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {generating === m.id ? 'Generating Draft...' : 'Auto-Generate Match Report'}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Drafts Awaiting Editorial Approval */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="font-headline font-black text-lg uppercase tracking-wider text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Drafts Awaiting Human Editor Approval ({drafts.length})</span>
          </h3>
        </div>

        {drafts.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs italic">
            No auto-drafts currently in queue. Click "Auto-Generate Match Report" above to draft a report.
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                      {d.status}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold">{d.leagueTag}</span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-100">{d.translations.bn?.title}</h4>
                  <p className="text-xs text-zinc-400 italic line-clamp-1">
                    {d.translations.en?.title}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <Link
                    href={`/admin/posts/${d.id}/edit`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Edit Draft</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleApprovePublish(d)}
                    className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}