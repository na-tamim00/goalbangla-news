import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { signSessionToken, verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.username || body.identifier || body.email || '').trim();
    const password = (body.password || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'User ID / Username or Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await repo.getUserByUsernameOrEmail(identifier);
    if (!user) {
      return NextResponse.json({ error: 'Invalid User ID / Email or Password' }, { status: 401 });
    }

    // Real bcrypt password verification
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid User ID / Email or Password' }, { status: 401 });
    }

    // Check account verification status
    if (user.status === 'PENDING_VERIFICATION') {
      return NextResponse.json(
        {
          error: 'Your account is pending verification. Please enter the verification code.',
          pendingVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const authUser = {
      id: user.id,
      email: user.email,
      username: user.username,
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