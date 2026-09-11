'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowRight, KeyRound } from 'lucide-react';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail, email]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (code.trim().length !== 6) {
      setError('Please enter a 6-digit verification code.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Account verified successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/admin/posts');
        }, 1000);
      } else {
        setError(data.error || 'Verification failed');
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setResending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('A new verification code has been dispatched to your Gmail inbox.');
        setAttemptsLeft(3);
        if (data.devCode) {
          setDevCode(data.devCode);
        }
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (err: any) {
      setError(err.message || 'Error resending code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="relative h-14 w-60 mx-auto mb-4">
          <Image src="/goalbangla-logo.svg" alt="GoalBangla" fill className="object-contain" priority />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-800 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Email Verification Required</span>
        </div>
        <h2 className="font-headline font-black text-2xl uppercase tracking-wider text-white">
          Confirm Your Gmail Account
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          Enter the 6-digit confirmation code delivered to your registered Gmail address.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {devCode && (
            <div className="p-3 bg-indigo-950/80 border border-indigo-700 rounded-lg text-indigo-200 text-xs flex flex-col gap-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-400">
                Development Test Code:
              </span>
              <span className="font-mono text-base font-black tracking-widest text-white">
                {devCode}
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Gmail Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="editor@gmail.com"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  6-Digit Verification Code
                </label>
                {attemptsLeft !== null && attemptsLeft > 0 && (
                  <span className="text-[10px] text-amber-400 font-bold">
                    {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} left
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="123456"
                className="w-full bg-zinc-950 border-2 border-brand-600 rounded-lg py-3 text-center text-2xl font-black font-mono tracking-[0.5em] text-white placeholder-zinc-700 focus:outline-none focus:border-brand-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Launch Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white font-bold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Resending Code...' : 'Resend Code'}</span>
            </button>

            <a href="/admin/login" className="text-zinc-500 hover:text-zinc-300">
              Return to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
