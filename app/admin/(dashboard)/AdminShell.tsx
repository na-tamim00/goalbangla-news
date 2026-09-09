'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/auth';
import {
  FileText,
  PlusCircle,
  FolderOpen,
  Trophy,
  Activity,
  LogOut,
  Home,
  Menu,
  X,
} from 'lucide-react';

interface AdminShellProps {
  user: AuthUser;
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/posts', label: 'All Posts (সকল পোস্ট)', icon: FileText },
    { href: '/admin/posts/new', label: 'New Post (নতুন পোস্ট)', icon: PlusCircle },
    { href: '/admin/auto-reports', label: 'Auto Match Reports', icon: Activity },
    { href: '/admin/media', label: 'Media Library', icon: FolderOpen },
    { href: '/admin/standings-override', label: 'Standings Override', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Nav Top Bar */}
      <div className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
        <div className="relative h-8 w-36">
          <Image src="/goalbangla-logo.svg" alt="GoalBangla" fill className="object-contain" />
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 bg-zinc-800 rounded text-zinc-200"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`${
          mobileNavOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-zinc-900/90 border-r border-zinc-800 flex flex-col shrink-0`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <Link href="/admin/posts" className="block relative h-10 w-44">
            <Image src="/goalbangla-logo.svg" alt="GoalBangla CMS" fill className="object-contain" />
          </Link>
        </div>

        {/* User Role Badge */}
        <div className="p-4 mx-3 my-3 bg-zinc-950/80 rounded-xl border border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-white truncate">{user.name}</h4>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-brand-600 text-white tracking-wider">
              {user.role}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1.5 font-bold text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-800 space-y-2 text-xs font-bold">
          <Link
            href="/bn"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>View Public Site (ওয়েবসাইট)</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out (লগআউট)</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-5 sm:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}