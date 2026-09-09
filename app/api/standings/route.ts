import { NextRequest, NextResponse } from 'next/server';
import { footballService } from '@/lib/football/service';
import { repo } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get('leagueId') || 'pl';

    // Check if there is an editorial override
    const override = await repo.getStandingsOverrides(leagueId);
    if (override) {
      return NextResponse.json({ table: override, isOverridden: true });
    }

    const table = await footballService.getLeagueStandings(leagueId);
    return NextResponse.json({ table, isOverridden: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}