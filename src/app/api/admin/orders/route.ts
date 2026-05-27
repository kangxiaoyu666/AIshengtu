import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const authErr = requireAdmin(req); if (authErr) return authErr;
  try {
    const orders = getAllOrders();
    return NextResponse.json({ orders, total: orders.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
