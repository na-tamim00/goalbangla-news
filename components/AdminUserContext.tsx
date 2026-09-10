'use client';

import React, { createContext, useContext } from 'react';
import { AuthUser } from '@/lib/auth';

interface AdminUserContextType {
  user: AuthUser;
}

const AdminUserContext = createContext<AdminUserContextType | null>(null);

export function AdminUserProvider({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  return (
    <AdminUserContext.Provider value={{ user }}>
      {children}
    </AdminUserContext.Provider>
  );
}

export function useAdminUser(): AuthUser {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error('useAdminUser must be used within an AdminUserProvider');
  }
  return context.user;
}
