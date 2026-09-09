import { NextRequest, NextResponse } from 'next/server';
import { footballService } from '@/lib/football/service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const match = await footballService.getMatchById(params.id);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    return NextResponse.json({ match });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}