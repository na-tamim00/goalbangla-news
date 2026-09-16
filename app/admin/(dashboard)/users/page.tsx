'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAdminUser } from '@/components/AdminUserContext';
import MediaPicker from '@/components/MediaPicker';
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
  RefreshCw,
  Sparkles,
  ArrowRightLeft,
  Key,
} from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: 'ADMIN' | 'SUB_ADMIN' | 'CONTRIBUTOR';
  displayTitle?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION';
  devCode?: string | null;
  createdAt?: string;
}

export default function UsersManagementPage() {
  const currentUser = useAdminUser();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // User form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'SUB_ADMIN' | 'CONTRIBUTOR'>('CONTRIBUTOR');
  const [displayTitle, setDisplayTitle] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Generated Temp Password Modal
  const [createdInfo, setCreatedInfo] = useState<{
    name: string;
    username?: string;
    email: string;
    tempPassword?: string | null;
    devCode?: string | null;
  } | null>(null);

  // Resend code loading tracking
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Ownership Transfer Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [targetSubAdminId, setTargetSubAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [transferring, setTransferring] = useState(false);

  // Dev Code Alert Banner
  const [activeDevAlert, setActiveDevAlert] = useState<{ email: string; code: string } | null>(null);

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
    setSuccessMsg(null);

    if (!name.trim()) {
      setError('Please provide the full name.');
      setSaving(false);
      return;
    }

    if (!username.trim() && !email.trim()) {
      setError('Please provide a User ID / Username or Email.');
      setSaving(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter a login password for this account.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase() || `${username.trim().toLowerCase()}@goalbangla.com`,
          role: currentUser.role === 'SUB_ADMIN' ? 'CONTRIBUTOR' : role,
          displayTitle: displayTitle.trim() || undefined,
          password: password.trim(),
          avatarUrl: avatarUrl || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers([...users, data.user]);
        setCreatedInfo({
          name: data.user.name,
          username: data.user.username,
          email: data.user.email,
          tempPassword: data.temporaryPassword,
        });

        setName('');
        setUsername('');
        setEmail('');
        setDisplayTitle('');
        setPassword('');
        setAvatarUrl('');
        setIsAdding(false);
        setSuccessMsg(`Account created successfully for ${data.user.name}! User ID: ${data.user.username || data.user.email}. Password: ${data.temporaryPassword}. They can log in immediately.`);
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating user');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'SUB_ADMIN' | 'CONTRIBUTOR') => {
    if (currentUser.role !== 'ADMIN') return;
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        setSuccessMsg('User role updated successfully');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update role');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating role');
    }
  };

  const handleResendCode = async (userId: string, userEmail: string) => {
    setResendingId(userId);
    setError(null);
    try {
      const res = await fetch('/api/users/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Verification code resent to ${userEmail}`);
        if (data.devCode) {
          setActiveDevAlert({ email: userEmail, code: data.devCode });
        }
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (err: any) {
      setError(err.message || 'Error resending code');
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to deactivate and remove ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        setSuccessMsg(`${userName} has been removed.`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting user');
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmPhrase !== 'TRANSFER OWNERSHIP') {
      setError('You must type TRANSFER OWNERSHIP exactly to confirm.');
      return;
    }
    if (!targetSubAdminId || !adminPassword) {
      setError('Please select a Sub-Admin and enter your password.');
      return;
    }

    setTransferring(true);
    setError(null);

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TRANSFER_OWNERSHIP',
          targetUserId: targetSubAdminId,
          adminPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Super Admin ownership successfully transferred. You will now be redirected.');
        window.location.reload();
      } else {
        setError(data.error || 'Ownership transfer failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error during transfer');
    } finally {
      setTransferring(false);
    }
  };

  const subAdmins = users.filter((u) => u.role === 'SUB_ADMIN');

  return (
    <div className="space-y-6">
      {/* Dev Mode Verification Code Banner */}
      {activeDevAlert && (
        <div className="p-4 bg-indigo-950 border-2 border-indigo-600 rounded-xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-300 block">
                Development Test Code (RESEND_API_KEY Not Configured)
              </span>
              <p className="text-xs text-zinc-300">
                Active 6-digit code for <strong>{activeDevAlert.email}</strong>:{' '}
                <span className="font-mono text-base font-black tracking-widest text-white ml-2 bg-black/60 px-2 py-0.5 rounded border border-indigo-700">
                  {activeDevAlert.code}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveDevAlert(null)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-brand-500" />
            <h1 className="text-xl font-bold font-headline uppercase tracking-wider text-white">
              Team & Account Management
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            {currentUser.role === 'ADMIN'
              ? 'Super Admin portal: manage Sub-Admins, Contributors, byline titles, and Gmail verification.'
              : 'Sub-Admin newsroom portal: create Contributor accounts and view team directory.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'ADMIN' && subAdmins.length > 0 && (
            <button
              onClick={() => setTransferModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Ownership</span>
            </button>
          )}

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
          >
            {isAdding ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{isAdding ? 'Cancel' : 'Add New Account'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}>
            <X className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      )}

      {/* Temp Password Created Modal */}
      {createdInfo && (
        <div className="p-4 bg-zinc-900 border border-brand-500/50 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Account Created Successfully
            </h3>
            <button onClick={() => setCreatedInfo(null)} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-zinc-300">
            Account for <strong>{createdInfo.name}</strong> ({createdInfo.email}) is awaiting 6-digit email confirmation.
          </p>
          {createdInfo.tempPassword && (
            <div className="p-2.5 bg-zinc-950 rounded border border-zinc-800 text-xs flex items-center justify-between">
              <span className="text-zinc-400">Temporary Password:</span>
              <code className="font-mono font-bold text-amber-400 select-all">{createdInfo.tempPassword}</code>
            </div>
          )}
        </div>
      )}

      {/* Add User Drawer / Card */}
      {isAdding && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-2xl space-y-5 animate-in fade-in">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Create New Newsroom Member
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {currentUser.role === 'SUB_ADMIN'
                ? 'Sub-Admins can create Contributor accounts with public byline attribution.'
                : 'Create a Sub-Admin or Contributor account. A 6-digit verification code will be sent to their Gmail.'}
            </p>
          </div>

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Shakib Al Hasan"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                User ID / Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. subadmin1 or sports_author"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
                <Key className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">Used to log into the admin panel</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@goalbangla.com"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Role (Permissions) *
              </label>
              <select
                value={currentUser.role === 'SUB_ADMIN' ? 'CONTRIBUTOR' : role}
                onChange={(e) => setRole(e.target.value as any)}
                disabled={currentUser.role === 'SUB_ADMIN'}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 disabled:opacity-60"
              >
                {currentUser.role === 'ADMIN' && (
                  <option value="SUB_ADMIN">Sub-Admin (Manage & Publish Posts, Media, Auto Reports)</option>
                )}
                <option value="CONTRIBUTOR">Author / Contributor (Draft Articles & Submit for Review)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Public Byline Title / Designation
              </label>
              <input
                type="text"
                value={displayTitle}
                onChange={(e) => setDisplayTitle(e.target.value)}
                placeholder="e.g. Senior Sports Correspondent, Chief Analyst, Author"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Login Password *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Set initial password for this user"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 font-mono"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Profile Photo / Avatar
              </label>
              <MediaPicker
                label="Select Profile Photo"
                value={avatarUrl}
                onChange={(url: string) => setAvatarUrl(url)}
                type="image"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-300 uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating Account...' : 'Create Account & Grant Access'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Permission Role</th>
                <th className="px-4 py-3">Byline Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    Loading team accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    No users registered yet.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const isPending = u.status === 'PENDING_VERIFICATION';

                  return (
                    <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                            {u.avatarUrl ? (
                              <Image src={u.avatarUrl} alt={u.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                                {u.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block truncate">{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
                                (You)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-zinc-200 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {u.username || '—'}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 font-mono text-zinc-400">{u.email}</td>

                      {/* Role Selector or Badge */}
                      <td className="px-4 py-3">
                        {currentUser.role === 'ADMIN' && !isCurrent ? (
                          <select
                            value={u.role === 'ADMIN' ? 'ADMIN' : u.role}
                            disabled={u.role === 'ADMIN'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                            className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-brand-500"
                          >
                            {u.role === 'ADMIN' && <option value="ADMIN">SUPER ADMIN</option>}
                            <option value="SUB_ADMIN">SUB_ADMIN</option>
                            <option value="CONTRIBUTOR">CONTRIBUTOR</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider text-white ${
                              u.role === 'ADMIN'
                                ? 'bg-rose-600'
                                : u.role === 'SUB_ADMIN'
                                ? 'bg-emerald-600'
                                : 'bg-amber-600'
                            }`}
                          >
                            {u.role}
                          </span>
                        )}
                      </td>

                      {/* Display Title */}
                      <td className="px-4 py-3 text-zinc-300">{u.displayTitle || '—'}</td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-950/90 text-amber-300 border border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Pending Code
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          {isPending && (
                            <button
                              onClick={() => handleResendCode(u.id, u.email)}
                              disabled={resendingId === u.id}
                              title="Resend 6-digit verification code"
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3 h-3 ${resendingId === u.id ? 'animate-spin' : ''}`} />
                              <span>Resend</span>
                            </button>
                          )}

                          {currentUser.role === 'ADMIN' && !isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title="Delete user"
                              className="p-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded text-rose-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ownership Transfer Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-rose-700 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <ArrowRightLeft className="w-5 h-5" />
                <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                  Transfer Super Admin Ownership
                </h3>
              </div>
              <button onClick={() => setTransferModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-lg text-rose-300 text-xs space-y-1">
              <p className="font-bold uppercase tracking-wider">Warning: Critical Action</p>
              <p>
                This will elevate the selected Sub-Admin to become the sole Super Admin of GoalBangla. Your account
                will immediately step down to Sub-Admin.
              </p>
            </div>

            <form onSubmit={handleTransferOwnership} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Select New Super Admin (Sub-Admin)
                </label>
                <select
                  value={targetSubAdminId}
                  onChange={(e) => setTargetSubAdminId(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Choose Sub-Admin --</option>
                  {subAdmins.map((sa) => (
                    <option key={sa.id} value={sa.id}>
                      {sa.name} ({sa.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Your Current Super Admin Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  placeholder="Enter your password to authorize"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Type <span className="text-rose-400 font-mono">TRANSFER OWNERSHIP</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  required
                  placeholder="TRANSFER OWNERSHIP"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-300 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring || confirmPhrase !== 'TRANSFER OWNERSHIP'}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                >
                  {transferring ? 'Transferring...' : 'Confirm Ownership Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
