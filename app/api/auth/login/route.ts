import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { signSessionToken, verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await repo.getUserByEmail(trimmedEmail);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Real bcrypt password verification
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check account verification status
    if (user.status === 'PENDING_VERIFICATION') {
      return NextResponse.json(
        {
          error: 'Your Gmail address is pending verification. Please enter the 6-digit verification code.',
          pendingVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      displayTitle: user.displayTitle,
      avatarUrl: user.avatarUrl,
      mustChangePassword: user.mustChangePassword,
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