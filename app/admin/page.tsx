import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { repo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminIndexPage() {
  const hasUsers = await repo.hasUsers();
  if (!hasUsers) {
    redirect('/admin/setup');
  }

  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }
  redirect('/admin/posts');
}