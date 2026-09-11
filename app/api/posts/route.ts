import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const leagueTag = searchParams.get('leagueTag') || undefined;
    const type = searchParams.get('type') as any || undefined;
    const status = searchParams.get('status') as any || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined;
    const admin = searchParams.get('admin') === 'true';

    if (admin) {
      const user = await getSessionUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      let allPosts = await repo.getAllPostsAdmin();

      // For Contributor, prioritize their own posts first
      if (user.role === 'CONTRIBUTOR') {
        allPosts = [...allPosts].sort((a, b) => {
          const aOwn = a.authorId === user.id ? 1 : 0;
          const bOwn = b.authorId === user.id ? 1 : 0;
          if (aOwn !== bOwn) return bOwn - aOwn;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      }

      return NextResponse.json({ posts: allPosts, total: allPosts.length, user });
    }

    const result = await repo.getPosts({
      category,
      leagueTag,
      type,
      status: status || 'PUBLISHED',
      search,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug,
      type = 'ARTICLE',
      status = 'DRAFT',
      category = 'BREAKING',
      leagueTag = 'BPL',
      featuredImage,
      videoUrl,
      videoTranscript,
      audioUrl,
      audioShowNotes,
      galleryImages,
      translations,
      scheduledPublishAt,
      authorId,
    } = body;

    if (!slug || !translations || (!translations.bn?.title && !translations.en?.title)) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    // Role-based permission checks
    let targetStatus = status;
    let targetAuthorId = user.id;
    let targetAuthorName = user.name;
    let targetAuthorTitle = user.displayTitle || 'Contributing Author';

    if (user.role === 'CONTRIBUTOR') {
      // Contributor cannot publish directly
      if (status === 'PUBLISHED' || status === 'SCHEDULED') {
        return NextResponse.json(
          { error: 'Forbidden: Contributors cannot publish directly. Please submit to In Review.' },
          { status: 403 }
        );
      }
      targetStatus = status === 'IN_REVIEW' ? 'IN_REVIEW' : 'DRAFT';
      targetAuthorId = user.id;
      targetAuthorName = user.name;
      targetAuthorTitle = user.displayTitle || 'Contributing Author';
    } else {
      // Admin or Sub-Admin can reassign author
      if (authorId) {
        const allUsers = await repo.getAllUsers();
        const assigned = allUsers.find((u) => u.id === authorId);
        if (assigned) {
          targetAuthorId = assigned.id;
          targetAuthorName = assigned.name;
          targetAuthorTitle = assigned.displayTitle || body.authorTitle || 'Contributing Author';
        }
      }
    }

    const newPost = await repo.createPost({
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      type,
      status: targetStatus,
      category,
      leagueTag,
      featuredImage,
      videoUrl,
      videoTranscript,
      audioUrl,
      audioShowNotes,
      galleryImages,
      authorId: targetAuthorId,
      authorName: targetAuthorName,
      authorTitle: targetAuthorTitle,
      scheduledPublishAt: targetStatus === 'SCHEDULED' ? scheduledPublishAt : undefined,
      publishedAt: targetStatus === 'PUBLISHED' ? new Date().toISOString() : undefined,
      translations: {
        bn: translations.bn || {
          language: 'bn',
          title: translations.en?.title || 'শিরোনামহীন',
          content: translations.en?.content || '',
          tags: [],
        },
        en: translations.en || {
          language: 'en',
          title: translations.bn?.title || 'Untitled',
          content: translations.bn?.content || '',
          tags: [],
        },
      },
    });

    return NextResponse.json({ post: newPost, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}