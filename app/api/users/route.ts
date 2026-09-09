import { NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await repo.getAllUsers();
    // Exclude password hashes
    const sanitized = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatarUrl: u.avatarUrl,
    }));

    return NextResponse.json({ users: sanitized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}