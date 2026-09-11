import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { generate6DigitCode, hashCode } from '@/lib/auth';
import { emailService } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
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

    // Generate new 6-digit code
    const newCode = generate6DigitCode();
    const codeHash = await hashCode(newCode);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await repo.updateUser(user.id, {
      verificationCodeHash: codeHash,
      verificationExpiresAt: expiresAt,
      verificationAttempts: 0,
    });

    // Deliver via email service
    const result = await emailService.sendVerificationCode({
      to: user.email,
      code: newCode,
      recipientName: user.name,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A new 6-digit verification code has been sent to your Gmail address.',
      devCode: result.devCode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
