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
      const allPosts = await repo.getAllPostsAdmin();
      return NextResponse.json({ posts: allPosts, total: allPosts.length });
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
    } = body;

    if (!slug || !translations || (!translations.bn?.title && !translations.en?.title)) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const newPost = await repo.createPost({
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      type,
      status,
      category,
      leagueTag,
      featuredImage,
      videoUrl,
      videoTranscript,
      audioUrl,
      audioShowNotes,
      galleryImages,
      authorId: user.id,
      authorName: user.name,
      scheduledPublishAt,
      publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined,
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