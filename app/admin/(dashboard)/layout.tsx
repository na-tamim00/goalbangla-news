import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import AdminShell from './AdminShell';

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}