import { NextRequest, NextResponse } from 'next/server';
import { getConfig, saveConfig, resetConfig } from '@/lib/cms-config';

export async function GET() {
  return NextResponse.json(getConfig());
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const config = saveConfig(body);
    return NextResponse.json({ success: true, config });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE() {
  resetConfig();
  return NextResponse.json({ success: true, config: getConfig() });
}
