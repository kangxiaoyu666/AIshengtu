import { NextRequest, NextResponse } from 'next/server';
import { getAllPointLogs, getAllGenerateLogs } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const type = new URL(req.url).searchParams.get('type') || 'points';
    if (type === 'generate') {
      return NextResponse.json({ logs: getAllGenerateLogs() });
    }
    return NextResponse.json({ logs: getAllPointLogs() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
