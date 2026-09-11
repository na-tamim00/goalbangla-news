import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { getSessionUser, generate6DigitCode, hashCode } from '@/lib/auth';
import { emailService } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'SUB_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await repo.getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.status === 'ACTIVE') {
      return NextResponse.json({ error: 'User account is already active and verified.' }, { status: 400 });
    }

    // Generate new code
    const newCode = generate6DigitCode();
    const codeHash = await hashCode(newCode);
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await repo.updateUser(targetUser.id, {
      verificationCodeHash: codeHash,
      verificationExpiresAt: codeExpiry,
      verificationAttempts: 0,
    });

    const emailResult = await emailService.sendVerificationCode({
      to: targetUser.email,
      code: newCode,
      recipientName: targetUser.name,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code successfully resent to ${targetUser.email}.`,
      devCode: emailResult.devCode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
