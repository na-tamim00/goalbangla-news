'use client';

import React, { useState, useEffect } from 'react';
import { useAdminUser } from '@/components/AdminUserContext';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Mail,
  Lock,
  User as UserIcon,
} from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'CONTRIBUTOR';
  avatarUrl?: string;
}

export default function UsersManagementPage() {
  const currentUser = useAdminUser();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EDITOR' | 'CONTRIBUTOR'>('CONTRIBUTOR');
  const [password, setPassword] = useState('user123');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        setError('Failed to load users');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers([...users, data.user]);
        setName('');
        setEmail('');
        setPassword('user123');
        setIsAdding(false);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating user');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'EDITOR' | 'CONTRIBUTOR') => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      });

      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert('Failed to update role');
      }
    } catch (err) {
      alert('Error updating role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to deactivate and remove ${userName}?`)) return;

    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl mx-auto my-12 space-y-4">
        <Shield className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-zinc-400">
          User account management and role assignments are restricted to newsroom Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="font-headline font-black text-3xl uppercase tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-500" />
            <span>Newsroom User Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage newsroom staff accounts, editorial privileges, and author credentials
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg self-start sm:self-auto"
        >
          {isAdding ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{isAdding ? 'Cancel' : 'Add New Member'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add User Modal / Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateUser}
          className="p-6 bg-zinc-900 border border-brand-500/50 rounded-2xl shadow-2xl space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand-500" />
              <span>Create New Newsroom Member</span>
            </h3>
            <span className="text-[11px] text-zinc-500">Default password: user123</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Full Name (নাম) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: সাকিব আল হাসান"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                />
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reporter@goalbangla.com"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Role / Permissions *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white font-bold"
              >
                <option value="CONTRIBUTOR">CONTRIBUTOR (Draft & In Review)</option>
                <option value="EDITOR">EDITOR (Publish, Edit Any, Media)</option>
                <option value="ADMIN">ADMIN (Full Newsroom Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="user123"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Save User Account'}
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-zinc-400 font-bold text-sm">
            Loading newsroom staff directory...
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Role Permission</th>
                  <th className="px-4 py-3.5">Capability Scope</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {users.map((u) => {
                  const isSelf = u.id === currentUser.id;

                  return (
                    <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-800 text-brand-400 border border-zinc-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">
                              {u.name} {isSelf && <span className="text-[10px] text-brand-400 font-normal">(You)</span>}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-zinc-300">
                        {u.email}
                      </td>

                      {/* Role Dropdown */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isSelf ? (
                          <span className="inline-block px-2.5 py-1 rounded text-[11px] font-extrabold uppercase tracking-wider bg-rose-600 text-white">
                            ADMIN (Active)
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded text-[11px] font-extrabold uppercase tracking-wider border focus:outline-none ${
                              u.role === 'ADMIN'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                : u.role === 'EDITOR'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                : 'bg-amber-950/80 text-amber-300 border-amber-800'
                            }`}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="EDITOR">EDITOR</option>
                            <option value="CONTRIBUTOR">CONTRIBUTOR</option>
                          </select>
                        )}
                      </td>

                      {/* Capability Description */}
                      <td className="px-4 py-3.5 text-zinc-400 text-[11px]">
                        {u.role === 'ADMIN' && 'Full control: All posts, users, media, standings'}
                        {u.role === 'EDITOR' && 'Publish, edit, & delete any post, media library'}
                        {u.role === 'CONTRIBUTOR' && 'Draft & submit own posts for review only'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            title="Deactivate Account"
                            className="p-1.5 rounded bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
