import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized: requires Editor or Admin role' }, { status: 403 });
    }

    const { leagueId, table } = await req.json();
    if (!leagueId || !table) {
      return NextResponse.json({ error: 'leagueId and table are required' }, { status: 400 });
    }

    await repo.saveStandingsOverride(leagueId, table);
    return NextResponse.json({ success: true, message: 'Standings override saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}