import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePoints } from '@/lib/db';

export async function GET(req: NextRequest) {
  const uid = new URL(req.url).searchParams.get('userId');
  if (!uid) return NextResponse.json({ error: '缺少userId' }, { status: 400 });
  const p = getOrCreatePoints(uid);
  return NextResponse.json({ userId: p.userId, balancePoints: p.balancePoints, totalRecharged: p.totalRecharged, totalSpent: p.totalSpent });
}
