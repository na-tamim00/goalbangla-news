import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { verifyCode, signSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const user = await repo.getUserByEmail(trimmedEmail);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    if (user.status === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        message: 'Account is already verified. You may sign in.',
        alreadyActive: true,
      });
    }

    // Check code expiry
    if (user.verificationExpiresAt && new Date() > new Date(user.verificationExpiresAt)) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please click "Resend Code".', expired: true },
        { status: 400 }
      );
    }

    // Check failed attempts limit (3 max)
    const attempts = user.verificationAttempts || 0;
    if (attempts >= 3) {
      // Invalidate code
      await repo.updateUser(user.id, {
        verificationCodeHash: undefined,
        verificationExpiresAt: undefined,
      });
      return NextResponse.json(
        {
          error:
            'Too many failed attempts (3). This code has been invalidated for security. Please click "Resend Code".',
          maxAttemptsExceeded: true,
        },
        { status: 400 }
      );
    }

    if (!user.verificationCodeHash) {
      return NextResponse.json(
        { error: 'No active verification code found. Please request a new code.', noActiveCode: true },
        { status: 400 }
      );
    }

    // Verify code
    const isMatch = await verifyCode(cleanCode, user.verificationCodeHash);

    if (!isMatch) {
      const newAttempts = attempts + 1;
      await repo.updateUser(user.id, { verificationAttempts: newAttempts });

      const attemptsLeft = Math.max(0, 3 - newAttempts);
      const errorMsg =
        attemptsLeft > 0
          ? `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`
          : 'Too many failed attempts (3). This code has expired. Please request a new code.';

      return NextResponse.json(
        { error: errorMsg, attemptsLeft, maxAttemptsExceeded: attemptsLeft === 0 },
        { status: 400 }
      );
    }

    // Code matches! Activate user
    const updatedUser = await repo.updateUser(user.id, {
      status: 'ACTIVE',
      verificationCodeHash: undefined,
      verificationExpiresAt: undefined,
      verificationAttempts: 0,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to activate user.' }, { status: 500 });
    }

    // Issue session token and cookie
    const authUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      displayTitle: updatedUser.displayTitle,
      avatarUrl: updatedUser.avatarUrl,
      mustChangePassword: updatedUser.mustChangePassword,
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
