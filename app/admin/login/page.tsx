'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@goalbangla.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/admin/posts');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="relative h-14 w-60 mx-auto mb-4">
          <Image src="/goalbangla-logo.svg" alt="GoalBangla" fill className="object-contain" priority />
        </div>
        <h2 className="font-headline font-black text-2xl uppercase tracking-wider text-white">
          Editorial CMS Portal
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          Sign in with your newsroom credentials to manage articles, matches, and live media
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Newsroom Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Bar */}
          <div className="pt-4 border-t border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 text-center">
              Quick One-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setCredentials('admin@goalbangla.com', 'admin123')}
                className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 rounded text-brand-400 hover:text-brand-300 text-center transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setCredentials('editor@goalbangla.com', 'editor123')}
                className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 rounded text-emerald-400 hover:text-emerald-300 text-center transition-colors"
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setCredentials('writer@goalbangla.com', 'writer123')}
                className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 rounded text-amber-400 hover:text-amber-300 text-center transition-colors"
              >
                Contributor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}