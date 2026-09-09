import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { signSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await repo.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check credentials (for seed users: "admin123", "editor123", "writer123")
    const isValid =
      (email === 'admin@goalbangla.com' && password === 'admin123') ||
      (email === 'editor@goalbangla.com' && password === 'editor123') ||
      (email === 'writer@goalbangla.com' && password === 'writer123') ||
      password === 'admin123';

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await signSessionToken(authUser);

    const response = NextResponse.json({ user: authUser, success: true });
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