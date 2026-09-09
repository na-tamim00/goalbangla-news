import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await repo.getMedia();
    return NextResponse.json({ media: items });
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
    const { filename, url, mimeType = 'image/jpeg', sizeBytes = 256000 } = body;

    if (!filename || !url) {
      return NextResponse.json({ error: 'filename and url are required' }, { status: 400 });
    }

    const item = await repo.addMedia({
      filename,
      url,
      mimeType,
      sizeBytes,
      uploadedById: user.id,
    });

    return NextResponse.json({ item, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}