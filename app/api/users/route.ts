import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { getSessionUser, hashPassword, generate6DigitCode, hashCode, verifyPassword } from '@/lib/auth';
import { emailService } from '@/lib/email';

export async function GET() {
  try {
    const user = await getSessionUser();
    // Allow ADMIN and SUB_ADMIN to view user directory
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUB_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await repo.getAllUsers();
    // Exclude password hashes and code hashes
    const sanitized = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      displayTitle: u.displayTitle || 'Newsroom Contributor',
      avatarUrl: u.avatarUrl,
      status: u.status || 'ACTIVE',
      devCode: emailService.getLastDevCode(u.email),
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: sanitized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUB_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin or Sub-Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, role = 'CONTRIBUTOR', displayTitle, password, avatarUrl } = body;

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      return NextResponse.json({ error: 'Name and Gmail address are required.' }, { status: 400 });
    }

    // Gmail format validation
    if (!trimmedEmail.endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: 'A valid Gmail address (@gmail.com) is required for account creation.' },
        { status: 400 }
      );
    }

    // Hierarchical role validation
    if (user.role === 'SUB_ADMIN') {
      // Sub-Admins are strictly limited to creating Contributor accounts
      if (role === 'SUB_ADMIN' || role === 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden: Sub-Admins are only permitted to create Contributor accounts.' },
          { status: 403 }
        );
      }
    }

    if (user.role === 'ADMIN') {
      // Admins cannot create a secondary Super Admin casually
      if (role === 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden: Creating a secondary Super Admin is prohibited. Only one Super Admin may exist.' },
          { status: 403 }
        );
      }
    }

    const existing = await repo.getUserByEmail(trimmedEmail);
    if (existing) {
      return NextResponse.json({ error: 'A user with this Gmail address already exists.' }, { status: 409 });
    }

    // Check if email delivery is configured in deployed production
    const isDeployedProduction =
      Boolean(process.env.VERCEL) ||
      process.env.NETLIFY === 'true' ||
      process.env.RESEND_STRICT_PROD === 'true';

    if (isDeployedProduction && !emailService.isConfigured()) {
      return NextResponse.json(
        {
          error:
            'Transactional email is not configured (missing RESEND_API_KEY). Please configure RESEND_API_KEY before creating accounts.',
        },
        { status: 400 }
      );
    }

    // Password handling: creator specified or auto-generate secure temporary password
    let finalPassword = password ? password.trim() : '';
    let isTempPassword = false;
    if (!finalPassword) {
      finalPassword = `Gb-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(
        100 + Math.random() * 900
      )}`;
      isTempPassword = true;
    }

    const passwordHash = await hashPassword(finalPassword);

    // Generate 6-digit numeric verification code
    const verificationCode = generate6DigitCode();
    const codeHash = await hashCode(verificationCode);
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newUser = await repo.createUser({
      id,
      email: trimmedEmail,
      name: trimmedName,
      role: role as any,
      displayTitle: (displayTitle || '').trim() || (role === 'SUB_ADMIN' ? 'Associate Editor' : 'Contributing Author'),
      passwordHash,
      avatarUrl:
        avatarUrl ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80`,
      status: 'PENDING_VERIFICATION',
      verificationCodeHash: codeHash,
      verificationExpiresAt: codeExpiry,
      verificationAttempts: 0,
      mustChangePassword: isTempPassword,
      createdAt: new Date().toISOString(),
    });

    // Send transactional verification code email
    const emailResult = await emailService.sendVerificationCode({
      to: trimmedEmail,
      code: verificationCode,
      recipientName: trimmedName,
    });

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          displayTitle: newUser.displayTitle,
          avatarUrl: newUser.avatarUrl,
          status: newUser.status,
          createdAt: newUser.createdAt,
        },
        temporaryPassword: isTempPassword ? finalPassword : null,
        devCode: emailResult.devCode,
        success: true,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, id, role, name, displayTitle, avatarUrl, targetUserId, adminPassword } = body;

    // Ownership Transfer Action
    if (action === 'TRANSFER_OWNERSHIP') {
      if (!targetUserId || !adminPassword) {
        return NextResponse.json(
          { error: 'Target user ID and current Super Admin password are required.' },
          { status: 400 }
        );
      }

      const currentAdmin = await repo.getUserById(user.id);
      if (!currentAdmin) {
        return NextResponse.json({ error: 'Admin record not found.' }, { status: 404 });
      }

      const passwordValid = await verifyPassword(adminPassword, currentAdmin.passwordHash);
      if (!passwordValid) {
        return NextResponse.json({ error: 'Incorrect administrator password.' }, { status: 401 });
      }

      const targetUser = await repo.getUserById(targetUserId);
      if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
      }

      if (targetUser.role !== 'SUB_ADMIN') {
        return NextResponse.json(
          { error: 'Super Admin ownership can only be transferred to an active Sub-Admin.' },
          { status: 400 }
        );
      }

      // Execute transfer: promote target to ADMIN, demote current to SUB_ADMIN
      await repo.updateUser(targetUser.id, { role: 'ADMIN' });
      await repo.updateUser(currentAdmin.id, { role: 'SUB_ADMIN' });

      return NextResponse.json({
        success: true,
        message: `Super Admin ownership successfully transferred to ${targetUser.name}.`,
      });
    }

    // Standard profile / role update
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await repo.getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: any = {};
    if (role) {
      if (role === 'ADMIN' && targetUser.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'To make someone Super Admin, please use the deliberate "Transfer Ownership" flow.' },
          { status: 400 }
        );
      }
      updates.role = role;
    }
    if (name) updates.name = name.trim();
    if (displayTitle !== undefined) updates.displayTitle = displayTitle.trim();
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const updated = await repo.updateUser(id, updates);

    return NextResponse.json({
      user: {
        id: updated!.id,
        email: updated!.email,
        name: updated!.name,
        role: updated!.role,
        displayTitle: updated!.displayTitle,
        avatarUrl: updated!.avatarUrl,
        status: updated!.status,
      },
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own active Super Admin account' }, { status: 400 });
    }

    const deleted = await repo.deleteUser(id);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}