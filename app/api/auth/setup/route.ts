import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { hashPassword, signSessionToken } from '@/lib/auth';

export async function GET() {
  try {
    const hasUsers = await repo.hasUsers();
    return NextResponse.json({ initialized: hasUsers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. One-time setup guard: if any user exists, forbid setup
    const hasUsers = await repo.hasUsers();
    if (hasUsers) {
      return NextResponse.json(
        { error: 'Setup has already been completed. An admin account already exists.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name = 'Habibur Rahman Khan', email, password, confirmPassword } = body;

    const trimmedName = (name || '').trim() || 'Habibur Rahman Khan';
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedEmail) {
      return NextResponse.json({ error: 'Gmail address is required.' }, { status: 400 });
    }

    if (!trimmedEmail.endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: 'Please enter a valid Gmail address (@gmail.com).' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    // 2. Hash password and create the Single Super Admin
    const passwordHash = await hashPassword(password);
    const adminUser = await repo.createUser({
      id: `admin-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      role: 'ADMIN',
      displayTitle: 'Founder & Editor-in-Chief',
      status: 'ACTIVE', // Founding admin is immediately verified
      mustChangePassword: false,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    });

    // 3. Issue session token and log in straight to dashboard
    const authUser = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      displayTitle: adminUser.displayTitle,
      avatarUrl: adminUser.avatarUrl,
    };

    const token = await signSessionToken(authUser);

    const response = NextResponse.json({ success: true, user: authUser });
    response.cookies.set('goalbangla_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
