import React from 'react';
import Link from 'next/link';
import { Flag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-zinc-950 text-white">
      <div className="w-20 h-20 rounded-full bg-brand-950 border-2 border-brand-600 flex items-center justify-center text-brand-500 mb-6 shadow-xl">
        <Flag className="w-10 h-10 animate-bounce" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">
        ERROR 404 • OFFSIDE!
      </span>

      <h1 className="font-headline font-black text-4xl sm:text-6xl uppercase tracking-tight mb-4">
        অফসাইড! পেজটি খুঁজে পাওয়া যায়নি
      </h1>

      <p className="text-zinc-400 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
        The referee has flagged you offside. The match report or page you were searching for might have moved or does not exist.
      </p>

      <Link
        href="/bn"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>প্রচ্ছদে ফিরে যান (Return to Home)</span>
      </Link>
    </div>
  );
}