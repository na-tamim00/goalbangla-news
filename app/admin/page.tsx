import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export default async function AdminIndexPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }
  redirect('/admin/posts');
}