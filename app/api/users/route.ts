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
      username: u.username,
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
    const { username, email, name, role = 'CONTRIBUTOR', displayTitle, password, avatarUrl } = body;

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedUsername = (username || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');

    if (!trimmedName || (!trimmedEmail && !trimmedUsername)) {
      return NextResponse.json({ error: 'Name, User ID (username), and email are required.' }, { status: 400 });
    }

    const effectiveEmail = trimmedEmail || `${trimmedUsername}@goalbangla.com`;
    const effectiveUsername = trimmedUsername || trimmedEmail.split('@')[0];

    // Hierarchical role validation
    if (user.role === 'SUB_ADMIN') {
      // Sub-Admins are strictly limited to creating Contributor accounts
      if (role === 'SUB_ADMIN' || role === 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden: Sub-Admins are only permitted to create Author / Contributor accounts.' },
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

    const existingByEmail = await repo.getUserByEmail(effectiveEmail);
    if (existingByEmail) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }

    const existingByUsername = await repo.getUserByUsername(effectiveUsername);
    if (existingByUsername) {
      return NextResponse.json({ error: 'A user with this User ID / Username already exists.' }, { status: 409 });
    }

    // Password handling: creator specified or auto-generate
    let finalPassword = password ? password.trim() : '';
    let isTempPassword = false;
    if (!finalPassword) {
      finalPassword = `Gb-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(
        100 + Math.random() * 900
      )}`;
      isTempPassword = true;
    }

    const passwordHash = await hashPassword(finalPassword);
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newUser = await repo.createUser({
      id,
      email: effectiveEmail,
      username: effectiveUsername,
      name: trimmedName,
      role: role as any,
      displayTitle: (displayTitle || '').trim() || (role === 'SUB_ADMIN' ? 'Associate Editor' : 'Contributing Author'),
      passwordHash,
      avatarUrl:
        avatarUrl ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80`,
      status: 'ACTIVE',
      mustChangePassword: false,
      createdAt: new Date().toISOString(),
    });

    // Optionally attempt sending email if service configured, but do not block
    let devCode: string | null = null;
    try {
      if (emailService.isConfigured()) {
        await emailService.sendVerificationCode({
          to: effectiveEmail,
          code: '123456',
          recipientName: trimmedName,
        });
      }
    } catch (e) {
      // non-blocking
    }

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
          displayTitle: newUser.displayTitle,
          avatarUrl: newUser.avatarUrl,
          status: newUser.status,
          createdAt: newUser.createdAt,
        },
        temporaryPassword: finalPassword,
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