import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = (await repo.getPostById(params.id)) || (await repo.getPostBySlug(params.id));
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await repo.getPostById(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await req.json();

    // Contributor Permission Constraints
    if (user.role === 'CONTRIBUTOR') {
      if (post.authorId !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden: Contributors can only edit their own articles.' },
          { status: 403 }
        );
      }

      // Contributor cannot publish directly
      if (body.status === 'PUBLISHED' || body.status === 'SCHEDULED') {
        return NextResponse.json(
          { error: 'Forbidden: Contributors cannot publish directly. Please submit to In Review for editor approval.' },
          { status: 403 }
        );
      }

      // Lock author to self
      delete body.authorId;
      delete body.authorName;
    } else {
      // Admin or Editor can reassign author
      if (body.authorId && body.authorId !== post.authorId) {
        const allUsers = await repo.getAllUsers();
        const assigned = allUsers.find((u) => u.id === body.authorId);
        if (assigned) {
          body.authorId = assigned.id;
          body.authorName = assigned.name;
        }
      }
    }

    // If changing to PUBLISHED, ensure publishedAt is recorded
    if (body.status === 'PUBLISHED') {
      body.publishedAt = post.publishedAt || new Date().toISOString();
    }

    const updated = await repo.updatePost(params.id, body);
    return NextResponse.json({ post: updated, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Admin and Editor have capability to delete posts
    if (user.role === 'CONTRIBUTOR') {
      return NextResponse.json(
        { error: 'Forbidden: Contributors do not have permission to delete posts.' },
        { status: 403 }
      );
    }

    const post = await repo.getPostById(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await repo.deletePost(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}