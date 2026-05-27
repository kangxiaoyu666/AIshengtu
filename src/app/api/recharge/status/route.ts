import { NextRequest, NextResponse } from 'next/server';
import { getOrderByOutTradeNo } from '@/lib/db';

export async function GET(req: NextRequest) {
  const orderNo = new URL(req.url).searchParams.get('orderNo');
  if (!orderNo) return NextResponse.json({ error: '缺少orderNo' }, { status: 400 });
  const order = getOrderByOutTradeNo(orderNo);
  if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 });
  return NextResponse.json({ status: order.status, points: order.points, paidAt: order.paidAt });
}
