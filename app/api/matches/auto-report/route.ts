import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { footballService } from '@/lib/football/service';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId } = await req.json();
    if (!matchId) {
      return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
    }

    const match = await footballService.getMatchById(matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Generate draft using repo helper
    const draftPost = await repo.generateMatchReportDraft(match, user.id);

    return NextResponse.json({
      success: true,
      post: draftPost,
      message: 'Match report draft generated successfully for editor review!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}