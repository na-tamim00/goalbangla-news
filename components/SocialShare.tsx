'use client';

import React, { useState } from 'react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Share2, Link as LinkIcon, Check, Facebook } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url: string;
  locale: Locale;
}

export default function SocialShare({ title, url, locale }: SocialShareProps) {
  const dict = getDictionary(locale);
  const [copied, setCopied] = useState(false);

  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // fallback
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 border-y border-zinc-200 dark:border-zinc-800 my-6">
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mr-2">
        <Share2 className="w-4 h-4 text-brand-500" />
        <span>{dict.share.shareTitle}:</span>
      </span>

      {/* Facebook Button */}
      <a
        href={fbShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 text-xs font-bold transition-colors"
      >
        <Facebook className="w-3.5 h-3.5 fill-current" />
        <span>{dict.share.facebook}</span>
      </a>

      {/* WhatsApp Button */}
      <a
        href={waShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 text-xs font-bold transition-colors"
      >
        <span className="font-mono text-sm">💬</span>
        <span>{dict.share.whatsapp}</span>
      </a>

      {/* X / Twitter Button */}
      <a
        href={xShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-black text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition-colors"
      >
        <span className="font-bold text-xs">𝕏</span>
        <span>{dict.share.twitter}</span>
      </a>

      {/* Copy Link Button */}
      <button
        onClick={copyToClipboard}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
          copied
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-zinc-300 dark:border-zinc-700'
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
        <span>{copied ? dict.share.copiedToast : dict.share.copyLink}</span>
      </button>
    </div>
  );
}