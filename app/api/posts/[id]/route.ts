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

    // Contributor can only update their own post unless promoted to Editor/Admin
    if (user.role === 'CONTRIBUTOR' && post.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: you cannot edit posts by other authors' }, { status: 403 });
    }

    const body = await req.json();

    // If publishing, update publishedAt
    if (body.status === 'PUBLISHED' && !post.publishedAt) {
      body.publishedAt = new Date().toISOString();
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

    const post = await repo.getPostById(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Only Admin and Editor can delete
    if (user.role === 'CONTRIBUTOR' && post.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await repo.deletePost(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}