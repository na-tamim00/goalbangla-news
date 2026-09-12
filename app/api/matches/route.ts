import { NextRequest, NextResponse } from 'next/server';
import { footballService } from '@/lib/football/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get('leagueId') || undefined;
    const status = searchParams.get('status') || undefined;

    let matches = status === 'LIVE'
      ? await footballService.getLiveScores()
      : await footballService.getLeagueFixtures(leagueId);

    if (status === 'LIVE') {
      matches = matches.filter((m) => m.status === 'LIVE');
    } else if (status === 'FINISHED') {
      matches = matches.filter((m) => m.status === 'FINISHED');
    } else if (status === 'SCHEDULED') {
      matches = matches.filter((m) => m.status === 'SCHEDULED');
    }

    return NextResponse.json({ matches });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
