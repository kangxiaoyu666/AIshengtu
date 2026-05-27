import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/db';

export async function GET() {
  try {
    const orders = getAllOrders();
    return NextResponse.json({ orders, total: orders.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
