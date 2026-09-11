import { redirect } from 'next/navigation';
import { repo } from '@/lib/db';
import SetupForm from './SetupForm';

export const dynamic = 'force-dynamic';

export default async function AdminSetupPage() {
  const hasUsers = await repo.hasUsers();
  if (hasUsers) {
    redirect('/admin/login');
  }

  return <SetupForm />;
}
